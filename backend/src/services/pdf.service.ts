import fs from "node:fs/promises";
import path from "node:path";
import { pdf } from "pdf-to-img";

const PDF_IMAGES_DIR = path.join(
    process.cwd(),
    "public",
    "pdf-images"
);

export async function convertPdfToImages(
    pdfUrl: string,
    pdfId: string
) {
    // Main PDF folder
    const outputDir = path.join(PDF_IMAGES_DIR, pdfId);

    await fs.mkdir(outputDir, {
        recursive: true,
    });

    // PDF download
    const response = await fetch(pdfUrl);

    if (!response.ok) {
        throw new Error(
            `Failed to download PDF: ${response.status}`
        );
    }

    const pdfBuffer = Buffer.from(
        await response.arrayBuffer()
    );

    // PDF ko temporary file me save
    const tempDir = path.join(
        process.cwd(),
        "temp"
    );

    await fs.mkdir(tempDir, {
        recursive: true,
    });

    const tempPdfPath = path.join(
        tempDir,
        `${pdfId}.pdf`
    );

    await fs.writeFile(
        tempPdfPath,
        pdfBuffer
    );

    // PDF → Images
    const document = await pdf(tempPdfPath, {
        scale: 2,
    });

    const pages: {
        page: number;
        imageUrl: string;
        filePath: string;
    }[] = [];

    let pageNumber = 1;

    for await (const image of document) {
        const fileName = `page-${pageNumber}.png`;

        const filePath = path.join(
            outputDir,
            fileName
        );

        await fs.writeFile(
            filePath,
            image
        );

        pages.push({
            page: pageNumber,
            imageUrl: `/pdf-images/${pdfId}/${fileName}`,
            filePath,
        });

        pageNumber++;
    }

    // PDF document release
    document.destroy();

    // Temporary PDF delete
    await fs.unlink(tempPdfPath);

    return {
        pdfId,
        totalPages: pages.length,
        pages,
    };
}