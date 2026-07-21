import { api } from "@/api/axios";

export interface HeadingBlock {
  type: "heading";
  text: string;
  level?: number;
}

export interface ParagraphBlock {
  type: "paragraph";
  text: string;
}

export interface CodeBlock {
  type: "code";
  language: string;
  code: string;
}

export type PdfBlock = HeadingBlock | ParagraphBlock | CodeBlock;

export interface GeneratePdfPayload {
  title: string;
  sections: PdfBlock[];
}

/**
 * Sends a JSON payload representing document sections to the backend
 * and returns the generated PDF as a Blob.
 */
export async function generatePdf(payload: GeneratePdfPayload): Promise<Blob> {
  const res = await api.post("/pdf/generate", payload, {
    responseType: "blob",
  });
  return res.data;
}

/**
 * Triggers a browser download for a given Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
