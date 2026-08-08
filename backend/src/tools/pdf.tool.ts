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
    const normalizedQuery = query.toLowerCase().trim();

    // -----------------------------------------
    // 1. Find document
    // -----------------------------------------

    let selectedDocument = pdfDocuments.find((doc) =>
        normalizedQuery.includes(doc.pdfId.toLowerCase())
    );

    // -----------------------------------------
    // 2. If PDF ID is not present,
    //    find best matching document
    // -----------------------------------------

    if (!selectedDocument) {
        let bestScore = 0;

        for (const doc of pdfDocuments) {
            const searchableText = [
                doc.pdfId,
                doc.title,
                ...doc.keywords,
            ]
                .join(" ")
                .toLowerCase();

            let score = 0;

            for (const keyword of doc.keywords) {
                const normalizedKeyword = keyword.toLowerCase();

                if (normalizedQuery.includes(normalizedKeyword)) {
                    score += normalizedKeyword.length;
                }
            }

            if (normalizedQuery.includes(doc.title.toLowerCase())) {
                score += 100;
            }

            if (score > bestScore) {
                bestScore = score;
                selectedDocument = doc;
            }
        }
    }

    // -----------------------------------------
    // 3. Fallback
    // -----------------------------------------

    const documents = selectedDocument
        ? [selectedDocument]
        : pdfDocuments.slice(0, 1);

    // -----------------------------------------
    // 4. Maximum 3 images
    // -----------------------------------------

    const imageUrls = documents
        .flatMap((doc) =>
            doc.pages.map((page) => ({
                pdfId: doc.pdfId,
                title: doc.title,
                page: page.page,
                imageUrl: page.imageUrl,
            }))
        )
        .slice(0, 3);

    console.log("QUERY:", query);

    console.log(
        "SELECTED DOCUMENT:",
        documents.map((doc) => ({
            pdfId: doc.pdfId,
            title: doc.title,
            pages: doc.pages.length,
        }))
    );

    console.log("IMAGE URLS:", imageUrls);

    // -----------------------------------------
    // 5. Prepare multimodal content
    // -----------------------------------------

    const content: any[] = [
        {
            type: "text",
            text: `
Answer the user's question using ONLY the provided PSEB document images.

User Query:
${query}

Instructions:

- Carefully read all provided document images.
- The documents may contain Punjabi/Gurmukhi and English.
- Understand Punjabi/Gurmukhi text.
- Answer only from the document.
- Do not use outside knowledge.
- Do not invent information.
- If the answer cannot be found in the provided pages, say:
  "The information is not available in the provided pages."
- Give only the final answer.
- Do not explain your reasoning.
- Keep the answer short and specific.
- Reply in the same language as the user.
`,
        },
    ];

    // -----------------------------------------
    // 6. Add images
    // -----------------------------------------

    for (const image of imageUrls) {
        content.push({
            type: "image_url",
            image_url: {
                url: image.imageUrl,
            },
        });
    }

    console.log("CONTENT:", content);

    // -----------------------------------------
    // 7. Groq Vision
    // -----------------------------------------

    const response = await groq.chat.completions.create({
        model: "qwen/qwen3.6-27b",

        messages: [
            {
                role: "system",
                content: `
You are a PSEB document assistant.

Answer ONLY from the provided document images.

Do not reveal reasoning.
Return only the final answer.

If the answer is not present in the provided pages,
say that the information is not available.

Reply in the same language as the user.
`,
            },
            {
                role: "user",
                content,
            },
        ],

        reasoning_effort: "none",

        temperature: 0.1,

        max_completion_tokens: 500,
    });

    console.log(
        "MODEL RESPONSE:",
        response.choices[0]
    );

    return {
        success: true,

        message:
            response.choices[0]?.message?.content || "",

        data: documents.map((doc) => ({
            pdfId: doc.pdfId,
            title: doc.title,
            pdfUrl: doc.pdfUrl,
        })),
    };
}