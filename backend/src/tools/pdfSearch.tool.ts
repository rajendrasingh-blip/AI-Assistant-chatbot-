import Groq from "groq-sdk";
import { getPdfPageContent, searchPdfChunks } from "../services/pdfSearch.service";
import { extractPdfPageQuery } from "../constant/pdfregex";

const grokApiKey = process.env.GROK_API_KEY;

if (!grokApiKey) {
    throw new Error(
        "GROK_API_KEY is missing"
    );
}

const groq = new Groq({
    apiKey: grokApiKey,
});


export async function searchPsebPdf(query: string, searchLimit: number) {
    let ocrResult = null;
    const { pdfId, pageNumber } = extractPdfPageQuery(query) ?? {
        pdfId: undefined,
        pageNumber: undefined,
    };

    try {
        if (pdfId) {
            ocrResult = await getPdfPageContent(pdfId, pageNumber);
        } else {
            ocrResult = await searchPdfChunks(query, searchLimit);
        }
        const pdfContext = ocrResult
            .map((item, index) => {
                return `
SOURCE ${index + 1}

PDF ID: ${item.pdfId}
PDF TITLE: ${item.pdfTitle || "N/A"}
PAGE NUMBER: ${item.pageNumber}
CHUNK INDEX: ${item.chunkIndex}
SOURCE TYPE: ${item.source}

PDF CONTENT:
${item.content}
`;
            })
            .join("\n\n==============================\n\n");

        const response =
            await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",

                messages: [
                    {
                        role: "system",

                        content: `
You are the official-document answer assistant for the Punjab School Education Board (PSEB).

Your task is to answer the user's question using ONLY the supplied PDF content.

IMPORTANT RULES:

1. Use ONLY information present in the supplied PDF.

2. DO NOT use outside knowledge.

3. DO NOT invent, assume, infer, or add information.

4. For normal questions, identify the relevant page(s) and passage(s).
   If the user asks for full page or complete content, return the supplied content without omitting relevant information.

5. Return the relevant information from the PDF with MINIMUM modification.

6. Preserve the original PDF wording, language, terminology and structure
   wherever possible.

7. VERY IMPORTANT LANGUAGE RULE:

   The user's question language MUST NOT determine the answer language.

   The answer MUST preserve the language used in the PDF.

   If the relevant PDF content is in English, answer in English.

   If the relevant PDF content is in Punjabi, answer in Punjabi.

   If the relevant PDF content contains BOTH Punjabi and English,
   preserve BOTH languages in the answer in the same way they appear
   in the relevant PDF content.

   DO NOT translate the PDF content into the user's language.

   DO NOT convert English text into Hindi/Punjabi.

   DO NOT convert Punjabi text into Hindi/English.

8. If the PDF contains bilingual or mixed-language content,
   preserve the mixed-language content instead of translating it.

9. If the user asks a question in Hindi but the relevant PDF passage
   is in English, return the relevant English PDF content.

10. If the user asks a question in English but the relevant PDF passage
    is in Punjabi, return the relevant Punjabi PDF content.

11. If the answer is spread across multiple pages, combine only the
    relevant passages while preserving each passage's original language.

12. Correct ONLY obvious OCR errors when necessary to make the original
    PDF meaning understandable.

13. Do NOT change names, dates, numbers, percentages, designations,
    organizations, clauses, headings or official terminology.

14. Do NOT add explanations unless they are necessary to connect the
    supplied PDF information.

15. If the requested information is not present in the supplied PDF,
    respond exactly:

"The requested information is not available in the provided PDF."

16. Do not mention OCR, Groq, AI, model, prompt, tools or internal processing.

17. Do not add unnecessary introduction or conclusion.

18. If the user asks for the complete content, full data, or entire page of the supplied PDF, return the supplied content as completely as possible without summarizing or omitting information.

19. Never claim to provide the complete PDF unless the complete PDF content is supplied.`},
                    {
                        role: "user",
                        content: `USER QUESTION:
${query}

SUPPLIED PDF CONTENT:
${pdfContext}`,
                    },
                ],
            });
        console.log(response, 'response')
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
            };
        }

        return {
            success: true,

            message: finalAnswer,
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
    }
}