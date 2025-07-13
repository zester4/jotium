
import { compareSync } from "bcrypt-ts";
import { NextRequest } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getUserById, updateUserPassword } from "@/db/queries";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword) {
    return new Response("Missing current or new password", { status: 400 });
  }
  // Fetch user
  const user = await getUserById(session.user.id);
  if (!user || !user.password) {
    return new Response("User not found or password not set", { status: 404 });
  }
  // Verify current password
  const isMatch = compareSync(currentPassword, user.password);
  if (!isMatch) {
    return new Response(JSON.stringify({ error: "Current password is incorrect." }), { status: 403 });
  }
  // Update password
  await updateUserPassword({ userId: session.user.id, newPassword });
  return new Response(null, { status: 204 });
} 