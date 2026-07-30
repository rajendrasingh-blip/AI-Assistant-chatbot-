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

    // Sirf raw data return karo
    return {
        success: true,
        type: body.Type,
        classId: body.Class,
        studentCount: response.data.StudentCount
    };
}