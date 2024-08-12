import { gt, sql } from "drizzle-orm";
import { db } from "../config/db";
import { usersStatistic } from "../database/schema";
import { AddUserStatisticType } from "../models/statistic.model";

export const addStatistic = async (val: AddUserStatisticType) => {
  return await db.insert(usersStatistic).values(val);
};

export const getActiveUserLast7Day = async () => {
  return await db
    .select()
    .from(usersStatistic)
    .where(gt(usersStatistic.timestamp, sql`NOW() - INTERVAL '7 days'`));
};
