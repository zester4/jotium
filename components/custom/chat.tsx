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
  const [error, setError] = useState<string | null>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  const [attachments, setAttachments] = useState<any[]>([]);

  // Add state for firstName
  const [firstName, setFirstName] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Try to fetch the user's first name from the profile API
    fetch("/account/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.firstName) setFirstName(data.firstName);
      });
  }, []);

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
      attachments, // <-- Add this line!
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, messages: [...messages, userMessage] }),
    });

    if (response.status === 429) {
      setError("You have reached your daily message limit. Please upgrade your plan to continue.");
      setIsLoading(false);
      // remove user message
      setMessages((prev) => prev.slice(0, prev.length - 1));
      return;
    }

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

      // Track start time for duration
      const startTime = Date.now();

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
                } else if (data.type === "error") {
                  setError(data.content);
                }
                // Update duration on every chunk (so UI can show live duration if needed)
                assistantMessage.duration = Date.now() - startTime;
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
      // Finalize duration after streaming ends
      assistantMessage.duration = Date.now() - startTime;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id ? assistantMessage : msg
        )
      );
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
          {messages.length === 0 && <Overview firstName={firstName} />}

          {messages.map((message) => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              role={message.role}
              content={message.content}
              thoughts={message.thoughts}
              toolInvocations={message.toolCalls as any}
              duration={message.duration}
              attachments={message.attachments} // <-- Add this line!
            />
          ))}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

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
