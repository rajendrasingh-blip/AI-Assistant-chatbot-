"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.grokGenerateContent = grokGenerateContent;
// import { GoogleGenAI } from "@google/genai";
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const students_tool_1 = require("../tools/students.tool");
// import { studentTpeConstant } from "../constant/studentTypeConstant";
const school_tool_1 = require("../tools/school.tool");
const toolsFunction_1 = require("../tools_funtions/toolsFunction");
const grokApiKey = process.env.GROK_API_KEY;
// const GeminiApiKey = process.env.GEMINI_API_KEY;
// if (!GeminiApiKey) {
//   throw new Error("GEMINI_API_KEY is missing");
// }
if (!grokApiKey) {
    throw new Error("GROk_API_KEY is missing");
}
const groq = new groq_sdk_1.default({
    apiKey: grokApiKey,
});
// const geminiAI = new GoogleGenAI({ apiKey: GeminiApiKey });
// export async function geminiGenerateContent(
//   query: string,
//   retries = 3,
//   delay = 2000
// ): Promise<string> {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const response = await geminiAI.models.generateContent({
//         model: "gemini-3.5-flash",
//         contents: query,
//       });
//       return response.text ?? "";
//     } catch (error: any) {
//       if (
//         error?.status === 503 ||
//         error?.status === "UNAVAILABLE" ||
//         error?.message?.includes("high demand")
//       ) {
//         console.warn(
//           `Retry ${i + 1}/${retries} after ${delay}ms`
//         );
//         await new Promise((resolve) => setTimeout(resolve, delay));
//         delay *= 2;
//       } else {
//         throw error;
//       }
//     }
//   }
//   throw new Error("Gemini API is currently unavailable.");
// }
async function grokGenerateContent(messages, collegeCode) {
    try {
        let response = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: messages,
            tools: [toolsFunction_1.studentToolFN, toolsFunction_1.schoolToolFN],
            tool_choice: "auto",
        });
        let assistantMessage = response.choices[0].message;
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
            messages.push({
                role: "assistant",
                content: assistantMessage.content || null,
                tool_calls: assistantMessage.tool_calls,
            });
            for (const toolCall of assistantMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments || "{}");
                let toolResult = null;
                if (functionName === "get_student_count") {
                    if (!collegeCode) {
                        toolResult = { success: false, message: "Please Login Again." };
                    }
                    else {
                        const type = Number(args.type);
                        const classId = args.classId || null;
                        if ([2, 4, 6].includes(type) && !classId) {
                            toolResult = {
                                success: false,
                                message: "Class number is required for this type of query."
                            };
                        }
                        else {
                            toolResult = await (0, students_tool_1.getStudentCount)({
                                SchlCode: collegeCode,
                                Class: classId,
                                Type: String(type)
                            });
                        }
                    }
                }
                else if (functionName === "get_college_details") {
                    if (!collegeCode) {
                        toolResult = { success: false, message: "Please Login Again." };
                    }
                    else {
                        toolResult = await (0, school_tool_1.getCollegeDetails)({ SchlCode: collegeCode });
                    }
                }
                else {
                    toolResult = { success: false, message: `Unknown tool: ${functionName}` };
                }
                // Tool result ko JSON string bana ke bhejo
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: functionName,
                    content: JSON.stringify(toolResult),
                });
            }
            // ========== YEH SABSE IMPORTANT HAI (Formatting ke liye) ==========
            messages.push({
                role: "system",
                content: `You are a helpful school assistant.

Response Formatting Rules:
- Reply in the same language as the user (Hindi / English / Hinglish).
- Keep the response clean and easy to read on UI.
- Put important information on separate lines.
- Prefer this style:

Total Students: 1250

or

Class 10 - Verified Students: 340

or

Unpaid Students: 89

- Do not write long paragraphs.
- Do not mention tools, APIs, or technical details.
- If data is not found, simply say it politely.`
            });
            // ================================================================
            response = await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                messages: messages,
            });
            assistantMessage = response.choices[0].message;
        }
        if (!assistantMessage.content) {
            throw new Error("Model failed to generate response...");
        }
        return assistantMessage.content;
    }
    catch (error) {
        throw error;
    }
}
