import { users } from "../database/schema";

export type AddUserType = typeof users.$inferInsert;
export type UserType = typeof users.$inferSelect;
