<template>
  <div class="content">
    <div class="qa-container">
      <div class="chat-area">
        <div class="chat-header">
          <span class="chat-title">AI 问答</span>
          <button
            v-if="messages.length"
            class="btn btn--ghost"
            @click="clearHistory"
            :disabled="workspaceStore.isStreaming"
          >
            清空记录
          </button>
        </div>
        <div class="messages" ref="messagesContainer">
          <div v-if="!messages.length" class="empty-state">
            <p>开始提问，AI 面试官为你解答</p>
          </div>
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="message-wrapper"
            :class="msg.role"
          >
            <div
              v-if="msg.role === 'assistant'"
              class="bubble-container"
              @mouseenter="hoveredIndex = i"
              @mouseleave="hoveredIndex = null"
            >
              <div
                v-if="!msg.content && streaming"
                class="message-bubble streaming empty"
              >
                <div class="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
              <div v-else class="message-bubble md-content">
                <div v-html="md.render(msg.content)"></div>
                <div
                  class="msg-actions"
                  :class="{ visible: hoveredIndex === i }"
                >
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
                  <button
                    class="action-btn"
                    title="下载"
                    @click="downloadMd(i)"
                  >
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
            </div>
            <div
              v-else
              class="message-bubble user-bubble"
              v-text="msg.content"
            ></div>
          </div>
        </div>

        <div class="input-area">
          <div class="input-wrapper">
            <textarea
              ref="inputEl"
              v-model="input"
              class="chat-input"
              placeholder="输入你的面试问题... (Enter 发送，Shift+Enter 换行)"
              @keydown.enter.exact.prevent="send"
              :disabled="workspaceStore.isStreaming"
              rows="2"
            />
            <div class="input-footer">
              <button
                v-if="workspaceStore.isStreaming"
                class="stop-btn"
                @click="stopAnswer"
                title="中断回答"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" />
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
                  width="18"
                  height="18"
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

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px var(--space-7);
  border-bottom: 1px solid var(--color-border-light);
}

.chat-title {
  font-weight: 700;
  font-size: var(--text-lg);
  color: var(--color-text);
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-7);
}

.message-wrapper {
  margin-bottom: var(--space-5);
}

.message-wrapper.assistant {
  margin-bottom: 48px;
}

.message-wrapper.user {
  display: flex;
  justify-content: flex-end;
}

.user-bubble {
  background: var(--color-primary);
  color: white;
  max-width: 100%;
  padding: 14px 18px;
  border-radius: var(--radius-lg);
  line-height: 1.6;
  font-size: var(--text-base);
}

.message-wrapper.assistant .message-bubble {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  max-width: 100%;
  padding: 18px 22px;
  border-radius: var(--radius-lg);
  color: var(--color-text);
  position: relative;
  line-height: 1.85;
  font-size: var(--text-md);
  box-shadow: var(--shadow-sm);
}

.bubble-container {
  display: inline-block;
  max-width: 100%;
}

/* action buttons - positioned relative to .message-bubble, outside at bottom-right */
.msg-actions {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.msg-actions.visible {
  opacity: 1;
}

.action-btn {
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
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

.input-area {
  padding: var(--space-5);
  border-top: 1px solid var(--color-border-light);
}

.input-wrapper {
  border: 1px solid var(--color-border-input);
  border-radius: var(--radius-lg);
  background: var(--color-surface-hover);
  transition: border-color var(--transition);
}

.input-wrapper:focus-within {
  border-color: var(--color-primary);
}

.chat-input {
  display: block;
  width: 100%;
  border: none;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: 14px 18px 4px;
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
  justify-content: flex-end;
  padding: 0 12px 10px;
}

.send-btn {
  border: none;
  background: var(--color-primary);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.send-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stop-btn {
  border: none;
  background: var(--color-danger);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.stop-btn:hover {
  background: #dc2626;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .content {
    padding: 0;
  }

  .qa-container {
    height: calc(100dvh - 52px);
  }

  .chat-area {
    border-radius: 0;
    border: none;
  }

  .chat-header {
    padding: 12px 16px;
  }

  .chat-title {
    font-size: 16px;
  }

  .btn--ghost {
    font-size: 13px;
    padding: 6px 12px;
  }

  .messages {
    padding: 12px;
  }

  .message-wrapper {
    margin-bottom: 12px;
  }

  .message-wrapper.assistant {
    margin-bottom: 28px;
  }

  .message-wrapper.assistant .message-bubble {
    padding: 12px 14px;
    font-size: 14px;
    border-radius: 12px;
  }

  .user-bubble {
    padding: 10px 14px;
    font-size: 14px;
    max-width: 82%;
    border-radius: 12px;
  }

  .input-area {
    padding: 10px 12px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  }

  .input-wrapper {
    border-radius: 12px;
  }

  .chat-input {
    padding: 10px 12px 2px;
    font-size: 16px;
    min-height: 42px;
  }

  .input-footer {
    padding: 0 8px 8px;
  }

  .send-btn,
  .stop-btn {
    width: 38px;
    height: 38px;
  }

  .action-btn {
    width: 34px;
    height: 34px;
  }

  .msg-actions {
    opacity: 1;
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
