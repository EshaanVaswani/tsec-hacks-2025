import express from "express";

import { authenticate } from "../middlewares/auth";
import { gemini } from "../controllers/gemini.controller";

const router = express.Router();

router.post("/", authenticate, gemini);

export {router as geminiRoutes}