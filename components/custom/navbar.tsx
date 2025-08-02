//components/custom/navbar.tsx
import Image from "next/image";
import Link from "next/link";

import { auth } from "@/app/(auth)/auth";
import { getMessageCount, getUserById } from "@/db/queries";

import { History } from "./history";
import { SlashIcon } from "./icons";
import { UserMenu } from "./user-menu";
import { Button } from "../ui/button";

export const Navbar = async () => {
  const session = await auth();
  let messageCount = 0;
  let messageLimit: number | "Unlimited" = 5; // Default to Free plan limit

  if (session?.user?.id) {
    const user = await getUserById(session.user.id);
    const { count } = await getMessageCount(session.user.id);
    messageCount = count;

    const planLimits: { [key: string]: number | "Unlimited" } = {
      "Free": 5,
      "Pro": 50,
      "Advanced": "Unlimited",
    };
    messageLimit = planLimits[user?.plan || "Free"];
  }

  return (
    <>
      <div className="bg-background/80 backdrop-blur-md border-b border-border/50 fixed top-0 left-0 w-full py-3 px-4 justify-between flex flex-row items-center z-30 shadow-sm">
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
                style={{ width: "auto", height: "auto" }}
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
            <UserMenu session={session} messageCount={messageCount} messageLimit={messageLimit} />
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
