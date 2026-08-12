import { getStudentsDetails } from "../api/callApi";

interface StudentRequest {
    SchlCode: string;
    Type: string;
    Class: string | null;
    Form: string | null;
    fields: []
}


export async function getStudent(body: StudentRequest) {

    const response = await getStudentsDetails(
        "ChatBoatApi/GetStudentClassDetails",
        body
    );

    if (response.status !== 200) {
        return {
            success: false,
            message: "No student record was found."
        };
    }
    const result = response.data;
    if (!result.status || !result.data) {
        return {
            success: false,
            message: result.message || "No student record was found."
        };
    }

    // -----------------------
    // Count (Type 1 - 6)
    // -----------------------

    if (["1", "2", "3", "4", "5", "6"].includes(body.Type)) {

        const count = result.data.StudentCount;

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
        const students = Array.isArray(result.data)
            ? result.data
            : [result.data];

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