"use client"
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
  const [selectedMetric, setSelectedMetric] = useState<string>('totalRevenue');
  const [chartTimeRange, setChartTimeRange] = useState<string>('15days'); // New state for chart time range

  // Removed table virtualization to ensure correct column alignment

  useEffect(() => {
    const params = new URLSearchParams();
    if (chartTimeRange) params.append("timeRange", chartTimeRange);
    fetch(`/api/admin/analytics?${params.toString()}`)
      .then((res) => res.json())
      .then(setAnalytics);
  }, [chartTimeRange]); // Re-fetch analytics when chartTimeRange changes

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

  const METRICS_CONFIG = [
    {
      key: 'totalRevenue',
      label: 'Total Revenue',
      value: analytics?.totalRevenue ?? 0,
      chartData: analytics?.revenuePerMonth ?? [],
      formatter: (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: '+20.1%',
      dataKey: 'amount',
      color: '#3b82f6',
    },
    {
      key: 'totalUsers',
      label: 'Total Users',
      value: analytics?.totalUsers ?? 0,
      chartData: analytics?.usersPerMonth ?? [],
      formatter: (v: number) => v.toLocaleString(),
      change: '+12%',
      dataKey: 'count',
      color: '#10b981',
    },
    {
      key: 'activeSubs',
      label: 'Active Subscriptions',
      value: analytics?.activeSubs ?? 0,
      chartData: analytics?.subsPerMonth ?? [],
      formatter: (v: number) => v.toLocaleString(),
      change: '+8%',
      dataKey: 'count',
      color: '#f59e0b',
    },
    {
      key: 'freeUsers',
      label: 'Free Users',
      value: analytics?.freeUsers ?? 0,
      chartData: analytics?.freeUsersPerMonth ?? [],
      formatter: (v: number) => v.toLocaleString(),
      change: '+5%',
      dataKey: 'count',
      color: '#8b5cf6',
    },
  ];

  const selectedMetricData = METRICS_CONFIG.find(m => m.key === selectedMetric);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16"> {/* Added pt-16 to prevent overlap with fixed navbar */}
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24">
                <Skeleton className="w-full h-full" />
              </div>
            ))
          ) : (
            METRICS_CONFIG.map((metric) => (
              <Card 
                key={metric.key} 
                className={`cursor-pointer transition-all hover:shadow-lg border-l-4 ${
                  selectedMetric === metric.key 
                    ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-l-gray-200 dark:border-l-gray-700'
                }`}
                onClick={() => setSelectedMetric(metric.key)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {metric.label}
                    </p>
                    <div className="flex items-end gap-2">
                      <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {metric.formatter(metric.value)}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                        {metric.change}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Chart Section */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {selectedMetricData?.label} Trends
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Monthly performance overview
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={chartTimeRange} onValueChange={setChartTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Last 15 days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15days">Last 15 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Select value="all" onValueChange={() => {}}> {/* This select remains unchanged as it's not part of the current task */}
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {loading || !analytics ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-gray-500">Loading chart...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={selectedMetricData?.chartData || []} 
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedMetricData?.color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={selectedMetricData?.color} stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={m => format(new Date(m), 'MMM dd')}
                      axisLine={false}
                      tickLine={false}
                      className="text-xs"
                    />
                    <YAxis 
                      allowDecimals={false} 
                      axisLine={false}
                      tickLine={false}
                      className="text-xs"
                    />
                    <BarChartTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={selectedMetricData!.dataKey} 
                      stroke={selectedMetricData?.color}
                      strokeWidth={2}
                      fill="url(#colorMetric)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="col-span-1 sm:col-span-2"
                />
                <Select value={plan || "all"} onValueChange={v => { setPlan(v === "all" ? "" : v); setPage(1); }}>
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left">
                      {createdFrom ? format(createdFrom, 'MMM dd, yyyy') : 'From date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar
                      mode="single"
                      selected={createdFrom ?? undefined}
                      onSelect={date => { setCreatedFrom(date ?? null); setPage(1); }}
                      className="border-none"
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left">
                      {createdTo ? format(createdTo, 'MMM dd, yyyy') : 'To date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar
                      mode="single"
                      selected={createdTo ?? undefined}
                      onSelect={date => { setCreatedTo(date ?? null); setPage(1); }}
                      className="border-none"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {(createdFrom || createdTo) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="self-start"
                  onClick={() => { setCreatedFrom(null); setCreatedTo(null); setPage(1); }}
                >
                  Clear date filters
                </Button>
              )}
            </div>

            {/* User Table */}
            <div className="border rounded-lg overflow-hidden">
              <div style={{ maxHeight: 500, overflow: 'auto' }}>
                <Table className="table-fixed min-w-full">
                  <TableHeader className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-12 text-center sticky left-0 bg-gray-50 dark:bg-gray-800">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={e => setSelectedIds(e.target.checked ? users.map(u => u.id) : [])}
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-left min-w-[220px]">Name</TableHead>
                      <TableHead className="font-semibold text-left min-w-[260px] hidden sm:table-cell">Email</TableHead>
                      <TableHead className="font-semibold text-center min-w-[140px]">Plan</TableHead>
                      <TableHead className="font-semibold text-center min-w-[160px] hidden md:table-cell">Status</TableHead>
                      <TableHead className="font-semibold text-center min-w-[160px] hidden lg:table-cell">Signup Date</TableHead>
                      <TableHead className="w-16 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="w-12 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(user.id)}
                            onChange={e => setSelectedIds(
                              e.target.checked 
                                ? [...selectedIds, user.id] 
                                : selectedIds.filter(id => id !== user.id)
                            )}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-left min-w-[220px]">{user.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-left min-w-[260px] text-gray-600">{user.email}</TableCell>
                        <TableCell className="text-center min-w-[140px]">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.plan === 'Pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            user.plan === 'Advanced' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {user.plan}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center min-w-[160px]">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            user.subscriptionStatus === 'canceled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {user.subscriptionStatus}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-center min-w-[160px] text-gray-600">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="w-16 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreHorizontalIcon size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => { setSelectedUser(user); setModalOpen(true); }}>
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => openEditModal(user)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onSelect={() => openDeleteModal(user)}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={page === pageNum}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(p => p < Math.ceil(total / pageSize) ? p + 1 : p)}
                      className={page === Math.ceil(total / pageSize) ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {anySelected && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 flex items-center gap-4 z-50 min-w-80">
            <span className="font-medium text-sm">
              {selectedIds.length} user{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setBulkDeleteOpen(true)}
                disabled={bulkActionLoading}
              >
                Delete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedIds([])}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* All existing modals remain the same */}
        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Selected Users</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} user{selectedIds.length > 1 ? 's' : ''}?
              {anySelectedAdmin && (
                <div className="text-red-600 font-semibold mt-2">
                  Warning: One or more selected users are admins. This action cannot be undone!
                </div>
              )}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button variant="destructive" disabled={bulkActionLoading} onClick={handleBulkDelete}>
                Delete
              </Button>
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
              {selectedUser && (
                <div className="space-y-3">
                  <div><strong>Name:</strong> {selectedUser.name}</div>
                  <div><strong>Email:</strong> {selectedUser.email}</div>
                  <div><strong>Plan:</strong> {selectedUser.plan}</div>
                  <div><strong>Subscription Status:</strong> {selectedUser.subscriptionStatus}</div>
                  <div><strong>Signup Date:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "-"}</div>
                  <div><strong>Admin:</strong> {selectedUser.isAdmin ? "Yes" : "No"}</div>
                </div>
              )}
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
                <Select value={editForm?.isAdmin ? "yes" : "no"} onValueChange={v => handleEditChange("isAdmin", v === "yes")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editError && <div className="text-red-600 text-sm">{editError}</div>}
              <AlertDialogFooter>
                <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save"}
                </Button>
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
              Are you sure you want to delete user <strong>{selectedUser?.name}</strong>? This action cannot be undone.
              {deleteError && <div className="text-red-600 text-sm mt-2">{deleteError}</div>}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button variant="destructive" onClick={handleDeleteSubmit} disabled={deleteLoading}>
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
