import { callApi } from "../api/callApi";

interface StudentRequest {
    SchlCode: string;
    Class: string | null;
    Type: string
}

interface StudentDetailsType {
    SchlCode: string;
    Class: string;
    Form: string | null;
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
        "ChatBoatApi/GetStudentClassDetails",
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

export async function getStudentDetails(body: StudentDetailsType) {
    const response = await callApi<StudentDetailsType, any>(
        "ChatBoatApi/GetStudentDetails",
        body
    );

    if (!response || !response.status || !response.data?.length) {
        return {
            success: false,
            message: response?.message || "No student record was found."
        };
    }

    const student = response.data[0];

    const message = Object.entries(student)
        .filter(([_, value]) =>
            value !== null &&
            value !== undefined &&
            value !== ""
        )
        .map(([key, value]) => `${key} : ${value}`)
        .join("\n");

    return {
        success: true,
        message
    };
}