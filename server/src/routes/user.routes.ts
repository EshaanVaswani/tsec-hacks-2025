import express from "express";
import {
   loginUser,
   registerUser,
   verifyUser,
} from "../controllers/user.controller";
import { upload } from "../lib/multer";

const router = express.Router();

router.post("/sign-up", upload.single("avatar"), registerUser);
router.post("/verify", verifyUser);
router.post("/login", loginUser);

export { router as userRoutes };
