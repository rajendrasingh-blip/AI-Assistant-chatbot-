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

        // Single key/value objects
        if (data.every((item: Record<string, any>) => Object.keys(item).length === 1)) {
            const finalData = data
                .map((item: Record<string, any>, index: number) => {
                    const [key, value] = Object.entries(item)[0];

                    return `${index + 1}. **${key}:** ${value}`;
                })
                .join("\n");

            return { data: finalData };
        }

        // Multiple keys -> Markdown table

        // Get all unique keys from all objects
        const allKeys = [
            ...new Set(
                data.flatMap((item: Record<string, any>) =>
                    Object.keys(item)
                )
            )
        ];

        // Table header
        const header = `| ${allKeys.join(" | ")} |`;

        const separator = `| ${allKeys
            .map(() => "---")
            .join(" | ")} |`;

        // Table rows
        const rows = data.map((item: Record<string, any>) => {
            return `| ${allKeys
                .map(key => item[key] ?? "")
                .join(" | ")} |`;
        });

        const finalData = [
            header,
            separator,
            ...rows
        ].join("\n");

        return { data: finalData };

    } catch (error) {
        throw error;
    }
};

