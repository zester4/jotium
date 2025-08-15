import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getUserById } from "@/db/queries";
import { getUserDailyMessageCount } from "@/lib/redis-queries";

const planLimits: { [key: string]: number } = {
  "Free": 5,
  "Pro": 50,
  "Advanced": Infinity,
};

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id as string;
  const user = await getUserById(userId);
  const userPlan = user?.plan || "Free";
  const messageLimit = planLimits[userPlan];

  const { count, messageLimitResetAt } = await getUserDailyMessageCount(userId);

  return NextResponse.json({
    messageCount: count,
    messageLimit: messageLimit,
    messageLimitResetAt: messageLimitResetAt,
  });
}
