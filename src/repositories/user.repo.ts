import { countDistinct, desc, eq } from "drizzle-orm";
import { db } from "../config/db";
import { users } from "../database/schema";
import { AddUserType } from "../models/user.model";
import e from "express";

export const registerUser = async (user: AddUserType) => {
  return await db.insert(users).values(user).returning({ insertId: users.id });
};

export const findUserByEmail = async (email: string) => {
  return await db.select().from(users).where(eq(users.email, email)).limit(1);
};

export const findAllUser = async () => {
  return await db.select().from(users).orderBy(desc(users.createdAt));
};

export const verifyUserByEmail = async (email: string) => {
  return await db
    .update(users)
    .set({ isVerified: true })
    .where(eq(users.email, email));
};

export const updateNameByEmail = async (email: string, newName: string) => {
  return await db
    .update(users)
    .set({ name: newName })
    .where(eq(users.email, email));
};

export const updatePasswordByEmail = async (
  email: string,
  newHashedPassword: string
) => {
  return await db
    .update(users)
    .set({ password: newHashedPassword })
    .where(eq(users.email, email));
};

export const totalUserSignUp = async () => {
  return await db.select({ totalUser: countDistinct(users.id) }).from(users);
};
