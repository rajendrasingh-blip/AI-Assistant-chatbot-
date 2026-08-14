import fs from "fs/promises";
import path from "path";
import os from "os";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  hasText: boolean;
}

export interface ExtractedPdf {
  totalPages: number;
  pages: ExtractedPage[];
}

export async function downloadPdf(
  url: string
): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to download PDF: ${response.status} ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  const tempRoot = os.tmpdir();

  const tempDir = await fs.mkdtemp(
    path.join(tempRoot, "pseb-pdf-")
  );

  const pdfPath = path.join(
    tempDir,
    "document.pdf"
  );

  await fs.writeFile(
    pdfPath,
    Buffer.from(arrayBuffer)
  );

  return pdfPath;
}

export async function extractPdfText(
  pdfPath: string
): Promise<ExtractedPdf> {
  const pdfBuffer = await fs.readFile(pdfPath);

  const pdf = await pdfjsLib
    .getDocument({
      data: new Uint8Array(pdfBuffer),
    })
    .promise;

  const pages: ExtractedPage[] = [];

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {
    const page = await pdf.getPage(pageNumber);

    const textContent =
      await page.getTextContent();

    const text = textContent.items
      .map((item: any) => item.str || "")
      .join(" ")
      .trim();

    /*
     * IMPORTANT:
     * 30 characters is NOT enough.
     *
     * Scanned pages can contain only:
     * - File number
     * - eOffice header
     * - page number
     *
     * So use a higher threshold.
     */
    const meaningfulText =
      text
        .replace(/\s+/g, " ")
        .trim();

    const hasText =
      meaningfulText.length >= 500;

    pages.push({
      pageNumber,
      text,
      hasText,
    });
  }

  return {
    totalPages: pdf.numPages,
    pages,
  };
}

export async function processPdf(
  url: string
): Promise<ExtractedPdf> {
  const pdfPath = await downloadPdf(url);

  try {
    return await extractPdfText(pdfPath);
  } finally {
    await fs.rm(
      path.dirname(pdfPath),
      {
        recursive: true,
        force: true,
      }
    );
  }
}