import { NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { deleteAllChatsByUserId } from "@/db/queries";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await deleteAllChatsByUserId(session.user.id);

    return new NextResponse("Chats deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting all chats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
