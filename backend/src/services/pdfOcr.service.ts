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

const cacheDir = path.join(
  process.cwd(),
  "temp",
  "pdf-cache"
);

const CACHE_VERSION = "v2";

function getCachePath(
  pdfId: string
) {
  return path.join(
    cacheDir,
    `${pdfId}-${CACHE_VERSION}.txt`
  );
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

  const cachePath =
    getCachePath(pdfId);

  /*
   * Cache
   */
  try {

    const cachedText =
      await fs.readFile(
        cachePath,
        "utf8"
      );

    if (cachedText.trim()) {

      console.log(
        `PDF cache HIT: ${pdfId}`
      );

      const pages: FinalPage[] =
        cachedText
          .split(
            /===== PAGE (\d+) =====/g
          )
          .reduce(
            (
              result: FinalPage[],
              value: string,
              index: number,
              array: string[]
            ) => {

              if (index % 2 === 1) {

                result.push({
                  pageNumber:
                    Number(value),

                  text:
                    array[index + 1]
                      ?.trim() || "",

                  source:
                    "ocr",
                });
              }

              return result;
            },
            []
          );

      return {
        totalPages: pages.length,
        pages,
        pdfText: cachedText,
      };
    }

  } catch {
    console.log(
      `PDF cache MISS: ${pdfId}`
    );
  }

  /*
   * STEP 1
   * Extract native PDF text
   */
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

    /*
     * STEP 2
     * Process page by page
     */
    for (
      const page of extracted.pages
    ) {

      /*
       * Native PDF text is sufficient
       */
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

      /*
       * Native text is insufficient
       * → OCR
       */
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

    /*
     * STEP 3
     * Final PDF content
     */
    const pdfText =
      pages
        .map(
          (page) =>
            `===== PAGE ${page.pageNumber} =====\n${page.text}`
        )
        .join("\n\n")
        .trim();

    /*
     * STEP 4
     * Cache
     */
    await fs.mkdir(
      cacheDir,
      {
        recursive: true,
      }
    );

    await fs.writeFile(
      cachePath,
      pdfText,
      "utf8"
    );

    console.log(
      `PDF cache CREATED: ${pdfId}`
    );

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