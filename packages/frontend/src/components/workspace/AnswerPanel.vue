<template>
  <div class="right-panel">
    <div class="answer-wrapper" v-if="question">
      <div class="answer-header">
        <div class="job-meta">
          <div v-for="tag in analysisTags" :key="tag" class="meta-item">
            {{ tag }}
          </div>
        </div>

        <div class="answer-toolbar">
          <button
            class="bookmark-btn"
            :class="{ bookmarked: isBookmarked, identical: isContentIdentical }"
            :disabled="
              !store.answerContent || store.isStreaming || isContentIdentical
            "
            @click="handleBookmark"
            :title="
              isContentIdentical
                ? '内容未变更，已收藏'
                : isBookmarked
                  ? '已收藏（可再次收藏）'
                  : '收藏'
            "
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              :fill="isBookmarked ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>{{ isBookmarked ? "已收藏" : "收藏" }}</span>
          </button>
          <button
            class="regenerate-btn"
            :disabled="!store.answerContent || store.isStreaming"
            @click="handleRegenerate"
            title="重新生成回答"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span>重新生成</span>
          </button>
          <button
            class="download-md-btn"
            :disabled="!store.answerContent || store.isStreaming"
            @click="handleDownloadMd"
            title="下载 Markdown"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>下载 MD</span>
          </button>
        </div>

        <div class="main-question">{{ question.title }}</div>

        <div v-if="store.isStreaming" class="streaming-bar">
          <span class="typing-dots"
            ><span></span><span></span><span></span
          ></span>
          <span>{{ sectionLabel(store.currentSection) }}</span>
        </div>
      </div>

      <div class="answer-body" ref="scrollContainer" @scroll="onUserScroll">
        <div class="section">
          <div class="section-title">
            AI 推荐回答
            <span
              v-if="store.isStreaming && store.currentSection === 'answer'"
              class="typing-dots"
              ><span></span><span></span><span></span
            ></span>
          </div>
          <div class="answer-box-wrapper">
            <div
              class="answer-box md-content"
              v-html="
                renderedAnswer ||
                '<span class=\'placeholder\'>点击题目自动生成回答</span>'
              "
            ></div>
          </div>
        </div>

        <div class="section" v-if="store.structure.length || store.isStreaming">
          <div class="section-title">
            推荐回答结构
            <span
              v-if="store.isStreaming && store.currentSection === 'structure'"
              class="typing-dots"
              ><span></span><span></span><span></span
            ></span>
          </div>
          <div class="structure-list">
            <div
              v-for="item in store.structure"
              :key="item.step"
              class="structure-item md-content"
              v-html="md.render(item.step + '. ' + item.content)"
            ></div>
            <div
              v-if="
                store.isStreaming &&
                store.currentSection === 'structure' &&
                !store.structure.length
              "
              class="structure-item skeleton"
            >
              <span class="typing-dots"
                ><span></span><span></span><span></span
              ></span>
            </div>
          </div>
        </div>

        <div class="section" v-if="store.followUps.length || store.isStreaming">
          <div class="section-title">
            高频追问
            <span
              v-if="store.isStreaming && store.currentSection === 'followUps'"
              class="typing-dots"
              ><span></span><span></span><span></span
            ></span>
          </div>
          <div class="follow-list">
            <div
              v-for="(item, i) in store.followUps"
              :key="i"
              class="follow-item"
              @click="onFollowUpClick(item)"
              :class="{
                disabled: store.isStreaming || isFollowUpAnswered(item),
              }"
              v-html="md.render(item)"
            ></div>
            <div
              v-if="
                store.isStreaming &&
                store.currentSection === 'followUps' &&
                !store.followUps.length
              "
              class="follow-item skeleton"
            >
              <span class="typing-dots"
                ><span></span><span></span><span></span
              ></span>
            </div>
          </div>
        </div>

        <div class="section" v-if="store.insight || store.isStreaming">
          <div class="section-title">
            面试官真实考察点
            <span
              v-if="store.isStreaming && store.currentSection === 'insight'"
              class="typing-dots"
              ><span></span><span></span><span></span
            ></span>
          </div>
          <div
            v-if="store.insight"
            class="insight-box md-content"
            v-html="md.render(store.insight)"
          ></div>
          <div v-else-if="store.isStreaming" class="insight-box skeleton-text">
            <span class="typing-dots"
              ><span></span><span></span><span></span
            ></span>
          </div>
        </div>

        <!-- Follow-up threads -->
        <div v-if="store.followUpThreads.length" class="followup-threads">
          <div
            v-for="thread in store.followUpThreads"
            :key="thread.id"
            class="thread-card"
          >
            <div class="thread-header">
              <div class="thread-question">{{ thread.question }}</div>
              <button
                v-if="thread.answer && !thread.isStreaming"
                class="thread-regenerate-btn"
                @click="handleRegenerateThread(thread.id)"
                title="重新生成"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>
            </div>
            <div class="thread-answer">
              <div
                v-if="thread.answer"
                class="thread-answer-text md-content"
                v-html="md.render(thread.answer)"
              ></div>
              <div v-else-if="thread.isStreaming" class="thread-loading">
                <span class="typing-dots"
                  ><span></span><span></span><span></span
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="answer-wrapper empty" v-else>
      <div class="empty-hint">选择左侧题目，查看 AI 生成的面试回答</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import { useMessage } from "naive-ui";
