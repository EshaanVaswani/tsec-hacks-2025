import express from "express";
import morgan from "morgan";
import { connectDb } from "./lib/db";
import { userRoutes } from "./routes/user.routes";

const app = express();

connectDb();
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/user", userRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
