<template>
  <div class="content">
    <div class="workspace">
      <button
        class="panel-toggle"
        @click="questionPanelOpen = !questionPanelOpen"
      >
        <span v-if="!questionPanelOpen">☰ 题目列表</span>
        <span v-else>✕ 关闭</span>
      </button>

      <div
        v-if="questionPanelOpen"
        class="panel-overlay"
        @click="questionPanelOpen = false"
      ></div>

      <QuestionPanel
        ref="questionPanelRef"
        :class="{ 'panel-overlay-open': questionPanelOpen }"
        :docs-loading="docsStore.isLoading"
        :bookmarked-questions="bookmarkedQuestions"
        @select="onSelect"
        @generate="onGenerate"
        @generate-more="onGenerateMore"
        @regenerate="onRegenerate"
        @close="questionPanelOpen = false"
      />
      <AnswerPanel
        :question="questionsStore.currentQuestion"
        :bookmarks="bookmarks"
        @bookmarked="onBookmarked"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import QuestionPanel from "../components/workspace/QuestionPanel.vue";
import AnswerPanel from "../components/workspace/AnswerPanel.vue";
import { useQuestionsStore } from "../stores/questions";
import { useWorkspaceStore } from "../stores/workspace";
import { useDocumentsStore } from "../stores/documents";
import { fetchBookmarks } from "../api/bookmarks";
import type { Bookmark } from "../types";

const questionsStore = useQuestionsStore();
const workspaceStore = useWorkspaceStore();
const docsStore = useDocumentsStore();

const questionPanelRef = ref<InstanceType<typeof QuestionPanel> | null>(null);
const questionPanelOpen = ref(false);
const bookmarks = ref<Bookmark[]>([]);
const bookmarkedQuestions = computed(
  () => new Set(bookmarks.value.map((b) => b.question)),
);

async function loadBookmarks() {
  try {
    bookmarks.value = await fetchBookmarks();
  } catch {
    // ignore
  }
}

function onSelect(id: string) {
  questionPanelOpen.value = false;
  const q = questionsStore.currentQuestion;
  if (q) {
    workspaceStore.ask(q.id, q.title, q.answers);
  }
}

function onGenerate() {
  if (questionsStore.isLoading || docsStore.isLoading) return;
  questionsStore.generateQuestions();
}

function onGenerateMore() {
  if (questionsStore.isLoading || docsStore.isLoading) return;
  questionsStore.continueGeneration();
}

function onRegenerate() {
  if (questionsStore.isLoading || docsStore.isLoading) return;
  questionsStore.regenerateQuestions();
}

function onBookmarked() {
  loadBookmarks();
}

onMounted(() => {
  questionsStore.fetchQuestions();
  docsStore.fetchDocuments();
  loadBookmarks();
});
</script>

<style scoped>
.content {
  flex: 1;
  overflow-y: auto;
  padding: var(--content-padding);
}

.workspace {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(380px, 1fr);
  gap: var(--space-6);
  height: calc(100vh - var(--topbar-height) - var(--content-padding) * 2);
}

.panel-toggle {
  display: none;
}

.panel-overlay {
  display: none;
}

@media (max-width: 1000px) {
  .workspace {
    grid-template-columns: 1fr;
    height: auto;
    min-height: calc(100dvh - 52px);
  }

  .panel-toggle {
    display: flex;
    position: fixed;
    bottom: calc(20px + env(safe-area-inset-bottom, 0px));
    left: 50%;
    transform: translateX(-50%);
    z-index: 80;
    padding: 12px 24px;
    border: none;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    color: white;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(79, 110, 247, 0.4);
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .panel-toggle:active {
    transform: translateX(-50%) scale(0.95);
    box-shadow: 0 2px 10px rgba(79, 110, 247, 0.3);
  }

  .panel-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    z-index: 88;
    animation: fadeIn 0.2s ease;
  }

  .left-panel {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 90;
    width: 320px;
    height: 100dvh;
    border-radius: 0;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .left-panel.panel-overlay-open {
    transform: translateX(0);
    box-shadow: 8px 0 40px rgba(15, 23, 42, 0.2);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .content {
    padding: 8px;
  }

  .workspace {
    min-height: calc(100dvh - 52px - 8px);
  }

  .left-panel {
    width: 100vw;
  }

  .panel-toggle {
    bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    padding: 12px 28px;
    font-size: 14px;
    left: 50%;
    transform: translateX(-50%);
  }

  .panel-toggle:active {
    transform: translateX(-50%) scale(0.95);
  }
}
</style>
