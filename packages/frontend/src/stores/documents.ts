import { defineStore } from "pinia";
import { ref } from "vue";
import type { Document, AnalysisResult } from "../types";
import {
  uploadDocument as uploadApi,
  getDocuments as listApi,
  deleteDocument as deleteApi,
  processDocument as processApi,
  getDocumentStatus,
  createDocumentFromText,
  createDocumentFromUrl,
} from "../api/documents";

export const useDocumentsStore = defineStore("documents", () => {
  const documents = ref<Document[]>([]);
  const currentAnalysis = ref<AnalysisResult | null>(null);
  const isLoading = ref(false);

  async function upload(file: File, type: string) {
    const { data } = await uploadApi(file, type);
    documents.value.unshift(data);
    return data;
  }

  async function createFromText(type: string, title: string, content: string) {
    const { data } = await createDocumentFromText(type, title, content);
    documents.value.unshift(data);
    return data;
  }

  async function createFromUrl(type: string, title: string, url: string) {
    const { data } = await createDocumentFromUrl(type, title, url);
    documents.value.unshift(data);
    return data;
  }

  async function fetchDocuments(force = false) {
    if (!force && documents.value.length > 0) return;
    const { data } = await listApi();
    documents.value = data;

    // find latest analysis
    const withAnalysis = documents.value.find(
      (d) => d.analysis && d.analysis.techStack.length > 0,
    );
    if (withAnalysis) {
      currentAnalysis.value = withAnalysis.analysis || null;
    }
  }

  async function processDocument(id: string) {
    // Update local status immediately
    const doc = documents.value.find((d) => d.id === id);
    if (doc) doc.status = "PROCESSING" as any;
    isLoading.value = true;

    try {
      await processApi(id);

      // poll for completion, return promise that resolves when done
      return new Promise<void>((resolve) => {
        const poll = setInterval(async () => {
          try {
            const { data } = await getDocumentStatus(id);
            const doc = documents.value.find((d) => d.id === id);
            if (doc) doc.status = data.status as any;

            if (data.status === "COMPLETED" || data.status === "FAILED") {
              clearInterval(poll);
              await fetchDocuments(true);
              isLoading.value = false;
              resolve();
            }
          } catch {
            clearInterval(poll);
            isLoading.value = false;
            resolve();
          }
        }, 2000);
      });
    } catch {
      isLoading.value = false;
    }
  }

  async function remove(id: string) {
    await deleteApi(id);
    documents.value = documents.value.filter((d) => d.id !== id);
  }

  return {
    documents,
    currentAnalysis,
    isLoading,
    upload,
    createFromText,
    createFromUrl,
    fetchDocuments,
    processDocument,
    remove,
  };
});
