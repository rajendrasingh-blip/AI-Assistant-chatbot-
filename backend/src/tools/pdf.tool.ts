import Groq from "groq-sdk";
import { pdfDocuments } from "../constant/pdfDocuments";

const grokApiKey = process.env.GROK_API_KEY;

if (!grokApiKey) {
    throw new Error("GROK_API_KEY is missing");
}

const groq = new Groq({
    apiKey: grokApiKey,
});

export async function pdfTool(query: string) {
    const documents = pdfDocuments;
 
    const response = await groq.chat.completions.create({
        model: "qwen/qwen3.6-27b",

        messages: [
            {
                role: "system",
                content: `
You are PSEB AI Assistant.

Answer the user's question only from the
provided PDF documents.

Documents may contain Punjabi and English.

Do not invent or assume information.

If the answer is not available in the documents,
clearly say that the information is not available.

Reply in the same language as the user.
Keep the answer short and professional.
                `,
            },
            {
                role: "user",
                content: `
User Query:
${query}

PDF Documents:
${JSON.stringify(documents)}
                `,
            },
        ],
    });

    let answer =
        response.choices[0]?.message?.content || "";

    answer = answer
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .trim();

    return {
        success: true,
        message:
            answer,
        data: documents.map((doc) => ({
            pdfId: doc.pdfId,
            title: doc.title,
            pdfUrl: doc.pdfUrl,
        })),
    };
}