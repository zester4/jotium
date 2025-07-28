"use client";

import { ArrowLeft, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);

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

  async function markAllAsRead() {
    try {
      await fetch(`/api/notifications/mark-all-read`, {
        method: 'POST',
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      // Optionally show error
    }
  }

  return (
    <div className="max-w-2xl mx-auto pt-24 pb-6 px-4">
      <Button
        variant="outline"
        size="sm"
        className="mb-4 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="flex items-center gap-2">
          <CheckCheck className="size-4" />
          Mark all as read
        </Button>
      </div>
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
                className={`py-4 flex flex-col gap-1 cursor-pointer rounded-lg p-4 transition-colors ${!n.read ? 'bg-muted/30 hover:bg-muted/50' : 'hover:bg-muted/20'}`}
                onClick={() => {
                  if (!n.read) markAsRead(n.id);
                  setSelectedNotification(n);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-foreground">{n.title}</div>
                    {!n.read && <Badge variant="secondary">New</Badge>}
                  </div>
                  {!n.read && (
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}>
                      Mark as read
                    </Button>
                  )}
                </div>
                <div className="text-sm text-foreground/80 mt-2">{n.description}</div>
                <div className="text-xs text-foreground/60 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
