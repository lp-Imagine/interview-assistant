import api from "./index";
import type { Document } from "../types";

export function uploadDocument(file: File, type: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("type", type);
  return api.post<Document>("/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function getDocuments() {
  return api.get<Document[]>("/documents");
}

export function deleteDocument(id: string) {
  return api.delete(`/documents/${id}`);
}

export function createDocumentFromText(
  type: string,
  title: string,
  content: string,
) {
  return api.post<Document>("/documents/text", { type, title, content });
}

export function createDocumentFromUrl(
  type: string,
  title: string,
  url: string,
) {
  return api.post<Document>("/documents/url", { type, title, url });
}

export function processDocument(id: string) {
  return api.post(`/documents/process/${id}`);
}

export function getDocumentStatus(id: string) {
  return api.get<{
    id: string;
    status: string;
    chunkCount: number;
    analysis: { techStack: string[]; keywords: string[] } | null;
  }>(`/documents/${id}/status`);
}
