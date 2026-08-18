<template>
  <div class="left-panel">
    <div class="left-header">
      <div class="header-row">
        <h3>
          面试题目录
          <span v-if="store.totalCount" class="total-count"
            >共 {{ store.totalCount }} 题</span
          >
        </h3>
        <button class="close-panel-btn" @click="emit('close')">✕</button>
      </div>
      <input
        class="search"
        placeholder="搜索问题..."
        :value="store.searchQuery"
        @input="store.setSearchQuery(($event.target as HTMLInputElement).value)"
      />
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: store.categoryFilter === tab.key }"
          @click="store.setCategoryFilter(tab.key)"
        >
          {{ tab.label }}
          <span class="tab-count">{{
            store.categoryCounts[tab.key] || 0
          }}</span>
        </div>
      </div>
    </div>

    <div class="question-list">
      <!-- Loading state -->
      <div
        v-if="store.isLoading && !store.filteredQuestions.length"
        class="loading-area"
      >
        <div class="loading-spinner"></div>
        <div class="loading-text">AI 正在生成题目...</div>
        <div class="loading-sub">
          根据文档内容分析生成面试题，可能需要 10-30 秒
        </div>
      </div>

      <template v-else-if="store.filteredQuestions.length">
        <!-- Generating indicator at top -->
        <div v-if="store.isLoading" class="generating-bar">
          <span class="generating-dot"></span>
          正在生成题目...
        </div>

        <div
          v-for="q in store.filteredQuestions"
          :key="q.id"
          class="question-item"
          :class="{ active: store.currentQuestion?.id === q.id }"
          @click="
            store.selectQuestion(q.id);
            $emit('select', q.id);
          "
        >
          <div class="question-meta">
            <span class="question-category">{{
              categoryLabel(q.category)
            }}</span>
            <span
              v-if="q.frequency"
              class="question-frequency"
              :class="q.frequency"
              >{{ freqLabel(q.frequency) }}</span
            >
            <span v-if="hasAnswer(q)" class="answered-dot" title="已生成回答">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </span>
            <span
              v-if="bookmarkedQuestions?.has(q.title)"
              class="bookmark-dot"
              title="已收藏"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                />
              </svg>
            </span>
          </div>
          <div class="question-title">{{ q.title }}</div>
          <button
            class="delete-btn"
            title="删除"
            :disabled="store.isLoading || docsLoading"
            @click.stop="onDelete(q.id)"
          >
            ✕
          </button>
        </div>
      </template>
      <div v-else class="empty-area">
        <p class="empty-hint">
          {{
            store.questions.length
              ? "没有匹配的题目"
              : "还没有题目，请先生成面试题"
          }}
        </p>
        <button
          v-if="!store.questions.length"
          class="generate-cta"
          @click="onGenerate"
          :disabled="store.isLoading || docsLoading"
        >
          {{
            store.isLoading
              ? "生成中..."
              : docsLoading
                ? "文档处理中..."
                : "生成题目"
          }}
        </button>
      </div>
    </div>

    <div v-if="store.questions.length" class="pagination-bar">
      <div class="pagination-nav">
        <button
          class="page-btn"
          :disabled="store.currentPage <= 1"
          @click="store.goToPage(store.currentPage - 1)"
        >
          ‹
        </button>
        <span class="page-info"
          >{{ store.currentPage }} / {{ store.totalPages }}</span
        >
        <button
          class="page-btn"
          :disabled="store.currentPage >= store.totalPages"
          @click="store.goToPage(store.currentPage + 1)"
        >
          ›
        </button>
      </div>
      <select
        class="page-size-select"
        :value="store.pageSize"
        @change="onPageSizeChange"
      >
        <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
          {{ opt }} 条/页
        </option>
      </select>
    </div>

    <div v-if="store.questions.length" class="left-footer">
      <div class="footer-actions">
        <button
          class="generate-btn"
          @click="onContinue"
          :disabled="store.isLoading || docsLoading"
        >
          {{
            store.isLoading && generationMode === "continue"
              ? "生成中..."
              : docsLoading
                ? "文档处理中..."
                : "+ 继续生成"
          }}
        </button>
        <button
          class="generate-btn primary"
          @click="onRegenerate"
          :disabled="store.isLoading || docsLoading"
        >
          {{
            store.isLoading && generationMode === "regenerate"
              ? "生成中..."
              : docsLoading
                ? "文档处理中..."
                : "⟳ 重新生成"
          }}
        </button>
      </div>

      <button class="export-btn" @click="onExportMd" :disabled="exportLoading">
        {{ exportLoading ? "导出中..." : "导出 MD" }}
      </button>

      <button
        class="clear-btn"
        @click="onClear"
        :disabled="store.isLoading || docsLoading"
      >
        清空题目
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useDialog } from "naive-ui";
import { useQuestionsStore } from "../../stores/questions";
import {
  QuestionCategory,
  QuestionCategoryLabel,
  FrequencyLabel,
} from "../../types";
import { fetchAllQuestions, downloadMd } from "../../utils/exportPdf";

