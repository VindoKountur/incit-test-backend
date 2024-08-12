import { usersStatistic } from "../database/schema";

export type AddUserStatisticType = typeof usersStatistic.$inferInsert;
export type UserStatisticType = typeof usersStatistic.$inferSelect;