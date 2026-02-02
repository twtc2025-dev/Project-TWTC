import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  coins: integer("coins").default(0),
  lastLogin: timestamp("last_login").defaultNow(),
});
