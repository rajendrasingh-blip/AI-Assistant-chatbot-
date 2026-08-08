import { callApi } from "../api/callApi";

interface StudentRequest {
    SchlCode: string;
    Type: string;
    Class: string | null;
    rawClassId: string | null;
    Form: string | null;
    fields: []
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
                    message: `Class ${body.rawClassId} - Total Students: ${count}`
                };

            case "3":
                return {
                    success: true,
                    message: `Fee Paid Students: ${count}`
                };

            case "4":
                return {
                    success: true,
                    message: `Class ${body.rawClassId} - Fee Paid Students: ${count}`
                };

            case "5":
                return {
                    success: true,
                    message: `Fee Unpaid Students: ${count}`
                };

            case "6":
                return {
                    success: true,
                    message: `Class ${body.rawClassId} - Fee Unpaid Students: ${count}`
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

        const allowedKeys =
            body.fields && body.fields.length > 0
                ? body.fields
                : [
                    "Candi_Name",
                    "Father_Name",
                    "CLASS",
                ];

        const fieldLabels: Record<string, string> = {
            Candi_Name: "Student Name",
            Father_Name: "Father Name",
            Mother_Name: "Mother Name",
            UDISECODE: "UDISE Code",
            Registration_num: "Registration No",
            CLASS: "Class",
            Mobile: "Mobile",
            Gender: "Gender",
            DOB: "DOB",
            PreSchlState: "State",
        };

        const header = [
            "**#**",
            ...allowedKeys.map((key) => `**${fieldLabels[key] || key}**`),
        ].join(" | ");

        const rows = students
            .map((student: any, index: number) => {
                return [
                    index + 1,
                    ...allowedKeys.map((key) => student[key] ?? ""),
                ].join(" | ");
            })
            .join("\n\n");

        const message = `${header}\n\n${rows}`;

        return {
            success: true,
            message,
        };
    }

    return {
        success: false,
        message: "Invalid request."
    };
}