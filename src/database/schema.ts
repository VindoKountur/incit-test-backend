import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 256 }),
  password: varchar("password", { length: 256 }),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(
    () => new Date()
  ),
});

export const usersStatistic = pgTable("users_statistic", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  type: varchar("type", { length: 256 }).notNull(),
  timestamp: timestamp("timestamp", { mode: "date" }).defaultNow(),
});