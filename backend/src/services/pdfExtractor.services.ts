import fs from "fs/promises";
import path from "path";
import os from "os";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

interface ExtractedPage {
  pageNumber: number;
  text: string;
  hasText: boolean;
}

interface ExtractedPdf {
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
      .replace(/\s+/g, " ")
      .trim();

    pages.push({
      pageNumber,
      text,
      hasText: text.length > 20,
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