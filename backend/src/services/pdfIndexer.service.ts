import { PsebPdfDocument } from "../models/psebPdfDocument.model";
import { PSebPdfChunksModel } from "../models/psebPdfChunk.model";

import {
    downloadPdf,
} from "./pdfExtractor.services";

import {
    ocrPdf,
} from "./pdfOcr.service";

import fs from "fs/promises";
import path from "path";

function isPermanentPdfError(error: any) {
    const message =
        error?.message?.toLowerCase() || "";

    return (
        message.includes("not a valid pdf") ||
        message.includes("empty or too small") ||
        message.includes("invalid pdf structure")
    );
}

export async function indexPdf(
    pdfId: string
) {
    const pdf =
        await PsebPdfDocument.findOne({
            pdfId,
        });

    if (!pdf) {
        throw new Error(
            `PDF not found in MongoDB: ${pdfId}`
        );
    }

    if (pdf.fileType !== "pdf") {
        console.log(
            `Skipping non-PDF: ${pdfId}`
        );

        return;
    }

    /*
     * Already indexed
     */
    if (pdf.status === "indexed") {
        console.log(
            `PDF already indexed: ${pdfId}`
        );

        return;
    }

    let pdfPath: string | null =
        null;

    try {
        /*
         * Mark processing
         */
        await PsebPdfDocument.updateOne(
            { pdfId },
            {
                $set: {
                    status: "processing",
                },
            }
        );

        console.log(
            `Indexing PDF: ${pdfId} - ${pdf.title}`
        );

        /*
         * Download
         */
        pdfPath =
            await downloadPdf(
                pdf.attachment
            );

        /*
         * Existing OCR / PDF extraction
         */
        const result =
            await ocrPdf(
                pdfPath,
                pdfId
            );

        /*
         * Remove old chunks first.
         *
         * Important when PDF content changes
         * and document is re-indexed.
         */
        await PSebPdfChunksModel.deleteMany({
            pdfId,
        });

        /*
         * Insert page-wise chunks
         */
        const chunks =
            result.pages
                .filter(
                    (page) =>
                        page.text &&
                        page.text.trim().length > 0
                )
                .map(
                    (
                        page,
                        index
                    ) => ({
                        pdfId,

                        pageNumber:
                            page.pageNumber,

                        chunkIndex:
                            index,

                        content:
                            page.text.trim(),

                        source:
                            page.source,
                    })
                );

        if (chunks.length > 0) {
            await PSebPdfChunksModel.insertMany(
                chunks
            );
        }

        /*
         * Mark PDF indexed
         */
        await PsebPdfDocument.updateOne(
            { pdfId },
            {
                $set: {
                    status: "indexed",

                    totalPages:
                        result.totalPages,

                    indexedAt:
                        new Date(),
                },
            }
        );

        console.log(
            `PDF indexed successfully: ${pdfId}, pages: ${result.totalPages}, chunks: ${chunks.length}`
        );

    } catch (error) {
        console.error(
            `PDF indexing failed: ${pdfId}`,
            error
        );
        const skipped =
            isPermanentPdfError(error);

        await PsebPdfDocument.updateOne(
            { pdfId },
            {
                $set: {
                    status: skipped
                        ? "skipped"
                        : "failed",
                },
            }
        );

        throw error;

    } finally {
        /*
         * Remove downloaded temporary PDF
         */
        if (pdfPath) {
            try {
                await fs.rm(
                    path.dirname(pdfPath),
                    {
                        recursive: true,
                        force: true,
                    }
                );
            } catch (cleanupError) {
                console.error(
                    `PDF cleanup failed: ${pdfId}`,
                    cleanupError
                );
            }
        }
    }
}

async function indexPdfWithRetry(
    pdfId: string,
    maxAttempts = 3
) {
    let lastError: unknown;

    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {
        try {
            console.log(
                `Index attempt ${attempt}/${maxAttempts}: ${pdfId}`
            );

            await indexPdf(pdfId);

            return;
        } catch (error) {
            lastError = error;

            console.error(
                `Index attempt ${attempt} failed: ${pdfId}`,
                error
            );

            if (attempt < maxAttempts) {
                const delay =
                    attempt * 2000;

                console.log(
                    `Retrying ${pdfId} in ${delay}ms...`
                );

                await new Promise((resolve) =>
                    setTimeout(resolve, delay)
                );
            }
        }
    }

    throw lastError;
}

export async function indexPendingPdfs() {
    const pdfs =
        await PsebPdfDocument.find({
            status: {
                $in: ["pending", "failed"],
            },

            fileType: "pdf",
        }).lean();

    console.log(
        `PDFs waiting for indexing: ${pdfs.length}`
    );

    for (const pdf of pdfs) {
        try {
            await indexPdfWithRetry(
                pdf.pdfId
            );
        } catch (error) {
            console.error(
                `Failed to index ${pdf.pdfId} after retries`,
                error
            );
        }
    }

    console.log(
        "PDF indexing process completed."
    );
}