import { PSebPdfChunksModel } from "../models/psebPdfChunk.model";

export interface PdfSearchResult {
    pdfId: string;
    pdfTitle: string;
    attachment: string;
    pageNumber: number;
    chunkIndex: number;
    source: "pdf-text" | "ocr";
    content: string;
    score: number;
}

function cleanSearchQuery(
    query: unknown
): string {
    if (typeof query !== "string") {
        throw new TypeError(
            `PDF search query must be a string, received: ${typeof query}`
        );
    }

    return query
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export async function searchPdfChunks(
    query: string,
    limit = 5
): Promise<PdfSearchResult[]> {
    const cleanQuery =
        cleanSearchQuery(query);

    if (!cleanQuery) {
        return [];
    }

    /*
     * STEP 1
     * MongoDB text search
     */
    const chunks =
        await PSebPdfChunksModel.aggregate([
            {
                $match: {
                    $text: {
                        $search: cleanQuery,
                    },
                },
            },

            {
                $addFields: {
                    score: {
                        $meta: "textScore",
                    },
                },
            },

            {
                $sort: {
                    score: -1,
                },
            },

            {
                $limit: limit,
            },

            /*
             * Get PDF metadata
             */
            {
                $lookup: {
                    from: "psebpddocuments",

                    let: {
                        currentPdfId: "$pdfId",
                    },

                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                "$pdfId",
                                                "$$currentPdfId",
                                            ],
                                        },
                                        {
                                            $eq: [
                                                "$status",
                                                "indexed",
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                title: 1,
                                attachment: 1,
                            },
                        },
                    ],

                    as: "pdf",
                },
            },

            {
                $unwind: {
                    path: "$pdf",
                    preserveNullAndEmptyArrays: true,
                },
            },

            {
                $project: {
                    _id: 0,

                    pdfId: 1,

                    pageNumber: 1,

                    chunkIndex: 1,

                    content: 1,

                    source: 1,

                    score: 1,

                    pdfTitle: {
                        $ifNull: [
                            "$pdf.title",
                            "",
                        ],
                    },

                    attachment: {
                        $ifNull: [
                            "$pdf.attachment",
                            "",
                        ],
                    },
                },
            },
        ]);

    return chunks.map(
        (item: any) => ({
            pdfId: String(
                item.pdfId
            ),

            pdfTitle: String(
                item.pdfTitle ?? ""
            ),

            attachment: String(
                item.attachment ?? ""
            ),

            pageNumber:
                Number(item.pageNumber),

            chunkIndex:
                Number(item.chunkIndex),

            source:
                item.source,

            content:
                String(item.content ?? ""),

            score:
                Number(item.score ?? 0),
        })
    );
}