import jwt from "jsonwebtoken";

const accessTokenSecret = process.env.JWT_ACCESS_SECRET as string;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET as string;
const emailSecret = process.env.JWT_EMAIL_SECRET as string;

type JwtPayload = {
  name: string;
  email: string;
};
const createAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, accessTokenSecret, { expiresIn: "1d" });
};

const decodeAccessToken = (token: string) => {
  return jwt.verify(token, accessTokenSecret);
};

const createRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(payload, refreshTokenSecret, { expiresIn: "3d" });
};

const createAccessAndRefreshToken = (payload: JwtPayload) => {
  return {
    accessToken: createAccessToken(payload),
    refreshToken: createRefreshToken(payload),
  };
};

const createEmailToken = (payload: { email: string }) => {
  return jwt.sign(payload, emailSecret, { expiresIn: "10m" });
};

const decodeEmailToken = (token: string) => {
  try {
    const payload = jwt.verify(token, emailSecret) as { email: string };
    return payload.email;
  } catch (err) {
    return null;
  }
};

export default {
  createAccessToken,
  createRefreshToken,
  createEmailToken,
  createAccessAndRefreshToken,
  decodeAccessToken,
  decodeEmailToken,
};
