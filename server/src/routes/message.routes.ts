import { Router } from "express";
import {
  sendMessage,
  getMessages,
  getRecentChats,
} from "../controllers/message.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/send", authenticate, sendMessage);
router.get("/m/:receiver", authenticate, getMessages);
router.get("/recent-chats", authenticate, getRecentChats);

export { router as messageRoutes };
