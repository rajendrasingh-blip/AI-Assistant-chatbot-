import mongoose, { Schema, Document } from "mongoose";

export interface IPSebPdfChunks extends Document {
    pdfId: string;
    pageNumber: number;
    chunkIndex: number;
    content: string;
    source: "pdf-text" | "ocr";
    createdAt: Date;
    updatedAt: Date;
}

const PSebPdfChunksSchema = new Schema<IPSebPdfChunks>({
    pdfId: {
        type: String,
        required: true,
        index: true,
    },

    pageNumber: {
        type: Number,
        required: true,
        index: true,
    },

    chunkIndex: {
        type: Number,
        required: true,
    },

    content: {
        type: String,
        required: true,
    },

    source: {
        type: String,
        enum: ["pdf-text", "ocr"],
        required: true,
    },
},
    {
        timestamps: true,
    });


PSebPdfChunksSchema.index({
    pdfId: 1,
    pageNumber: 1,
    chunkIndex: 1,
});

PSebPdfChunksSchema.index({
    content: "text",
});

export const PSebPdfChunksModel = mongoose.models.PSebPdfChunksSchema || mongoose.model<IPSebPdfChunks>("PSebPdfChunksModel", PSebPdfChunksSchema);