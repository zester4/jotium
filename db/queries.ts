import "server-only";

import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";
import { desc, eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { user, chat, User, reservation, apiKey, ApiKey } from "./schema";
import { encryptApiKey, decryptApiKey } from "@/lib/encryption";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database:", error); // Print actual error
    throw error;
  }
}

export async function createUser(email: string, password: string, firstName: string, lastName: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash, firstName, lastName });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: messages,
        })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: messages,
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string;
  userId: string;
  details: any;
}) {
  return await db.insert(reservation).values({
    id,
    createdAt: new Date(),
    userId,
    hasCompletedPayment: false,
    details: JSON.stringify(details),
  });
}

export async function getReservationById({ id }: { id: string }) {
  const [selectedReservation] = await db
    .select()
    .from(reservation)
    .where(eq(reservation.id, id));

  return selectedReservation;
}

export async function updateReservation({
  id,
  hasCompletedPayment,
}: {
  id: string;
  hasCompletedPayment: boolean;
}) {
  return await db
    .update(reservation)
    .set({
      hasCompletedPayment,
    })
    .where(eq(reservation.id, id));
}

// Save (insert or update) a hashed and encrypted API key for a user/service
export async function saveApiKey({ userId, service, rawKey }: { userId: string; service: string; rawKey: string }) {
  const salt = genSaltSync(10);
  const keyHash = hashSync(rawKey, salt);
  const keyEncrypted = encryptApiKey(rawKey);
  // Check if key exists
  const existing = await db.select().from(apiKey).where(and(eq(apiKey.userId, userId), eq(apiKey.service, service)));
  if (existing.length > 0) {
    // Update
    return await db.update(apiKey)
      .set({ keyHash, keyEncrypted, updatedAt: new Date() })
      .where(and(eq(apiKey.userId, userId), eq(apiKey.service, service)));
  } else {
    // Insert
    return await db.insert(apiKey).values({ userId, service, keyHash, keyEncrypted, createdAt: new Date(), updatedAt: new Date() });
  }
}

// Retrieve the hashed API key for a user/service (for verification, not for tool use)
export async function getApiKey({ userId, service }: { userId: string; service: string }) {
  const [key] = await db.select().from(apiKey).where(and(eq(apiKey.userId, userId), eq(apiKey.service, service)));
  return key;
}

// Retrieve and decrypt the API key for a user/service (for backend tool use only)
export async function getDecryptedApiKey({ userId, service }: { userId: string; service: string }) {
  const [key] = await db.select().from(apiKey).where(and(eq(apiKey.userId, userId), eq(apiKey.service, service)));
  if (!key?.keyEncrypted) return null;
  return decryptApiKey(key.keyEncrypted);
}

// Delete a user's API key for a service
export async function deleteApiKey({ userId, service }: { userId: string; service: string }) {
  return await db.delete(apiKey).where(and(eq(apiKey.userId, userId), eq(apiKey.service, service)));
}

// List all service names for which the user has an API key
export async function listApiKeys({ userId }: { userId: string }) {
  const keys = await db.select({ service: apiKey.service }).from(apiKey).where(eq(apiKey.userId, userId));
  return keys.map((k) => k.service);
}
