<template>
  <div class="content">
    <div class="page-header">
      <h1 class="page-title">我的收藏</h1>
      <span v-if="bookmarks.length" class="badge badge--muted"
        >{{ bookmarks.length }} 条</span
      >
    </div>

    <div class="favorites-container">
      <div class="bookmark-list" v-if="groupedBookmarks.length">
        <div
          v-for="group in groupedBookmarks"
          :key="group.question"
          class="bookmark-card card"
          :class="{ expanded: expandedId === group.question }"
        >
          <div
            class="card-header"
            :class="{ 'sticky-header': expandedId === group.question }"
            @click="toggleExpand(group.question)"
          >
            <div class="card-question">
              {{ group.question }}
              <span v-if="group.count > 1" class="version-badge"
                >{{ group.count }} 个版本</span
              >
            </div>
            <div class="card-meta">
              <span class="card-date">{{
                formatDate(group.latestVersion.createdAt)
              }}</span>
              <button
                class="delete-btn"
                @click.stop="
                  handleDeleteVersion(group, group.latestVersion.id, 0)
                "
                title="删除最新版本"
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
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2l-1-14" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
              <span class="expand-arrow">{{
                expandedId === group.question ? "▾" : "▸"
              }}</span>
            </div>
          </div>

          <div class="card-body" v-if="expandedId === group.question">
            <div v-if="group.count > 1" class="version-tabs">
              <div
                v-for="(v, vi) in group.versions"
                :key="v.id"
                class="version-row"
              >
                <button
                  class="version-tab"
                  :class="{
                    active:
                      (selectedVersion[group.question] ||
                        group.latestVersion.id) === v.id,
                  }"
                  @click.stop="selectVersion(group.question, v.id)"
                >
                  v{{ group.count - vi }} · {{ formatDateShort(v.createdAt) }}
                </button>
                <button
                  class="version-delete-btn"
                  @click.stop="handleDeleteVersion(group, v.id, vi)"
                  title="删除此版本"
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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2l-1-14" />
                  </svg>
                </button>
              </div>
            </div>

            <template v-for="v in group.versions" :key="v.id">
              <div
                v-if="
                  (selectedVersion[group.question] ||
                    group.latestVersion.id) === v.id
                "
              >
                <div class="section">
                  <div class="section-title">AI 推荐回答</div>
                  <div
                    class="answer-box md-content"
                    v-html="md.render(v.answer)"
                  ></div>
                </div>

                <div class="section" v-if="v.structure && v.structure.length">
                  <div class="section-title">推荐回答结构</div>
                  <div class="structure-list">
                    <div
                      v-for="(s, i) in v.structure || []"
                      :key="i"
                      class="structure-item md-content"
                      v-html="md.render((s.step || i + 1) + '. ' + s.content)"
                    ></div>
                  </div>
                </div>

                <div class="section" v-if="v.followUps?.length">
                  <div class="section-title">高频追问</div>
                  <div class="follow-list">
                    <div
                      v-for="(f, i) in v.followUps"
                      :key="i"
                      class="follow-item"
                      :class="{
                        'has-answer': getThreadAnswer(v, f),
                        expanded: expandedFollowUps.has(i),
                      }"
                      @click="toggleFollowUp(i, v, f)"
                    >
                      <div class="follow-question">
                        <span
                          v-if="getThreadAnswer(v, f)"
                          class="expand-icon"
                          >{{ expandedFollowUps.has(i) ? "▾" : "▸" }}</span
                        >
                        <span v-html="md.render(f)"></span>
                      </div>
                      <div
                        v-if="getThreadAnswer(v, f) && expandedFollowUps.has(i)"
                        class="follow-answer md-content"
                        v-html="md.render(getThreadAnswer(v, f))"
                      ></div>
                    </div>
                  </div>
                </div>

                <div class="section" v-if="v.insight">
                  <div class="section-title">面试官真实考察点</div>
                  <div
                    class="insight-box md-content"
                    v-html="md.render(v.insight)"
                  ></div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="empty-icon"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <p class="empty-title">还没有收藏内容</p>
        <p class="empty-hint">
          在面试准备工作台中，点击右侧的"收藏"按钮保存喜欢的题目和回答
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useDialog } from "naive-ui";
import { fetchBookmarks, deleteBookmark } from "../api/bookmarks";
import { md } from "../utils/markdown";
import type { Bookmark } from "../types";

const dialog = useDialog();
const bookmarks = ref<Bookmark[]>([]);
const expandedId = ref<string | null>(null);
const expandedFollowUps = ref(new Set<number>());
const selectedVersion = ref<Record<string, string>>({});

