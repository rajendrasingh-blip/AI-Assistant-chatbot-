import { callApi } from "../api/callApi";

interface CollegeRequest {
    SchlCode: string;
}

interface CollegeResponse {
    status: number;
    message: string;
    data: {
        Schl: string;
        UDISECode: string;
        Class: string;
        Area: string;
        SchlNme: string;
        DistNm: string;
        UserType: string;
        MID_UType: string;
        HID_UType: string;
        H_UType: string;
        S_UType: string;
        C_UType: string;
        V_UType: string;
        Middle: string;
        Matric: string;
        Hum: string;
        Sci: string;
        Comm: string;
        Voc: string;
    } | null;
    error?: {
        code: number;
        message: string;
        details: string;
    };
    failedPacketIds: string[];
}

export async function getCollegeDetails(
    body: CollegeRequest
) {
    const response = await callApi<
        CollegeRequest,
        CollegeResponse
    >(
        "ChatBoatApi/GetChatBotDetails",
        body
    );

    if (!response) {
        return {
            success: false,
            message: "No school details found."
        };
    }

    if (response.status !== 1 || !response.data) {
        return {
            success: false,
            message: response.message || "No school details found."
        };
    }

    const data = response.data;

    return {
        success: true,
        message: `# School Details

| Field | Value |
|-------|-------|
| School Name | ${data.SchlNme || "N/A"} |
| School Code | ${data.Schl || "N/A"} |
| UDISE Code | ${data.UDISECode || "N/A"} |
| District | ${data.DistNm || "N/A"} |
| Area | ${data.Area || "N/A"} |
| Class | ${data.Class || "N/A"} |
| User Type | ${data.UserType || "N/A"} |

## Facilities

| Facility | Value |
|----------|-------|
| Middle | ${data.Middle || "N/A"} |
| Matric | ${data.Matric || "N/A"} |
| Humanities | ${data.Hum || "N/A"} |
| Science | ${data.Sci || "N/A"} |
| Commerce | ${data.Comm || "N/A"} |
| Vocational | ${data.Voc || "N/A"} |
`
    };
}