defineProps<{
  docsLoading?: boolean;
  bookmarkedQuestions?: Set<string>;
}>();

const emit = defineEmits<{
  select: [id: string];
  generate: [];
  generateMore: [];
  regenerate: [];
  close: [];
}>();

const store = useQuestionsStore();
const dialog = useDialog();
const generationMode = ref<"generate" | "continue" | "regenerate" | null>(null);
const exportLoading = ref(false);

watch(
  () => store.isLoading,
  (loading) => {
    if (!loading) generationMode.value = null;
  },
);

async function onExportMd() {
  exportLoading.value = true;
  try {
    const questions = await fetchAllQuestions();
    downloadMd(questions);
  } finally {
    exportLoading.value = false;
  }
}

const pageSizeOptions = [20, 50, 100, 200, 500, 1000];

const tabs = [
  { key: QuestionCategory.FUNDAMENTAL, label: "基础八股" },
  { key: QuestionCategory.PROJECT, label: "项目深挖" },
  { key: QuestionCategory.SCENARIO, label: "场景题" },
  { key: QuestionCategory.COMPREHENSIVE, label: "综合题" },
];

function onPageSizeChange(e: Event) {
  store.setPageSize(Number((e.target as HTMLSelectElement).value));
}

function categoryLabel(cat: QuestionCategory) {
  return QuestionCategoryLabel[cat];
}

function freqLabel(f: string) {
  return FrequencyLabel[f] || f;
}

function hasAnswer(q: any) {
  return q.answers?.some((a: any) => a.answer);
}

function onDelete(id: string) {
  store.deleteQuestion(id);
}

function onGenerate() {
  generationMode.value = "generate";
  emit("generate");
}

function onContinue() {
  generationMode.value = "continue";
  emit("generateMore");
}

function onRegenerate() {
  dialog.warning({
    title: "重新生成题目",
    content: "将清空所有旧题并从当前文档重新生成，确定吗？",
    positiveText: "确定重新生成",
    negativeText: "取消",
    onPositiveClick: () => {
      generationMode.value = "regenerate";
      emit("regenerate");
    },
  });
}

function onClear() {
  dialog.warning({
    title: "清空题目",
    content: "确定要清空所有题目吗？此操作不可撤销。",
    positiveText: "确定清空",
    negativeText: "取消",
    onPositiveClick: () => {
      store.clearAllQuestions();
    },
  });
}
</script>

<style scoped>
.left-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.left-header {
  padding: var(--space-5) var(--space-5) 0;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-row h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text);
}

.total-count {
  font-weight: 400;
  font-size: var(--text-sm);
  color: var(--color-text-placeholder);
  margin-left: var(--space-2);
}

.close-panel-btn {
  display: none;
  border: none;
  background: transparent;
  color: var(--color-text-placeholder);
  font-size: var(--text-lg);
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  line-height: 1;
  transition: var(--transition);
}

.close-panel-btn:hover {
  background: var(--color-surface-muted);
  color: var(--color-text);
}

@media (max-width: 1000px) {
  .close-panel-btn {
    display: block;
  }
}

@media (max-width: 768px) {
  .left-header {
    padding: 16px 16px 12px;
  }

  .header-row h3 {
    font-size: 16px;
  }

  .search {
    padding: 10px 14px;
    font-size: 16px;
  }

  .tabs {
    gap: 4px;
  }

  .tab {
    padding: 6px 12px;
    font-size: 13px;
  }

  .tab-count {
    padding: 1px 6px;
    font-size: 10px;
  }

  .question-list {
    padding: 12px;
  }

  .question-item {
    padding: 12px;
  }

  .question-title {
    font-size: 14px;
    padding-right: 28px;
  }

  .question-category {
    font-size: 11px;
  }

  .generate-cta {
    padding: 14px 32px;
    font-size: 15px;
  }

  .empty-area {
    padding: 30px 16px;
  }

  .pagination-bar {
    padding: 8px 12px;
  }

  .page-btn {
    width: 36px;
    height: 36px;
  }
}

.search {
  width: 100%;
  border: 1px solid var(--color-border-input);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  margin-top: var(--space-4);
  background: var(--color-surface-hover);
  outline: none;
  font-size: var(--text-base);
  color: var(--color-text);
  transition: var(--transition);
}

