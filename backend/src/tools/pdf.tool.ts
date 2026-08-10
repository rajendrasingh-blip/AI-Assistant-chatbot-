import Groq from "groq-sdk";
import axios from "axios";
import { pdfDocuments } from "../constant/pdfDocuments";

const grokApiKey = process.env.GROK_API_KEY;
if (!grokApiKey) throw new Error("GROK_API_KEY is missing");

const groq = new Groq({ apiKey: grokApiKey });

// Image URL ko Base64 mein convert karne ka helper function
async function urlToBase64(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary').toString('base64');
    return `data:image/png;base64,${buffer}`;
}

export async function pdfTool(query: string) {
    const normalizedQuery = query.toLowerCase().trim();

    let selectedDocument = pdfDocuments.find((doc) =>
        normalizedQuery.includes(doc.pdfId.toLowerCase())
    );

    if (!selectedDocument) {
        selectedDocument = pdfDocuments[0]; // Fallback
    }

    const documents = [selectedDocument];

    // Page images nikalna
    const imageItems = documents
        .flatMap((doc) =>
            doc.pages.map((page) => ({
                imageUrl: page.imageUrl,
            }))
        )
        .slice(0, 3);

    // 1. Convert all image URLs to Base64 (CRITICAL FIX)
    const base64Images = await Promise.all(
        imageItems.map((img) => urlToBase64(img.imageUrl))
    );

    // 2. Prepare multimodal content
    const content: any[] = [
        {
            type: "text",
            text: `Read the text from the provided document images carefully (which contains both Punjabi and English text).
Answer this user question accurately: "${query}"
Give a direct, concise response in simple English.`
        }
    ];

    for (const b64 of base64Images) {
        content.push({
            type: "image_url",
            image_url: { url: b64 }
        });
    }

    // 3. Call Groq with Vision Model
    const response = await groq.chat.completions.create({
        model: "llama-3.2-90b-vision-preview", // Accurate Vision Model
        messages: [
            {
                role: "user",
                content,
            },
        ],
        temperature: 0.1,
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