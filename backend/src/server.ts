import "dotenv/config";
import express from "express";
import chatRouter from "./routers/chat.route.js";
import cors from "cors";
import connectDB from "./config/db.js";
import { loadPdfRecords } from "./api/callApi.js";
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://testreg2026.pseb.ac.in",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Default API route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chatbot backend is running successfully1",
  });
});

app.use("/api", chatRouter);

const connectServer = async () => {
  await connectDB();
  await loadPdfRecords();
  
  app.listen(5000, () => {
    console.log("server running on port 5000");
  });
};

connectServer();