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
        return "No college details record was found.";
    }

    if (response.status !== 1 || !response.data) {
        return response.message ||
            "No college details record was found.";
    }

    return response.data;
}