//db/schema.ts
import { Message } from "@/ai/types";
import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  boolean,
  integer,
  date,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  firstName: varchar("firstName", { length: 32 }).notNull(),
  lastName: varchar("lastName", { length: 32 }).notNull(),
  // Stripe integration fields
  stripeCustomerId: varchar("stripeCustomerId", { length: 64 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 64 }),
  subscriptionStatus: varchar("subscriptionStatus", { length: 32 }), // e.g. 'active', 'trialing', 'canceled', etc.
  plan: varchar("plan", { length: 32 }).default("Free"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  isAdmin: boolean("isAdmin").notNull().default(false),
  dailyMessageCount: integer("dailyMessageCount").default(0),
  messageLimitResetAt: timestamp("messageLimitResetAt"),
  // ADD THESE PASSWORD RESET FIELDS:
  passwordResetToken: varchar("passwordResetToken", { length: 255 }),
  passwordResetExpires: timestamp("passwordResetExpires"),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  messages: json("messages").$type<Message[]>().notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Chat = InferSelectModel<typeof chat>;

export const reservation = pgTable("Reservation", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  details: json("details").notNull(),
  hasCompletedPayment: boolean("hasCompletedPayment").notNull().default(false),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Reservation = InferSelectModel<typeof reservation>;

export const apiKey = pgTable("ApiKey", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId").notNull().references(() => user.id),
  service: varchar("service", { length: 64 }).notNull(), // e.g. "Gemini", "GitHub"
  keyHash: varchar("keyHash", { length: 255 }).notNull(),
  keyEncrypted: varchar("keyEncrypted", { length: 512 }), // encrypted API key for backend tool usage
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type ApiKey = InferSelectModel<typeof apiKey>;

export const notification = pgTable("Notification", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId").notNull().references(() => user.id),
  title: varchar("title", { length: 128 }).notNull(),
  description: varchar("description", { length: 512 }),
  type: varchar("type", { length: 32 }), // e.g. 'payment', 'subscription', etc.
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Notification = InferSelectModel<typeof notification>;

export const oauthConnection = pgTable("OAuthConnection", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  service: varchar("service", { length: 64 }).notNull(), // e.g. "google", "github", "slack"
  accessToken: varchar("accessToken", { length: 512 }).notNull(), // encrypted
  refreshToken: varchar("refreshToken", { length: 512 }), // encrypted, optional
  expiresAt: timestamp("expiresAt"), // optional, for token expiry
  scope: varchar("scope", { length: 512 }), // permissions granted
  externalUserId: varchar("externalUserId", { length: 128 }).notNull(), // User's ID on the external service
  externalUserName: varchar("externalUserName", { length: 255 }), // User's name/email on the external service
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type OAuthConnection = InferSelectModel<typeof oauthConnection>;
