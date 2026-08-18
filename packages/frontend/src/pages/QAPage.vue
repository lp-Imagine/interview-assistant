<template>
  <div class="content">
    <div class="qa-container">
      <!-- 头部 -->
      <div class="chat-header">
        <div class="header-left">
          <div class="ai-avatar">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="4" y="8" width="16" height="12" rx="2" />
              <path d="M12 8V4" />
              <circle cx="12" cy="4" r="2" />
              <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
              <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none" />
              <path d="M9 17h6" />
            </svg>
          </div>
          <div class="header-text">
            <div class="chat-title">AI 面试官</div>
            <div class="chat-subtitle">面试问题随时问 · AI 实时解答</div>
          </div>
        </div>
        <button
          v-if="messages.length"
          class="clear-btn"
          @click="clearHistory"
          :disabled="workspaceStore.isStreaming"
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
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
          </svg>
          清空记录
        </button>
      </div>

      <!-- 消息区 -->
      <div class="messages" ref="messagesContainer">
        <!-- 空状态：AI 图标 + 示例问题 -->
        <div v-if="!messages.length" class="empty-state">
          <div class="empty-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="4" y="8" width="16" height="12" rx="2" />
              <path d="M12 8V4" />
              <circle cx="12" cy="4" r="2" />
              <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
              <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none" />
              <path d="M9 17h6" />
            </svg>
          </div>
          <div class="empty-title">开始提问</div>
          <div class="empty-desc">选择下方示例问题，或直接输入你的面试问题</div>
          <div class="suggestions">
            <button
              v-for="q in suggestions"
              :key="q"
              class="suggestion-chip"
              @click="useSuggestion(q)"
            >
              <span class="chip-arrow">→</span>
              {{ q }}
            </button>
          </div>
        </div>

        <!-- 对话消息 -->
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="message-row"
          :class="msg.role"
        >
          <!-- 助手消息：头像 + 气泡 -->
          <template v-if="msg.role === 'assistant'">
            <div class="msg-avatar">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="4" y="8" width="16" height="12" rx="2" />
                <path d="M12 8V4" />
                <circle cx="12" cy="4" r="2" />
                <circle
                  cx="9"
                  cy="14"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
                <circle
                  cx="15"
                  cy="14"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
                <path d="M9 17h6" />
              </svg>
            </div>
            <div class="msg-body">
              <div
                class="bubble-container"
                @mouseenter="hoveredIndex = i"
                @mouseleave="hoveredIndex = null"
              >
                <div
                  v-if="!msg.content && streaming"
                  class="bubble streaming empty"
                >
                  <div class="typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
                <div v-else class="bubble md-content">
                  <div v-html="md.render(msg.content)"></div>
                </div>
              </div>
              <div class="msg-actions" :class="{ visible: hoveredIndex === i }">
                <button
                  class="action-btn"
                  :class="{ copied: copiedIndex === i }"
                  title="复制"
                  @click="copyContent(msg.content, i)"
                >
                  <svg
                    v-if="copiedIndex === i"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <svg
                    v-else
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path
                      d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                    />
                  </svg>
                </button>
                <button class="action-btn" title="下载" @click="downloadMd(i)">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
            </div>
          </template>

          <!-- 用户消息 -->
          <div v-else class="bubble user-bubble" v-text="msg.content"></div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="input-area">
        <div class="input-wrapper">
          <textarea
            ref="inputEl"
            v-model="input"
            class="chat-input"
            placeholder="输入你的面试问题..."
            @keydown.enter.exact.prevent="send"
            :disabled="workspaceStore.isStreaming"
            rows="2"
          />
          <div class="input-footer">
            <span class="input-hint">Enter 发送 · Shift+Enter 换行</span>
            <button
              v-if="workspaceStore.isStreaming"
              class="send-btn stop"
              @click="stopAnswer"
              title="中断回答"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="4" y="4" width="16" height="16" rx="3" />
              </svg>
            </button>
            <button
              v-else
              class="send-btn"
              @click="send"
              :disabled="!input.trim()"
              title="发送"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from "vue";
import { useDialog } from "naive-ui";
import { useWorkspaceStore } from "../stores/workspace";
import { md } from "../utils/markdown";
import { fetchQaHistory, deleteQaHistory } from "../api/qa";

const workspaceStore = useWorkspaceStore();
const dialog = useDialog();

const messages = ref<Array<{ role: string; content: string }>>([]);
const input = ref("");
const messagesContainer = ref<HTMLElement>();
const inputEl = ref<HTMLTextAreaElement>();
const hoveredIndex = ref<number | null>(null);
const copiedIndex = ref<number | null>(null);
const stoppedByUser = ref(false);
const streaming = ref(false);

const suggestions = [
  "如何准备系统设计面试？",
  "讲一下 Vue 的响应式原理",
  "防抖和节流的区别是什么？",
  "如何介绍自己的项目经历？",
];

