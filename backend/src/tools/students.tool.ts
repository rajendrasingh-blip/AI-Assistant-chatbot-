import { callApi } from "../api/callApi";

interface StudentRequest {
    SchlCode: string;
    Class: string | null;
    Type: string;
}

interface StudentResponse {
    status: string;
    message: string;
    data: {
        StudentCount: number;
    } | null;
    error?: {
        details: string;
    };
}

export async function getStudentCount(body: StudentRequest) {
    const response = await callApi<StudentRequest, StudentResponse>(
        "https://testreg2026.pseb.ac.in/api/ChatBoatApi/GetStudentClassDetails",
        body
    );

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

    const count = response.data.StudentCount;

    switch (body.Type) {

        case "1":
            return {
                success: true,
                message:
                    `Total Students: ${count}`
            };

        case "2":
            return {
                success: true,
                message:
                    `Class ${body.Class} - Total Students: ${count}`
            };

        case "3":
            return {
                success: true,
                message:
                    `Fee Paid Students: ${count}`
            };

        case "4":
            return {
                success: true,
                message:
                    `Class ${body.Class} - Fee Paid Students: ${count}`
            };

        case "5":
            return {
                success: true,
                message:
                    `Fee Unpaid Students: ${count}`
            };

        case "6":
            return {
                success: true,
                message:
                    `Class ${body.Class} - Fee Unpaid Students: ${count}`
            };

        default:
            return {
                success: false,
                message: "Invalid request."
            };
    }

}