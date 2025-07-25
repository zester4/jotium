//components/custom/navbar.tsx
import Image from "next/image";
import Link from "next/link";

import { auth, signOut } from "@/app/(auth)/auth";

import { History } from "./history";
import { SlashIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const Navbar = async () => {
  let session = await auth();

  return (
    <>
      <div className="bg-background/80 backdrop-blur-md border-b border-border/50 absolute top-0 left-0 w-dvw py-3 px-4 justify-between flex flex-row items-center z-30 shadow-sm">
        <div className="flex flex-row gap-4 items-center">
          <History user={session?.user} />
          <Link href="/" className="flex flex-row gap-3 items-center group">
            <div className="relative">
              <Image
                src="/images/jotium.png"
                height={24}
                width={24}
                alt="jotium logo"
                className="group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="text-zinc-400 group-hover:text-zinc-500 transition-colors duration-200">
              <SlashIcon size={18} />
            </div>
            <div className="text-base font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-200 truncate w-32 md:w-fit">
              Jotium Agent
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
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
                <DropdownMenuItem className="px-3 py-2 hover:bg-muted/50 transition-colors duration-200">
                  <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuItem className="p-0 z-50">
                  <form className="w-full">
                    <button
                      formAction={async () => {
                        "use server";
                        await signOut({
                          redirectTo: "/",
                        });
                      }}
                      type="submit"
                      className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-200 text-sm"
                    >
                      Sign out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              className="py-2 px-4 h-fit font-medium text-white rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105" 
              asChild
            >
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
};