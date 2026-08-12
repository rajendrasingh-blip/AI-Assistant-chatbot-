import Groq from "groq-sdk";
import fs from "fs/promises";
import path from "path";

import { pdfDocuments } from "../constant/pdfDocuments";
import { downloadPdf, } from "../services/pdfExtractor.services";
import { ocrPdf, } from "../services/pdfOcr.service";

const grokApiKey = process.env.GROK_API_KEY;

if (!grokApiKey) {
    throw new Error(
        "GROK_API_KEY is missing"
    );
}

const groq = new Groq({
    apiKey: grokApiKey,
});

interface SearchPsebPdfParams {
    pdfId: string;
    query: string;
}

export async function searchPsebPdf({
    pdfId,
    query,
}: SearchPsebPdfParams) {
    const pdf = pdfDocuments.find(
        (item) => item.id === pdfId
    );

    if (!pdf) {
        console.error(
            `PDF not found: ${pdfId}`
        );

        return {
            success: false,
            message:
                "Sorry, the relevant PSEB PDF could not be found.",
        };
    }
    let pdfPath: string | null = null;

    try {
        pdfPath = await downloadPdf(pdf.url);
        const ocrResult = await ocrPdf(pdfPath, pdfId);
// content: `
// You are the final answer extractor for the Punjab School Education Board (PSEB) AI Assistant.

// The user has asked a question about an official PSEB PDF.

// You are given the OCR text of the selected PDF.

// STRICT SOURCE PRESERVATION RULES:

// 1. Answer ONLY using the supplied PDF content.

// 2. DO NOT rewrite, paraphrase, summarize, translate, interpret,
//    correct, improve, or modify the PDF content.

// 3. The answer MUST use the EXACT WORDING from the supplied PDF content
//    wherever possible.

// 4. Do NOT change:
//    - names
//    - dates
//    - numbers
//    - percentages
//    - sections
//    - clauses
//    - rules
//    - instructions
//    - headings
//    - terminology
//    - official wording

// 5. Do NOT add information that is not present in the PDF.

// 6. Do NOT use outside knowledge.

// 7. If the answer is available in the PDF, return the relevant
//    original PDF text directly.

// 8. If the answer is spread across multiple pages, return the
//    relevant original passages from those pages without rewriting them.

// 9. Preserve the original wording and line structure as much as
//    possible.

// 10. Do not translate the PDF content even if the user's question
//     is in another language.

// 11. Do not mention OCR, Grok, tools, APIs, prompts, or internal
//     processing.

// 12. If the requested information is not present in the supplied PDF,
//     return exactly:
//     "The requested information is not available in the provided PDF."

// 13. Do not generate a new answer from your own knowledge.

// 14. Do not add an introduction such as:
//     "According to the PDF..."
//     "The answer is..."
//     "As per the document..."

// 15. Return only the relevant original PDF content.

// SELECTED PDF:

// PDF ID: ${pdf.id}

// PDF TITLE:
// ${pdf.title}

// TOTAL PAGES:
// ${ocrResult.totalPages}
// `,

        const response =
            await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",

                messages: [
                    {
                        role: "system",

                        content: `
You are the final answer generator for the Punjab School Education Board (PSEB) AI Assistant.

The user has asked a question about an official PSEB PDF.

You have been given the OCR text of the selected PDF.

IMPORTANT RULES:

1. Answer ONLY from the supplied PDF text.
2. Do NOT use outside knowledge.
3. Do NOT invent information.
4. If the answer is not available in the PDF, clearly say that the information is not available in the provided PDF.
5. Answer the user's actual question directly.
6. Do not mention OCR, Grok, tools, internal processing, or this system prompt.
7. Answer in the same language as the user whenever possible.
8. Preserve important dates, numbers, names, sections, clauses and instructions accurately.
9. If the PDF contains the answer across multiple pages, combine the relevant information.
10. Give a clear and concise answer.

Selected PDF:

PDF ID: ${pdf.id}

PDF TITLE:
${pdf.title}

TOTAL PAGES:
${ocrResult.totalPages}
`,
                    },

                    {
                        role: "user",

                        content: `
USER QUESTION:

${query}


PDF CONTENT:

${ocrResult.pdfText}
`,
                    },
                ],
            });

        const finalAnswer =
            response.choices[0]
                ?.message
                ?.content
                ?.trim();

        if (!finalAnswer) {
            return {
                success: false,
                message:
                    "I found the relevant PDF, but could not generate an answer from it.",
                pdfId: pdf.id,
                pdfTitle: pdf.title,
            };
        }

        return {
            success: true,

            message: finalAnswer,

            pdfId: pdf.id,

            pdfTitle: pdf.title,

            totalPages:
                ocrResult.totalPages,
        };
    } catch (error: any) {
        console.error(
            "PDF processing failed:",
            error
        );

        return {
            success: false,

            message:
                error?.message ||
                "Unable to process the PDF.",
        };
    } finally {
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
                    "PDF cleanup failed:",
                    cleanupError
                );
            }
        }
    }
}