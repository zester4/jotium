import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/custom/chat";
import { getChatsByUserId, getMessageCount, getUserById } from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export default async function Page() {
  const session = await auth();
  const chats = session?.user?.id
    ? await getChatsByUserId({ id: session.user.id })
    : [];

  // Use the first chat's id if it exists, otherwise generate a new one
  const id = chats[0]?.id || generateUUID();

  let messageCount = 0;
  let messageLimit = 5; // Default to Free plan limit

  if (session?.user?.id) {
    const user = await getUserById(session.user.id);
    const userPlan = user?.plan || "Free";
    const { count } = await getMessageCount(session.user.id);
    messageCount = count;

    const planLimits: { [key: string]: number } = {
      "Free": 5,
      "Pro": 50,
      "Advanced": Infinity,
    };
    messageLimit = planLimits[userPlan];
  }

  return (
    <Chat
      key={id}
      id={id}
      initialMessages={chats[0]?.messages || []}
      messageCount={messageCount}
      messageLimit={messageLimit}
    />
  );
}