const groupedBookmarks = computed(() => {
  const map = new Map<string, Bookmark[]>();
  for (const bm of bookmarks.value) {
    const list = map.get(bm.question) || [];
    list.push(bm);
    map.set(bm.question, list);
  }
  for (const list of map.values()) {
    list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  return [...map.entries()].map(([question, versions]) => ({
    question,
    versions,
    latestVersion: versions[0],
    count: versions.length,
  }));
});

function selectVersion(question: string, id: string) {
  selectedVersion.value = { ...selectedVersion.value, [question]: id };
  expandedFollowUps.value.clear();
}

function getThreadAnswer(bm: any, question: string): string | undefined {
  const threads = bm.followUpThreads as any[] | undefined;
  if (!threads?.length) return undefined;
  const t = threads.find((t: any) => t.question === question);
  return t?.answer;
}

function toggleFollowUp(index: number, bm: any, question: string) {
  if (!getThreadAnswer(bm, question)) return;
  if (expandedFollowUps.value.has(index)) {
    expandedFollowUps.value.delete(index);
  } else {
    expandedFollowUps.value.add(index);
  }
}

onMounted(async () => {
  try {
    bookmarks.value = await fetchBookmarks();
  } catch {
    // ignore
  }
});

function toggleExpand(id: string) {
  if (expandedId.value === id) {
    expandedId.value = null;
    expandedFollowUps.value.clear();
  } else {
    expandedId.value = id;
    expandedFollowUps.value.clear();
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("zh-CN", { hour12: false });
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

async function handleDeleteVersion(
  group: { question: string; versions: Bookmark[]; count: number },
  id: string,
  idx: number,
) {
  dialog.warning({
    title: "删除收藏版本",
    content: `确定要删除「${group.question}」的版本 ${group.count - idx} 吗？`,
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await deleteBookmark(id);
        bookmarks.value = bookmarks.value.filter((b) => b.id !== id);
        // Clear selected version for this question if the deleted version was selected
        if (selectedVersion.value[group.question] === id) {
          const next = { ...selectedVersion.value };
          delete next[group.question];
          selectedVersion.value = next;
        }
        // If no more versions for this question, collapse
        const remaining = bookmarks.value.filter(
          (b) => b.question === group.question,
        );
        if (!remaining.length && expandedId.value === group.question) {
          expandedId.value = null;
        }
      } catch {
        // ignore
      }
    },
  });
}
</script>

<style scoped>
.content {
  flex: 1;
  overflow: hidden;
  padding: var(--content-padding);
  display: flex;
  flex-direction: column;
}

.favorites-container {
  flex: 1;
  overflow-y: auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
  flex-shrink: 0;
}

.page-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.bookmark-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.bookmark-card {
  transition: all 0.2s ease;
}

.bookmark-card:hover {
  border-color: var(--color-primary-border);
  box-shadow: 0 2px 8px rgba(18, 24, 38, 0.04);
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  gap: var(--space-3);
}

.card-question {
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
  line-height: 1.5;
  font-size: var(--text-base);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.version-badge {
  font-size: var(--text-xs);
  font-weight: 500;
  padding: 1px 8px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  white-space: nowrap;
}

.expand-arrow {
  font-size: var(--text-sm);
  color: var(--color-text-placeholder);
  transition: transform 0.2s;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.card-date {
  font-size: var(--text-sm);
  color: var(--color-text-placeholder);
}

.delete-btn {
  border: none;
  background: transparent;
  color: var(--color-text-placeholder);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  transition: var(--transition);
}

.delete-btn:hover {
  color: var(--color-danger);
  background: var(--color-danger-bg);
}

.card-body {
  padding: 0 var(--space-5) var(--space-5);
  border-top: 1px solid var(--color-surface-muted);
}

.version-tabs {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: var(--space-3);
}

.version-row {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.version-tab {
  padding: 3px var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--text-xs);
  font-weight: 500;
  transition: var(--transition);
}

.version-tab.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.version-tab:hover:not(.active) {
  border-color: var(--color-primary-border);
  color: var(--color-text-secondary);
}

.version-delete-btn {
  border: none;
  background: transparent;
  color: var(--color-text-placeholder);
  cursor: pointer;
  padding: 2px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  transition: var(--transition);
  margin-left: auto;
}

.version-delete-btn:hover {
  color: var(--color-danger);
  background: var(--color-danger-bg);
}

.section {
  margin-top: var(--space-4);
}

.section-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.answer-box {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px;
  line-height: 1.9;
  color: var(--color-text-secondary);
  font-size: var(--text-base);
}

.structure-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.structure-item {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  padding: 12px 14px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  line-height: 1.7;
  font-size: var(--text-base);
}

.follow-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.follow-item {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--text-base);
  overflow: hidden;
}

.follow-item.has-answer {
  cursor: pointer;
}

.expand-icon {
  display: inline-block;
  width: 16px;
  color: var(--color-primary);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.follow-question {
  word-wrap: break-word;
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}

.follow-answer {
  margin-top: 10px;
  padding: 10px 14px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-weight: 400;
  line-height: 1.7;
  font-size: var(--text-sm);
}

.insight-box {
  background: linear-gradient(135deg, #eff6ff, #f5f3ff);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  line-height: 1.7;
  font-size: var(--text-base);
  color: var(--color-text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: var(--color-text-muted);
  font-size: var(--text-md);
}

.empty-icon {
  color: var(--color-text-placeholder);
  opacity: 0.4;
  margin-bottom: var(--space-4);
}

.empty-title {
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.empty-hint {
  font-size: var(--text-base);
  color: var(--color-text-placeholder);
  max-width: 360px;
  text-align: center;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .content {
    padding: 12px;
  }

  .page-title {
    font-size: 18px;
  }

  .card-header {
    padding: 12px 14px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .card-question {
    font-size: 14px;
    width: 100%;
  }

  .card-meta {
    width: 100%;
    justify-content: space-between;
  }

  .card-body {
    padding: 0 14px 14px;
  }

  .version-tabs {
    gap: 6px;
  }

  .version-tab {
    padding: 6px 10px;
    font-size: 12px;
  }

  .answer-box {
    padding: 14px;
    font-size: 14px;
  }

  .structure-item {
    padding: 10px 12px;
    font-size: 14px;
  }

  .follow-item {
    padding: 10px 12px;
    font-size: 14px;
  }

  .insight-box {
    padding: 12px;
    font-size: 14px;
  }

  .section-title {
    font-size: 14px;
  }

  .delete-btn,
  .version-delete-btn {
    padding: 6px;
  }
}
</style>
