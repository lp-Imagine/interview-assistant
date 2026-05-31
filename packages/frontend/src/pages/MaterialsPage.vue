<template>
  <div class="content">
    <div class="card">
      <div class="card-title">我的资料</div>

      <div class="upload-section">
        <div class="mode-tabs">
          <button
            v-for="m in modes"
            :key="m.key"
            class="mode-tab"
            :class="{ active: mode === m.key }"
            @click="mode = m.key"
          >
            <svg
              v-html="m.icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <span>{{ m.label }}</span>
          </button>
        </div>

        <!-- File mode -->
        <div v-if="mode === 'file'" class="mode-panel">
          <div
            class="upload-zone"
            :class="{ disabled: isBusy }"
            @click="!isBusy && triggerFile()"
            @dragover.prevent
            @drop.prevent="!isBusy && onDrop($event)"
          >
            <template v-if="uploading">
              <div class="spinner"></div>
              <div>正在上传...</div>
            </template>
            <template v-else>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <div>点击或拖拽上传文件</div>
              <div class="hint">支持 PDF / DOCX / TXT，最大 10MB</div>
            </template>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            style="display: none"
            @change="onFileChange"
          />
        </div>

        <!-- Text mode -->
        <div v-if="mode === 'text'" class="mode-panel">
          <input v-model="textTitle" class="input" placeholder="输入标题" />
          <textarea
            v-model="textContent"
            class="input field-textarea"
            placeholder="粘贴文本内容..."
            rows="6"
          ></textarea>
          <button
            class="btn btn--primary submit-btn"
            :disabled="isBusy || !textTitle.trim() || !textContent.trim()"
            @click="submitText"
          >
            <template v-if="textSubmitting"
              ><div class="spinner small"></div>
              提交中...</template
            >
            <template v-else>提交文本</template>
          </button>
        </div>

        <!-- URL mode -->
        <div v-if="mode === 'url'" class="mode-panel">
          <input v-model="urlTitle" class="input" placeholder="输入标题" />
          <input v-model="urlInput" class="input" placeholder="输入链接地址" />
          <button
            class="btn btn--primary submit-btn"
            :disabled="isBusy || !urlTitle.trim() || !urlInput.trim()"
            @click="submitUrl"
          >
            <template v-if="urlSubmitting"
              ><div class="spinner small"></div>
              读取中...</template
            >
            <template v-else>读取链接</template>
          </button>
        </div>
      </div>

      <!-- Document list -->
      <div v-if="docsStore.documents.length" class="doc-list">
        <div v-for="doc in docsStore.documents" :key="doc.id" class="doc-item">
          <div class="doc-info">
            <div class="doc-name">{{ doc.fileName }}</div>
            <div class="doc-meta">
              {{ statusLabel(doc.status) }} · {{ doc.createdAt.slice(0, 10) }}
            </div>
            <div v-if="doc.analysis" class="doc-tags">
              <span
                v-for="tag in doc.analysis.techStack"
                :key="'t-' + tag"
                class="badge badge--primary"
                >{{ tag }}</span
              >
              <span
                v-for="tag in doc.analysis.keywords"
                :key="'k-' + tag"
                class="badge kw"
                >{{ tag }}</span
              >
            </div>
          </div>
          <div class="doc-actions">
            <template v-if="operatingId === doc.id">
              <span class="operating-hint">处理中...</span>
            </template>
            <template v-else>
              <button
                v-if="doc.status === 'UPLOADED' || doc.status === 'FAILED'"
                class="action-btn"
                :disabled="!!operatingId || isBusy"
                @click="onProcess(doc.id)"
              >
                分析
              </button>
              <button
                class="action-btn danger"
                :disabled="!!operatingId || isBusy"
                @click="onRemove(doc.id)"
              >
                删除
              </button>
            </template>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
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
          <path
            d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
          />
        </svg>
        <p class="empty-title">还没有上传任何资料</p>
        <p class="empty-hint--sub">
          上传简历、岗位 JD 和面试资料，系统会自动分析并生成面试题
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useDocumentsStore } from "../stores/documents";
import { useQuestionsStore } from "../stores/questions";
import { DocumentStatus } from "../types";

const modes = [
  {
    key: "file",
    label: "本地文件",
    icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  },
  {
    key: "text",
    label: "文本输入",
    icon: '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="11" x2="20" y2="11"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="4" y1="19" x2="14" y2="19"/>',
  },
  {
    key: "url",
    label: "线上链接",
    icon: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  },
];

const docsStore = useDocumentsStore();
const questionsStore = useQuestionsStore();

const mode = ref<"file" | "text" | "url">("file");
const operatingId = ref<string | null>(null);

const fileInput = ref<HTMLInputElement>();
const uploading = ref(false);

const textTitle = ref("");
const textContent = ref("");
const textSubmitting = ref(false);

const urlTitle = ref("");
const urlInput = ref("");
const urlSubmitting = ref(false);

const isBusy = computed(
  () =>
    uploading.value ||
    textSubmitting.value ||
    urlSubmitting.value ||
    !!operatingId.value ||
    questionsStore.isLoading,
);

