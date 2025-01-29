import express from "express";
import morgan from "morgan";
import cors from "cors";
import { connectDb } from "./lib/db";
import { userRoutes } from "./routes/user.routes";
import { messageRoutes } from "./routes/message.routes";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { setupSocket } from "./socket";

const app = express();
const http = createServer(app); // Attach Express to HTTP server

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

connectDb();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/user", userRoutes);
app.use("/api/messages", messageRoutes);

setupSocket(http); // Attach Socket.io to HTTP server

http.listen(3000, () => {
  console.log("Server is running on port 3000");
});
