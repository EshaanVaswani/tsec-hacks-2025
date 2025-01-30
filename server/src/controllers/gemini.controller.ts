import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response } from "express";
import { TryCatch } from "../lib/TryCatch";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const gemini = TryCatch(async (req: Request, res: Response) => {
   try {
      const { input, context } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
          You are a legal assistance IVR system. The user has provided the following input: "${input}"
          Current navigation path: ${context.currentPath.join(" > ")}
          Language: ${context.language}
          
          Provide a natural, conversational response that:
          1. Acknowledges their input
          2. Provides relevant legal information
          3. Offers clear next steps or options
          4. Keeps responses concise and clear
          
          Respond in ${context.language === "en" ? "English" : "Hindi"}.
        `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return res.status(200).json({ text });
   } catch (error) {
      console.error("Gemini API error:", error);
      return res.status(500).json({
         message: "Error processing request",
         error: error instanceof Error ? error.message : "Unknown error",
      });
   }
});
