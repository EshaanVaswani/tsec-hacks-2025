import express from "express";
import morgan from "morgan";
import cors from "cors";
import { connectDb } from "./lib/db";
import { userRoutes } from "./routes/user.routes";
import { messageRoutes } from "./routes/message.routes";
import cors from "cors";

const app = express();

app.use(
   cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
   })
);

connectDb();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
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
