//components/custom/multimodal-input.tsx
"use client";

import { Attachment, ChatRequestOptions, CreateMessage, Message } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from "react";
import { toast } from "sonner";

import { ArrowUpIcon, PaperclipIcon, StopIcon } from "./icons";
import { MessageLimitBanner } from "./message-limit-banner";
import { PreviewAttachment } from "./preview-attachment";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const suggestedActions = [
  {
    title: "Project & Communication",
    label: "Create a Linear project, schedule a meeting, and send an email.",
    action: "Please create a new project in Linear called 'Jotium AI Feature Development'. Add initial tasks: 'Implement new user authentication flow', 'Develop real-time chat functionality', and 'Integrate third-party API for data enrichment'. Once the project is set up, schedule a project kickoff meeting for next Wednesday at 11 AM in Google Calendar, and send an email to devteam@example.com with the project overview and meeting invitation.",
    icon: "💼",
  },
  {
    title: "Financial Analysis & Report",
    label: "Analyze stock performance and email a report.",
    action: "Provide a detailed market analysis for Tesla stock (TSLA) covering its performance over the past three months. Include key trends and a summary of recent news affecting its price. Once complete, email the full report to finance.updates@example.com.",
    icon: "📈",
  },
  {
    title: "Flight Booking & Itinerary",
    label: "Find flights, add to calendar, and email details.",
    action: "Find the cheapest round-trip flights from San Francisco (SFO) to Tokyo (NRT) for a two-week trip starting exactly two weeks from today. Once you find suitable flights, please add the travel dates to my Google Calendar and send an email with the flight details and itinerary to my.travel@example.com.",
    icon: "✈️",
  },
  {
    title: "Code & Communication",
    label: "Create GitHub issue, email team, and set calendar reminder.",
    action: "For the 'Jotium AI Feature Development' project in Linear, please create a new GitHub issue titled 'Refactor AgenticDecisionEngine for better extensibility'. Assign it to developer@example.com. Once the issue is created, send an email to team-leads@example.com notifying them about this new refactoring task and its importance, and add a reminder to my Google Calendar for next Monday to follow up on this issue.",
    icon: "💻",
  },
];

export function MultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  append,
  handleSubmit,
  messageCount,
  messageLimit,
  messageLimitResetAt,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  messageCount: number;
  messageLimit: number;
  messageLimitResetAt: Date | null;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [input]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Assuming 768px as the mobile breakpoint
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    if (!input.trim() && attachments.length === 0) return;
    
    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    if (typeof window !== "undefined" && window.innerWidth > 768) {
      textareaRef.current?.focus();
    }
  }, [attachments, handleSubmit, input]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/files/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      } else {
        const { error } = await response.json();
        toast.error(error);
      }
    } catch (error) {
      toast.error("Failed to upload file, please try again!");
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );


  const handleRemoveAttachment = useCallback(
    (attachmentToRemove: Attachment) => {
      setAttachments((currentAttachments) =>
        currentAttachments.filter(
          (attachment) => attachment.url !== attachmentToRemove.url,
        ),
      );
    },
    [setAttachments],
  );

  const hasContent = input.trim().length > 0 || attachments.length > 0;

  return (
    <div className="relative w-full flex flex-col gap-1 sm:gap-1">
      {/* Suggested Actions - Responsive grid */}
      <AnimatePresence>
        {messages.length === 0 &&
          attachments.length === 0 &&
          uploadQueue.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full"
            >
              {suggestedActions.map((suggestedAction, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  key={index}
                  className="block"
                >
                  <button
                    onClick={() => {
                      setInput(suggestedAction.action);
                      textareaRef.current?.focus();
                    }}
                    className="group w-full text-left bg-background/60 backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-200 rounded-lg p-2 hover:bg-muted/50 hover:shadow-sm hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs group-hover:scale-110 transition-transform duration-200 shrink-0">
                        {suggestedAction.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-foreground block text-xs">
                          {suggestedAction.title}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {suggestedAction.label}
                        </span>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
      </AnimatePresence>

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {/* Attachments Preview - Responsive */}
      <AnimatePresence>
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-row gap-2 overflow-x-auto pb-1"
          >
            {attachments.map((attachment) => (
              <PreviewAttachment 
                key={attachment.url} 
                attachment={attachment} 
                onRemove={() => handleRemoveAttachment(attachment)} 
              />
            ))}

            {uploadQueue.map((filename) => (
              <PreviewAttachment
                key={filename}
                attachment={{
                  url: "",
                  name: filename,
                  contentType: "",
                }}
                isUploading={true}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Container - Responsive sizing */}
      <div className={`
        relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl
        transition-all duration-200 shadow-sm
        ${isFocused ? "border-primary/50 shadow-md ring-2 sm:ring-4 ring-primary/10" : "hover:border-border"}
        ${hasContent ? "border-primary/30" : ""}
      `}>
        <MessageLimitBanner
          messageCount={messageCount}
          messageLimit={messageLimit}
          messageLimitResetAt={messageLimitResetAt}
        />
        <Textarea
          ref={textareaRef}
          placeholder="Ask Jotium anything..."
          value={input}
          onChange={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            min-h-[72px] sm:min-h-[88px] max-h-[250px] sm:max-h-[300px] overflow-y-auto resize-none 
            border-0 bg-transparent text-sm sm:text-base placeholder:text-muted-foreground/60 
            focus-visible:ring-0 focus-visible:ring-offset-0 p-3 sm:p-4 
            pr-20 sm:pr-28 leading-relaxed thin-scrollbar
          `}
          rows={2}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              if (isMobile) {
                // On mobile, allow the default behavior so Enter inserts a newline.
                // Do not send; messages are sent via the submit button on mobile.
                return;
              } else {
                // On desktop, send message
                event.preventDefault();
                if (isLoading) {
                  toast.error("Please wait for the agent to finish its response!");
                } else {
                  submitForm();
                }
              }
            }
          }}
        />

        {/* Action Buttons - Responsive positioning */}
        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex items-center gap-1.5 sm:gap-2">
          <Button
            className="rounded-full p-1.5 sm:p-2 size-8 sm:size-10 border-border/50 bg-background/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200"
            onClick={(event) => {
              event.preventDefault();
              fileInputRef.current?.click();
            }}
            variant="outline"
            disabled={isLoading}
            size="sm"
          >
            <PaperclipIcon size={14} className="sm:size-4" />
          </Button>

          {isLoading ? (
            <Button
              className="rounded-full p-1.5 sm:p-2 size-8 sm:size-10 bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
              onClick={(event) => {
                event.preventDefault();
                stop();
              }}
              size="sm"
            >
              <StopIcon size={14} className="sm:size-4" />
            </Button>
          ) : (
            <Button
              className={`
                rounded-full p-1.5 sm:p-2 size-8 sm:size-10 transition-all duration-200
                ${hasContent
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-105"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
                }
              `}
              onClick={(event) => {
                event.preventDefault();
                submitForm();
              }}
              disabled={!hasContent || uploadQueue.length > 0}
              size="sm"
            >
              <ArrowUpIcon size={14} className="sm:size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