import { useWorkspaceStore } from "../../stores/workspace";
import { useDocumentsStore } from "../../stores/documents";
import { md } from "../../utils/markdown";
import { createBookmark } from "../../api/bookmarks";
import type { Question, Bookmark } from "../../types";

const props = defineProps<{
  question: Question | null;
  bookmarks?: Bookmark[];
}>();

const emit = defineEmits<{
  bookmarked: [];
}>();

const store = useWorkspaceStore();
const docsStore = useDocumentsStore();
const message = useMessage();

const isBookmarked = ref(false);
const isContentIdentical = ref(false);

function currentFingerprint() {
  return JSON.stringify({
    answer: store.answerContent,
    structure: store.structure,
    followUps: store.followUps,
    insight: store.insight,
    followUpThreads: store.followUpThreads.map((t) => ({
      q: t.question,
      a: t.answer,
    })),
  });
}

function bookmarkFingerprint(bm: Bookmark) {
  return JSON.stringify({
    answer: bm.answer,
    structure: bm.structure,
    followUps: bm.followUps,
    insight: bm.insight,
    followUpThreads: (bm.followUpThreads || []).map((t) => ({
      q: t.question,
      a: t.answer,
    })),
  });
}

const renderedAnswer = computed(() => {
  if (!store.answerContent) return "";
  return md.render(store.answerContent);
});

const scrollContainer = ref<HTMLElement | null>(null);
let userScrolledUp = false;
let scrollTimer: ReturnType<typeof setTimeout> | null = null;

function onUserScroll() {
  if (!scrollContainer.value || !store.isStreaming) return;
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  userScrolledUp = scrollHeight - scrollTop - clientHeight > 80;
  if (scrollTimer) clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    userScrolledUp = false;
  }, 2000);
}

function scrollToBottom() {
  nextTick(() => {
    if (scrollContainer.value && !userScrolledUp) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
    }
  });
}

function shouldAutoScroll() {
  if (store.isStreaming) return true;
  return store.followUpThreads.some((t) => t.isStreaming);
}

watch(
  () => [
    store.answerContent,
    store.structure,
    store.followUps,
    store.insight,
    store.followUpThreads,
  ],
  () => {
    if (shouldAutoScroll()) scrollToBottom();
    if (isBookmarked.value && isContentIdentical.value) {
      isContentIdentical.value = false;
    }
  },
  { deep: true },
);