function statusLabel(status: DocumentStatus) {
  const map: Record<string, string> = {
    UPLOADED: "已上传",
    PROCESSING: "处理中",
    COMPLETED: "已完成",
    FAILED: "失败",
  };
  return map[status] || status;
}

function triggerFile() {
  if (!isBusy.value) fileInput.value?.click();
}
function onDrop(e: DragEvent) {
  if (isBusy.value) return;
  const file = e.dataTransfer?.files?.[0];
  if (file) uploadFile(file);
}
function onFileChange(e: Event) {
  if (isBusy.value) return;
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) uploadFile(file);
}
async function uploadFile(file: File) {
  uploading.value = true;
  try {
    const doc = await docsStore.upload(file, "INTERVIEW_EXP");
    docsStore.processDocument(doc.id);
  } finally {
    uploading.value = false;
  }
}

async function submitText() {
  if (isBusy.value || !textTitle.value.trim() || !textContent.value.trim())
    return;
  textSubmitting.value = true;
  try {
    const doc = await docsStore.createFromText(
      "INTERVIEW_EXP",
      textTitle.value.trim(),
      textContent.value,
    );
    textTitle.value = "";
    textContent.value = "";
    docsStore.processDocument(doc.id);
  } finally {
    textSubmitting.value = false;
  }
}

async function submitUrl() {
  if (isBusy.value || !urlTitle.value.trim() || !urlInput.value.trim()) return;
  urlSubmitting.value = true;
  try {
    const doc = await docsStore.createFromUrl(
      "INTERVIEW_EXP",
      urlTitle.value.trim(),
      urlInput.value.trim(),
    );
    urlTitle.value = "";
    urlInput.value = "";
    docsStore.processDocument(doc.id);
  } finally {
    urlSubmitting.value = false;
  }
}

async function onProcess(id: string) {
  operatingId.value = id;
  await docsStore.processDocument(id);
  operatingId.value = null;
}

async function onRemove(id: string) {
  operatingId.value = id;
  await docsStore.remove(id);
  operatingId.value = null;
}

onMounted(() => {
  docsStore.fetchDocuments();
});
</script>

<style scoped>
.content {
  flex: 1;
  overflow-y: auto;
  padding: var(--content-padding);
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-7);
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: var(--space-5);
  color: var(--color-text);
}

/* Mode tabs */
.mode-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: var(--space-3);
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: var(--color-text-placeholder);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--text-base);
  font-weight: 500;
  transition: var(--transition);
}

.mode-tab.active {
  background: var(--color-surface-muted);
  color: var(--color-text);
}

.mode-tab:hover:not(.active) {
  color: var(--color-text-muted);
}

/* Mode panels */
.mode-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

/* Upload zone */
.upload-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface-hover);
  padding: 42px 20px;
  text-align: center;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.upload-zone:hover:not(.disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.upload-zone.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.hint {
  font-size: var(--text-sm);
  color: var(--color-text-placeholder);
}

.field-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.submit-btn {
  align-self: flex-start;
}

/* Spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  border-top-color: white;
}

/* Document list */
.doc-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.doc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.doc-item:hover {
  border-color: var(--color-primary-border);
  box-shadow: 0 2px 8px rgba(18, 24, 38, 0.04);
}

.doc-name {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
  font-size: var(--text-base);
}

.doc-meta {
  font-size: var(--text-sm);
  color: var(--color-text-placeholder);
  margin-bottom: 6px;
}

.doc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: var(--space-1);
}

.kw {
  background: #f5f3ff;
  color: #7c3aed;
}

.doc-actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.operating-hint {
  font-size: var(--text-sm);
  color: var(--color-primary);
  font-weight: 500;
}

.action-btn {
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
  font-size: var(--text-base);
  background: var(--color-primary-light);
  color: var(--color-primary);
  transition: var(--transition);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn:hover:not(:disabled) {
  background: var(--color-primary-border);
}

.action-btn.danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.action-btn.danger:hover:not(:disabled) {
  background: #fee2e2;
}

.empty-hint {
  color: var(--color-text-placeholder);
  text-align: center;
  padding: 60px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
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
  font-size: var(--text-base);
}

.empty-hint--sub {
  font-size: var(--text-sm);
  color: var(--color-text-placeholder);
  max-width: 320px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .content {
    padding: 12px;
  }

  .card {
    padding: 16px;
    border-radius: var(--radius-lg);
  }

  .card-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .mode-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .mode-tabs::-webkit-scrollbar {
    display: none;
  }

  .mode-tab {
    white-space: nowrap;
    flex-shrink: 0;
    padding: 8px 14px;
    font-size: 14px;
  }

  .upload-zone {
    padding: 28px 16px;
  }

  .doc-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
  }

  .doc-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .action-btn {
    padding: 8px 14px;
    font-size: 13px;
  }

  .submit-btn {
    width: 100%;
    justify-content: center;
  }

  .doc-tags {
    gap: 4px;
  }

  .badge {
    font-size: 11px;
    padding: 2px 8px;
  }
}
</style>
