//app/notifications/page.tsx

"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";

const notifications = [
  {
    id: 1,
    title: "Welcome to Jotium!",
    description: "Your account has been created successfully.",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "Pro Plan Available",
    description: "Upgrade to Pro for unlimited chat history and more.",
    time: "1 day ago",
  },
  {
    id: 3,
    title: "New Feature: Tool Integrations",
    description: "You can now connect external tools to Jotium.",
    time: "3 days ago",
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <Button
        variant="outline"
        size="sm"
        className="mb-4 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>
      <h1 className="text-3xl font-bold text-center mb-8 text-foreground">Notifications</h1>
      <div className="bg-background rounded-xl shadow p-6 border border-border">
        {notifications.length === 0 ? (
          <div className="text-center text-foreground/70">No notifications yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li key={n.id} className="py-4 flex flex-col gap-1">
                <div className="font-semibold text-foreground">{n.title}</div>
                <div className="text-sm text-foreground/80">{n.description}</div>
                <div className="text-xs text-foreground/60">{n.time}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}