watch(
  () => [props.question?.id, props.bookmarks] as const,
  () => {
    userScrolledUp = false;
    if (props.question && props.bookmarks) {
      const matched = props.bookmarks.filter(
        (b) => b.question === props.question!.title,
      );
      isBookmarked.value = matched.length > 0;
      if (matched.length) {
        const latest = matched.reduce((a, b) =>
          a.createdAt > b.createdAt ? a : b,
        );
        isContentIdentical.value =
          currentFingerprint() === bookmarkFingerprint(latest);
      } else {
        isContentIdentical.value = false;
      }
    } else {
      isBookmarked.value = false;
      isContentIdentical.value = false;
    }
  },
  { immediate: true },
);

const sectionLabels: Record<string, string> = {
  answer: "正在生成回答...",
  structure: "正在分析结构...",
  followUps: "正在生成追问...",
  insight: "正在提取考察点...",
};

function sectionLabel(section: string) {
  return sectionLabels[section] || "生成中...";
}

function isFollowUpAnswered(question: string): boolean {
  return store.followUpThreads.some(
    (t) => t.question === question && !t.isStreaming,
  );
}

function onFollowUpClick(question: string) {
  if (store.isStreaming || isFollowUpAnswered(question)) return;
  store.askFollowUp(question, props.question?.id);
}

function handleRegenerateThread(threadId: string) {
  store.regenerateFollowUp(threadId, props.question?.id);
}

function handleRegenerate() {
  if (!props.question || store.isStreaming) return;
  store.forceRegenerate(props.question.id, props.question.title);
}

async function handleBookmark() {
  if (!props.question || !store.answerContent) return;

  try {
    await createBookmark({
      question: props.question.title,
      answer: store.answerContent,
      structure: store.structure.length ? [...store.structure] : undefined,
      followUps: store.followUps.length ? [...store.followUps] : undefined,
      insight: store.insight || undefined,
      followUpThreads: store.followUpThreads.length
        ? store.followUpThreads.map((t) => ({
            id: t.id,
            question: t.question,
            answer: t.answer,
            isStreaming: t.isStreaming,
          }))
        : undefined,
    });
    isBookmarked.value = true;
    isContentIdentical.value = true;
    emit("bookmarked");
    message.success("已收藏");
  } catch {
    message.error("收藏失败");
  }
}

function handleDownloadMd() {
  if (!props.question || !store.answerContent) return;

  const question = props.question.title;
  const answer = store.answerContent;
  const structure = store.structure.length
    ? `\n\n---\n\n## 推荐回答结构\n\n${store.structure.map((s) => `${s.step}. ${s.content}`).join("\n")}`
    : "";
  const followUps = store.followUps.length
    ? `\n\n---\n\n## 高频追问\n\n${store.followUps.map((f) => `- ${f}`).join("\n")}`
    : "";
  const insight = store.insight
    ? `\n\n---\n\n## 面试官真实考察点\n\n${store.insight}`
    : "";
  const threads = store.followUpThreads.length
    ? `\n\n---\n\n## 追问记录\n\n${store.followUpThreads.map((t) => `**Q:** ${t.question}\n\n**A:** ${t.answer}\n`).join("\n")}`
    : "";

  const mdContent = `# ${question}\n\n## AI 推荐回答\n\n${answer}${structure}${followUps}${insight}${threads}\n`;

  const date = new Date()
    .toLocaleString("zh-CN", { hour12: false })
    .replace(/[/:]/g, "-");
  const filename = `${question.slice(0, 30)}_${date}.md`;
  const blob = new Blob([mdContent], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const analysisTags = computed(() => {
  const tags: string[] = [];
  for (const doc of docsStore.documents) {
    if (doc.analysis) {
      tags.push(...doc.analysis.techStack, ...doc.analysis.keywords);
    }
  }
  return [...new Set(tags)].slice(0, 8);
});
</script>

<style scoped>
.right-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  height: 100%;
}

.answer-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.answer-wrapper.empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-header {
  padding: var(--space-5) var(--space-6) 0;
  flex-shrink: 0;
}

.answer-body {
  padding: 0 var(--space-6) var(--space-6);
  overflow-y: auto;
  flex: 1;
}

.empty-hint {
  color: var(--color-text-placeholder);
  font-size: var(--text-md);
}

.streaming-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 500;
}

