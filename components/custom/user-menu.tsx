"use client";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
// import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ThemeToggle } from "./theme-toggle";

interface UserMenuProps {
  session: Session;
  messageCount: number;
  messageLimit: number | "Unlimited";
}

export function UserMenu({ session, messageCount, messageLimit }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="py-2 px-3 h-fit font-normal rounded-full bg-background/50 hover:bg-muted/80 border border-border/50 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md"
          variant="outline"
        >
          <Avatar className="size-7 rounded-full">
            <AvatarImage src={session.user?.image || undefined} alt={session.user?.email || "User"} />
            <AvatarFallback className="text-xs font-medium">
              {session.user?.email ? session.user.email[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="ml-2 text-sm font-medium hidden sm:block">
            {session.user?.email?.split('@')[0] || 'User'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-background/95 backdrop-blur-md border border-border/50 shadow-lg"
      >
        <div className="px-3 py-2 border-b border-border/50">
          <p className="text-sm font-medium text-foreground">
            {session.user?.email?.split('@')[0] || 'User'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {session.user?.email}
          </p>
        </div>
        <div className="px-3 py-2 border-b border-border/50">
          <p className="text-xs text-muted-foreground">
            Messages: {messageCount} / {messageLimit === Infinity ? "Unlimited" : messageLimit}
          </p>
        </div>
        <DropdownMenuItem className="px-3 py-2 hover:bg-muted/50 transition-colors duration-200">
          <ThemeToggle />
        </DropdownMenuItem>
        <DropdownMenuItem
          className="p-0 z-50"
          onSelect={async (e) => {
            e.preventDefault();
            await signOut({ redirect: false });
            window.location.reload();
          }}
        >
          <button
            type="button"
            className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-200 text-sm"
          >
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