function useSuggestion(q: string) {
  input.value = q;
  nextTick(() => inputEl.value?.focus());
}

onMounted(async () => {
  try {
    const records = await fetchQaHistory();
    messages.value = records.flatMap((r) => [
      { role: "user", content: r.question },
      { role: "assistant", content: r.answer },
    ]);
  } catch {
    // ignore
  }
});

watch(
  () => workspaceStore.answerContent,
  () => {
    nextTick(() => scrollToBottom());
  },
);

watch(input, () => {
  nextTick(() => {
    if (inputEl.value) {
      inputEl.value.style.height = "auto";
      inputEl.value.style.height =
        Math.max(73, Math.min(inputEl.value.scrollHeight, 160)) + "px";
    }
  });
});

watch(
  () => messages.value.length,
  () => {
    nextTick(() => scrollToBottom(true));
  },
);

function isNearBottom(): boolean {
  const el = messagesContainer.value;
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight < 60;
}

function scrollToBottom(force = false) {
  if (messagesContainer.value && (force || isNearBottom())) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

async function send() {
  const question = input.value.trim();
  if (!question || workspaceStore.isStreaming) return;

  stoppedByUser.value = false;
  streaming.value = true;
  messages.value.push({ role: "user", content: question });
  input.value = "";
  if (inputEl.value) {
    inputEl.value.style.height = "auto";
  }

  const assistantIdx = messages.value.length;
  messages.value.push({ role: "assistant", content: "" });

  const stopWatch = watch(
    () => workspaceStore.answerContent,
    (val) => {
      if (assistantIdx < messages.value.length) {
        messages.value[assistantIdx].content = val;
      }
    },
  );

  const history = messages.value
    .slice(0, -1)
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));

  await nextTick();
  await workspaceStore.qaAsk(question, history);
  stopWatch();
  streaming.value = false;

  if (stoppedByUser.value) return;

  if (!messages.value[assistantIdx].content) {
    messages.value.pop();
  }
}

function stopAnswer() {
  if (!workspaceStore.isStreaming) return;
  stoppedByUser.value = true;
  streaming.value = false;

  const partial = workspaceStore.answerContent;
  workspaceStore.cancelStreaming();

  if (
    partial &&
    messages.value.length &&
    messages.value[messages.value.length - 1].role === "assistant"
  ) {
    messages.value[messages.value.length - 1].content = partial;
  }
}

async function copyContent(content: string, index: number) {
  try {
    await navigator.clipboard.writeText(content);
    copiedIndex.value = index;
    setTimeout(() => {
      copiedIndex.value = null;
    }, 1500);
  } catch {
    // ignore
  }
}

function downloadMd(index: number) {
  const answer = messages.value[index].content;
  const question = index > 0 ? messages.value[index - 1].content : "问答";
  const date = new Date()
    .toLocaleString("zh-CN", { hour12: false })
    .replace(/[/:]/g, "-");
  const filename = `${question.slice(0, 30)}_${date}.md`;
  const blob = new Blob([answer], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function clearHistory() {
  if (workspaceStore.isStreaming) return;
  dialog.warning({
    title: "清空问答记录",
    content: "确定要清空所有问答记录吗？此操作不可撤销。",
    positiveText: "确定清空",
    negativeText: "取消",
    onPositiveClick: async () => {
      try {
        await deleteQaHistory();
      } catch {
        // ignore
      }
      messages.value = [];
    },
  });
}
</script>

<style scoped>
.content {
  flex: 1;
  overflow: hidden;
  padding: var(--content-padding);
}

.qa-container {
  height: calc(100vh - var(--topbar-height) - var(--content-padding) * 2);
  display: flex;
  flex-direction: column;
}

/* ===== 头部 ===== */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-bottom: none;
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.35);
}

.header-text {
  display: grid;
  gap: 2px;
}

.chat-title {
  font-weight: 700;
  font-size: var(--text-lg);
  color: var(--color-text);
  line-height: 1.2;
}

.chat-subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
}

.clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  font-size: 13px;
  padding: 7px 13px;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.clear-btn:hover:not(:disabled) {
  color: var(--color-danger);
  border-color: var(--color-danger);
  background: rgba(239, 68, 68, 0.06);
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== 消息区 ===== */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 26px 22px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
}

/* 空状态 */
.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  width: 76px;
  height: 76px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.12),
    rgba(139, 92, 246, 0.12)
  );
  margin-bottom: 14px;
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.empty-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 22px;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 560px;
}

.suggestion-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface-muted);
  color: var(--color-text);
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.suggestion-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.06);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.chip-arrow {
  color: var(--color-primary);
  font-weight: 600;
}

/* 消息行 */
.message-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 24px;
  animation: msg-in 0.22s ease;
}

