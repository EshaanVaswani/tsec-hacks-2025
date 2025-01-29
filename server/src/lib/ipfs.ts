import pinataSDK from "@pinata/sdk";
import dotenv from "dotenv";
import { TryCatch } from "./TryCatch";
import { NextFunction, Request, Response } from "express";

dotenv.config({
   path: "./.env",
});

const pinata = new pinataSDK(
   process.env.PINATA_API_KEY,
   process.env.PINATA_SECRET_KEY
);

interface File {
   originalname: string;
   buffer: Buffer;
}

interface PinataOptions {
   pinataMetadata: {
      name: string;
   };
}

export const upload = async (file: File): Promise<string> => {
   try {
      const options: PinataOptions = {
         pinataMetadata: {
            name: file.originalname,
         },
      };

      const result = await pinata.pinFileToIPFS(file.buffer, options);
      return result.IpfsHash;
   } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw error;
   }
};

export const uploadToIPFS = TryCatch(
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
         }

         // Create a readable stream from the file buffer
         const { Buffer } = require("buffer");
         const stream = require("stream");
         const readableStream = new stream.PassThrough();
         readableStream.end(req.file.buffer);

         const options = {
            pinataMetadata: {
               name: req.file.originalname,
            },
            pinataOptions: {
               cidVersion: 0 as 0 | 1,
            },
         };

         const result = await pinata.pinFileToIPFS(readableStream, options);
         console.log("Upload successful:", result);

         res.json({
            success: true,
            ipfsHash: result.IpfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
         });
      } catch (error: unknown) {
         console.error("Upload error:", error);
         if (error instanceof Error) {
            res.status(500).json({ error: error.message });
         } else {
            res.status(500).json({ error: "Unknown error" });
         }
      }
   }
);
