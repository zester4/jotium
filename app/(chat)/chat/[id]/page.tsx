import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";

import { Message } from "@/ai/types";
import { auth } from "@/app/(auth)/auth";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { getUserById } from "@/db/queries";
import { getChatWithMessages, getUserChats, getUserDailyMessageCount } from "@/lib/redis-queries";

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
  const { count: messageCount, messageLimitResetAt } = await getUserDailyMessageCount(
    userId
  );

  // Check if this chat belongs to the user
  const userChats = await getUserChats(userId);
  const chatExists = userChats.some(chat => chat.id === id);
  
  if (!chatExists) {
    // If chat doesn't exist, render empty chat UI
    return (
      <PreviewChat
        id={id}
        initialMessages={[]}
        messageCount={messageCount}
        messageLimit={messageLimit}
        messageLimitResetAt={messageLimitResetAt}
      />
    );
  }

  // Get chat with messages from Redis
  const chat = await getChatWithMessages(id);
  
  // Convert Redis messages to proper format
  const initialMessages: Message[] = chat ? chat.messages.map(msg => ({
    id: msg.id,
    role: msg.role as "user" | "assistant" | "tool",
    content: msg.content,
    timestamp: msg.timestamp,
    attachments: msg.attachments || [],
    toolCalls: msg.toolCalls || [],
  })) : [];

  return (
    <PreviewChat
      id={id}
      initialMessages={initialMessages}
      messageCount={messageCount}
      messageLimit={messageLimit}
      messageLimitResetAt={messageLimitResetAt}
    />
  );
}
