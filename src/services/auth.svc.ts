import { OAuth2Client, UserRefreshClient } from "google-auth-library";
import { AddUserType } from "../models/user.model";
import {
  findUserByEmail,
  registerUser,
  updatePasswordByEmail,
} from "../repositories/user.repo";
import { Request, Response } from "express";
import { recordUserStatistic } from "./statistic.svc";
import { hash, compare } from "bcrypt";
import jwtUtil from "../utils/jwt.util";
import { sendValidationEmail } from "../utils/mail.util";

const saltRound = 10;

export const authWithGoogle = async (req: Request, res: Response) => {
  const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "postmessage"
  );

  const { tokens } = await oAuth2Client.getToken(req.body.code);

  let user: AddUserType = {
    isVerified: true,
  };
  if (tokens.access_token) {
    const { email } = await oAuth2Client.getTokenInfo(tokens.access_token);
    const name = email?.split("@")[0];
    user.email = email;
    user.name = name;
  }
  if (user.email) {
    const findUser = await findUserByEmail(user.email);
    if (findUser.length === 0) {
      const insertVal = await registerUser(user);
      const insertId = insertVal[0].insertId;
      recordUserStatistic({ type: "REGISTER", userId: insertId });
    } else {
      user = { ...findUser[0] };
      recordUserStatistic({ type: "LOGIN", userId: findUser[0].id });
    }
  }

  return res.json({
    success: true,
    data: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      name: user.name,
      email: user.email,
      isVerified: true,
    },
  });
};

export const authRefreshTokenGoogle = async (req: Request, res: Response) => {
  const user = new UserRefreshClient(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    req.body.refreshToken
  );
  const { credentials, res: resToken } = await user.refreshAccessToken(); // optain new tokens
  console.log("Cred", credentials);
  console.log("Res ", resToken);
  return res.json("OK");
};

export const logout = async (req: Request, res: Response) => {
  const userEmail = req.body.userEmail;

  if (!userEmail) {
    console.log("Error : no user id provided from client");
    return res.json("OK");
  }
  const user = await findUserByEmail(userEmail);
  if (user.length > 0) {
    const userId = user[0].id;
    await recordUserStatistic({ type: "LOGOUT", userId: Number(userId) });
  }
  return res.json({
    success: true,
    data: "OK",
  });
};

export const registerWithEmail = async (req: Request, res: Response) => {
  const payload = req.body;

  // TODO : use zod for validate payload
  const findEmail = await findUserByEmail(payload.email);
  if (findEmail.length > 0) {
    return res.status(403).json({
      success: false,
      message: "Email already registered",
    });
  }

  // TODO : enc password from payload
  const hashedPassword = await hash(payload.password, saltRound);

  const newUser: AddUserType = {
    email: payload.email,
    name: payload.email?.split("@")[0],
    isVerified: false,
    password: hashedPassword,
  };

  if (!newUser.email || !newUser.name) {
    return res.status(400).json({
      success: false,
      message: "email and name is required",
    });
  }

  const registerRes = await registerUser(newUser);
  const insertId = registerRes[0].insertId;

  const jwtPayload = {
    email: newUser.email,
    name: newUser.name,
  };

  const { accessToken, refreshToken } =
    jwtUtil.createAccessAndRefreshToken(jwtPayload);

  recordUserStatistic({ type: "REGISTER", userId: insertId });

  sendValidationEmail(newUser.email);

  return res.status(201).json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      name: newUser.name,
      email: newUser.email,
      isVerified: newUser.isVerified,
    },
  });
};

export const loginWithEmail = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const finduser = await findUserByEmail(email);
  if (finduser.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Wrong email or password",
    });
  }

  const user = finduser[0];

  const checkPassword = await compare(password, user.password ?? "");
  if (!checkPassword) {
    return res.status(400).json({
      success: false,
      message: "Wrong email or password",
    });
  }

  // TODO : Update email in database cannot null
  const jwtPayload = {
    email: user.email ?? "",
    name: user.name ?? "",
  };

  const { accessToken, refreshToken } =
    jwtUtil.createAccessAndRefreshToken(jwtPayload);

  recordUserStatistic({ type: "LOGIN", userId: user.id });

  return res.status(200).json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    },
  });
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: "No auth header is send",
    });
  }

  const token = authorization.split(" ")[1];
  const payload = jwtUtil.decodeAccessToken(token) as {
    name: string;
    email: string;
  };

  const email = payload.email;

  await sendValidationEmail(email);

  return res.status(200).json({
    success: true,
    data: "Request verified email send",
  });
};

export const updateUserPassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const token = req.headers.authorization;

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

  const user = users[0];

  // If user got no password, set new password and return
  if (user.password === null) {
    const hashedPassword = await hash(newPassword, saltRound);
    await updatePasswordByEmail(jwtPayload.email, hashedPassword);
  } else {
    // Check Current Password
    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Wrong password",
      });
    }

    // TODO : Takeout, this is like when pass null
    const hashedNewPassword = await hash(newPassword, saltRound);
    await updatePasswordByEmail(jwtPayload.email, hashedNewPassword);
  }

  return res.status(200).json({
    success: true,
    data: "Password updated",
  });
};
