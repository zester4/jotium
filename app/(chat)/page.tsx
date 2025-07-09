import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/custom/chat";
import { getChatsByUserId } from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export default async function Page() {
  const session = await auth();
  const chats = session?.user?.id
    ? await getChatsByUserId({ id: session.user.id })
    : [];

  // Use the first chat's id if it exists, otherwise generate a new one
  const id = chats[0]?.id || generateUUID();

  return <Chat key={id} id={id} initialMessages={chats[0]?.messages || []} />;
}