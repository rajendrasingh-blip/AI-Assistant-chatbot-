import { Router } from "express";
import { geminiAiChat } from "../controllers/chat.controller.js";
import { convertPdfToImages } from "../services/pdf.service.js";

const chatRouter = Router();

chatRouter.post("/chat", geminiAiChat);
chatRouter.post("/convert-pdf", async (req, res) => {
    try {
        const { pdfUrl, pdfId } = req.body;

        if (!pdfUrl || !pdfId) {
            return res.status(400).json({
                success: false,
                message: "pdfUrl and pdfId are required",
            });
        }

        const result = await convertPdfToImages(
            pdfUrl,
            pdfId
        );

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("PDF conversion error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to convert PDF",
        });
    }
});

export default chatRouter;