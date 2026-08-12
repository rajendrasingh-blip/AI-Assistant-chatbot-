import fs from "fs/promises";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

interface OcrPageResult {
  pageNumber: number;
  text: string;
}

interface OcrPdfResult {
  totalPages: number;
  pdfText: string;
}

const cacheDir = path.join(
  process.cwd(),
  "temp",
  "pdf-cache"
);

function getCachePath(pdfId: string) {
  return path.join(
    cacheDir,
    `${pdfId}.txt`
  );
}

async function getPdfPageCount(
  pdfPath: string
): Promise<number> {
  const { stdout } = await execFileAsync(
    "pdfinfo",
    [pdfPath]
  );

  const match = stdout.match(
    /Pages:\s+(\d+)/
  );

  if (!match) {
    throw new Error(
      "Could not determine PDF page count"
    );
  }

  return Number(match[1]);
}

async function renderPdfPage(
  pdfPath: string,
  pageNumber: number,
  outputDir: string
): Promise<string> {
  const outputPrefix = path.join(
    outputDir,
    `page-${pageNumber}`
  );

  await execFileAsync("pdftoppm", [
    "-f",
    String(pageNumber),
    "-singlefile",
    "-png",
    "-r",
    "200",
    pdfPath,
    outputPrefix,
  ]);

  return `${outputPrefix}.png`;
}

async function runTesseract(
  imagePath: string
): Promise<string> {
  const outputBase = imagePath.replace(
    /\.png$/i,
    ""
  );

  await execFileAsync("tesseract", [
    imagePath,
    outputBase,
    "-l",
    "eng+pan",
    "--psm",
    "6",
  ]);

  const textPath = `${outputBase}.txt`;

  const text = await fs.readFile(
    textPath,
    "utf8"
  );

  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function ocrPdf(
  pdfPath: string,
  pdfId: string
): Promise<OcrPdfResult> {

  const cachePath = getCachePath(pdfId);

  try {
    const cachedText = await fs.readFile(
      cachePath,
      "utf8"
    );

    if (cachedText.trim()) {
      console.log(
        `PDF cache HIT: ${pdfId}`
      );

      const totalPages = await getPdfPageCount(
        pdfPath
      );

      return {
        totalPages,
        pdfText: cachedText,
      };
    }
  } catch {
    console.log(
      `PDF cache MISS: ${pdfId}`
    );
  }

  const totalPages =
    await getPdfPageCount(pdfPath);

  const tempDir = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "pseb-ocr-"
    )
  );

  const pages: OcrPageResult[] = [];

  try {

    for (
      let pageNumber = 1;
      pageNumber <= totalPages;
      pageNumber++
    ) {

      console.log(
        `OCR processing page ${pageNumber}/${totalPages}`
      );

      const imagePath =
        await renderPdfPage(
          pdfPath,
          pageNumber,
          tempDir
        );

      const text =
        await runTesseract(
          imagePath
        );

      pages.push({
        pageNumber,
        text,
      });
    }


    const pdfText = pages
      .map(
        (page) =>
          `\n===== PAGE ${page.pageNumber} =====\n${page.text}`
      )
      .join("\n")
      .trim();

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