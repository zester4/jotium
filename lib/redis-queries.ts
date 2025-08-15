import redis, { redisKeys, serialize, deserialize } from './redis';
import { generateUUID } from './utils';

export interface ChatMeta {
  id: string;
  createdAt: string;
  userId: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  timestamp: number;
  attachments?: any[];
  toolCalls?: any[];
}

export interface Chat {
  id: string;
  createdAt: string;
  userId: string;
  messages: ChatMessage[];
}

// Generate a title from the first user message
function generateChatTitle(chatId: string, messages: ChatMessage[] = []): string {
  if (messages.length === 0) return 'Untitled chat';
  
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  if (!firstUserMessage) return 'Untitled chat';
  
  const content = firstUserMessage.content.trim();
  return content.length > 40 ? content.slice(0, 40) + '...' : content;
}

// Save chat metadata
export async function saveChatMeta(chatMeta: Omit<ChatMeta, 'title'>) {
  const meta = { ...chatMeta, title: 'Untitled chat' };
  
  await redis.hset(redisKeys.chatMeta(chatMeta.id), meta);
  await redis.zadd(redisKeys.userChats(chatMeta.userId), {
    score: new Date(chatMeta.createdAt).getTime(),
    member: chatMeta.id,
  });
  
  return meta;
}

// Save messages for a chat
export async function saveChatMessages(chatId: string, messages: ChatMessage[]) {
  // Clear existing messages and save new ones
  await redis.del(redisKeys.chatMessages(chatId));
  if (messages.length > 0) {
    // Store messages as objects directly (Upstash Redis handles serialization)
    await redis.rpush(redisKeys.chatMessages(chatId), ...messages);
    
    // Update title based on first user message
    const title = generateChatTitle(chatId, messages);
    await redis.hset(redisKeys.chatMeta(chatId), { title });
  }
}

// Get all chat metadata for a user (lightweight)
export async function getUserChats(userId: string): Promise<ChatMeta[]> {
  const chatIds = await redis.zrange(redisKeys.userChats(userId), 0, -1, { rev: true });
  
  if (chatIds.length === 0) return [];
  
  const results: any[] = [];
  for (const id of chatIds) {
    const meta = await redis.hgetall(redisKeys.chatMeta(id as string));
    if (meta && meta.id) {
      const createdAt = meta.createdAt ? new Date(meta.createdAt as string) : new Date(); // Ensure createdAt is a Date object
      results.push({
        id: meta.id,
        createdAt: createdAt.toISOString(), // Store as ISO string for consistency
        userId: meta.userId,
        title: meta.title || 'Untitled chat',
      });
    }
  }
  
  return results;
}

// Get paginated messages for a chat
export async function getChatMessages(chatId: string, page = 1, limit = 25) {
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  
  const totalMessages = await redis.llen(redisKeys.chatMessages(chatId));
  const messages = await redis.lrange(redisKeys.chatMessages(chatId), start, end);
  
  // Handle empty or malformed messages gracefully
  const parsedMessages: ChatMessage[] = [];
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') continue;
    
    try {
      if (msg && typeof msg === 'object') {
        parsedMessages.push(msg as ChatMessage);
      }
    } catch (error) {
      console.error('Error processing message:', msg, error);
    }
  }
  
  return {
    messages: parsedMessages,
    total: totalMessages,
    hasMore: end < totalMessages - 1,
  };
}

// Save complete chat (meta + messages)
export async function saveChat(chat: {
  id: string;
  createdAt: string;
  userId: string;
  messages: any[];
}) {
  await saveChatMeta({
    id: chat.id,
    createdAt: chat.createdAt,
    userId: chat.userId,
  });
  
  if (chat.messages && chat.messages.length > 0) {
    // Convert messages to ChatMessage format
    const chatMessages: ChatMessage[] = chat.messages.map((msg: any, index: number) => ({
      id: msg.id || `msg_${chat.id}_${index}`,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || Date.now(),
      attachments: msg.attachments || [],
      toolCalls: msg.toolCalls || [],
    }));
    
    await saveChatMessages(chat.id, chatMessages);
  }
}

// Get single chat metadata
export async function getChatMeta(chatId: string): Promise<ChatMeta | null> {
  const meta = await redis.hgetall(redisKeys.chatMeta(chatId));
  if (!meta || !meta.id) return null;
  
  return {
    id: meta.id as string,
    createdAt: meta.createdAt as string,
    userId: meta.userId as string,
    title: (meta.title as string) || 'Untitled chat',
  };
}

// Delete a chat
export async function deleteChat(chatId: string, userId: string) {
  await redis.zrem(redisKeys.userChats(userId), chatId);
  await redis.del(redisKeys.chatMeta(chatId));
  await redis.del(redisKeys.chatMessages(chatId));
}

// Delete all chats for a user
export async function deleteAllUserChats(userId: string) {
  const chatIds = await redis.zrange(redisKeys.userChats(userId), 0, -1);
  
  for (const id of chatIds) {
    await redis.del(redisKeys.chatMeta(id as string));
    await redis.del(redisKeys.chatMessages(id as string));
  }
  await redis.del(redisKeys.userChats(userId));
}

// Get chat with messages (for backward compatibility)
export async function getChatWithMessages(chatId: string): Promise<Chat | null> {
  const meta = await getChatMeta(chatId);
  if (!meta) return null;
  
  const result = await getChatMessages(chatId, 1, 1000); // Get all messages
  
  return {
    id: meta.id,
    createdAt: meta.createdAt,
    userId: meta.userId,
    messages: result.messages,
  };
}

// Get total message count for a user across all chats
export async function getUserTotalMessageCount(userId: string): Promise<number> {
  const chatIds = await redis.zrange(redisKeys.userChats(userId), 0, -1);
  let totalMessages = 0;
  
  for (const chatId of chatIds) {
    const count = await redis.llen(redisKeys.chatMessages(chatId as string));
    totalMessages += count;
  }
  
  return totalMessages;
}

// Get message count for a specific chat
export async function getChatMessageCount(chatId: string): Promise<number> {
  return await redis.llen(redisKeys.chatMessages(chatId));
}

// Get user's daily message count (for rate limiting)
export async function getUserDailyMessageCount(userId: string): Promise<{
  count: number;
  messageLimitResetAt: Date | null;
}> {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const key = redisKeys.dailyMessages(userId, today);
  
  // Get today's message count
  const count = await redis.get(key) || 0;
  
  // Calculate reset time (midnight tomorrow)
  const resetTime = new Date(now);
  resetTime.setDate(now.getDate() + 1);
  resetTime.setHours(0, 0, 0, 0);
  
  return {
    count: Number(count),
    messageLimitResetAt: resetTime,
  };
}

// Increment user's daily message count
export async function incrementUserDailyMessageCount(userId: string): Promise<number> {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const key = redisKeys.dailyMessages(userId, today);
  
  // Increment count with automatic expiration (48 hours to be safe)
  const count = await redis.incr(key);
  await redis.expire(key, 48 * 60 * 60); // 48 hours in seconds
  
  return count;
}
