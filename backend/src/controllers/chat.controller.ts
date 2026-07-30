import { grokGenerateContent } from "../services/gemini.service.js";
import type { Request, Response } from "express";

export const geminiAiChat = async (req: Request, res: Response) => {
    try {
        const { query,
            //  projectId,
            collegeCode } = req.body;
        const chatres = await grokGenerateContent(query, collegeCode);
        if (!chatres) {
            res.status(404).json({ success: false, message: "not found gemini response" });

        }
        res.status(200).json({ success: true, message: "generate gemini response successfully.", data: chatres });

    }
    catch (error) {
        console.log("failed to generate response.", error);
        res.status(500).json({ success: false, message: "failed to generate response." });
    }
}