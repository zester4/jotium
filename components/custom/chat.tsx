"use client";

import { useEffect, useRef, useState } from "react";

import { Message } from "@/ai/types";
import { Message as PreviewMessage } from "@/components/custom/message";
import { generateUUID } from "@/lib/utils";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";
import { useScrollToBottom } from "./use-scroll-to-bottom";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  const [attachments, setAttachments] = useState<any[]>([]);

  const handleSubmit = async (
    e?: { preventDefault?: () => void }
  ) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!input) return;

    const userMessage: Message = {
      id: generateUUID(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, messages: [...messages, userMessage] }),
    });

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: generateUUID(),
        role: "assistant",
        content: "",
        thoughts: "",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.substring(6);
            // Only attempt to parse if it looks like valid JSON (starts with { and ends with })
            if (jsonStr.trim().startsWith("{") && jsonStr.trim().endsWith("}")) {
              try {
                const data = JSON.parse(jsonStr);
                if (data.type === "thought") {
                  assistantMessage.thoughts += data.content;
                } else if (data.type === "response") {
                  assistantMessage.content += data.content;
                }
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id ? assistantMessage : msg
                  )
                );
              } catch (error) {
                console.error("Error parsing stream data:", error, jsonStr);
              }
            } else {
              // Skip malformed/incomplete JSON
              // Optionally log for debugging
              // console.warn("Skipping malformed stream line:", jsonStr);
            }
          }
        }
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-row justify-center pb-4 md:pb-8 h-dvh bg-background">
      <div className="flex flex-col justify-between items-center gap-4">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-4 h-full w-dvw items-center overflow-y-scroll"
        >
          {messages.length === 0 && <Overview />}

          {messages.map((message) => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              role={message.role}
              content={message.content}
              thoughts={message.thoughts}
              toolInvocations={message.toolCalls as any}
            />
          ))}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-row gap-2 relative items-end w-full md:max-w-[500px] mx-auto max-w-[calc(100dvw-32px) px-4 md:px-0"
        >
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={() => {}}
            messages={messages as any}
            attachments={attachments}
            setAttachments={setAttachments}
            append={async () => null}
          />
        </form>
      </div>
    </div>
  );
}
