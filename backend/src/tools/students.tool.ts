import { callApi } from "../api/callApi";

interface StudentRequest {
    SchlCode: string;
    Type: string;
    Class: string | null;
    Form: string | null;
}

interface StudentResponse {
    status: string;
    message: string;
    data: any;
    error?: {
        details: string;
    };
}

export async function getStudent(body: StudentRequest) {

    const response = await callApi<StudentRequest, StudentResponse>(
        "ChatBoatApi/GetStudentClassDetails",
        body
    );
    console.log(response, 'response', body, 'body')
    if (!response) {
        return {
            success: false,
            message: "No student record was found."
        };
    }

    if (!response.status || !response.data) {
        return {
            success: false,
            message: response.message || "No student record was found."
        };
    }

    // -----------------------
    // Count (Type 1 - 6)
    // -----------------------

    if (["1", "2", "3", "4", "5", "6"].includes(body.Type)) {

        const count = response.data.StudentCount;

        switch (body.Type) {

            case "1":
                return {
                    success: true,
                    message: `Total Students: ${count}`
                };

            case "2":
                return {
                    success: true,
                    message: `Class ${body.Class} - Total Students: ${count}`
                };

            case "3":
                return {
                    success: true,
                    message: `Fee Paid Students: ${count}`
                };

            case "4":
                return {
                    success: true,
                    message: `Class ${body.Class} - Fee Paid Students: ${count}`
                };

            case "5":
                return {
                    success: true,
                    message: `Fee Unpaid Students: ${count}`
                };

            case "6":
                return {
                    success: true,
                    message: `Class ${body.Class} - Fee Unpaid Students: ${count}`
                };
        }
    }

    // -----------------------
    // List (Type 7 - 12)
    // -----------------------

    if (["7", "8", "9", "10", "11", "12"].includes(body.Type)) {
        const students = Array.isArray(response.data)
            ? response.data
            : [response.data];

        const allowedKeys = ["Candi_Name", "PreSchlState", "UDISECODE"];

        const message = students
            .map((student: any, index: number) => {
                const details = allowedKeys
                    .filter((key) => student[key] !== null && student[key] !== undefined && student[key] !== "")
                    .map((key) => student[key])
                    .join(" | ");

                return ` ${index + 1}. ${details}`;
            })
            .join("\n");

        return {
            success: true,
            message
        };
    }

    return {
        success: false,
        message: "Invalid request."
    };
}