import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "../src/route/auth.route";
import userRouter from "../src/route/user.route";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.send("Server Running v1.0.0");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
