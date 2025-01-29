import express from "express";
import {
  getMyDetails,
  loginUser,
  registerUser,
  verifyUser,
} from "../controllers/user.controller";
import { upload } from "../lib/multer";

const router = express.Router();

router.post("/sign-up", upload.single("avatar"), registerUser);
router.post("/verify", verifyUser);
router.post("/login", loginUser);
router.get("/me", getMyDetails);

export { router as userRoutes };
