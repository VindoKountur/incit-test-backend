import express from "express";
import {
  authRefreshTokenGoogle,
  authWithGoogle,
  loginWithEmail,
  logout,
  registerWithEmail,
  resendVerificationEmail,
  updateUserPassword,
} from "../services/auth.svc";

const authRouter = express.Router();

authRouter.post("/google", authWithGoogle);
authRouter.post("/google/refresh-token", authRefreshTokenGoogle);
authRouter.post("/logout", logout);
authRouter.post("/register", registerWithEmail);
authRouter.post("/login", loginWithEmail);
authRouter.post("/resend-verification-email", resendVerificationEmail);
authRouter.put("/change-password", updateUserPassword);

export default authRouter;
