import { getPdfRecords } from "../api/callApi";
import { PsebPdfDocument } from "../models/psebPdfDocument.model";

export const syncPsebPdfDocuments = async () => {
  try {
    const pdfRecords = getPdfRecords();

    if (!pdfRecords.length) {
      console.log(
        "No PDF records available for MongoDB sync."
      );

      return;
    }

    let newCount = 0;
    let updatedCount = 0;

    for (const pdf of pdfRecords) {
      const attachment =
        String(pdf.Attachment ?? "").trim();

      const title =
        String(pdf.Title ?? "").trim();

      const pdfId =
        String(pdf.Id ?? "").trim();

      if (!pdfId || !attachment) {
        continue;
      }

      let fileType:
        | "pdf"
        | "image"
        | "url" = "url";

      if (
        attachment
          .toLowerCase()
          .endsWith(".pdf")
      ) {
        fileType = "pdf";
      } else if (
        /\.(jpg|jpeg|png|webp)$/i.test(
          attachment
        )
      ) {
        fileType = "image";
      }

      const existing =
        await PsebPdfDocument.findOne({
          pdfId,
        });

      if (!existing) {
        await PsebPdfDocument.create({
          pdfId,
          title,
          attachment,
          fileType,
          status:
            fileType === "pdf"
              ? "pending"
              : "pending",
          totalPages: 0,
          indexedAt: null,
        });

        newCount++;

        continue;
      }

      const hasChanged =
        existing.title !== title ||
        existing.attachment !== attachment;

      if (hasChanged) {
        existing.title = title;
        existing.attachment = attachment;
        existing.fileType = fileType;

        // Content may have changed.
        existing.status = "pending";
        existing.totalPages = 0;
        existing.indexedAt = null;

        await existing.save();

        updatedCount++;
      }
    }

    console.log(
      `PDF MongoDB sync completed. Total: ${pdfRecords.length}, New: ${newCount}, Updated: ${updatedCount}`
    );
  } catch (error) {
    console.error(
      "PDF MongoDB sync failed:",
      error
    );
  }
};