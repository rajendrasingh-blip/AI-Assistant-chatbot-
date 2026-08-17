import axiosBase from "./axios";
import { PdfDocumentType } from "../constant/pdfDocuments";

export const getSchoolDetails = (url: string, SchlCode: string) => {
  return axiosBase.post(url, { SchlCode });
}

export const getStudentsDetails = (url: string, body: any) => {
  return axiosBase.post(url, body);
}

let pdfRecords: PdfDocumentType[] = [];

export const loadPdfRecords = async () => {
  try {
    const res = await axiosBase.post(
      "/ChatBoatApi/GetCircularAttachment",
      {
        SearchType: "Attachment",
      }
    );

    if (res.status === 200) {
      pdfRecords = res.data.data ?? [];

      console.log(
        `PDF records loaded: ${pdfRecords.length}`
      );
    }
  } catch (error) {
    console.error("Failed to load PDF records:", error);
    pdfRecords = [];
  }
};

export const getPdfRecords = (): PdfDocumentType[] => {
  return pdfRecords;
};