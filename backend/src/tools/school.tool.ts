import { getSchoolDetails } from "../api/callApi";

export async function getCollegeDetails(SchlCode: string) {
    const response = await getSchoolDetails("ChatBoatApi/GetChatBotDetails", SchlCode);

    if (response.status !== 200 || !response.data.data) {
        return {
            success: false,
            message: response.data.message || "No school details found."
        };
    }

    const data = response.data.data;

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