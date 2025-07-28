import { CoreMessage } from "ai";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatById, getChatMessagesById, getUserById, getMessageCount } from "@/db/queries";
import { Chat } from "@/db/schema";
import { convertToUIMessages } from "@/lib/utils";

const planLimits: { [key: string]: number } = {
  "Free": 5,
  "Pro": 50,
  "Advanced": Infinity,
};

export default async function Page({ params }: { params: any }) {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  const userId = session.user.id as string;
  const user = await getUserById(userId);
  const userPlan = user?.plan || "Free";
  const messageLimit = planLimits[userPlan];
  const { count: messageCount } = await getMessageCount(userId);

  const chatFromDb = await getChatById({ id });
  const initialMessages: Array<CoreMessage> = chatFromDb
    ? (await getChatMessagesById({ id, page: 1, limit: 10 })) as Array<CoreMessage>
    : [];

  // type casting and converting messages to UI messages
  let chat;
  if (chatFromDb) {
    chat = {
      ...chatFromDb,
      messages: convertToUIMessages(initialMessages),
    };
  }

  if (chat && session.user.id !== chat.userId) {
    return notFound();
  }

  // If chat does not exist, render an empty chat UI for this id
  return (
    <PreviewChat
      id={id}
      initialMessages={chat ? chat.messages : []}
      messageCount={messageCount}
      messageLimit={messageLimit}
    />
  );
}
