"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function formatDate(ts: number | undefined) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleDateString();
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 640);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

export default function BillingPage() {
  const [overview, setOverview] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [showInvoices, setShowInvoices] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    setShowInvoices(!isMobile);
    setShowNotifications(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      setInvoiceError(null);
      setNotificationError(null);
      try {
        const [oRes, iRes, nRes] = await Promise.all([
          fetch("/api/billing/overview"),
          fetch("/api/billing/invoices"),
          fetch("/api/notifications"),
        ]);
        const o = await oRes.json();
        setOverview(o);
        if (iRes.ok) {
          const i = await iRes.json();
          setInvoices(i.invoices || []);
        } else {
          setInvoices([]);
          setInvoiceError("No invoices found or failed to load invoices.");
        }
        if (nRes.ok) {
          const n = await nRes.json();
          setNotifications(n.notifications || []);
        } else {
          setNotifications([]);
          setNotificationError("No notifications found or failed to load notifications.");
        }
      } catch (err) {
        setError("Failed to load billing info.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handlePortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || data.error || "Failed to open billing portal.");
      }
    } catch {
      setError("Failed to open billing portal.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json();
      if (data.status) {
        setOverview((prev: any) => ({ ...prev, status: data.status, cancel_at_period_end: data.cancel_at_period_end }));
      } else {
        setError(data.error || "Failed to cancel subscription.");
      }
    } catch {
      setError("Failed to cancel subscription.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResume() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/resume", { method: "POST" });
      const data = await res.json();
      if (data.status) {
        setOverview((prev: any) => ({ ...prev, status: data.status, cancel_at_period_end: data.cancel_at_period_end }));
      } else {
        setError(data.error || "Failed to resume subscription.");
      }
    } catch {
      setError("Failed to resume subscription.");
    } finally {
      setLoading(false);
    }
  }

  async function markNotificationRead(notificationId: string) {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, read: true } : n));
    } catch {}
  }

  // Swipe-to-mark-as-read for mobile (basic touch event)
  function useSwipeToMarkRead() {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [swipedId, setSwipedId] = useState<string | null>(null);
    function onTouchStart(e: React.TouchEvent, id: string) {
      setTouchStart(e.touches[0].clientX);
      setSwipedId(id);
    }
    function onTouchEnd(e: React.TouchEvent, id: string) {
      if (touchStart !== null && swipedId === id) {
        const diff = e.changedTouches[0].clientX - touchStart;
        if (diff < -60) markNotificationRead(id); // swipe left
      }
      setTouchStart(null);
      setSwipedId(null);
    }
    return { onTouchStart, onTouchEnd };
  }
  const swipeHandlers = useSwipeToMarkRead();

  if (loading) return <div className="p-8 text-center">Loading billing info...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  const isFreePlan = !overview?.paymentMethod && (!overview?.plan || overview?.plan.toLowerCase() === "free");
  const isProPlan = overview?.plan && overview.plan.toLowerCase() === "pro";
  const isAdvancedPlan = overview?.plan && overview.plan.toLowerCase() === "advanced";

  // Plan capability descriptions
  const planDescriptions: Record<string, string> = {
    free: 'Basic AI chat and answers. No agent thoughts or advanced reasoning. Limited chat history and integrations.',
    pro: 'Smarter, more helpful agentic responses. Agent thoughts and reasoning enabled. Unlimited chat history, advanced integrations, and priority support.',
    advanced: 'Most advanced agentic reasoning and features. Advanced code generation, custom AI workflows, team tools, and dedicated support.',
  };
  const planKey = (overview?.plan || 'free').toLowerCase();
  const planDescription = planDescriptions[planKey] || '';

  return (
    <main className="max-w-2xl mx-auto pt-16 pb-6 px-2 sm:px-4 md:px-0">
        <Button
          variant="outline"
          size="sm"
          className="mb-4 flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Billing & Subscription</h1>
      {/* Overview Section */}
      <section className="mb-8">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="text-base sm:text-lg font-semibold truncate">Current Plan: {overview?.plan || "-"}</div>
              <div className="text-sm text-muted-foreground">Status: <Badge>{overview?.status}</Badge></div>
              <div className="text-xs text-muted-foreground mt-1">{planDescription}</div>
              {isFreePlan && (
                <div className="text-sm text-green-600 mt-1">You are on the Free plan. Upgrade to unlock more features!</div>
              )}
              {isProPlan && (
                <div className="text-sm text-blue-600 mt-1">You are on the Pro plan. Upgrade to Advanced for even more capabilities!</div>
              )}
              {isAdvancedPlan && (
                <div className="text-sm text-purple-600 mt-1">You are on the Advanced plan. Enjoy all features and priority support!</div>
              )}
              {overview?.cancel_at_period_end && (
                <div className="text-sm text-yellow-600 mt-1">Subscription will cancel at period end.</div>
              )}
              {overview?.status === "past_due" && (
                <div className="text-sm text-red-600 mt-1">Payment failed. Please update your payment method.</div>
              )}
              {overview?.status === "canceled" && (
                <div className="text-sm text-red-600 mt-1">Your subscription is canceled.</div>
              )}
              {overview?.status === "trialing" && (
                <div className="text-sm text-blue-600 mt-1">You are in a free trial.</div>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:items-end w-full sm:w-auto">
              {!isFreePlan && <Button onClick={handlePortal} disabled={loading} className="w-full sm:w-auto">Manage Subscription</Button>}
              {!isFreePlan && overview?.status === "active" && !overview?.cancel_at_period_end && (
                <Button variant="outline" onClick={handleCancel} disabled={loading} className="w-full sm:w-auto">Cancel Subscription</Button>
              )}
              {!isFreePlan && overview?.cancel_at_period_end && (
                <Button variant="outline" onClick={handleResume} disabled={loading} className="w-full sm:w-auto">Resume Subscription</Button>
              )}
              {/* Upgrade button for Free and Pro users */}
              {(isFreePlan || isProPlan) && (
                <Button
                  variant="default"
                  className="w-full sm:w-auto mt-2"
                  onClick={() => router.push('/pricing')}
                  disabled={loading}
                >
                  Upgrade Plan
                </Button>
              )}
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-muted-foreground">Next Payment Date: <span className="font-medium">{formatDate(overview?.current_period_end)}</span></div>
            {overview?.paymentMethod && (
              <div className="text-sm text-muted-foreground mt-1">Payment Method: <span className="font-medium">{overview.paymentMethod.card?.brand?.toUpperCase()} ****{overview.paymentMethod.card?.last4}</span> (exp {overview.paymentMethod.card?.exp_month}/{overview.paymentMethod.card?.exp_year})</div>
            )}
          </div>
        </Card>
      </section>

      {/* Invoices Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl sm:text-2xl font-bold">Invoices</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowInvoices((v) => !v)} aria-expanded={showInvoices} aria-controls="invoices-table">
            {showInvoices ? "Collapse" : "Expand"}
              </Button>
        </div>
        {invoiceError && <div className="text-red-600 mb-2">{invoiceError}</div>}
        {showInvoices && (
          <Card className="p-2 sm:p-4 overflow-x-auto" id="invoices-table">
            <Table className="min-w-[400px]">
            <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Download</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center">No invoices found.</TableCell></TableRow>
                )}
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{formatDate(inv.created)}</TableCell>
                    <TableCell>${(inv.amount_paid / 100).toFixed(2)}</TableCell>
                    <TableCell><Badge>{inv.status}</Badge></TableCell>
                    <TableCell>{inv.invoice_pdf ? <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer" className="underline">PDF</a> : '-'}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          </Card>
        )}
      </section>

      {/* Notifications Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl sm:text-2xl font-bold">Billing Notifications</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowNotifications((v) => !v)} aria-expanded={showNotifications} aria-controls="notifications-list">
            {showNotifications ? "Collapse" : "Expand"}
          </Button>
        </div>
        {notificationError && <div className="text-red-600 mb-2">{notificationError}</div>}
        {showNotifications && (
          <Card className="p-2 sm:p-4" id="notifications-list">
            {notifications.length === 0 && <div className="text-muted-foreground">No notifications.</div>}
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-2 py-2 border-b last:border-b-0 ${isMobile ? 'bg-zinc-50' : ''}`}
                  onTouchStart={isMobile ? (e) => swipeHandlers.onTouchStart(e, n.id) : undefined}
                  onTouchEnd={isMobile ? (e) => swipeHandlers.onTouchEnd(e, n.id) : undefined}
                >
                  <div className="flex items-center gap-2">
                    {!n.read && <Badge>New</Badge>}
                    <span className="font-medium truncate max-w-[180px] sm:max-w-none">{n.title}</span>
          </div>
                  <span className="text-muted-foreground flex-1 truncate">{n.description}</span>
                  <span className="text-xs text-muted-foreground sm:ml-auto">{formatDate(new Date(n.createdAt).getTime() / 1000)}</span>
                  {!n.read && !isMobile && (
                    <Button variant="ghost" size="sm" onClick={() => markNotificationRead(n.id)}>Mark as read</Button>
                  )}
                  {isMobile && !n.read && (
                    <span className="text-xs text-zinc-400">Swipe left to mark as read</span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </main>
  );
}