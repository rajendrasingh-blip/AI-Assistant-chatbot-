export const studentToolFN = {
  type: "function" as const,
  function: {
    name: "get_student",
    description: `
Use this tool whenever the user asks anything related to students.

Select the correct Type based on the user's request.

=========================
COUNT TYPES
=========================

1  = Total Students Count
2  = Class Wise Students Count
3  = Total Fee Paid (Verified) Students Count
4  = Class Wise Fee Paid (Verified) Students Count
5  = Total Fee Unpaid Students Count
6  = Class Wise Fee Unpaid Students Count

=========================
LIST TYPES
=========================

7  = Total Student List
8  = Class Wise Student List
9  = Total Fee Paid (Verified) Student List
10 = Class Wise Fee Paid (Verified) Student List
11 = Total Fee Unpaid Student List
12 = Class Wise Fee Unpaid Student List

=========================
COUNT KEYWORDS
=========================

count
how many
total
number of
kitne
count batao

=========================
LIST KEYWORDS
=========================

list
student list
student details
details
records
show
display

=========================
PAID KEYWORDS
=========================

verified
fee paid
fees paid
paid
challan verified
payment completed

=========================
UNPAID KEYWORDS
=========================

unpaid
pending
fees pending
fees due
not paid

=========================
CLASS RULES
=========================

If a class number is mentioned,
use the Class Wise Type.

Otherwise use the School Level Type.

Always extract only the class number.

Examples:

Class 8
→ classId = "8"

Class 10
→ classId = "10"

=========================
FORM RULES
=========================

FormType is OPTIONAL.

Supported Form Types:

Class 8
- A1
- A2

Class 9
- N1
- N2

Class 10
- M1
- M2

Class 12
- T1
- T2

Rules:

- If the user mentions A1 or A2, FormType = A1/A2.
- If the user mentions N1 or N2, FormType = N1/N2.
- If the user mentions M1 or M2, FormType = M1/M2.
- If the user mentions T1 or T2, FormType = T1/T2.

If the user mentions both a class and a form type,
extract both.

Examples:

"Class 8 A1 students"
→ classId = "8"
→ formType = "A1"

"A2 student list"
→ formType = "A2"

"Class 9 N1 students"
→ classId = "9"
→ formType = "N1"

"Class 10 M2 fee paid students"
→ classId = "10"
→ formType = "M2"

"Class 12 T1 students"
→ classId = "12"
→ formType = "T1"

If the user does not mention a Form Type,
do not send formType.

Never send:

formType: ""

Never send:

classId: ""

Omit optional fields completely if unavailable.

Never guess class number or form type.
`,

    parameters: {
      type: "object",
      properties: {
        type: {
          type: "number",
          enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          description: "Student query type."
        },
        classId: {
          type: "string",
          description: "Optional. Class number only."
        },
        formType: {
          type: "string",
          enum: ["A1", "A2",
            "N1", "N2",
            "M1", "M2",
            "T1", "T2"],
          description: "Optional. Student Form Type."
        }
      },
      required: ["type"]
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