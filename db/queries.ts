import "server-only";

import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";
import { desc, eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { user, chat, User, reservation, apiKey, ApiKey, notification } from "./schema";
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
  // Admin emails
  const adminEmails = [
    "seyyid225@gmail.com",
    "terry.wright40@gmail.com",
    "treffbour@gmail.com",
  ];
  const isAdmin = adminEmails.includes(email);
  try {
    return await db.insert(user).values({ email, password: hash, firstName, lastName, isAdmin });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function isUserAdminById(userId: string): Promise<boolean> {
  const [u] = await db.select({ isAdmin: user.isAdmin }).from(user).where(eq(user.id, userId));
  return !!u?.isAdmin;
}

export async function isUserAdminByEmail(email: string): Promise<boolean> {
  const [u] = await db.select({ isAdmin: user.isAdmin }).from(user).where(eq(user.email, email));
  return !!u?.isAdmin;
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

// Set Stripe customer/subscription IDs and status for a user
export async function setStripeSubscription({
  userId,
  stripeCustomerId,
  stripeSubscriptionId,
  subscriptionStatus,
  plan,
}: {
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: string;
  plan?: string;
}) {
  try {
    return await db.update(user)
      .set({
        ...(stripeCustomerId && { stripeCustomerId }),
        ...(stripeSubscriptionId && { stripeSubscriptionId }),
        ...(subscriptionStatus && { subscriptionStatus }),
        ...(plan && { plan }),
      })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to update Stripe subscription for user:", error);
    throw error;
  }
}

// Get Stripe subscription info for a user
export async function getStripeSubscription(userId: string) {
  try {
    const [u] = await db.select().from(user).where(eq(user.id, userId));
    return {
      stripeCustomerId: u?.stripeCustomerId,
      stripeSubscriptionId: u?.stripeSubscriptionId,
      subscriptionStatus: u?.subscriptionStatus,
    };
  } catch (error) {
    console.error("Failed to get Stripe subscription for user:", error);
    throw error;
  }
}

// Update only the subscription status
export async function updateSubscriptionStatus({ userId, subscriptionStatus }: { userId: string; subscriptionStatus: string }) {
  try {
    return await db.update(user)
      .set({ subscriptionStatus })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to update subscription status for user:", error);
    throw error;
  }
}

export async function createNotification({
  userId,
  title,
  description,
  type,
}: {
  userId: string;
  title: string;
  description?: string;
  type?: string;
}) {
  try {
    return await db.insert(notification).values({
      userId,
      title,
      description,
      type,
      read: false,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
}

export async function getUserNotifications(userId: string) {
  try {
    return await db
      .select()
      .from(notification)
      .where(eq(notification.userId, userId))
      .orderBy(desc(notification.createdAt));
  } catch (error) {
    console.error("Failed to get notifications:", error);
    throw error;
  }
}

export async function markNotificationRead({ notificationId }: { notificationId: string }) {
  try {
    return await db.update(notification)
      .set({ read: true })
      .where(eq(notification.id, notificationId));
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
}

// Update a user's password (hashes the new password securely)
export async function updateUserPassword({ userId, newPassword }: { userId: string; newPassword: string }) {
  const salt = genSaltSync(10);
  const hash = hashSync(newPassword, salt);
  try {
    return await db.update(user)
      .set({ password: hash })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to update user password in database:", error);
    throw error;
  }
}

// Update user profile fields
export async function updateUserProfile({
  userId,
  firstName,
  lastName,
}: {
  userId: string;
  firstName: string;
  lastName: string;
}) {
  try {
    return await db.update(user)
      .set({ firstName, lastName })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Failed to update user profile:", error);
    throw error;
  }
}

// Get a user by their ID
export async function getUserById(userId: string): Promise<User | undefined> {
  try {
    const users = await db.select().from(user).where(eq(user.id, userId));
    return users[0];
  } catch (error) {
    console.error("Failed to get user by id from database:", error);
    throw error;
  }
}
