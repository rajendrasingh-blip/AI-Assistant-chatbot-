import "dotenv/config";
import express from "express";
import chatRouter from "./routers/chat.route.js";
import cors from "cors";
import connectDB from "./config/db.js";

import {
  getPdfRecords,
  loadPdfRecords,
} from "./api/callApi.js";

import {
  syncPsebPdfDocuments,
} from "./services/pdfIndexSync.service.js";

import {
  indexPendingPdfs,
} from "./services/pdfIndexer.service.js";

import {
  PsebPdfDocument,
} from "./models/psebPdfDocument.model.js";

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

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Chatbot backend is running successfully1",
  });
});

app.use("/api", chatRouter);

const connectServer = async () => {
  try {
    await connectDB();
    await loadPdfRecords();
    const pdfRecords = getPdfRecords();
    const apiPdfCount = pdfRecords.length;
    const dbPdfCount = await PsebPdfDocument.countDocuments();

    console.log(
      `API PDFs: ${apiPdfCount}, MongoDB PDFs: ${dbPdfCount}`
    );

    if (apiPdfCount > dbPdfCount) {
      console.log(
        "New PDF(s) detected. Syncing PDF metadata..."
      );

      await syncPsebPdfDocuments();

      console.log(
        "Starting background PDF indexing..."
      );

      indexPendingPdfs().catch(
        (error) => {
          console.error(
            "Background PDF indexing failed:",
            error
          );
        }
      );
    } else {
      console.log(
        "No new PDFs detected. Skipping PDF sync and indexing."
      );
    }

    app.listen(5000, () => {
      console.log(
        "server running on port 5000"
      );
    });

  } catch (error) {
    console.error(
      "Server startup failed:",
      error
    );

    process.exit(1);
  }
};

connectServer();