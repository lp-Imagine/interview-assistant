import { ref } from "vue";
import type { SSEResponse } from "../types";

export function useSSE() {
  const answerContent = ref("");
  const structure = ref<Array<{ step: number; content: string }>>([]);
  const followUps = ref<string[]>([]);
  const insight = ref("");
  const isStreaming = ref(false);
  const currentSection = ref("");
  const error = ref("");

  let abortController: AbortController | null = null;

  async function start(question: string) {
    answerContent.value = "";
    structure.value = [];
    followUps.value = [];
    insight.value = "";
    error.value = "";
    isStreaming.value = true;

    abortController = new AbortController();

    try {
      const token = localStorage.getItem("access_token");
      const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
      const response = await fetch(`/api/qa/ask${tokenParam}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: abortController.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event: SSEResponse = JSON.parse(line.slice(6));
              handleEvent(event);
            } catch {
              // skip malformed lines
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.startsWith("data: ")) {
        try {
          const event: SSEResponse = JSON.parse(buffer.slice(6));
          handleEvent(event);
        } catch {
          // skip
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        error.value = err.message;
      }
    } finally {
      isStreaming.value = false;
      currentSection.value = "";
    }
  }

  function handleEvent(event: SSEResponse) {
    currentSection.value = event.type;

    switch (event.type) {
      case "answer":
        answerContent.value = event.content;
        break;
      case "structure":
        structure.value = event.content;
        break;
      case "followUps":
        followUps.value = event.content;
        break;
      case "insight":
        insight.value = event.content;
        break;
      case "error":
        error.value = event.message || "Unknown error";
        break;
    }
  }

  function stop() {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    isStreaming.value = false;
  }

  return {
    answerContent,
    structure,
    followUps,
    insight,
    isStreaming,
    currentSection,
    error,
    start,
    stop,
  };
}
