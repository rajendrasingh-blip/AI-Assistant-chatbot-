import axiosBase from "./axios";

type Message = {
    role: string,
    content: string
}

export const fetchGeminiChat = async (query: Message, collegeCode: string, projectId: string) => {
    try {
        const response = await axiosBase.post("/chat", { query, projectId, collegeCode })

        return response.data;
    }
    catch (error) {
        throw error;
    }

}