import Groq from "groq-sdk";
import { getStudent } from "../tools/students.tool";
import { getCollegeDetails } from "../tools/school.tool";
import {
  schoolToolFN,
  studentToolFN,
  pdfToolFN
} from "../tools_funtions/toolsFunction";
import { ChatMessage } from "../types/message";
import { systemPrompt } from "../ai_prompt_message/prompt";
import { pdfTool } from "../tools/pdf.tool";

const grokApiKey = process.env.GROK_API_KEY;

if (!grokApiKey) {
  throw new Error("GROK_API_KEY is missing");
}

const groq = new Groq({
  apiKey: grokApiKey,
});

export async function grokGenerateContent(
  messages: ChatMessage,
  collegeCode: string
) {
  try {
    const conversation = [systemPrompt, messages];

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: conversation as any,
      tools: [studentToolFN, schoolToolFN, pdfToolFN],
      tool_choice: "auto",
    });

    const assistantMessage = response.choices[0].message;

    if (
      !assistantMessage.tool_calls ||
      assistantMessage.tool_calls.length === 0
    ) {
      return {
        success: true,
        message:
          assistantMessage.content ??
          "Sorry, I couldn't understand your request.",
      };
    }

    if (!collegeCode) {
      return {
        success: false,
        message: "Please Login Again.",
      };
    }

    const toolCall = assistantMessage.tool_calls[0];
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments || "{}");

    switch (functionName) {

      case "get_student": {
        const type = Number(args.type);

        const classIdMap: Record<string, string> = {
          "9": "1",
          "10": "2",
          "11": "3",
          "12": "4",
        };

        const rawClassId = String(args.classId);
        const classId = classIdMap[rawClassId] ?? null;

        const formType = args.formType ?? null;
        const fields = args.fields ?? null;

        // Types where class is mandatory
        const classRequiredTypes = [2, 4, 6, 8, 10, 12];

        if (classRequiredTypes.includes(type) && classId === null) {
          return {
            success: false,
            message: "Please provide the class number.",
          };
        }

        return await getStudent({
          SchlCode: collegeCode,
          Class: classId,
          Type: String(type),
          Form: formType,
          fields,
          rawClassId
        });
      }

      case "get_college_details": {

        return await getCollegeDetails({
          SchlCode: collegeCode,
        });
      }

      case "pdfTool": {

        const query = args.query;

        if (!query) {
          return {
            success: false,
            message: "Please provide a PDF related query.",
          };
        }

        return await pdfTool(query);
      }

      default:
        return {
          success: false,
          message: `Unsupported tool: ${functionName}`,
        };
    }

  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Something went wrong.",
    };
  }
}