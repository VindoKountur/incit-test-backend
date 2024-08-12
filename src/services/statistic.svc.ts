import { db } from "../config/db";
import { usersStatistic } from "../database/schema";
import { AddUserStatisticType } from "../models/statistic.model";

const addUserStatistic = async (val: AddUserStatisticType) => {
  await db.insert(usersStatistic).values(val);
};

interface IRecordStatistic {
  userId: number;
  type: "LOGIN" | "LOGOUT" | "REGISTER";
}
export const recordUserStatistic = async ({
  type,
  userId,
}: IRecordStatistic) => {
  addUserStatistic({ type, userId });
};
