import dotenv from "dotenv";
dotenv.config();

import express from "express";
import chatRouter from "./routers/chat.route.js";
import cors from "cors";
import connectDB from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

// Default API route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chatbot backend is running successfully",
  });
});

app.use("/api", chatRouter);

const connectServer = async () => {
  await connectDB();

  app.listen(5000, () => {
    console.log("server running on port 5000");
  });
};

connectServer();