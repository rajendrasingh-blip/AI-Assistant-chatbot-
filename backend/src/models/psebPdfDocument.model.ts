import mongoose, { Schema, Document } from "mongoose";

export interface IPSebPdfDocument extends Document {
    pdfId: string;
    title: string;
    attachment: string;
    fileType: "pdf" | "image" | "url";
    status: "pending" | "processing" | "indexed" | "failed" | "skipped";
    totalPages: number;
    indexedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const psebPdfDocumentSchema = new Schema<IPSebPdfDocument>({
    pdfId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    attachment: {
        type: String,
        required: true,
    },

    fileType: {
        type: String,
        enum: ["pdf", "image", "url"],
        default: "pdf",
    },

    status: {
        type: String,
        enum: [
            "pending",
            "processing",
            "indexed",
            "failed",
            "skipped",
        ],
        default: "pending",
    },

    totalPages: {
        type: Number,
        default: 0,
    },

    indexedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true, });


export const PsebPdfDocument = mongoose.models.PsebPdfDocument || mongoose.model<IPSebPdfDocument>("PsebPdfDocument", psebPdfDocumentSchema)