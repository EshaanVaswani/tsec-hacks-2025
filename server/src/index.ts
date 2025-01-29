import express from "express";
import morgan from "morgan";
import { connectDb } from "./lib/db";
import { userRoutes } from "./routes/user.routes";
import { messageRoutes } from "./routes/message.routes";
import cors from "cors";

const app = express();

connectDb();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use("/api/user", userRoutes);
app.use("/api/chat", messageRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
