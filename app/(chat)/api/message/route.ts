import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getChatMessagesById } from "@/db/queries";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");
  const page = parseInt(searchParams.get("page") || "1", 25);
  const limit = parseInt(searchParams.get("limit") || "25", 25);

  if (!chatId) {
    return new Response("Missing chatId", { status: 400 });
  }

  try {
    const messages = await getChatMessagesById({ id: chatId, page, limit });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to get messages:", error);
    return new Response("Failed to get messages", { status: 500 });
  }
}
