import express from "express";
import {
  getMe,
  getMyDetails,
  getUserById,
  loginUser,
  registerUser,
  searchUser,
  updateUsername,
  verifyUser,
} from "../controllers/user.controller";
import { upload } from "../lib/multer";
import { authenticate } from "../middlewares/auth";

const router = express.Router();

router.post("/sign-up", upload.single("avatar"), registerUser);
router.post("/verify", verifyUser);
router.post("/login", loginUser);
router.get("/me", getMyDetails);
router.get("/search", authenticate, searchUser);
router.post("/username", authenticate, updateUsername);
router.get("/userInfo/:userId", getUserById);
router.get("/me", authenticate, getMe);

export { router as userRoutes };
