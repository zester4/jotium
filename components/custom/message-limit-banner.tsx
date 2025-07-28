"use client";

import Link from "next/link";

import { Button } from "../ui/button";

interface MessageLimitBannerProps {
  messageCount: number;
  messageLimit: number;
}

export function MessageLimitBanner({
  messageCount,
  messageLimit,
}: MessageLimitBannerProps) {
  const remainingMessages = messageLimit - messageCount;
  const resetTime = "5:00 AM"; // This could be made dynamic in the future

  if (remainingMessages <= 2 && remainingMessages > 0) {
    return (
      <div className="text-center text-xs text-muted-foreground p-2 bg-background/80 backdrop-blur-sm border-b border-border/50 rounded-t-xl">
        You have {remainingMessages} message{remainingMessages > 1 ? "s" : ""} left.{" "}
        <Link href="/pricing" className="underline">
          Upgrade
        </Link>{" "}
        for more.
      </div>
    );
  }

  if (remainingMessages <= 0) {
    return (
      <div className="flex items-center justify-between text-xs text-muted-foreground p-2 bg-background/80 backdrop-blur-sm border-b border-border/50 rounded-t-xl">
        <span>
          You are out of free messages until {resetTime}.
        </span>
        <Button asChild size="sm" className="h-6 px-2 text-xs">
          <Link href="/pricing">Upgrade plan</Link>
        </Button>
      </div>
    );
  }

  return null;
}
