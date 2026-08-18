import { defineStore } from "pinia";
import { ref } from "vue";
import { askQuestion } from "../api/qa";
import { saveFollowUpThreads } from "../api/questions";
import { useQuestionsStore } from "./questions";
import type { SSEResponse } from "../types";

interface CachedAnswer {
  answerContent: string;
  structure: Array<{ step: number; content: string }>;
  followUps: string[];
  insight: string;
  followUpThreads: FollowUpThread[];
}

export interface FollowUpThread {
  id: string;
  question: string;
  answer: string;
  isStreaming: boolean;
}

const CHARS_PER_FRAME = 30;
const INSIGHT_CHARS_PER_FRAME = 12;

export const useWorkspaceStore = defineStore("workspace", () => {
  const answerContent = ref("");
  const structure = ref<Array<{ step: number; content: string }>>([]);
  const followUps = ref<string[]>([]);
  const insight = ref("");
  const isStreaming = ref(false);
  const currentSection = ref<
    "answer" | "structure" | "followUps" | "insight" | "done" | "error" | ""
  >("");
  const activeQuestionId = ref<string | null>(null);
  const followUpThreads = ref<FollowUpThread[]>([]);

  let abortController: AbortController | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let typewriterRaf: number | null = null;
  let insightRaf: number | null = null;
  let structureTimer: ReturnType<typeof setInterval> | null = null;
  let followUpTimer: ReturnType<typeof setInterval> | null = null;
  let rawBuffer = "";
  let rawInsight = "";
  let rawStructureItems: Array<{ step: number; content: string }> = [];
  let rawFollowUpItems: string[] = [];
  const questionCache = new Map<string, CachedAnswer>();

  function startTypewriter() {
    if (typewriterRaf !== null) return;

    function tick() {
      if (rawBuffer.length === 0) {
        typewriterRaf = null;
        return;
      }

      const targetLen = Math.min(
        rawBuffer.length,
        answerContent.value.length + CHARS_PER_FRAME,
      );
      answerContent.value = rawBuffer.slice(0, targetLen);

      if (answerContent.value.length < rawBuffer.length) {
        typewriterRaf = requestAnimationFrame(tick);
      } else {
        typewriterRaf = null;
      }
    }

    typewriterRaf = requestAnimationFrame(tick);
  }

  function stopTypewriter(showAll: boolean) {
    if (typewriterRaf !== null) {
      cancelAnimationFrame(typewriterRaf);
      typewriterRaf = null;
    }
    if (showAll && rawBuffer) {
      answerContent.value = rawBuffer;
    }
    rawBuffer = "";
  }

  function startInsightTypewriter() {
    if (insightRaf !== null) return;

    function tick() {
      if (rawInsight.length === 0) {
        insightRaf = null;
        return;
      }

      const targetLen = Math.min(
        rawInsight.length,
        insight.value.length + INSIGHT_CHARS_PER_FRAME,
      );
      insight.value = rawInsight.slice(0, targetLen);

      if (insight.value.length < rawInsight.length) {
        insightRaf = requestAnimationFrame(tick);
      } else {
        insightRaf = null;
      }
    }

    insightRaf = requestAnimationFrame(tick);
  }

  function stopInsightTypewriter(showAll: boolean) {
    if (insightRaf !== null) {
      cancelAnimationFrame(insightRaf);
      insightRaf = null;
    }
    if (showAll && rawInsight) {
      insight.value = rawInsight;
    }
    rawInsight = "";
  }

  function startStructureReveal(
    items: Array<{ step: number; content: string }>,
  ) {
    rawStructureItems = items;
    if (structureTimer !== null) clearInterval(structureTimer);
    structure.value = [];
    let idx = 0;

    structureTimer = setInterval(() => {
      if (idx >= items.length) {
        if (structureTimer !== null) clearInterval(structureTimer);
        structureTimer = null;
        return;
      }
      structure.value = [...structure.value, items[idx]];
      idx++;
    }, 250);
  }

  function stopStructureReveal(showAll: boolean) {
    if (structureTimer !== null) {
      clearInterval(structureTimer);
      structureTimer = null;
    }
    if (showAll && rawStructureItems.length) {
      structure.value = [...rawStructureItems];
    }
  }

  function startFollowUpReveal(items: string[]) {
    rawFollowUpItems = items;
    if (followUpTimer !== null) clearInterval(followUpTimer);
    followUps.value = [];
    let idx = 0;

    followUpTimer = setInterval(() => {
      if (idx >= items.length) {
        if (followUpTimer !== null) clearInterval(followUpTimer);
        followUpTimer = null;
        return;
      }
      followUps.value = [...followUps.value, items[idx]];
      idx++;
    }, 250);
  }

  function stopFollowUpReveal(showAll: boolean) {
    if (followUpTimer !== null) {
      clearInterval(followUpTimer);
      followUpTimer = null;
    }
    if (showAll && rawFollowUpItems.length) {
      followUps.value = [...rawFollowUpItems];
    }
  }

  function stopAllAnimations(showAll: boolean) {
    stopTypewriter(showAll);
    stopInsightTypewriter(showAll);
    stopStructureReveal(showAll);
    stopFollowUpReveal(showAll);
  }

  function saveToCache(questionId: string) {
    questionCache.set(questionId, {
      answerContent: rawBuffer || answerContent.value,
      structure: [...structure.value],
      followUps: [...followUps.value],
      insight: insight.value,
      followUpThreads: [...followUpThreads.value],
    });
  }

  function restoreFromCache(questionId: string): boolean {
    const cached = questionCache.get(questionId);
    if (!cached) return false;

    answerContent.value = cached.answerContent;
    structure.value = cached.structure;
    followUps.value = cached.followUps;
    insight.value = cached.insight;
    followUpThreads.value = cached.followUpThreads;
    isStreaming.value = false;
    currentSection.value = "";
    activeQuestionId.value = questionId;
    return true;
  }

  function clearDisplay() {
    stopAllAnimations(false);
    answerContent.value = "";
    structure.value = [];
    followUps.value = [];
    insight.value = "";
    followUpThreads.value = [];
    isStreaming.value = false;
    currentSection.value = "";
  }

  function restoreFromDb(
    answers: Array<{
      answer: string;
      structure?: Array<{ step: number; content: string }>;
      followUps: string[];
      insight?: string;
      followUpThreads?: FollowUpThread[];
    }>,
  ) {
    if (!answers.length) return;
    const a = answers[0];
    answerContent.value = a.answer || "";
    structure.value = a.structure || [];
    followUps.value = a.followUps || [];
    insight.value = a.insight || "";
    followUpThreads.value = (a.followUpThreads as FollowUpThread[]) || [];
    isStreaming.value = false;
    currentSection.value = "";
  }

  function cancelStreaming() {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    stopAllAnimations(false);
    isStreaming.value = false;
  }

  async function ask(
    questionId: string,
    question: string,
    existingAnswers?: Array<{
      answer: string;
      structure?: Array<{ step: number; content: string }>;
      followUps: string[];
      insight?: string;
    }>,
    forceRegen = false,
  ) {
    cancelStreaming();

    // Persist current question's follow-up threads before switching
    if (
      activeQuestionId.value &&
      activeQuestionId.value !== questionId &&
      followUpThreads.value.length
    ) {
      const existing = questionCache.get(activeQuestionId.value);
      if (existing) {
        existing.followUpThreads = [...followUpThreads.value];
      }
    }

    if (!forceRegen) {
      if (existingAnswers?.length && existingAnswers[0].answer) {
        clearDisplay();
        activeQuestionId.value = questionId;
        restoreFromDb(existingAnswers);
        saveToCache(questionId);
        return;
      }

      if (restoreFromCache(questionId)) return;
    }

    // Remove stale cache entry if forcing regeneration
    if (forceRegen) {
      questionCache.delete(questionId);
    }

    clearDisplay();
    activeQuestionId.value = questionId;

    debounceTimer = setTimeout(async () => {
      debounceTimer = null;
      isStreaming.value = true;

      abortController = new AbortController();

      try {
        const response = await askQuestion(
          question,
          abortController.signal,
          undefined,
          questionId,
        );
        if (!response.ok) throw new Error("Request failed");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          if (activeQuestionId.value !== questionId) return;
          const { done, value } = await reader.read();
          if (done) {
            buffer += decoder.decode();
            const lines = buffer.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const event: SSEResponse = JSON.parse(line.slice(6));
                  currentSection.value = event.type;

                  switch (event.type) {
                    case "answer":
                      rawBuffer += event.content;
                      startTypewriter();
                      break;
                    case "structure":
                      startStructureReveal(event.content);
                      break;
                    case "followUps":
                      startFollowUpReveal(event.content);
                      break;
                    case "insight":
                      rawInsight += event.content;
                      startInsightTypewriter();
                      break;
                    case "done":
                      stopAllAnimations(true);
                      if (event.content) {
                        answerContent.value = event.content;
                      }
                      saveToCache(questionId);
                      useQuestionsStore().markAnswered(questionId);
                      isStreaming.value = false;
                      currentSection.value = "";
                      break;
                    case "error":
                      console.error(event.message);
                      stopAllAnimations(true);
                      isStreaming.value = false;
                      break;
                  }
                } catch {
                  // ignore parse errors
                }
              }
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event: SSEResponse = JSON.parse(line.slice(6));
                currentSection.value = event.type;

                switch (event.type) {
                  case "answer":
                    rawBuffer += event.content;
                    startTypewriter();
                    break;
                  case "structure":
                    startStructureReveal(event.content);
                    break;
                  case "followUps":
                    startFollowUpReveal(event.content);
                    break;
                  case "insight":
                    rawInsight += event.content;
                    startInsightTypewriter();
                    break;
                  case "done":
                    stopAllAnimations(true);
                    if (event.content) {
                      answerContent.value = event.content;
                    }
                    saveToCache(questionId);
                    useQuestionsStore().markAnswered(questionId);
                    isStreaming.value = false;
                    currentSection.value = "";
                    break;
                  case "error":
                    console.error(event.message);
                    stopAllAnimations(true);
                    isStreaming.value = false;
                    break;
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }

        stopAllAnimations(true);
        saveToCache(questionId);
        isStreaming.value = false;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error(err);
        stopAllAnimations(true);
        isStreaming.value = false;
      }
    }, 300);
  }

  function forceRegenerate(questionId: string, question: string) {
    ask(questionId, question, undefined, true);
  }

  async function qaAsk(
    question: string,
    history?: Array<{ role: string; content: string }>,
  ): Promise<string> {
    cancelStreaming();
    clearDisplay();
    isStreaming.value = true;

    let fullContent = "";

    try {
      const response = await askQuestion(
        question,
        undefined,
        "qa",
        undefined,
        history,
      );
      if (!response.ok) throw new Error("Request failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          const lines = buffer.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event: SSEResponse = JSON.parse(line.slice(6));
                if (event.type === "answer") {
                  fullContent += event.content;
                  answerContent.value = fullContent;
                } else if (event.type === "done") {
                  if (event.content) {
                    fullContent = event.content;
                    answerContent.value = event.content;
                  }
                  isStreaming.value = false;
                } else if (event.type === "error") {
                  console.error(event.message);
                  isStreaming.value = false;
                }
              } catch {
                // ignore parse errors
              }
            }
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event: SSEResponse = JSON.parse(line.slice(6));
              if (event.type === "answer") {
                fullContent += event.content;
                answerContent.value = fullContent;
              } else if (event.type === "done") {
                if (event.content) {
                  fullContent = event.content;
                  answerContent.value = event.content;
                }
                isStreaming.value = false;
              } else if (event.type === "error") {
                console.error(event.message);
                isStreaming.value = false;
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        isStreaming.value = false;
        return fullContent;
      }
      console.error(err);
      isStreaming.value = false;
    }

    isStreaming.value = false;
    return fullContent;
  }

  async function askFollowUp(question: string, questionId?: string) {
    // Prevent duplicate: if already answered, don't create a new thread
    const existing = followUpThreads.value.find(
      (t) => t.question === question && !t.isStreaming,
    );
    if (existing) return;

    const threadId = `followup-${Date.now()}`;
    followUpThreads.value = [
      ...followUpThreads.value,
      {
        id: threadId,
        question,
        answer: "",
        isStreaming: true,
      },
    ];

    const idx = followUpThreads.value.length - 1;

    try {
      const response = await askQuestion(question, undefined, "followup");
      if (!response.ok) throw new Error("Request failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          const lines = buffer.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event: SSEResponse = JSON.parse(line.slice(6));

                switch (event.type) {
                  case "answer":
                    followUpThreads.value[idx].answer += event.content;
                    break;
                  case "done":
                    if (event.content) {
                      followUpThreads.value[idx].answer = event.content;
                    }
                    followUpThreads.value[idx].isStreaming = false;
                    break;
                  case "error":
                    followUpThreads.value[idx].isStreaming = false;
                    break;
                }
              } catch {
                // ignore parse errors
              }
            }
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event: SSEResponse = JSON.parse(line.slice(6));

              switch (event.type) {
                case "answer":
                  followUpThreads.value[idx].answer += event.content;
                  break;
                case "done":
                  if (event.content) {
                    followUpThreads.value[idx].answer = event.content;
                  }
                  followUpThreads.value[idx].isStreaming = false;
                  break;
                case "error":
                  followUpThreads.value[idx].isStreaming = false;
                  break;
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }

      if (followUpThreads.value[idx].answer) {
        followUpThreads.value[idx].isStreaming = false;
      }
      // Persist threads after follow-up completes
      if (questionId) {
        const threads = followUpThreads.value.filter((t) => t.answer);
        saveFollowUpThreads(questionId, threads).catch(() => {});
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      followUpThreads.value[idx].isStreaming = false;
    }
  }

  function regenerateFollowUp(threadId: string, questionId?: string) {
    const idx = followUpThreads.value.findIndex((t) => t.id === threadId);
    if (idx === -1) return;
    const question = followUpThreads.value[idx].question;
    // Remove the old thread and create a new one
    followUpThreads.value.splice(idx, 1);
    askFollowUp(question, questionId);
  }

  return {
    answerContent,
    structure,
    followUps,
    insight,
    isStreaming,
    currentSection,
    activeQuestionId,
    followUpThreads,
    ask,
    forceRegenerate,
    qaAsk,
    askFollowUp,
    regenerateFollowUp,
    cancelStreaming,
    restoreFromDb,
  };
});
