import { NextRequest, NextResponse } from "next/server";

import { AIAgent } from "@/ai/jotium";
import { Message } from "@/ai/types";
import { auth } from "@/app/(auth)/auth";
import { saveChat, deleteChatById, getUserById } from "@/db/queries";
import { getGeminiModelForPlan } from "@/lib/ai-models";
import { generateUUID } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const { id, messages }: { id?: string; messages: Message[] } = await request.json();
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id as string;
  const user = await getUserById(userId);
  const model = getGeminiModelForPlan(user?.plan ?? 'Free') || 'gemini-2.0-flash';
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

      responseStream = await agent.generateContentStream(conversationHistory);

      let fullResponse = "";
      let thoughts = "";
      let toolCalls: any[] = [];
      let hasToolCalls = false;
      let lastAssistantAttachments: any[] | undefined;

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
                fullResponse += part.text;
                controller.enqueue(
                  `data: ${JSON.stringify({ type: "response", content: part.text })}\n\n`
                );
              }
            }
          }
        }
        if (chunk.functionCalls?.length > 0) {
          hasToolCalls = true;
          toolCalls.push(...chunk.functionCalls);
        }
      }

      if (hasToolCalls) {
        const toolResults = [];
        const assistantAttachments = [];
        for (const toolCall of toolCalls) {
          const result = await agent.executeToolCall(toolCall);
          // Handle image generation tool results
          if (toolCall.functionName === 'generate_image' && result.result.success && result.result.results) {
            const imageToolResult = result.result;
            for (const imageResult of imageToolResult.results) {
              if (imageResult.imageBase64) {
                const outputFormat = imageToolResult.settings?.outputFormat || 'png';
                const mimeType = `image/${outputFormat}`;
                const dataUrl = `data:${mimeType};base64,${imageResult.imageBase64}`;
                assistantAttachments.push({
                  url: dataUrl,
                  name: `generated-image-${Date.now()}.${outputFormat}`,
                  contentType: mimeType,
                });
              }
            }
            // To avoid sending base64 to the model, we create a summary.
            const summary = {
              ...imageToolResult,
              results: imageToolResult.results.map((r: any) => ({ textResponse: r.textResponse, imageGenerated: !!r.imageBase64, savedFile: r.savedFile, error: r.error }))
            };
            toolResults.push({ ...result, result: summary });
          } else {
            toolResults.push(result);
          }
        }

        // Create the content for the next prompt to the model
        const toolResultsContent = toolResults
          .map(
            (tr) =>
              `Tool ${tr.toolCallId} result:\n$${
                typeof tr.result === "object"
                  ? JSON.stringify(tr.result, null, 2)
                  : String(tr.result)
              }`
          )
          .join("\n\n");

        if (!Array.isArray(conversationHistory)) {
          conversationHistory = [conversationHistory];
        }
        conversationHistory.push({
          role: "model",
          parts: [{ text: fullResponse }],
        });
        if (toolResultsContent.trim()) {
          conversationHistory.push({
            role: "user",
            parts: [
              {
                text: `Tool execution results:\n${toolResultsContent}\n\nPlease provide a comprehensive response based on these tool results.`,
              },
            ],
          });
        }

        const finalResponseStream = await agent.generateContentStream(conversationHistory);
        let finalResponseText = "";
        for await (const chunk of finalResponseStream) {
          if (chunk.candidates?.[0]?.content?.parts) {
            for (const part of chunk.candidates[0].content.parts) {
              if (part.text) {
                finalResponseText += part.text;
                controller.enqueue(
                  `data: ${JSON.stringify({ type: "response", content: part.text })}\n\n`
                );
              }
            }
          }
        }
        fullResponse = finalResponseText;
        // Attach generated images to the assistant's message
        if (assistantAttachments.length > 0) {
          lastAssistantAttachments = assistantAttachments;
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
          toolCalls: hasToolCalls ? toolCalls : undefined,
          attachments: typeof lastAssistantAttachments !== 'undefined' ? lastAssistantAttachments : undefined,
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
