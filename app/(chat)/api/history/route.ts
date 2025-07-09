// app/(chat)/api/history/route.ts
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId } from "@/db/queries";

export async function GET() {
  try {
    const headersList = headers();
    const session = await auth();
    console.log("Session in /api/history:", session);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await getChatsByUserId({ id: session.user.id });
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error in /api/history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