.search::placeholder {
  color: var(--color-text-placeholder);
}

.search:focus {
  border-color: var(--color-primary);
}

.tabs {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-top: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
}

.tab {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--text-base);
  transition: var(--transition);
}

.tab.active {
  background: var(--color-primary);
  color: white;
}

.tab.active .tab-count {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.tab-count {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

.question-list {
  padding: var(--space-4);
  overflow-y: auto;
  flex: 1;
}

.question-item {
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-surface-hover);
  border: 1px solid transparent;
  margin-bottom: var(--space-2);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  position: relative;
}

.question-item:hover,
.question-item.active {
  border-color: var(--color-primary-border);
  background: var(--color-primary-light);
}

.question-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: 6px;
  width: 100%;
}

.question-category {
  font-size: var(--text-sm);
  color: var(--color-primary);
  font-weight: 600;
}

.answered-dot {
  display: inline-flex;
  align-items: center;
  color: var(--color-success);
}

.bookmark-dot {
  display: inline-flex;
  align-items: center;
  color: var(--color-warning);
}

.question-frequency {
  font-size: var(--text-xs);
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
  font-weight: 500;
}

.question-frequency.高 {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.question-frequency.中 {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.question-frequency.低 {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.question-title {
  line-height: 1.6;
  color: var(--color-text);
  font-weight: 500;
  font-size: var(--text-base);
  flex: 1;
  padding-right: 24px;
}

.delete-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-text-placeholder);
  cursor: pointer;
  font-size: var(--text-base);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: var(--transition);
  line-height: 1;
}

.delete-btn:hover {
  background: #fee2e2;
  color: var(--color-danger);
}

.empty-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: var(--space-6);
}

.empty-hint {
  text-align: center;
  color: var(--color-text-placeholder);
  font-size: var(--text-base);
  margin: 0;
}

.generate-cta {
  padding: var(--space-4) 48px;
  border: none;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary), #7c6ef0);
  color: white;
  cursor: pointer;
  font-weight: 700;
  font-size: var(--text-md);
  letter-spacing: 0.5px;
  transition: var(--transition);
  box-shadow: var(--shadow-primary);
}

.generate-cta:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(37, 99, 235, 0.4);
}

.generate-cta:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.loading-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  gap: var(--space-3);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-weight: 600;
  color: var(--color-primary);
  font-size: var(--text-md);
}

.loading-sub {
  font-size: var(--text-sm);
  color: var(--color-text-placeholder);
}

.generating-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-3);
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-primary);
  font-weight: 500;
}

.generating-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: pulse 1s ease-in-out infinite;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-4);
  border-top: 1px solid var(--color-border-light);
}

.pagination-nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.page-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--color-border-input);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--text-md);
  font-weight: 600;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.page-btn:hover:not(:disabled) {
  background: var(--color-surface-muted);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: 500;
  white-space: nowrap;
  min-width: 50px;
  text-align: center;
}

.page-size-select {
  padding: 5px var(--space-2);
  border: 1px solid var(--color-border-input);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
}

.page-size-select:focus {
  border-color: var(--color-primary);
}

.left-footer {
  border-top: 1px solid var(--color-border-light);
}

.footer-actions {
  display: flex;
}

.generate-btn {
  flex: 1;
  padding: var(--space-3);
  border: none;
  background: var(--color-surface);
  color: var(--color-primary);
  cursor: pointer;
  font-weight: 600;
  font-size: var(--text-base);
  transition: var(--transition);
}

.generate-btn + .generate-btn {
  border-left: 1px solid var(--color-border-light);
}

.generate-btn.primary {
  background: var(--color-primary-light);
  font-weight: 700;
}

.generate-btn:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.generate-btn.primary:hover:not(:disabled) {
  background: #dbeafe;
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-btn {
  width: 100%;
  padding: var(--space-2);
  border: none;
  border-top: 1px solid var(--color-border-light);
  background: var(--color-surface);
  color: var(--color-primary);
  cursor: pointer;
  font-weight: 600;
  font-size: var(--text-sm);
  transition: var(--transition);
}

.export-btn:hover:not(:disabled) {
  background: var(--color-primary-light);
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  width: 100%;
  padding: var(--space-2);
  border: none;
  border-top: 1px solid var(--color-border-light);
  background: var(--color-surface);
  color: var(--color-text-placeholder);
  cursor: pointer;
  font-weight: 500;
  font-size: var(--text-sm);
  transition: var(--transition);
}

.clear-btn:hover:not(:disabled) {
  background: var(--color-surface-hover);
  color: var(--color-danger);
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
