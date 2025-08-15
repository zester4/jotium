//app/api/account/language/route.ts
import { NextRequest } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getUserLanguage, setUserLanguage } from "@/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const language = await getUserLanguage(session.user.id);
  return Response.json({ language: language || "" });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const { language } = await request.json();
  await setUserLanguage({ userId: session.user.id, language: String(language || "") });
  return new Response(null, { status: 204 });
}
