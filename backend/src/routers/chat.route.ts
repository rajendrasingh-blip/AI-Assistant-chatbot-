import { Router } from "express";
import { geminiAiChat } from "../controllers/chat.controller.js";

const chatRouter = Router();

chatRouter.post("/chat", geminiAiChat);

export default chatRouter;