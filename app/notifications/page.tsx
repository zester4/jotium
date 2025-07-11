"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) throw new Error("Failed to load notifications");
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  async function markAsRead(notificationId: string) {
    try {
      await fetch(`/api/notifications/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, read: true } : n));
    } catch (err) {
      // Optionally show error
    }
  }

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
        {loading ? (
          <div className="text-center text-foreground/70">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-foreground/70">No notifications yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`py-4 flex flex-col gap-1 cursor-pointer ${!n.read ? 'bg-muted/30 hover:bg-muted/50' : ''}`}
                onClick={() => {
                  if (!n.read) markAsRead(n.id);
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-foreground">{n.title}</div>
                  {!n.read && <Badge variant="secondary">New</Badge>}
                </div>
                <div className="text-sm text-foreground/80">{n.description}</div>
                <div className="text-xs text-foreground/60">{new Date(n.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}