.job-meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}

.meta-item {
  background: var(--color-surface-muted);
  padding: 5px var(--space-3);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: var(--text-sm);
}

.answer-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-bottom: var(--space-3);
}

.bookmark-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 5px var(--space-3);
  border: 1px solid #fcd34d;
  border-radius: var(--radius-md);
  background: var(--color-warning-bg);
  color: var(--color-warning);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: var(--transition);
}

.bookmark-btn:hover:not(:disabled) {
  border-color: #f59e0b;
  color: #92400e;
  background: #fef3c7;
}

.bookmark-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.bookmark-btn.identical {
  border-color: var(--color-border);
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
}

.bookmark-btn.identical:hover:not(:disabled) {
  border-color: var(--color-border);
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
}

.regenerate-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 5px var(--space-3);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: var(--transition);
}

.regenerate-btn:hover:not(:disabled) {
  border-color: #818cf8;
  background: #dbeafe;
}

.regenerate-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.download-md-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 5px var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: var(--transition);
}

.download-md-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.download-md-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.main-question {
  font-size: var(--text-lg);
  font-weight: 700;
  line-height: 1.5;
  margin-bottom: var(--space-3);
  color: var(--color-text);
}

.section {
  margin-bottom: var(--space-6);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text);
}

.answer-box-wrapper {
  position: relative;
}

.answer-box {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  line-height: 2;
  color: var(--color-text-secondary);
}

.placeholder {
  color: var(--color-text-placeholder);
}

.structure-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.structure-item {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  line-height: 1.7;
  font-size: var(--text-base);
}

.structure-item.skeleton {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
}

.follow-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.follow-item {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-weight: 500;
  font-size: var(--text-base);
  cursor: pointer;
  transition: var(--transition);
}

.follow-item:hover:not(.disabled) {
  background: #dbeafe;
}

.follow-item.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.follow-item.skeleton {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  cursor: default;
}

.insight-box {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  line-height: 1.7;
  font-size: var(--text-base);
  color: var(--color-text-secondary);
}

.insight-box.skeleton-text {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Follow-up threads */
.followup-threads {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-6);
  margin-top: var(--space-2);
}

.thread-card {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  margin-bottom: var(--space-4);
}

.thread-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
}

.thread-question {
  font-weight: 700;
  font-size: var(--text-md);
  color: var(--color-text);
  flex: 1;
}

.thread-regenerate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-sm);
  background: var(--color-primary-light);
  color: var(--color-primary);
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.thread-regenerate-btn:hover {
  border-color: #818cf8;
  background: #dbeafe;
}

.thread-answer-text {
  line-height: 1.9;
  color: var(--color-text-secondary);
  font-size: var(--text-base);
}

.thread-loading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-primary);
  font-size: var(--text-base);
}

@media (max-width: 768px) {
  .answer-header {
    padding: 16px 16px 0;
  }

  .answer-body {
    padding: 0 16px 16px;
  }

  .answer-toolbar {
    flex-wrap: wrap;
    gap: 4px;
  }

  .bookmark-btn,
  .regenerate-btn,
  .download-md-btn {
    padding: 8px 12px;
    font-size: 13px;
    min-height: 36px;
  }

  .main-question {
    font-size: 16px;
  }

  .answer-box {
    padding: 16px;
    font-size: 14px;
  }

  .structure-item {
    padding: 10px 12px;
    font-size: 14px;
  }

  .job-meta {
    gap: 4px;
  }

  .meta-item {
    padding: 4px 10px;
    font-size: 11px;
  }

  .section {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 16px;
  }

  .thread-card {
    padding: 14px;
  }
}
</style>
