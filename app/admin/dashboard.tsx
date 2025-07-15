"use client"
import { useVirtualizer } from '@tanstack/react-virtual';
import { format } from "date-fns";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as BarChartTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend } from "recharts";

import { MoreHorizontalIcon } from "@/components/custom/icons";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const editNameRef = useRef<HTMLInputElement>(null);
  // Sorting state
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [subscriptionStatus, setSubscriptionStatus] = useState('all');
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allSelected = useMemo(() => users.length > 0 && selectedIds.length === users.length, [users, selectedIds]);
  const anySelected = selectedIds.length > 0;
  const selectedUsers = useMemo(() => users.filter(u => selectedIds.includes(u.id)), [users, selectedIds]);
  const anySelectedAdmin = selectedUsers.some(u => u.isAdmin);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [createdFrom, setCreatedFrom] = useState<Date | null>(null);
  const [createdTo, setCreatedTo] = useState<Date | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>('totalRevenue');

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then(setAnalytics);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.append("search", search);
    if (plan && plan !== "all") params.append("plan", plan);
    if (subscriptionStatus && subscriptionStatus !== 'all') params.append("subscriptionStatus", subscriptionStatus);
    if (sortBy) params.append("sortBy", sortBy);
    if (sortDir) params.append("sortDir", sortDir);
    if (createdFrom) params.append("createdFrom", createdFrom.toISOString().slice(0, 10));
    if (createdTo) params.append("createdTo", createdTo.toISOString().slice(0, 10));
    fetch(`/api/admin/users?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setLoading(false);
      });
  }, [page, pageSize, search, plan, subscriptionStatus, sortBy, sortDir, createdFrom, createdTo]);

  // Handler for opening edit modal
  const openEditModal = (user: any) => {
    setEditForm({ ...user });
    setEditModalOpen(true);
    setEditError(null);
  };
  // Handler for opening delete modal
  const openDeleteModal = (user: any) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };
  // Handler for edit form change
  const handleEditChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };
  // Handler for edit submit (calls backend)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/admin/users/${editForm.id}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          plan: editForm.plan,
          isAdmin: editForm.isAdmin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');
      setEditLoading(false);
      setEditModalOpen(false);
      // Refetch users
      setPage(1); // Optionally reset to first page
    } catch (err: any) {
      setEditError(err.message || 'Unknown error');
      setEditLoading(false);
    }
  };
  // Handler for delete submit (calls backend)
  const handleDeleteSubmit = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/delete`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      // Refetch users
      setPage(1); // Optionally reset to first page
    } catch (err: any) {
      setDeleteError(err.message || 'Unknown error');
      setDeleteLoading(false);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    setBulkActionLoading(true);
    try {
      const res = await fetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete users');
      setBulkDeleteOpen(false);
      setSelectedIds([]);
      setPage(1); // Optionally reset to first page
    } catch (err: any) {
      alert(err.message || 'Unknown error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const CARD_CONFIG = [
    {
      key: 'totalRevenue',
      label: 'Total Revenue',
      icon: '$',
      valueKey: 'totalRevenue',
      chartDataKey: 'revenuePerMonth',
      valueFormatter: (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: '+20.1% from last month', // Placeholder, can be dynamic
      dataKey: 'amount',
    },
    {
      key: 'totalUsers',
      label: 'Users',
      icon: '👥',
      valueKey: 'totalUsers',
      chartDataKey: 'usersPerMonth',
      valueFormatter: (v: number) => v.toLocaleString(),
      subtext: '+12% from last month', // Placeholder
      dataKey: 'count',
    },
    {
      key: 'activeSubs',
      label: 'Subscriptions',
      icon: '📃',
      valueKey: 'activeSubs',
      chartDataKey: 'subsPerMonth',
      valueFormatter: (v: number) => v.toLocaleString(),
      subtext: '+8% from last month', // Placeholder
      dataKey: 'count',
    },
    {
      key: 'freeUsers',
      label: 'Free Users',
      icon: '🆓',
      valueKey: 'freeUsers',
      chartDataKey: 'freeUsersPerMonth',
      valueFormatter: (v: number) => v.toLocaleString(),
      subtext: '+5% from last month', // Placeholder
      dataKey: 'count',
    },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 mt-16">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24"><Skeleton className="size-full" /></div>
          ))
        ) : (
          CARD_CONFIG.map((card, i) => (
            <div key={card.key} className="relative">
              <div
                className={`cursor-pointer rounded-xl border bg-white dark:bg-zinc-900 p-6 shadow-sm transition-all hover:shadow-md flex flex-col gap-2 ${expandedCard === card.key ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setExpandedCard(card.key)}
                tabIndex={0}
                role="button"
                aria-pressed={expandedCard === card.key}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{card.icon}</span>
                  <span className="text-muted-foreground text-lg font-medium">{card.label}</span>
                </div>
                <div className="text-3xl font-extrabold mt-2">{card.valueFormatter(analytics?.[card.valueKey] ?? 0)}</div>
                <div className="text-xs text-muted-foreground mt-1">{card.subtext}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Analytics Chart for Selected Card */}
      <div className="bg-card rounded-lg p-6 mt-4 min-h-[260px] max-w-xl mx-auto w-full shadow">
        {(() => {
          const card = CARD_CONFIG.find(c => c.key === expandedCard);
          if (!card) return null;
          if (loading || !analytics) return <div className="h-48 flex items-center justify-center text-muted-foreground">Loading chart...</div>;
          return (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics[card.chartDataKey] || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tickFormatter={m => m.slice(0, 7)} />
                <YAxis allowDecimals={false} />
                <Line type="monotone" dataKey={card.dataKey} stroke="#6366f1" strokeWidth={2} />
                <BarChartTooltip />
              </LineChart>
            </ResponsiveContainer>
          );
        })()}
      </div>

      {/* Filters Row */}
      <div className="w-full flex justify-center mb-2 sm:mb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 items-stretch sm:items-end justify-center max-w-5xl w-full">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-56 text-sm sm:text-base"
          />
          <Select value={plan || "all"} onValueChange={v => { setPlan(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-40 text-sm sm:text-base">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subscriptionStatus} onValueChange={v => { setSubscriptionStatus(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-40 text-sm sm:text-base">
              <SelectValue placeholder="Subscription Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
          {/* Date Range Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div>
              <span className="block text-xs text-muted-foreground mb-1">From</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-36 justify-start text-left text-xs sm:text-base">
                    {createdFrom ? format(createdFrom, 'yyyy-MM-dd') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0 w-full sm:w-72">
                  <Calendar
                    mode="single"
                    selected={createdFrom ?? undefined}
                    onSelect={date => { setCreatedFrom(date ?? null); setPage(1); }}
                    className="border-none bg-background"
                    captionLayout="dropdown"
                    fromYear={2022}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground mb-1">To</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-36 justify-start text-left text-xs sm:text-base">
                    {createdTo ? format(createdTo, 'yyyy-MM-dd') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0 w-full sm:w-72">
                  <Calendar
                    mode="single"
                    selected={createdTo ?? undefined}
                    onSelect={date => { setCreatedTo(date ?? null); setPage(1); }}
                    className="border-none bg-background"
                    captionLayout="dropdown"
                    fromYear={2022}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {(createdFrom || createdTo) && (
              <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => { setCreatedFrom(null); setCreatedTo(null); setPage(1); }}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-card rounded-lg p-1 xs:p-2 sm:p-4 md:p-6 overflow-x-auto">
        <div className="min-w-[400px] xs:min-w-[500px] sm:min-w-[600px]">
          <div ref={parentRef} style={{ height: 480, overflow: 'auto' }}>
            <Table className="text-xs xs:text-sm sm:text-base w-full min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 p-2 align-middle text-center">{/* Checkbox */}</TableHead>
                  <TableHead className="min-w-[140px] text-left font-semibold">Name</TableHead>
                  <TableHead className="min-w-[200px] text-left font-semibold">Email</TableHead>
                  <TableHead className="min-w-[100px] text-left font-semibold">Plan</TableHead>
                  <TableHead className="min-w-[150px] text-left font-semibold">Subscription Status</TableHead>
                  <TableHead className="min-w-[120px] text-left font-semibold">Signup Date</TableHead>
                  <TableHead className="w-16 text-center font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody style={{ position: 'relative', height: `${rowVirtualizer.getTotalSize()}px` }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow: ReturnType<typeof rowVirtualizer.getVirtualItems>[number]) => {
                  const u = users[virtualRow.index];
                  if (!u) return null;
                  return (
                    <TableRow
                      key={u.id}
                      data-index={virtualRow.index}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualRow.start}px)` }}
                    >
                      <TableCell className="w-10 p-2 align-middle text-center">
                        <input
                          type="checkbox"
                          aria-label={`Select user ${u.name}`}
                          checked={selectedIds.includes(u.id)}
                          onChange={e => setSelectedIds(e.target.checked ? [...selectedIds, u.id] : selectedIds.filter(id => id !== u.id))}
                        />
                      </TableCell>
                      <TableCell className="min-w-[140px] text-left">{u.name}</TableCell>
                      <TableCell className="min-w-[200px] text-left">{u.email}</TableCell>
                      <TableCell className="min-w-[100px] text-left">{u.plan}</TableCell>
                      <TableCell className="min-w-[150px] text-left">{u.subscriptionStatus}</TableCell>
                      <TableCell className="min-w-[120px] text-left">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="w-16 text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label="More actions"
                                  className="focus:outline-none"
                                >
                                  <MoreHorizontalIcon size={20} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => { setSelectedUser(u); setModalOpen(true); }} aria-label="View user">View</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => openEditModal(u)} aria-label="Edit user">Edit</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => openDeleteModal(u)} aria-label="Delete user" className="text-destructive">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TooltipTrigger>
                          <TooltipContent>More actions</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* Bulk Actions Bar */}
        {anySelected && (
          <div className="fixed bottom-2 left-1/2 -translate-x-1/2 bg-card border rounded-lg shadow-lg p-2 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center z-50 w-[99vw] max-w-xl">
            <span className="font-medium">{selectedIds.length} selected</span>
            <Button
              variant="destructive"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={bulkActionLoading}
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              disabled={bulkActionLoading}
              // onClick={...} // Change plan/admin (future step)
            >
              Change Plan/Admin
            </Button>
          </div>
        )}
        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Selected Users</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} user{selectedIds.length > 1 ? 's' : ''}?
              {anySelectedAdmin && (
                <div className="text-destructive font-semibold mt-2">Warning: One or more selected users are admins. This action is sensitive and cannot be undone!</div>
              )}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button variant="destructive" disabled={bulkActionLoading} onClick={handleBulkDelete}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* User Details Modal */}
        <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>User Details</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              {selectedUser ? (
                <div className="space-y-2">
                  <div><b>Name:</b> {selectedUser.name}</div>
                  <div><b>Email:</b> {selectedUser.email}</div>
                  <div><b>Plan:</b> {selectedUser.plan}</div>
                  <div><b>Subscription Status:</b> {selectedUser.subscriptionStatus}</div>
                  <div><b>Signup Date:</b> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "-"}</div>
                  <div><b>Admin:</b> {selectedUser.isAdmin ? "Yes" : "No"}</div>
                </div>
              ) : null}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* Edit User Modal */}
        <AlertDialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit User</AlertDialogTitle>
            </AlertDialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  ref={editNameRef}
                  value={editForm?.name || ""}
                  onChange={e => handleEditChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Plan</label>
                <Select value={editForm?.plan || "Free"} onValueChange={v => handleEditChange("plan", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin</label>
                <Select value={editForm?.isAdmin ? "yes" : "no"} onValueChange={v => handleEditChange("isAdmin", v === "yes") }>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editError && <div className="text-destructive text-sm">{editError}</div>}
              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                <Button type="submit" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
        {/* Delete User Modal */}
        <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Are you sure you want to delete user <b>{selectedUser?.name}</b>? This action cannot be undone.
              {deleteError && <div className="text-destructive text-sm mt-2">{deleteError}</div>}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button variant="destructive" onClick={handleDeleteSubmit} disabled={deleteLoading}>
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-disabled={page === 1}
                />
              </PaginationItem>
              {/* Simple page numbers, can be improved */}
              {[...Array(Math.max(1, Math.ceil(total / pageSize)))].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => p < Math.ceil(total / pageSize) ? p + 1 : p)}
                  aria-disabled={page === Math.ceil(total / pageSize)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
} 