@keyframes msg-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-row.user {
  justify-content: flex-end;
}

.msg-avatar {
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  margin-top: 2px;
}

.msg-body {
  max-width: calc(100% - 40px);
  min-width: 0;
}

/* 气泡 */
.bubble {
  padding: 14px 18px;
  border-radius: 14px;
  line-height: 1.85;
  font-size: var(--text-md);
  color: var(--color-text);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  position: relative;
}

.message-row.assistant .bubble {
  border-top-left-radius: 4px;
}

.message-row.user .user-bubble {
  background: linear-gradient(135deg, #6366f1, #7c6cf6);
  color: #fff;
  max-width: 78%;
  padding: 12px 18px;
  border: none;
  border-top-right-radius: 4px;
  font-size: 15px;
  line-height: 1.7;
  box-shadow: 0 3px 12px rgba(99, 102, 241, 0.25);
}

.bubble-container {
  display: block;
}

/* 操作按钮（复制/下载，hover 显示） */
.msg-actions {
  display: flex;
  gap: 2px;
  margin-top: 6px;
  opacity: 0;
  transition: opacity 0.18s ease;
}

.msg-actions.visible {
  opacity: 1;
}

.action-btn {
  border: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  background: transparent;
  color: var(--color-text-muted);
}

.action-btn:hover {
  background: var(--color-surface-muted);
  color: var(--color-primary);
}

.action-btn.copied {
  color: var(--color-success);
}

/* ===== 输入区 ===== */
.input-area {
  padding: 16px 22px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0 0 var(--radius-2xl) var(--radius-2xl);
}

.input-wrapper {
  border: 1px solid var(--color-border-input);
  border-radius: 14px;
  background: var(--color-surface-hover);
  transition:
    border-color var(--transition),
    box-shadow var(--transition);
}

.input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.chat-input {
  display: block;
  width: 100%;
  border: none;
  border-radius: 14px 14px 0 0;
  padding: 14px 16px 6px;
  background: transparent;
  outline: none;
  font-size: var(--text-md);
  font-family: inherit;
  resize: none;
  min-height: 48px;
  max-height: 160px;
  line-height: 1.5;
  overflow-y: auto;
}

.chat-input::placeholder {
  color: var(--color-text-placeholder);
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px 10px;
}

.input-hint {
  font-size: 12px;
  color: var(--color-text-placeholder);
  user-select: none;
}

.send-btn {
  border: none;
  background: linear-gradient(135deg, #6366f1, #7c6cf6);
  color: #fff;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.3);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.04);
  box-shadow: 0 5px 14px rgba(99, 102, 241, 0.4);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.send-btn.stop {
  background: linear-gradient(135deg, #ef4444, #f97316);
  box-shadow: 0 3px 10px rgba(239, 68, 68, 0.3);
}

/* ===== 移动端 ===== */
@media (max-width: 768px) {
  .content {
    padding: 0;
  }

  .qa-container {
    height: calc(100dvh - 52px);
  }

  .chat-header {
    padding: 12px 14px;
  }

  .ai-avatar {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }

  .chat-title {
    font-size: 16px;
  }

  .chat-subtitle {
    font-size: 11px;
  }

  .clear-btn {
    font-size: 12px;
    padding: 6px 10px;
  }

  .messages {
    padding: 14px 12px;
  }

  .message-row {
    margin-bottom: 16px;
    gap: 8px;
  }

  .msg-avatar {
    width: 26px;
    height: 26px;
  }

  .bubble {
    padding: 11px 14px;
    font-size: 14px;
    border-radius: 12px;
  }

  .message-row.user .user-bubble {
    max-width: 82%;
    font-size: 14px;
    padding: 10px 14px;
  }

  .msg-actions {
    opacity: 1;
  }

  .empty-icon {
    width: 60px;
    height: 60px;
  }

  .empty-title {
    font-size: 18px;
  }

  .suggestion-chip {
    font-size: 12.5px;
    padding: 8px 12px;
  }

  .input-area {
    padding: 10px 12px 14px;
  }

  .input-wrapper {
    border-radius: 12px;
  }

  .chat-input {
    padding: 10px 12px 2px;
    font-size: 16px;
    min-height: 42px;
  }

  .input-hint {
    display: none;
  }

  .input-footer {
    padding: 2px 8px 8px;
  }

  .send-btn {
    width: 38px;
    height: 38px;
  }
}
</style>

<style>
/* Q&A streaming dots — global keyframes, same as workspace */
.message-bubble.streaming.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 8px 0 !important;
}

.message-bubble.streaming.empty .typing-dots span {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  opacity: 0.5;
}

.message-bubble.streaming.empty .typing-dots span:nth-child(2) {
  opacity: 0.7;
}
.message-bubble.streaming.empty .typing-dots span:nth-child(3) {
  opacity: 1;
}
</style>
