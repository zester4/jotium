import { CoreMessage } from "ai";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatById } from "@/db/queries";
import { Chat } from "@/db/schema";
import { convertToUIMessages } from "@/lib/utils";

export default async function Page({ params }: { params: any }) {
  const { id } = await params;
  const chatFromDb = await getChatById({ id });

  // type casting and converting messages to UI messages
  let chat;
  if (chatFromDb) {
    chat = {
      ...chatFromDb,
      messages: convertToUIMessages(chatFromDb.messages as Array<CoreMessage>),
    };
  }

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  if (chat && session.user.id !== chat.userId) {
    return notFound();
  }

  // If chat does not exist, render an empty chat UI for this id
  return <PreviewChat id={id} initialMessages={chat ? chat.messages : []} />;
}
