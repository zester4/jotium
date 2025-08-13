import { revalidatePath } from "next/cache"; 
import { NextRequest, NextResponse } from "next/server";

import { AIAgent } from "@/ai/jotium";
import { Message } from "@/ai/types";
import { auth } from "@/app/(auth)/auth";
import { getUserById, getUserCustomInstruction } from "@/db/queries";
import { 
  saveChat as saveChatToRedis, 
  saveChatMeta, 
  saveChatMessages,
  deleteChat as deleteChatFromRedis,
  getChatMessages,
  getUserDailyMessageCount,
  incrementUserDailyMessageCount
} from "@/lib/redis-queries";
import { getUserAIModel } from "@/lib/user-model"; 
import { generateUUID } from "@/lib/utils";

const planLimits: { [key: string]: number } = {
  "Free": 5,
  "Pro": 50,
  "Advanced": Infinity,
};

export async function POST(request: NextRequest) {
  const { id, messages, regenerate }: { id?: string; messages: Message[]; regenerate?: boolean } = await request.json();
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id as string;

  const user = await getUserById(userId);
  const userPlan = user?.plan || "Free";
  const limit = planLimits[userPlan];

  const { count, messageLimitResetAt } = await getUserDailyMessageCount(userId);
  const now = new Date();

  if (messageLimitResetAt && now < new Date(messageLimitResetAt) && count >= limit) {
    return new Response("Message limit reached.", { status: 429 });
  }

  const chatId = id || generateUUID();
  
  // Use the new function to get the correct model based on current plan
  const model = await getUserAIModel(userId);
  
  const geminiApiKey = process.env.GOOGLE_API_KEY || '';
  const agent = new AIAgent(geminiApiKey, userId, undefined, model);
  await agent.initializeTools(userId);
  const lastMessage = messages[messages.length - 1];

  const attachments = lastMessage.attachments || [];

  const stream = new ReadableStream({
    async start(controller) {
      let conversationHistory: any[];
      let responseStream;
      
      if (
        attachments.length > 0 &&
        attachments[0].contentType &&
        (attachments[0].contentType.startsWith("image/") || attachments[0].contentType === "application/pdf")
      ) {
        const fileAttachment = attachments[0];
        try {
          const response = await fetch(fileAttachment.url);
          const arrayBuffer = await response.arrayBuffer();
          const base64Data = Buffer.from(arrayBuffer).toString('base64');

          const userParts = [
            { text: lastMessage.content },
            {
              inlineData: {
                mimeType: fileAttachment.contentType,
                data: base64Data,
              },
            },
          ];

          if (fileAttachment.contentType.startsWith("image/")) {
            userParts.reverse();
          }

          conversationHistory = [{ role: "user", parts: userParts }];
        } catch (err) {
          controller.enqueue(
            `data: ${JSON.stringify({ type: "error", content: "Failed to process file attachment." })}\n\n`
          );
          controller.close();
          return;
        }
      } else {
        conversationHistory = messages.map((msg) => ({
          role: msg.role === "assistant" ? "model" : msg.role,
          parts: [{ text: msg.content }],
        }));
      }

      // Inject per-user custom instruction as a system-style priming message
      try {
        const customInstruction = await getUserCustomInstruction(userId);
        if (customInstruction && customInstruction.trim().length > 0) {
          conversationHistory.unshift({ role: "user", parts: [{ text: `(User Preference) ${customInstruction.trim()}` }] });
        }
      } catch {}

      let fullResponse = "";
      let thoughts = "";
      let finalToolCalls: any[] = [];
      let lastAssistantAttachments: any[] | undefined;

      while (true) {
        const responseStream = await agent.generateContentStream(conversationHistory);
        let currentTextResponse = "";
        let currentToolCalls: any[] = [];
        let hasToolCalls = false;

        for await (const chunk of responseStream) {
          if (chunk.candidates?.[0]?.content?.parts) {
            for (const part of chunk.candidates[0].content.parts) {
              if (part.text) {
                if (part.thought) {
                  thoughts += part.text;
                  controller.enqueue(
                    `data: ${JSON.stringify({ type: "thought", content: part.text })}\n\n`
                  );
                } else {
                  currentTextResponse += part.text;
                  controller.enqueue(
                    `data: ${JSON.stringify({ type: "response", content: part.text })}\n\n`
                  );
                }
              }
            }
          }
          if (chunk.functionCalls?.length > 0) {
            hasToolCalls = true;
            currentToolCalls.push(...chunk.functionCalls);
          }
        }

        fullResponse += (fullResponse ? " " : "") + currentTextResponse;

        if (hasToolCalls) {
          const toolResults = [];
          const assistantAttachments = [];
          let shouldContinueToAgent = true;
          
          const toolCallsWithIds = currentToolCalls.map(tc => ({
            ...tc,
            id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }));
          
          finalToolCalls.push(...toolCallsWithIds);
          
          for (const toolCall of toolCallsWithIds) {
            const toolName = toolCall.functionName || toolCall.name;
            
            // Send tool execution start event
            controller.enqueue(
              `data: ${JSON.stringify({ type: "tool-start", toolName })}\n\n`
            );

            // Handle generate_image tool call directly
            if (toolName === 'generate_image') {
              shouldContinueToAgent = false;
              const result = await agent.executeToolCall(toolCall);
              
              if (result.result.success && result.result.results) {
                const imageToolResult = result.result;
                for (const imageResult of imageToolResult.results) {
                  let dataUrl = imageResult.imageDataUrl;
                  let outputFormat = imageToolResult.settings?.outputFormat || 'png';
                  let mimeType = `image/${outputFormat}`;
                  if (!dataUrl && imageResult.imageBase64) {
                    dataUrl = `data:${mimeType};base64,${imageResult.imageBase64}`;
                  }
                  if (dataUrl) {
                    assistantAttachments.push({
                      url: dataUrl,
                      name: `generated-image-${Date.now()}.${outputFormat}`,
                      contentType: mimeType,
                    });
                  }
                }
                
                const successMessage = `I've generated ${imageToolResult.results.length} image(s) for you.`;
                controller.enqueue(
                  `data: ${JSON.stringify({ type: "response", content: successMessage })}\n\n`
                );
                fullResponse = successMessage;
              } else {
                const errorMessage = `I encountered an error generating the image: ${result.result.error || 'Unknown error'}`;
                controller.enqueue(
                  `data: ${JSON.stringify({ type: "response", content: errorMessage })}\n\n`
                );
                fullResponse = errorMessage;
              }
            }
            
            else if (toolName === 'get_weather' || toolName === 'get_stock_data' || toolName === 'get_map_data' || toolName === 'pdf_generator' || toolName === 'fire_web_scrape') {
              const result = await agent.executeToolCall(toolCall);
              const payload = result.result || {};
              let fenceLang;
              if (toolName === 'get_weather') {
                fenceLang = 'weather';
              } else if (toolName === 'get_stock_data') {
                fenceLang = 'stock';
              } else if (toolName === 'get_map_data') {
                fenceLang = 'map';
              } else if (toolName === 'pdf_generator') {
                fenceLang = 'pdf';
              } else if (toolName === 'fire_web_scrape') {
                fenceLang = 'scrape';
              }
              
              if (payload && payload.success) {
                const markdownBlock = `\n\n\`\`\`${fenceLang}\n${JSON.stringify(payload)}\n\`\`\`\n\n`;
                controller.enqueue(
                  `data: ${JSON.stringify({ type: "response", content: markdownBlock })}\n\n`
                );
                fullResponse += markdownBlock;
              }

              toolResults.push({
                toolCallId: toolCall.id,
                result: payload,
                error: undefined
              });
            }

            else {
              const result = await agent.executeToolCall(toolCall);
              toolResults.push(result);
            }
          }

          if (assistantAttachments.length > 0) {
            lastAssistantAttachments = assistantAttachments;
          }

          if (shouldContinueToAgent && toolResults.length > 0) {
            const modelParts = [];
            if (currentTextResponse) {
              modelParts.push({ text: currentTextResponse });
            }
            currentToolCalls.forEach(toolCall => {
              modelParts.push({ functionCall: toolCall });
            });
            
            conversationHistory.push({
              role: "model",
              parts: modelParts,
            });

            conversationHistory.push({
              role: "user",
              parts: toolResults.map(tr => ({
                functionResponse: {
                  name: toolCallsWithIds.find(tc => tc.id === tr.toolCallId)?.name,
                  response: tr.result,
                },
              })),
            });
          } else {
            break; 
          }
        } else {
          break; 
        }
      }

      const finalMessages: Message[] = [
        ...messages,
        {
          id: generateUUID(),
          role: "assistant",
          content: fullResponse,
          thoughts: thoughts,
          timestamp: Date.now(),
          toolCalls: finalToolCalls.length > 0 ? finalToolCalls : undefined,
          attachments: lastAssistantAttachments,
        },
      ];

      if (session.user && session.user.id) {
        // Increment message count only when not regenerating
        if (!regenerate) {
          await incrementUserDailyMessageCount(userId);
        }

        // Save to Redis instead of PostgreSQL
        try {
          await saveChatToRedis({
            id: chatId,
            createdAt: new Date().toISOString(),
            userId: session.user.id,
            messages: finalMessages,
          });
          console.log('✅ Chat saved to Redis:', chatId);
        } catch (error) {
          console.error('❌ Error saving chat to Redis:', error);
        }

        // Revalidate the chat page and the root path to update message count in Navbar
        revalidatePath(`/chat/${chatId}`);
        revalidatePath("/");
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return new Response("Missing chat id", { status: 400 });
  }
  try {
    await deleteChatFromRedis(id, session.user.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response("Failed to delete chat", { status: 500 });
  }
}

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}
