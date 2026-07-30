export const studentToolFN = {
    type: "function" as const,
    function: {
        name: "get_student_count",
        description: `Use this tool to get student count from the school.

### Type Selection Rules (Very Important):

| Type | When to use                                      | Class Required? |
|------|--------------------------------------------------|-----------------|
| 1    | Total students (no class mentioned)              | No              |
| 2    | Total students of a specific class               | Yes             |
| 3    | Total Verified / Fees Paid students              | No              |
| 4    | Verified / Fees Paid students of a class         | Yes             |
| 5    | Total Unpaid / Pending fees students             | No              |
| 6    | Unpaid / Pending fees students of a class        | Yes             |

### Keywords Mapping:
- "total students", "kitne students", "total bachhe" → 1 or 2
- "verified", "fees paid", "paid", "challan verify", "fees de di" → 3 or 4
- "unpaid", "pending", "not paid", "fees nahi di", "baaki fees" → 5 or 6

### Class Rules:
- Class mentioned (10, 12, 10th, class 8 etc.) → use even type (2, 4, 6)
- No class mentioned → use odd type (1, 3, 5)
- Always extract only the number for classId (e.g. "10", "12")`,

        parameters: {
            type: "object",
            properties: {
                type: {
                    type: "number",
                    enum: [1, 2, 3, 4, 5, 6],
                    description: "Mandatory. Choose correct type according to rules above."
                },
                classId: {
                    type: "string",
                    description: "Class number only (example: '10', '12', '8'). Required when type is 2, 4 or 6. Otherwise do not send."
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
        description: `Get complete details of the current school/college like name, address, principal name, contact, UDISE code etc. 
Use this when user asks about school information, school details, college info, principal, address etc.`
    }
};