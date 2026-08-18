import fs from "fs/promises";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";

import {
  extractPdfText,
} from "./pdfExtractor.services";

const execFileAsync =
  promisify(execFile);

interface FinalPage {
  pageNumber: number;
  text: string;
  source: "pdf-text" | "ocr";
}

export interface OcrPdfResult {
  totalPages: number;
  pages: FinalPage[];
  pdfText: string;
}

async function renderPdfPage(
  pdfPath: string,
  pageNumber: number,
  outputDir: string
): Promise<string> {

  const outputPrefix =
    path.join(
      outputDir,
      `page-${pageNumber}`
    );

  await execFileAsync(
    "pdftoppm",
    [
      "-f",
      String(pageNumber),
      "-singlefile",
      "-png",
      "-r",
      "300",
      pdfPath,
      outputPrefix,
    ]
  );

  return `${outputPrefix}.png`;
}

async function runTesseract(
  imagePath: string
): Promise<string> {

  const outputBase =
    imagePath.replace(
      /\.png$/i,
      ""
    );

  await execFileAsync(
    "tesseract",
    [
      imagePath,
      outputBase,
      "-l",
      "eng+pan",
      "--psm",
      "6",
    ]
  );

  const textPath =
    `${outputBase}.txt`;

  const text =
    await fs.readFile(
      textPath,
      "utf8"
    );

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function ocrPdf(
  pdfPath: string,
  pdfId: string
): Promise<OcrPdfResult> {

  const extracted =
    await extractPdfText(
      pdfPath
    );

  const totalPages =
    extracted.totalPages;

  const tempDir =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "pseb-ocr-"
      )
    );

  const pages: FinalPage[] = [];

  try {
    for (
      const page of extracted.pages
    ) {
      if (page.hasText) {
        console.log(
          `PAGE ${page.pageNumber}/${totalPages} → PDF TEXT (${page.text.length} chars)`
        );

        pages.push({
          pageNumber:
            page.pageNumber,

          text:
            page.text,

          source:
            "pdf-text",
        });

        continue;
      }
      console.log(
        `PAGE ${page.pageNumber}/${totalPages} → OCR (${page.text.length} native chars)`
      );

      const imagePath =
        await renderPdfPage(
          pdfPath,
          page.pageNumber,
          tempDir
        );

      const ocrText =
        await runTesseract(
          imagePath
        );

      pages.push({
        pageNumber:
          page.pageNumber,

        text:
          ocrText,

        source:
          "ocr",
      });
    }

  
    const pdfText =
      pages
        .map(
          (page) =>
            `===== PAGE ${page.pageNumber} =====\n${page.text}`
        )
        .join("\n\n")
        .trim();

    return {
      totalPages,
      pages,
      pdfText,
    };

  } finally {

    await fs.rm(
      tempDir,
      {
        recursive: true,
        force: true,
      }
    );
  }
}