"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { MessageImageDisplay } from "./message-image-display"; // New component for displaying images in messages
import { MessageReasoning } from "./thoughts";
import { ToolExecution } from "./tool-execution"; // Import the new component
import { Weather } from "./weather";
import { AuthorizePayment } from "../flights/authorize-payment";
import { DisplayBoardingPass } from "../flights/boarding-pass";
import { CreateReservation } from "../flights/create-reservation";
import { FlightStatus } from "../flights/flight-status";
import { ListFlights } from "../flights/list-flights";
import { SelectSeats } from "../flights/select-seats";
import { VerifyPayment } from "../flights/verify-payment";

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
  thoughts,
  duration,
  executingTools, // Updated prop
  isStreaming = false, // New prop to indicate if message is streaming
  onEditMessage,
  onUseAsInput,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
  thoughts?: string;
  duration?: number;
  executingTools?: string[]; // Updated prop type
  isStreaming?: boolean; // New prop type
  onEditMessage?: (newContent: string) => void;
  onUseAsInput?: (content: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(
    typeof content === "string" ? content : ""
  );
  const [showActionsMobile, setShowActionsMobile] = useState(false);
  const hideActionsTimeoutRef = useRef<number | null>(null);

  const handleTouchRevealActions = () => {
    setShowActionsMobile(true);
    if (hideActionsTimeoutRef.current) {
      window.clearTimeout(hideActionsTimeoutRef.current);
    }
    hideActionsTimeoutRef.current = window.setTimeout(() => {
      setShowActionsMobile(false);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (hideActionsTimeoutRef.current) {
        window.clearTimeout(hideActionsTimeoutRef.current);
      }
    };
  }, []);

  const canEdit = role === "user" && typeof content === "string" && !!onEditMessage;

  const handleSaveEdit = () => {
    if (!onEditMessage) return;
    const trimmed = draftContent.trim();
    if (trimmed.length === 0) {
      // Do not save empty edits
      setIsEditing(false);
      setDraftContent(typeof content === "string" ? content : "");
      return;
    }
    onEditMessage(trimmed);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraftContent(typeof content === "string" ? content : "");
  };

  return (
    <motion.div
      className={`group flex flex-col w-full py-1.5 sm:py-2.5 md:py-3.5 ${
        role === "assistant" ? "" : ""
      } first-of-type:pt-12 sm:first-of-type:pt-16 md:first-of-type:pt-20`}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.3,
        ease: [0.21, 1.11, 0.81, 0.99]
      }}
    >
      <div className="flex flex-row items-start gap-2 sm:gap-3 md:gap-4 w-full">
        {/* Avatar - Mobile optimized sizing */}
        <div className={`
          size-5 sm:size-6 md:size-8 rounded-md flex items-center justify-center shrink-0 shadow-sm
          ${role === "assistant" 
            ? "bg-background" 
            : "bg-background"
          }
        `}>
          <div className="size-2.5 sm:size-3 md:size-4">
            {role === "assistant" ? <BotIcon /> : <UserIcon />}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 w-full min-w-0 overflow-hidden">
          {/* Tool Execution Display - Chained Layout */}
          {executingTools && executingTools.length > 0 && role === "assistant" && (
            <div className="mb-1 sm:mb-2">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {executingTools.map((toolName, index) => (
                  <ToolExecution 
                    key={`${toolName}-${index}`} 
                    toolName={toolName}
                    isExecuting={isStreaming} // Pass streaming state to show different animation
                  />
                ))}
              </div>
            </div>
          )}

          {/* Thoughts/Reasoning - Mobile optimized */}
          {thoughts && (
            <div className="mb-1 sm:mb-2">
              <MessageReasoning 
                isLoading={false} 
                reasoning={thoughts} 
                duration={duration} 
              />
            </div>
          )}

          {/* Attachments - Mobile optimized grid - Moved before content for better UX */}
          {attachments && attachments.length > 0 && (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3 w-full">
              {attachments.map((attachment, index) => (
                <MessageImageDisplay 
                  key={attachment.url || index} 
                  attachment={attachment}
                  allAttachments={attachments}
                  currentIndex={index}
                />
              ))}
            </div>
          )}

          {/* Main Content - Full width on mobile with optimized spacing */}
          {typeof content === "string" && !isEditing && (
            <div
              className="flex flex-col gap-1 sm:gap-2 w-full overflow-hidden"
              onTouchStart={canEdit ? handleTouchRevealActions : undefined}
            >
              <div className={`
                prose prose-sm sm:prose-base max-w-none w-full overflow-hidden
                ${role === "assistant" 
                  ? "text-foreground/90" 
                  : "text-foreground"
                }
                prose-headings:text-foreground
                prose-code:text-foreground
                prose-pre:bg-muted/50
                prose-pre:border
                prose-blockquote:border-l-primary
                prose-blockquote:text-foreground/80
                
                /* Mobile-first responsive typography */
                prose-p:text-sm sm:prose-p:text-base md:prose-p:text-lg
                prose-li:text-sm sm:prose-li:text-base md:prose-li:text-lg
                prose-headings:text-base sm:prose-headings:text-lg md:prose-headings:text-xl lg:prose-headings:text-2xl
                prose-code:text-xs sm:prose-code:text-sm md:prose-code:text-base
                
                /* Prevent horizontal overflow and ensure full width */
                prose-pre:overflow-x-auto
                prose-pre:max-w-full
                prose-pre:w-full
                prose-table:max-w-full
                prose-table:overflow-x-auto
                prose-table:w-full
                prose-img:max-w-full
                prose-img:w-full
                prose-img:h-auto
                
                /* Tighter mobile spacing */
                prose-p:my-1.5 sm:prose-p:my-2 md:prose-p:my-3
                prose-li:my-0.5 sm:prose-li:my-1 md:prose-li:my-1.5
                prose-headings:my-2 sm:prose-headings:my-3 md:prose-headings:my-4
                prose-pre:my-1.5 sm:prose-pre:my-3 md:prose-pre:my-4
                
                /* Ensure all child elements take full width */
                [&>*]:w-full
                [&>*]:max-w-full
                [&_div]:w-full
                [&_div]:max-w-full
                [&_pre]:w-full
                [&_code]:max-w-full
                [&_table]:w-full
              `}>
                <Markdown showTypewriter={isStreaming && role === "assistant"}>{content}</Markdown>
              </div>
              
              {/* Message Actions - Mobile optimized positioning */}
              {/* Actions visibility: hover on desktop (lg+); tap on mobile/tablet */}
              <div
                className={`w-full mt-1 sm:mt-2 transition-opacity ${
                  canEdit && showActionsMobile ? "opacity-100" : "opacity-0"
                } group-hover:opacity-100`}
              >
                <MessageActions
                  messageId={
                    chatId +
                    "-" +
                    (typeof content === "string" ? content.slice(0, 8) : "")
                  }
                  content={content}
                  onEdit={canEdit ? () => setIsEditing(true) : undefined}
                />
              </div>
            </div>
          )}

          {/* Editing UI for user messages */}
          {typeof content === "string" && isEditing && (
            <div className="flex flex-col gap-2 w-full">
              <textarea
                className="w-full min-h-[120px] rounded-2xl sm:rounded-2xl md:rounded-3xl border border-border bg-background p-3 sm:p-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs sm:text-sm font-medium text-primary-foreground hover:opacity-90 shadow"
                  onClick={handleSaveEdit}
                >
                  Save
                </button>
                <button
                  className="inline-flex items-center rounded-full border px-4 py-1.5 text-xs sm:text-sm font-medium hover:bg-muted"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Tool Invocations - Mobile optimized spacing */}
          {toolInvocations && (
            <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 mt-1.5 sm:mt-2 w-full">
              {toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === "result") {
                  const { result } = toolInvocation;

                  return (
                    <motion.div 
                      key={toolCallId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="bg-background/50 backdrop-blur-sm border rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm w-full overflow-hidden"
                    >
                      {toolName === "getWeather" ? (
                        <Weather weatherAtLocation={result} />
                      ) : toolName === "displayFlightStatus" ? (
                        <FlightStatus flightStatus={result} />
                      ) : toolName === "searchFlights" ? (
                        <ListFlights chatId={chatId} results={result} />
                      ) : toolName === "selectSeats" ? (
                        <SelectSeats chatId={chatId} availability={result} />
                      ) : toolName === "createReservation" ? (
                        Object.keys(result).includes("error") ? null : (
                          <CreateReservation reservation={result} />
                        )
                      ) : toolName === "authorizePayment" ? (
                        <AuthorizePayment intent={result} />
                      ) : toolName === "displayBoardingPass" ? (
                        <DisplayBoardingPass boardingPass={result} />
                      ) : toolName === "verifyPayment" ? (
                        <VerifyPayment result={result} />
                      ) : (
                        <pre className="text-xs sm:text-sm text-muted-foreground overflow-auto max-w-full w-full">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      )}
                    </motion.div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}