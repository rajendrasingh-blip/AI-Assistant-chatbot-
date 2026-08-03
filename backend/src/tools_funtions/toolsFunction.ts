export const studentToolFN = {
  type: "function" as const,
  function: {
    name: "get_student_count",
    description: `
Use this tool whenever the user asks about student count.

Type Rules:

1 = Total Students (entire school)
2 = Total Students of a Class

3 = Fee Paid Students
4 = Fee Paid Students of a Class

5 = Fee Unpaid Students
6 = Fee Unpaid Students of a Class

Important:

- "verified" means Fee Paid.
- "paid" means Fee Paid.
- "fees paid" means Fee Paid.
- "challan verified" means Fee Paid.
- "payment completed" means Fee Paid.

These all MUST use Type 3 or Type 4.

- "unpaid"
- "pending"
- "fees pending"
- "fees due"
- "not paid"

These MUST use Type 5 or Type 6.

If class is mentioned, use Type 2,4,6.

If class is not mentioned, use Type 1,3,5.

Extract only class number like 8,10,11,12.
`,

    parameters: {
      type: "object",
      properties: {
        type: {
          type: "number",
          enum: [1, 2, 3, 4, 5, 6]
        },
        classId: {
          type: "string",
          description: "Only class number. Example: 8,10,11,12"
        }
      },
      required: ["type"]
    }
  }
};

export const studentDetailsToolFN = {
  type: "function" as const,
  function: {
    name: "get_student_details",
    description: `
Use this tool whenever the user asks for student details.

Rules:

- Class number is ALWAYS required.
- If the user does not mention a class, do NOT call this tool.
- Instead, ask the user to provide the class number.

Form Type Rules:

- Form Type is optional.
- If the user mentions M1, use FormType = "M1".
- If the user mentions M2, use FormType = "M2".
- If no form type is mentioned, do not send FormType.

Examples:

"Show Class 8 students"
→
classId = "8"

"Show Class 8 M1 students"
→
classId = "8"
FormType = "M1"

"Show Class 10 M2 students"
→
classId = "10"
FormType = "M2"

Always extract only the class number (8, 9, 10, 11, 12, etc.).
Never guess the class number.
`,

    parameters: {
      type: "object",
      properties: {
        classId: {
          type: "string",
          description: "Required. Class number only. Example: 8, 10, 11, 12."
        },
        formType: {
          type: "string",
          enum: ["M1", "M2"],
          description: "Optional. Student Form Type (M1 or M2)."
        }
      },
      required: ["classId"]
    }
  }
};

export const schoolToolFN = {
  type: "function" as const,
  function: {
    name: "get_college_details",
    description:
      "Use this tool when user asks about school details, school information, school name, address, UDISE, principal or other school profile information."
  }
};