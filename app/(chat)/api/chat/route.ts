import { NextRequest, NextResponse } from "next/server";

import { AIAgent } from "@/ai/jotium";
import { Message } from "@/ai/types";
import { auth } from "@/app/(auth)/auth";
import { saveChat, deleteChatById } from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const { id, messages }: { id?: string; messages: Message[] } = await request.json();
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const agent = new AIAgent(process.env.GOOGLE_API_KEY!, session.user.id);
  await agent.initializeTools(session.user.id);
  const lastMessage = messages[messages.length - 1];

  const chatId = id || generateUUID();

  const stream = new ReadableStream({
    async start(controller) {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : msg.role,
        parts: [{ text: msg.content }],
      }));

      const responseStream = await agent.generateContentStream(
        conversationHistory
      );

      let fullResponse = "";
      let thoughts = "";
      let toolCalls: any[] = [];
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
        for (const toolCall of toolCalls) {
          const result = await agent.executeToolCall(toolCall);
          toolResults.push(result);
        }

        const toolResultsContent = toolResults
          .map(
            (tr) =>
              `Tool ${tr.toolCallId} result:\n${
                typeof tr.result === "object"
                  ? JSON.stringify(tr.result, null, 2)
                  : String(tr.result)
              }`
          )
          .join("\n\n");

        conversationHistory.push({
          role: "model",
          parts: [{ text: fullResponse }],
        });
        conversationHistory.push({
          role: "user",
          parts: [
            {
              text: `Tool execution results:\n${toolResultsContent}\n\nPlease provide a comprehensive response based on these tool results.`,
            },
          ],
        });

        const finalResponseStream = await agent.generateContentStream(
          conversationHistory
        );
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
