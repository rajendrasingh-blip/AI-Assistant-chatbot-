import Groq from "groq-sdk";
import { getStudent } from "../tools/students.tool";
import { getCollegeDetails, } from "../tools/school.tool";
import { schoolToolFN, studentToolFN, pdfToolFN, } from "../tools_funtions/toolsFunction";
import { ChatMessage } from "../types/message";
import { systemPrompt, } from "../ai_prompt_message/prompt" ;
import { searchPsebPdf, } from "../tools/pdfSearch.tool";
const grokApiKey = process.env.GROK_API_KEY;

if (!grokApiKey) {
  throw new Error(
    "GROK_API_KEY is missing"
  );
}

const groq = new Groq({
  apiKey: grokApiKey,
});


export async function grokGenerateContent(
  messages: ChatMessage,
  collegeCode: string
) {
  try {
    const conversation = [
      systemPrompt,
      messages,
    ];

    const response =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        messages:
          conversation as any,

        tools: [
          studentToolFN,
          schoolToolFN,
          pdfToolFN,
        ],

        tool_choice: "auto",
      });


    const assistantMessage =
      response.choices[0]
        ?.message;

    if (
      !assistantMessage?.tool_calls ||
      assistantMessage.tool_calls.length === 0
    ) {
      return {
        success: true,

        message:
          assistantMessage?.content ??
          "Sorry, I couldn't understand your request.",
      };
    }

    const toolCall =
      assistantMessage.tool_calls[0];

    const functionName =
      toolCall.function.name;

    const args =
      JSON.parse(
        toolCall.function.arguments ||
        "{}"
      );

    switch (functionName) {
      case "get_student": {

        if (!collegeCode) {
          return {
            success: false,
            message:
              "Please Login Again.",
          };
        }

        const type =
          Number(args.type);

        const classId =
          args.classId ?? null;

        const formType =
          args.formType ?? null;

        const fields =
          args.fields ?? null;

        const classRequiredTypes = [2, 4, 6, 8, 10, 12,];
        if (
          classRequiredTypes.includes(type) && !classId) {
          return {
            success: false,

            message:
              "Please provide the class number.",
          };
        }

        return await getStudent({
          SchlCode: collegeCode,

          Class: classId,

          Type: String(type),

          Form: formType,

          fields,
        });
      }

      case "get_college_details": {
        if (!collegeCode) {
          return {
            success: false,

            message:
              "Please Login Again.",
          };
        }

        return await getCollegeDetails(
          collegeCode
        );
      }

      case "search_pseb_pdf": {
        return await searchPsebPdf({
          pdfId: String(args.pdfId),
          query: messages.content as string,
        });
      }
      default: {

        return {
          success: false,

          message:
            `Unsupported tool: ${functionName}`,
        };
      }
    }

  } catch (error) {

    console.error(
      "grokGenerateContent error:",
      error
    );

    return {
      success: false,

      message:
        "Something went wrong.",
    };
  }
}