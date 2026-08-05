type Message = {
    role: string,
    content: string
}

export const fetchGeminiChat = async (query: Message, collegeCode: string, projectId: string) => {
    try {
        const response = await fetch("https://chatbot.pseb.ac.in/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query, projectId, collegeCode })
        });

        const result = await response.json();

        // if (!result.success) {
        //     throw new Error(result.message || "Failed to get Gemini response")
        // }
        return result;
    }
    catch (error) {
        throw error;
    }

}