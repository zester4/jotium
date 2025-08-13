//components/custom/navbar.tsx
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { auth } from "@/app/(auth)/auth";
import { getUserById } from "@/db/queries";
import { getUserDailyMessageCount } from "@/lib/redis-queries";

import { History } from "./history";
import { SlashIcon } from "./icons";
import { UserMenu } from "./user-menu";
import { Button } from "../ui/button";

export const Navbar = async () => {
  const heads = headers();
  const pathname = heads.get("x-next-pathname");
  const session = await auth();
  let messageCount = 0;
  let messageLimit: number | "Unlimited" = 5; // Default to Free plan limit

  if (session?.user?.id) {
    const user = await getUserById(session.user.id);
    const { count } = await getUserDailyMessageCount(session.user.id);
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
      <div className="bg-background/80 backdrop-blur-md border-b border-border/50 fixed top-0 left-0 w-full py-2 px-3 justify-between flex flex-row items-center z-30 shadow-sm">
        <div className="flex flex-row gap-3 items-center">
          <History user={session?.user} />
          {pathname !== "/login" && pathname !== "/register" && (
            <Link href="/" className="flex flex-row gap-3 items-center group">
              <div className="relative">
                <Image
                  src="/images/jotium.png"
                  height={20}
                  width={20}
                  alt="jotium logo"
                  className="group-hover:scale-105 transition-transform duration-200"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              <div className="text-zinc-400 group-hover:text-zinc-500 transition-colors duration-200">
                <SlashIcon size={16} />
              </div>
              <div className="text-sm md:text-base font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-200 truncate w-28 md:w-fit">
                Jotium Agent
              </div>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <UserMenu session={session} messageCount={messageCount} messageLimit={messageLimit} />
          ) : (
            <Button
              className="py-1.5 px-3 h-fit text-sm font-medium text-white rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
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
