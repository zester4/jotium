import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { listOAuthConnections } from "@/db/queries";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const connections = await listOAuthConnections({ userId: session.user.id });
    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Failed to list OAuth connections:", error);
    return new Response("Failed to retrieve OAuth connections", { status: 500 });
  }
}
