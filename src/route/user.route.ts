import express from "express";
import {
  allSignupUsers,
  getTotalUser,
  updateUsernameByEmail,
  verifyUserEmail,
} from "../services/user.svc";

const userRouter = express.Router();

userRouter.get("/", allSignupUsers);
userRouter.post("/verify-email", verifyUserEmail);
userRouter.put("/name", updateUsernameByEmail);
userRouter.get("/total", getTotalUser);

export default userRouter;
