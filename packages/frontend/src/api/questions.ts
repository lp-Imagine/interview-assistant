import api from "./index";
import type { Question, PaginatedResponse } from "../types";

export function generateQuestions(batchSize = 20) {
  return api.post<{
    questions: Question[];
    batchIndex: number;
    isComplete: boolean;
  }>("/generation/questions", { batchSize });
}

export function regenerateQuestions(batchSize = 20) {
  return api.post<{
    questions: Question[];
    batchIndex: number;
    isComplete: boolean;
  }>("/generation/questions/regenerate", { batchSize });
}

export function continueGeneration(batchSize = 20) {
  return api.post<{
    questions: Question[];
    batchIndex: number;
    isComplete: boolean;
  }>("/generation/questions/continue", { batchSize });
}

export function getQuestions(params?: {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  return api.get<PaginatedResponse<Question>>("/generation/questions", {
    params,
  });
}

export function deleteQuestion(id: string) {
  return api.delete(`/generation/questions/${id}`);
}

export function clearAllQuestions() {
  return api.delete("/generation/questions");
}

export function saveFollowUpThreads(
  questionId: string,
  followUpThreads: Array<{
    id: string;
    question: string;
    answer: string;
    isStreaming: boolean;
  }>,
) {
  return api.patch(`/generation/questions/${questionId}/threads`, {
    followUpThreads,
  });
}
