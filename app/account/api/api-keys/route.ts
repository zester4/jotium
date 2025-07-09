import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { saveApiKey, deleteApiKey, listApiKeys } from "@/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const services = await listApiKeys({ userId: session.user.id });
  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { service, key } = await request.json();
  if (!service || !key) {
    return new Response("Missing service or key", { status: 400 });
  }
  await saveApiKey({ userId: session.user.id, service, rawKey: key });
  return new Response(null, { status: 204 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { service } = await request.json();
  if (!service) {
    return new Response("Missing service", { status: 400 });
  }
  await deleteApiKey({ userId: session.user.id, service });
  return new Response(null, { status: 204 });
} 