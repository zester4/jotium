//components/custom/message.tsx
"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";
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
}) => {
  return (
    <motion.div
      className={`group flex flex-col w-full py-3 sm:py-4 md:py-6 ${
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

          {/* Main Content - Full width on mobile with optimized spacing */}
          {content && typeof content === "string" && (
            <div className="flex flex-col gap-1 sm:gap-2 w-full overflow-hidden">
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
                <Markdown>{content}</Markdown>
              </div>
              
              {/* Message Actions - Mobile optimized positioning */}
              {role === "assistant" && (
                <div className="w-full mt-1 sm:mt-2">
                  <MessageActions
                    messageId={
                      chatId +
                      "-" +
                      (typeof content === "string" ? content.slice(0, 8) : "")
                    }
                    content={content}
                  />
                </div>
              )}
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

          {/* Attachments - Mobile optimized grid */}
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 w-full">
              {attachments.map((attachment) => (
                <PreviewAttachment 
                  key={attachment.url} 
                  attachment={attachment} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};