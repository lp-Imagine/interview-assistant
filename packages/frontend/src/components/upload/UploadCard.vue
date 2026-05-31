<template>
  <div class="card">
    <div class="card-title">上传资料</div>

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

    <!-- File upload mode -->
    <div v-if="mode === 'file'" class="mode-panel">
      <div
        class="upload-zone"
        :class="{ disabled: isBlocked }"
        @click="!isBlocked && triggerFile()"
        @dragover.prevent
        @drop.prevent="!isBlocked && onDrop($event)"
      >
        <template v-if="fileUploading">
          <div class="spinner"></div>
          <div>正在上传...</div>
        </template>
        <template v-else>
          <svg
            width="32"
            height="32"
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

    <!-- Text input mode -->
    <div v-if="mode === 'text'" class="mode-panel">
      <input
        v-model="textTitle"
        class="input"
        placeholder="输入标题，如：腾讯 Java 后端 JD"
      />
      <textarea
        v-model="textContent"
        class="input field-textarea"
        placeholder="粘贴文本内容..."
        rows="8"
      ></textarea>
      <button
        class="btn btn--primary submit-btn"
        :disabled="isBlocked || !textTitle.trim() || !textContent.trim()"
        @click="submitText"
      >
        <template v-if="textSubmitting"
          ><div class="spinner small"></div>
          提交中...</template
        >
        <template v-else>提交文本</template>
      </button>
    </div>

    <!-- URL input mode -->
    <div v-if="mode === 'url'" class="mode-panel">
      <input
        v-model="urlTitle"
        class="input"
        placeholder="输入标题，如：字节跳动前端 JD"
      />
      <input
        v-model="urlInput"
        class="input"
        placeholder="输入链接地址，如：https://example.com/jd"
      />
      <button
        class="btn btn--primary submit-btn"
        :disabled="isBlocked || !urlTitle.trim() || !urlInput.trim()"
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
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useDocumentsStore } from "../../stores/documents";

const props = defineProps<{ disabled?: boolean }>();
const emit = defineEmits<{ uploaded: [id: string] }>();

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

const store = useDocumentsStore();
const mode = ref<"file" | "text" | "url">("file");

const fileInput = ref<HTMLInputElement>();
const fileUploading = ref(false);
const textTitle = ref("");
const textContent = ref("");
const textSubmitting = ref(false);
const urlTitle = ref("");
const urlInput = ref("");
const urlSubmitting = ref(false);

const isBlocked = computed(
  () =>
    props.disabled ||
    fileUploading.value ||
    textSubmitting.value ||
    urlSubmitting.value,
);

function triggerFile() {
  if (!isBlocked.value) fileInput.value?.click();
}
function onDrop(e: DragEvent) {
  if (isBlocked.value) return;
  const file = e.dataTransfer?.files?.[0];
  if (file) handleFile(file);
}
function onFileChange(e: Event) {
  if (isBlocked.value) return;
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) handleFile(file);
}
async function handleFile(file: File) {
  fileUploading.value = true;
  try {
    const doc = await store.upload(file, "INTERVIEW_EXP");
    emit("uploaded", doc.id);
  } catch {
    /* ignore */
  } finally {
    fileUploading.value = false;
  }
}
async function submitText() {
  if (isBlocked.value || !textTitle.value.trim() || !textContent.value.trim())
    return;
  textSubmitting.value = true;
  try {
    const doc = await store.createFromText(
      "INTERVIEW_EXP",
      textTitle.value.trim(),
      textContent.value,
    );
    textTitle.value = "";
    textContent.value = "";
    emit("uploaded", doc.id);
  } catch {
    /* ignore */
  } finally {
    textSubmitting.value = false;
  }
}
async function submitUrl() {
  if (isBlocked.value || !urlTitle.value.trim() || !urlInput.value.trim())
    return;
  urlSubmitting.value = true;
  try {
    const doc = await store.createFromUrl(
      "INTERVIEW_EXP",
      urlTitle.value.trim(),
      urlInput.value.trim(),
    );
    urlTitle.value = "";
    urlInput.value = "";
    emit("uploaded", doc.id);
  } catch {
    /* ignore */
  } finally {
    urlSubmitting.value = false;
  }
}
</script>

<style scoped>
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

.mode-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

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
  min-height: 160px;
  line-height: 1.6;
}

.submit-btn {
  align-self: flex-start;
}

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
</style>
