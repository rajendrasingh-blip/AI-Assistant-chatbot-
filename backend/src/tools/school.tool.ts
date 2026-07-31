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
        "https://testreg2026.pseb.ac.in/api/ChatBoatApi/GetChatBotDetails",
        body
    );

    if (!response) {
        return {
            success: false,
            message: "No college details record was found."
        };
    }

    if (response.status !== 1 || !response.data) {
        return {
            success: false,
            message: response.message || "No college details record was found."
        };
    }

    const data = response.data;

    return {
        success: true,
        message: `# School Details

**School Name:** ${data.SchlNme}

**School Code:** ${data.Schl}

**UDISE Code:** ${data.UDISECode}

**District:** ${data.DistNm}

**Area:** ${data.Area}

**Class:** ${data.Class}

**User Type:** ${data.UserType}

## Facilities

- Middle: ${data.Middle}
- Matric: ${data.Matric}
- Humanities: ${data.Hum}
- Science: ${data.Sci}
- Commerce: ${data.Comm}
- Vocational: ${data.Voc}
`
    };
}