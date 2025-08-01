"use client";

import Link from "next/link";

import { Button } from "../ui/button";

interface MessageLimitBannerProps {
  messageCount: number;
  messageLimit: number;
  messageLimitResetAt: Date | null;
}

export function MessageLimitBanner({
  messageCount,
  messageLimit,
  messageLimitResetAt,
}: MessageLimitBannerProps) {
  const remainingMessages = messageLimit - messageCount;

  const getResetTime = () => {
    if (!messageLimitResetAt) return "the next day";
    const resetDate = new Date(messageLimitResetAt);
    const now = new Date();
    const isToday = resetDate.getDate() === now.getDate();
    const isTomorrow = resetDate.getDate() === now.getDate() + 1;

    const time = resetDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return `today at ${time}`;
    if (isTomorrow) return `tomorrow at ${time}`;
    return `on ${resetDate.toLocaleDateString()}`;
  };

  const resetTime = getResetTime();

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
        <span>You are out of daily messages until {resetTime}.</span>
        <Button asChild size="sm" className="h-6 px-2 text-xs">
          <Link href="/pricing">Upgrade plan</Link>
        </Button>
      </div>
    );
  }

  return null;
}
