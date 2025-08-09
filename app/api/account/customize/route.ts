import { NextRequest } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getUserCustomInstruction, setUserCustomInstruction } from "@/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const instruction = await getUserCustomInstruction(session.user.id);
  return Response.json({ instruction: instruction || "" });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const { instruction } = await request.json();
  await setUserCustomInstruction({ userId: session.user.id, instruction: String(instruction || "").slice(0, 4000) });
  return new Response(null, { status: 204 });
}


