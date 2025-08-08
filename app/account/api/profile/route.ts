import { NextRequest } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getUserById, updateUserProfile } from "@/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const user = await getUserById(session.user.id);
  if (!user) {
    return new Response("User not found", { status: 404 });
  }
  // Only return safe fields
  return Response.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    plan: user.plan,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { firstName, lastName } = await request.json();
  if (!firstName || !lastName) {
    return new Response("Missing fields", { status: 400 });
  }
  await updateUserProfile({ userId: session.user.id, firstName, lastName });
  return new Response(null, { status: 204 });
} 