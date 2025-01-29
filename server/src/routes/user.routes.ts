import express from "express";
import {
  getMyDetails,
  loginUser,
  registerUser,
  verifyUser,
} from "../controllers/user.controller";

const router = express.Router();

router.post("/sign-up", registerUser);
router.post("/verify", verifyUser);
router.post("/login", loginUser);
router.get("/me", getMyDetails);

export { router as userRoutes };
