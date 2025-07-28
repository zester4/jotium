//app/(chat)/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

import { AIAgent } from "@/ai/jotium";
import { Message } from "@/ai/types";
import { auth } from "@/app/(auth)/auth";
import { saveChat, deleteChatById, getMessageCount, updateUserMessageCount, getUserById } from "@/db/queries";
import { getUserAIModel } from "@/lib/user-model"; // Import the new function
import { generateUUID } from "@/lib/utils";

const planLimits: { [key: string]: number } = {
  "Free": 5,
  "Pro": 50,
  "Advanced": Infinity,
};

export async function POST(request: NextRequest) {
  const { id, messages }: { id?: string; messages: Message[] } = await request.json();
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id as string;

  const user = await getUserById(userId);
  const userPlan = user?.plan || "Free";
  const limit = planLimits[userPlan];

  const { count, messageLimitResetAt } = await getMessageCount(userId);
  const now = new Date();

  if (messageLimitResetAt && now < new Date(messageLimitResetAt) && count >= limit) {
    return new Response("Message limit reached.", { status: 429 });
  }

  // Reset count if the reset time has passed
  const newCount = (messageLimitResetAt && now > new Date(messageLimitResetAt)) ? 1 : count + 1;

  await updateUserMessageCount(userId, newCount);
  
  // Use the new function to get the correct model based on current plan
  const model = await getUserAIModel(userId);
  console.log(`Using model: ${model} for user: ${userId}`); // Optional: for debugging
  
  const geminiApiKey = process.env.GOOGLE_API_KEY || '';
  const agent = new AIAgent(geminiApiKey, userId, undefined, model);
  await agent.initializeTools(userId);
  const lastMessage = messages[messages.length - 1];

  const attachments = lastMessage.attachments || [];

  const chatId = id || generateUUID();

  const stream = new ReadableStream({
    async start(controller) {
      let conversationHistory: any[];
      let responseStream;
      // Only support one image for now
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

          // For PDFs, prepend the user's text for context
          if (fileAttachment.contentType === "application/pdf") {
            conversationHistory = [
              { text: lastMessage.content },
              {
                inlineData: {
                  mimeType: fileAttachment.contentType,
                  data: base64Data,
                },
              }
            ];
          } else {
            // For images, keep the current logic
            conversationHistory = [
              {
                inlineData: {
                  mimeType: fileAttachment.contentType,
                  data: base64Data,
                },
              },
              { text: lastMessage.content }
            ];
          }
        } catch (err) {
          controller.enqueue(
            `data: ${JSON.stringify({ type: "error", content: "Failed to process file attachment." })}\n\n`
          );
          controller.close();
          return;
        }
      } else {
        // Fallback to text-only flow
        conversationHistory = messages.map((msg) => ({
          role: msg.role === "assistant" ? "model" : msg.role,
          parts: [{ text: msg.content }],
        }));
      }

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
            
            // Handle generate_image tool call directly
            if (toolName === 'generate_image') {
              shouldContinueToAgent = false;
              const result = await agent.executeToolCall(toolCall);
              
              if (result.result.success && result.result.results) {
                const imageToolResult = result.result;
                for (const imageResult of imageToolResult.results) {
                  // Prefer imageDataUrl if present, fallback to imageBase64
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
                
                // Send success response directly to user
                const successMessage = `I've generated ${imageToolResult.results.length} image(s) for you.`;
                controller.enqueue(
                  `data: ${JSON.stringify({ type: "response", content: successMessage })}\n\n`
                );
                fullResponse = successMessage;
              } else {
                // Handle error
                const errorMessage = `I encountered an error generating the image: ${result.result.error || 'Unknown error'}`;
                controller.enqueue(
                  `data: ${JSON.stringify({ type: "response", content: errorMessage })}\n\n`
                );
                fullResponse = errorMessage;
              }
            }
            
            // Handle web_scrape tool call directly
            else if (toolName === 'web_scrape') {
              shouldContinueToAgent = false;
              const result = await agent.executeToolCall(toolCall);
              
              if (result.result.success) {
                const scrapeData = result.result;
                let responseMessage = `I've successfully scraped the webpage. Here's what I found:\n\n`;
                
                if (scrapeData.title) {
                  responseMessage += `**Title:** ${scrapeData.title}\n\n`;
                }
                
                if (scrapeData.description) {
                  responseMessage += `**Description:** ${scrapeData.description}\n\n`;
                }
                
                if (scrapeData.content) {
                  // Limit content length for display
                  const contentPreview = scrapeData.content.length > 1000 
                    ? scrapeData.content.substring(0, 1000) + '...' 
                    : scrapeData.content;
                  responseMessage += `**Content:**\n${contentPreview}\n\n`;
                }
                
                if (scrapeData.links && scrapeData.links.length > 0) {
                  responseMessage += `**Links found:** ${scrapeData.links.length}\n\n`;
                  // Show first few links
                  const linkPreview = scrapeData.links.slice(0, 5).map((link: any) => 
                    `- [${link.text || 'Link'}](${link.url})`
                  ).join('\n');
                  responseMessage += linkPreview;
                  if (scrapeData.links.length > 5) {
                    responseMessage += `\n... and ${scrapeData.links.length - 5} more links`;
                  }
                }
                
                controller.enqueue(
                  `data: ${JSON.stringify({ type: "response", content: responseMessage })}\n\n`
                );
                fullResponse = responseMessage;
              } else {
                // Handle error
                const errorMessage = `I encountered an error scraping the webpage: ${result.result.error || 'Unknown error'}`;
                controller.enqueue(
                  `data: ${JSON.stringify({ type: "response", content: errorMessage })}\n\n`
                );
                fullResponse = errorMessage;
              }
            }
            
            // For other tools, execute normally
            else {
              const result = await agent.executeToolCall(toolCall);
              toolResults.push(result);
            }
          }

          // Attach generated images to the assistant's message
          if (assistantAttachments.length > 0) {
            lastAssistantAttachments = assistantAttachments;
          }

          // Only continue to agent if we have non-direct tools
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
        await saveChat({
          id: chatId,
          messages: finalMessages,
          userId: session.user.id,
        });
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
    await deleteChatById({ id });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response("Failed to delete chat", { status: 500 });
  }
}

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}
