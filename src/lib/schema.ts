import { pgTable, serial, text, integer, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  coins: integer("coins").default(0),
  lastLogin: timestamp("last_login").defaultNow(),
  referralCode: varchar("referral_code", { length: 10 }).unique().notNull(),
  referredBy: integer("referred_by"), // ID of the referrer
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredUserId: integer("referred_user_id").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, confirmed, rewarded
  rewardGiven: boolean("reward_given").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});
