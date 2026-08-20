import { grokGenerateContent } from "../services/gemini.service.js";
import type { Request, Response } from "express";
import { searchPsebPdf } from "../tools/pdfSearch.tool.js";

export const geminiAiChat = async (req: Request, res: Response) => {
    try {
        const { query, collegeCode, searchType } = req.body;
        let chatres = null;

        if (searchType === "pdf") {
            chatres = await searchPsebPdf(query.content, 2);
        } else if (searchType === "pdf-deep-search") {
            chatres = await searchPsebPdf(query.content, 5);
        }
        else {
            chatres = await grokGenerateContent(query, collegeCode);
        }

        if (!chatres) {
            return res.status(404).json({
                success: false,
                message: "No response generated."
            });
        }

        return res.status(200).json({
            success: chatres.success,
            message: "Response generated successfully.",
            data: chatres.message
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate response."
        });
    }
};