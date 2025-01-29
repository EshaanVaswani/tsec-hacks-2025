import express from "express";
import {
  loginUser,
  registerUser,
  verifyUser,
} from "../controllers/user.controller";

const router = express.Router();

router.post("/sign-up", registerUser);
router.post("/verify", verifyUser);
router.post("/login", loginUser);

export { router as userRoutes };
