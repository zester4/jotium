//components/custom/chat.tsx
"use client";

import { AnimatePresence } from "framer-motion";
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
    useScrollToBottom<HTMLDivElement>([messages.length]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [firstName, setFirstName] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch("/account/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.firstName) setFirstName(data.firstName);
      });
  }, []);

  const handleSubmit = async (e?: { preventDefault?: () => void }) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!input.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: generateUUID(),
      role: "user",
      content: input,
      timestamp: Date.now(),
      attachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
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
        attachments: [],
      };
      setMessages((prev) => [...prev, assistantMessage]);

      const startTime = Date.now();
      let pendingAttachments: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.substring(6);
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
                if (data.attachments && Array.isArray(data.attachments)) {
                  pendingAttachments = data.attachments;
                  assistantMessage.attachments = pendingAttachments;
                }
                assistantMessage.duration = Date.now() - startTime;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id ? { ...assistantMessage } : msg
                  )
                );
              } catch (error) {
                console.error("Error parsing stream data:", error, jsonStr);
              }
            }
          }
        }
      }
      
      assistantMessage.duration = Date.now() - startTime;
      if (pendingAttachments.length > 0) {
        assistantMessage.attachments = pendingAttachments;
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id ? { ...assistantMessage } : msg
        )
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Messages Container - Stable width system */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--border)) transparent'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 6px;
          }
          div::-webkit-scrollbar-track {
            background: transparent;
          }
          div::-webkit-scrollbar-thumb {
            background-color: hsl(var(--border));
            border-radius: 3px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background-color: hsl(var(--border) / 0.8);
          }
        `}</style>
        
        {/* Fixed width container that never changes */}
        <div className="w-full max-w-none mx-auto">
          {/* Responsive padding with stable inner container */}
          <div className="px-4 sm:px-6 md:px-8 lg:mx-[144px] lg:px-12 xl:px-16 2xl:px-20">
            {/* Fixed max-width content area - This ensures stable layout */}
            <div className="max-w-4xl mx-auto layout-stable">
              <AnimatePresence mode="popLayout">
                {messages.length === 0 && (
                  <Overview firstName={firstName} key="overview" />
                )}

                {messages.map((message) => (
                  <PreviewMessage
                    key={message.id}
                    chatId={id}
                    role={message.role}
                    content={message.content}
                    thoughts={message.thoughts}
                    toolInvocations={message.toolCalls as any}
                    duration={message.duration}
                    attachments={message.attachments}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        <div ref={messagesEndRef} className="h-24 sm:h-32" />
      </div>

      {/* Error Display - Same stable width */}
      <AnimatePresence>
        {error && (
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pb-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-700 dark:text-red-300 text-sm text-center">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Input Section - Stable width system */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-4 sm:py-6">
          <div className="max-w-4xl mx-auto">
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
          </div>
        </div>
      </div>
    </div>
  );
}
