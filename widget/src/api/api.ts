import axiosBase from "./axios";

type Message = {
    role: string,
    content: string
}

export const fetchGeminiChat = async (query: Message,
    // collegeCode: string, projectId: string, searchType: string | null
) => {
    try {
        // const response = await axiosBase.post("/chat", { query, projectId, collegeCode, searchType })
        const response = await axiosBase.post("/AI/ask", { question: query })

        const data = response?.data?.data;

        const values = data?.map((item: Record<string, any>) => Object.values(item)[0]);
        const finalData = values.toString()

        return { data: finalData }
    }
    catch (error) {
        throw error;
    }

}