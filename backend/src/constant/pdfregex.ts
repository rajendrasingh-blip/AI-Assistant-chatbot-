export function extractPdfPageQuery(query: string) {
    const match = query.match(
        /\bpdf\s+(\d+)\b.*?\bpage\s+(\d+)\b/i
    );

    if (!match) {
        return null;
    }

    return {
        pdfId: match[1],
        pageNumber: Number(match[2]),
    };
}