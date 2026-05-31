import api from "./index";

export function askQuestion(
  question: string,
  signal?: AbortSignal,
  mode?: string,
  questionId?: string,
  history?: Array<{ role: string; content: string }>,
) {
  const token = localStorage.getItem("access_token");
  const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
  return fetch(`/api/qa/ask${tokenParam}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, mode, questionId, history }),
    signal,
  });
}

export function fetchQaHistory(): Promise<
  Array<{ id: string; question: string; answer: string; createdAt: string }>
> {
  return api.get("/qa/history").then((r) => r.data);
}

export function deleteQaHistory(): Promise<void> {
  return api.delete("/qa/history");
}
