import { getPdfRecords } from "../api/callApi";

export const studentToolFN = {
  type: "function" as const,
  function: {
    name: "get_student",
    description: `
Use this tool whenever the user asks anything related to students.

TYPE:
1 = Total Students Count
2 = Class Wise Students Count
3 = Total Fee Paid Students Count
4 = Class Wise Fee Paid Students Count
5 = Total Fee Unpaid Students Count
6 = Class Wise Fee Unpaid Students Count
7 = Total Student List
8 = Class Wise Student List
9 = Total Fee Paid Student List
10 = Class Wise Fee Paid Student List
11 = Total Fee Unpaid Student List
12 = Class Wise Fee Unpaid Student List

CLASS:
If a class is explicitly mentioned, use the Class Wise Type and extract only the class number.
Otherwise use the School Level Type.
Never guess class.

FORM:
FormType is optional.
Supported: A1, A2, N1, N2, M1, M2, T1, T2.
If explicitly mentioned, use exactly that FormType.
Otherwise omit formType.
Never infer FormType from class.

FIELDS:
If the user explicitly requests student fields, include only those fields in "fields".
If no fields are requested, omit "fields".
Never guess fields.
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
        },
        fields: {
          type: "array",
          description:
            "Optional. Student fields requested by the user. Omit if not specified.",
          items: {
            type: "string",
            enum: [
              "Registration_num",
              "Candi_Name",
              "Father_Name",
              "Mother_Name",
              "DOB",
              "Gender",
              "Religion",
              "Caste",
              "Category",
              "CLASS",
              "Section",
              "Group_Name",
              "SCHL",
              "UDISECODE",
              "Prev_School_Name",
              "PreSchlState",
              "SESSION",
              "SubjectList",
              "CandStudyMedium",
              "Admission_Date",
              "Mobile",
              "Mother_Mobile",
              "Address",
              "District",
              "PinCode",
              "Differently_Abled",
              "Belongs_BPL",
              "wantwriter",
              "IsStudentRegistered",
              "StudentVerificationFlag",
              "challanVerify"
            ]
          }
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
