import api from "./index";
import type { Bookmark } from "../types";

export function createBookmark(data: {
  question: string;
  answer: string;
  structure?: Array<{ step: number; content: string }>;
  followUps?: string[];
  insight?: string;
  followUpThreads?: Array<{
    id: string;
    question: string;
    answer: string;
    isStreaming: boolean;
  }>;
}): Promise<Bookmark> {
  return api.post("/bookmarks", data).then((r) => r.data);
}

export function fetchBookmarks(): Promise<Bookmark[]> {
  return api.get("/bookmarks").then((r) => r.data);
}

export function deleteBookmark(id: string): Promise<void> {
  return api.delete(`/bookmarks/${id}`);
}
