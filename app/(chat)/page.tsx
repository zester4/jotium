import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/custom/chat";
import { getUserById } from "@/db/queries";
import { getUserChats, getUserDailyMessageCount } from "@/lib/redis-queries";
import { generateUUID } from "@/lib/utils";

export default async function Page() {
  const session = await auth();
  const chats = session?.user?.id
    ? await getUserChats(session.user.id)
    : [];

  // Use the first chat's id if it exists, otherwise generate a new one
  const id = chats[0]?.id || generateUUID();

  let messageCount = 0;
  let messageLimit = 5; // Default to Free plan limit
  let messageLimitResetAt: Date | null = null;

  if (session?.user?.id) {
    const user = await getUserById(session.user.id);
    const userPlan = user?.plan || "Free";
    const { count, messageLimitResetAt: resetAt } = await getUserDailyMessageCount(
      session.user.id
    );
    messageCount = count;
    messageLimitResetAt = resetAt;

    const planLimits: { [key: string]: number } = {
      Free: 5,
      Pro: 50,
      Advanced: Infinity,
    };
    messageLimit = planLimits[userPlan];
  }

  return (
    <Chat
      key={id}
      id={id}
      initialMessages={[]} // Start with empty messages for new chats
      messageCount={messageCount}
      messageLimit={messageLimit}
      messageLimitResetAt={messageLimitResetAt}
    />
  );
}
