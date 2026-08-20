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



export async function searchPdfChunks(
    query: string,
    limit = 5
): Promise<PdfSearchResult[]> {

    if (!query) {
        return [];
    }

    const chunks =
        await PSebPdfChunksModel.aggregate([
            {
                $match: {
                    $text: {
                        $search: query,
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

export async function getPdfPageContent(
    pdfId: string,
    pageNumber?: number | null
): Promise<PdfSearchResult[]> {
    if (!pdfId || !Number.isInteger(pageNumber)) {
        return [];
    }

    const chunks = await PSebPdfChunksModel.find(
        {
            pdfId,
            pageNumber,
        },
        {
            _id: 0,
            pdfId: 1,
            pageNumber: 1,
            chunkIndex: 1,
            content: 1,
            source: 1,
        }
    )
        .sort({ chunkIndex: 1 })
        .lean();

    return chunks.map((item: any) => ({
        pdfId: String(item.pdfId),
        pdfTitle: "",
        attachment: "",
        pageNumber: Number(item.pageNumber),
        chunkIndex: Number(item.chunkIndex),
        source: item.source,
        content: String(item.content ?? ""),
        score: 1,
    }));
}