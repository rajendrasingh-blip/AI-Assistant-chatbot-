import axiosBase from "./axios";

type Message = {
    role: string,
    content: string
}

export const fetchGeminiChat = async (query: Message) => {
    try {
        const response = await axiosBase.post("/AI/ask", {
            question: query.content
        });

        const data = response?.data?.data;

        if (!Array.isArray(data) || data.length === 0) {
            return {
                data: "failed to fetch query response from database."
            };
        }

        const finalData = data
            .map((item: Record<string, any>, index: number) => {
                const values = Object.entries(item)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join("\n");

                return `${index + 1}. ${values}`;
            })
            .join("\n\n");

        return { data: finalData };

    } catch (error) {
        throw error;
    }
};