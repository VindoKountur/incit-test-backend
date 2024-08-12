import {
  findAllUser,
  findUserByEmail,
  totalUserSignUp,
  updateNameByEmail,
  verifyUserByEmail,
} from "../repositories/user.repo";
import { Request, Response } from "express";
import jwtUtil from "../utils/jwt.util";
import { decode } from "punycode";
import { compare, hash } from "bcrypt";

export const allSignupUsers = async (req: Request, res: Response) => {
  // TODO : MIDDLEWARE FOR ACCESS TOKEN
  const allUser = await findAllUser();
  const userDto = allUser.map((user) => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  });

  return res.json({
    success: true,
    data: userDto,
    timestamp: new Date().getTime(),
  });
};

export const verifyUserEmail = async (req: Request, res: Response) => {
  const verifyToken = req.body.token;

  const decodeEmail = jwtUtil.decodeEmailToken(verifyToken);
  if (!decodeEmail) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  const findUser = await findUserByEmail(decodeEmail);
  if (findUser.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Email not registered",
    });
  }
  const user = findUser[0];

  await verifyUserByEmail(decodeEmail);

  return res.status(200).json({
    success: true,
    data: getUserCredentials(user.name ?? "", user.email ?? "", true),
  });
};

export const updateUsernameByEmail = async (req: Request, res: Response) => {
  const { name } = req.body;
  const token = req.headers.authorization;
  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Name is required",
    });
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const jwtPayload = jwtUtil.decodeAccessToken(token.split(" ")[1]) as {
    name: string;
    email: string;
  };

  const users = await findUserByEmail(jwtPayload.email);
  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  await updateNameByEmail(jwtPayload.email, name);

  return res.status(200).json({
    success: true,
    messae: "Name updated",
  });
};

export const getTotalUser = async (req: Request, res: Response) => {
  const result = await totalUserSignUp();
  const data = result[0].totalUser;
  return res.status(200).json({
    success: true,
    data,
  });
};

const getUserCredentials = (
  name: string,
  email: string,
  isVerified: boolean
) => {
  const jwtPayload = {
    name,
    email,
  };
  const { accessToken, refreshToken } =
    jwtUtil.createAccessAndRefreshToken(jwtPayload);
  return {
    accessToken,
    refreshToken,
    name,
    email,
    isVerified,
  };
};
