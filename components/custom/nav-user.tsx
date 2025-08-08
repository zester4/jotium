"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useEffect, useState } from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
  onCloseSidebar,
}: {
  user: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    avatar: string;
    plan?: string;
  };
  onCloseSidebar?: () => void;
}) {
  const { isMobile } = useSidebar();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          const count = data.notifications?.filter((n: any) => !n.read).length || 0;
          setUnreadCount(count);
        }
      } catch (error) {
        // Handle error silently
      }
    }
    fetchNotifications();
  }, []);

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.name || user.email;

  // Compute initials for avatar fallback
  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email[0]?.toUpperCase() || "U";
    }
    return "U";
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="sm"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground px-4 py-2 min-h-0 h-10"
            >
              <Avatar className="size-9 rounded-lg">
                <AvatarImage src={user.avatar} alt={displayName} />
                <AvatarFallback className="rounded-lg text-xs">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-medium mb-0.5">{displayName}</span>
                <span className="truncate text-[10px]">{user.plan ?? "Free"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-3" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48 min-w-40 rounded-lg p-1"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 p-1 text-left text-xs">
                <Avatar className="size-6 rounded-lg">
                  <AvatarImage src={user.avatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg text-xs">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-[10px]">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="gap-2 px-2 py-1 text-xs" onClick={onCloseSidebar}>
                <Link href="/pricing" className="flex items-center w-full">
                  <Sparkles className="size-4" />
                  Upgrade Plan
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="gap-2 px-2 py-1 text-xs" onClick={onCloseSidebar}>
                <Link href="/account" className="flex items-center w-full">
                  <BadgeCheck className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 px-2 py-1 text-xs" onClick={onCloseSidebar}>
                <Link href="/billing" className="flex items-center w-full">
                  <CreditCard className="size-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 px-2 py-1 text-xs" onClick={onCloseSidebar}>
                <Link href="/notifications" className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Bell className="size-4" />
                    Notifications
                  </div>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="h-5 w-5 items-center justify-center p-0">
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                onCloseSidebar?.();
                await signOut({ redirect: false });
                window.location.reload();
              }}
              className="gap-2 px-2 py-1 text-xs cursor-pointer"
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
