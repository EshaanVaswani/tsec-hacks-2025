import express from "express";
import { upload } from "../lib/multer";
import { uploadToIPFS } from "../lib/ipfs";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadToIPFS);

export { router as ipfsRoutes };
