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
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
  thoughts?: string;
  duration?: number;
}) => {
  return (
    <motion.div
      className={`group flex flex-col w-full py-4 sm:py-6 ${
        role === "assistant" ? "" : ""
      } first-of-type:pt-16 sm:first-of-type:pt-20`}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.3,
        ease: [0.21, 1.11, 0.81, 0.99]
      }}
    >
      <div className="flex flex-row items-start gap-3 sm:gap-4 w-full">
        {/* Avatar - Responsive sizing */}
        <div className={`
          w-6 h-6 sm:w-8 sm:h-8 rounded-md flex items-center justify-center shrink-0 shadow-sm
          ${role === "assistant" 
            ? "bg-background" 
            : "bg-background"
          }
        `}>
          <div className="w-3 h-3 sm:w-4 sm:h-4">
            {role === "assistant" ? <BotIcon /> : <UserIcon />}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3 w-full min-w-0">
          {/* Thoughts/Reasoning */}
          {thoughts && (
            <div className="mb-1 sm:mb-2">
              <MessageReasoning 
                isLoading={false} 
                reasoning={thoughts} 
                duration={duration} 
              />
            </div>
          )}

          {/* Main Content - Fixed width prevents layout shifts */}
          {content && typeof content === "string" && (
            <div className="flex flex-col gap-1 sm:gap-2 w-full">
              <div className={`
                prose prose-sm sm:prose-base max-w-none w-full
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
                
                /* Responsive typography */
                prose-p:text-sm prose-p:sm:text-base
                prose-li:text-sm prose-li:sm:text-base
                prose-headings:text-base prose-headings:sm:text-lg prose-headings:md:text-xl
                prose-code:text-xs prose-code:sm:text-sm
                
                /* Prevent horizontal overflow */
                prose-pre:overflow-x-auto
                prose-pre:max-w-full
                prose-table:max-w-full
                prose-table:overflow-x-auto
                prose-img:max-w-full
                prose-img:h-auto
                
                /* Better mobile spacing */
                prose-p:my-2 prose-p:sm:my-3
                prose-li:my-1 prose-li:sm:my-1.5
                prose-headings:my-3 prose-headings:sm:my-4
              `}>
                <Markdown>{content}</Markdown>
              </div>
              
              {/* Message Actions - Responsive positioning */}
              {role === "assistant" && (
                <div className="w-full">
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

          {/* Tool Invocations - Responsive spacing */}
          {toolInvocations && (
            <div className="flex flex-col gap-3 sm:gap-4 mt-2">
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
                      className="bg-background/50 backdrop-blur-sm border rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm w-full overflow-hidden"
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
                        <pre className="text-xs sm:text-sm text-muted-foreground overflow-auto max-w-full">
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

          {/* Attachments - Responsive grid */}
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 w-full">
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
