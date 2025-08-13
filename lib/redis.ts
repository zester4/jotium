import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_KV_REST_API_URL!,
  token: process.env.KV_KV_REST_API_TOKEN!,
});

export default redis;

// Key patterns
export const redisKeys = {
  userChats: (userId: string) => `user:${userId}:chats`,
  chatMeta: (chatId: string) => `chat:${chatId}:meta`,
  chatMessages: (chatId: string) => `chat:${chatId}:messages`,
  dailyMessages: (userId: string, date: string) => `user:${userId}:daily_messages:${date}`,
} as const;

// Helper functions for consistent serialization
export const serialize = {
  message: (message: any) => JSON.stringify(message),
  messages: (messages: any[]) => messages.map(serialize.message),
  meta: (meta: any) => JSON.stringify(meta),
};

export const deserialize = {
  message: (data: string) => JSON.parse(data),
  messages: (data: string[]) => data.map(deserialize.message),
  meta: (data: string) => JSON.parse(data),
};
