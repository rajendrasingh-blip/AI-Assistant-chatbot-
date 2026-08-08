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
    const normalizedQuery = query.toLowerCase();

    const selectedDocuments = pdfDocuments.filter((doc) =>
        doc.keywords.some((keyword) =>
            normalizedQuery.includes(keyword.toLowerCase())
        )
    );

    const documents =
        selectedDocuments.length > 0
            ? selectedDocuments
            : pdfDocuments;

    const imageUrls = documents
        .flatMap((doc) =>
            doc.pages.map((page) => ({
                pdfId: doc.pdfId,
                title: doc.title,
                imageUrl: page.imageUrl,
            }))
        )
        .slice(0, 3);

    console.log("QUERY:", query);
    console.log("IMAGE URLS:", imageUrls, 'selectedDocuments', selectedDocuments);

    const content: any[] = [
        {
            type: "text",
            text: `
Answer the user's question using ONLY the provided PSEB document images.

User Query:
${query}

Important:
- Carefully read the document images.
- Documents may contain Punjabi, English, or both.
- Understand Punjabi/Gurmukhi text.
- Do not invent information.
- If the answer is not present in the provided documents, say that it is not available.
- Give ONLY the answer to the user's question.
- Do not explain your reasoning.
- Do not show your thinking process.
- Keep the answer short and specific.
- Reply in the same language as the user.
      `,
        },
    ];

    // Images LLM ko actual image input ke roop me bhejna
    for (const image of imageUrls) {
        content.push({
            type: "image_url",
            image_url: {
                url: image.imageUrl,
            },
        });
    }

    const response = await groq.chat.completions.create({
        model: "qwen/qwen3.6-27b",

        messages: [
            {
                role: "system",
                content: `
You are a PSEB document assistant.

Answer ONLY from the provided document images.

Do not reveal your reasoning or thinking process.
Return only the final answer.

If the answer is not present in the documents,
say that the information is not available.

Keep answers short, clear and specific.
Reply in the same language as the user.
        `,
            },
            {
                role: "user",
                content,
            },
        ],

        // Thinking output ko hide karne ke liye
        reasoning_format: "hidden",

        temperature: 0.2,
        max_completion_tokens: 500,
    });

    return {
        success: true,
        message: response.choices[0]?.message?.content || "",
        data: documents.map((doc) => ({
            pdfId: doc.pdfId,
            title: doc.title,
            pdfUrl: doc.pdfUrl,
        })),
    };
}