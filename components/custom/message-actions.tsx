"use client"

import { Check, Copy, MoreVertical, Share, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageActionsProps {
  messageId: string
  content: string
  onRegenerate?: (messageId: string) => void
  className?: string
  isMobile?: boolean
}

export function MessageActions({ messageId, content, onRegenerate, className, isMobile = false }: MessageActionsProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success("Message copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy message")
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Chat Message",
          text: content,
        })
        toast.success("Message shared successfully")
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      try {
        const url = `${window.location.origin}${window.location.pathname}#message-${messageId}`
        await navigator.clipboard.writeText(url)
        toast.success("Message link copied to clipboard")
      } catch (error) {
        toast.error("Failed to share message")
      }
    }
  }

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type)
    toast.success(type === "up" ? "Thanks for the positive feedback!" : "Thanks for the feedback!")
  }

  return (
    <div className={cn("flex items-center", "gap-0", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className={cn(
          "text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors",
          isMobile ? "h-7 w-7 p-0" : "h-8 w-8 p-0",
        )}
        title="Copy message"
      >
        {copied ? (
          <Check className={cn(isMobile ? "h-3 w-3" : "h-4 w-4", "text-green-600")} />
        ) : (
          <Copy className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className={cn(
          "text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors",
          isMobile ? "h-7 w-7 p-0" : "h-8 w-8 p-0",
        )}
        title="Share message"
      >
        <Share className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback("up")}
        className={cn(
          "text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors",
          isMobile ? "h-7 w-7 p-0" : "h-8 w-8 p-0",
          feedback === "up" && "text-green-600 bg-green-50",
        )}
        title="Good response"
      >
        <ThumbsUp className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleFeedback("down")}
        className={cn(
          "text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors",
          isMobile ? "h-7 w-7 p-0" : "h-8 w-8 p-0",
          feedback === "down" && "text-red-600 bg-red-50",
        )}
        title="Poor response"
      >
        <ThumbsDown className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
      </Button>
    </div>
  )
}