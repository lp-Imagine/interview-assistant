<template>
  <div class="content">
    <div class="mock-page">
      <!-- 顶部：面试官形象 + 状态 -->
      <div class="stage">
        <div class="avatar-wrap">
          <div class="avatar-ring" :class="state"></div>
          <div class="avatar" :class="state">
            <svg
              viewBox="0 0 120 120"
              width="110"
              height="110"
              aria-hidden="true"
            >
              <!-- 身体/领带 -->
              <rect
                x="34"
                y="88"
                width="52"
                height="22"
                rx="10"
                fill="#3b5bdb"
              />
              <path d="M54 88 L60 96 L66 88 Z" fill="#f59f00" />
              <!-- 头 -->
              <circle
                cx="60"
                cy="52"
                r="30"
                fill="#f3c99a"
                stroke="#d9a87a"
                stroke-width="2"
              />
              <!-- 头发 -->
              <path
                d="M30 48 Q30 20 60 20 Q90 20 90 48 Q90 34 74 30 Q60 26 46 30 Q30 34 30 48 Z"
                fill="#4a3728"
              />
              <!-- 眼睛 -->
              <template v-if="state === 'thinking'">
                <circle cx="49" cy="52" r="2.6" fill="#2b2b2b" />
                <circle cx="71" cy="52" r="2.6" fill="#2b2b2b" />
                <circle cx="49" cy="51" r="1" fill="#fff" />
                <circle cx="71" cy="51" r="1" fill="#fff" />
              </template>
              <template v-else>
                <circle cx="49" cy="52" r="3.4" fill="#2b2b2b" />
                <circle cx="71" cy="52" r="3.4" fill="#2b2b2b" />
                <circle cx="50" cy="50.5" r="1.3" fill="#fff" />
                <circle cx="72" cy="50.5" r="1.3" fill="#fff" />
              </template>
              <!-- 眼镜 -->
              <circle
                cx="49"
                cy="52"
                r="8"
                fill="none"
                stroke="#7b8794"
                stroke-width="1.6"
              />
              <circle
                cx="71"
                cy="52"
                r="8"
                fill="none"
                stroke="#7b8794"
                stroke-width="1.6"
              />
              <line
                x1="57"
                y1="52"
                x2="63"
                y2="52"
                stroke="#7b8794"
                stroke-width="1.6"
              />
              <!-- 嘴 -->
              <template v-if="state === 'asking'">
                <ellipse cx="60" cy="70" rx="7" ry="6" fill="#c0392b" />
                <rect x="53" y="64" width="14" height="4" rx="2" fill="#fff" />
              </template>
              <template v-else-if="state === 'listening'">
                <path
                  d="M52 68 Q60 73 68 68"
                  stroke="#b03a2e"
                  stroke-width="2.4"
                  fill="none"
                  stroke-linecap="round"
                />
              </template>
              <template v-else-if="state === 'done'">
                <path
                  d="M50 67 Q60 75 70 67"
                  stroke="#b03a2e"
                  stroke-width="2.6"
                  fill="none"
                  stroke-linecap="round"
                />
              </template>
              <template v-else>
                <path
                  d="M52 69 Q60 64 68 69"
                  stroke="#b03a2e"
                  stroke-width="2.4"
                  fill="none"
                  stroke-linecap="round"
                />
              </template>
            </svg>
            <div v-if="state === 'asking'" class="sound-wave">
              <i
                v-for="n in 5"
                :key="n"
                :style="{ animationDelay: n * 0.12 + 's' }"
              ></i>
            </div>
          </div>
          <div class="status-text">{{ statusText }}</div>
        </div>

        <!-- 进度 -->
        <div class="progress-area">
          <div class="progress-label">
            <span v-if="state === 'idle'">准备开始模拟面试</span>
            <span v-else
              >第 {{ currentIndex + 1 }} / {{ totalQuestions }} 题</span
            >
          </div>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 当前对话气泡 -->
      <div class="dialogue">
        <div v-if="state === 'asking'" class="bubble ai" key="ask">
          <span class="who">面试官</span>{{ currentQuestion }}
        </div>
        <div v-else-if="state === 'listening'" class="bubble hint">
          🎤 请开始回答（说完自动识别，或点击停止）
        </div>
        <div v-else-if="state === 'thinking'" class="bubble ai thinking">
          <span class="who">面试官</span>正在认真听你的回答…
        </div>
        <div v-else-if="state === 'done'" class="bubble ai" key="done">
          <span class="who">面试官</span
          >本次模拟面试结束！感谢参与，祝你面试顺利 🎉
        </div>
      </div>

      <!-- 历史轮次 -->
      <div v-if="turns.length" class="history">
        <div
          v-for="t in turns"
          :key="t.id"
          class="turn"
          :class="{ current: t.index === currentIndex }"
        >
          <div class="turn-q">
            <span class="qno">Q{{ t.index + 1 }}</span
            >{{ t.question }}
          </div>
          <div v-if="t.answer" class="turn-a">
            <span class="tag">回答</span>{{ t.answer }}
          </div>
          <div v-if="t.feedback" class="turn-f">
            <span class="tag">点评</span>{{ t.feedback }}
          </div>
        </div>
      </div>

      <!-- 控制区 -->
      <div class="controls">
        <template v-if="state === 'idle'">
          <div class="start-row">
            <label class="qty">
              面试题数
              <select v-model="totalQuestions">
                <option :value="3">3 题</option>
                <option :value="4">4 题</option>
                <option :value="5">5 题</option>
              </select>
            </label>
            <button
              class="primary-btn"
              @click="startInterview"
              :disabled="starting"
            >
              {{ starting ? "准备中…" : "开始模拟面试" }}
            </button>
          </div>
          <p class="tip">
            面试官将基于你的简历资料出题，逐题语音提问；请用语音或文字作答，每题后给出点评。
          </p>
        </template>

        <template v-else-if="state === 'listening'">
          <button
            class="mic-btn"
            :class="{ listening: micActive }"
            @click="toggleMic"
            title="点击说话/停止"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
              <path
                d="M19 11a1 1 0 0 1 2 0 9 9 0 0 1-8 8.94V22h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2.06A9 9 0 0 1 3 11a1 1 0 1 1 2 0 7 7 0 0 0 14 0z"
              />
            </svg>
            <span>{{ micActive ? "停止录音" : "点击说话" }}</span>
          </button>
          <button
            class="ghost-btn"
            @click="submitAnswer('（本题跳过）')"
            :disabled="submitting"
          >
            跳过本题
          </button>
          <div class="text-row">
            <input
              v-model="textAnswer"
              placeholder="或在这里输入回答，回车提交"
              @keyup.enter="submitAnswer(textAnswer)"
              :disabled="submitting"
            />
            <button
              class="ghost-btn"
              @click="submitAnswer(textAnswer)"
              :disabled="!textAnswer.trim() || submitting"
            >
              提交
            </button>
          </div>
          <p v-if="micError" class="mic-error">{{ micError }}</p>
        </template>

        <template v-else-if="state === 'asking'">
          <button class="ghost-btn" @click="skipSpeaking">
            跳过语音（直接回答）
          </button>
        </template>

        <template v-else-if="state === 'thinking'">
          <div class="thinking-hint">⏳ AI 面试官正在思考…</div>
        </template>

        <template v-else-if="state === 'done'">
          <button class="primary-btn" @click="resetInterview">再来一场</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  createInterviewSession,
  submitInterviewAnswer,
} from "../api/interview";
import {
  preloadVoices,
  speak,
  stopSpeaking,
  startListening,
} from "../utils/voice";

type InterviewState =
  | "idle"
  | "loading"
  | "asking"
  | "listening"
  | "thinking"
  | "done";

interface LocalTurn {
  id: string;
  index: number;
  question: string;
  answer?: string;
  feedback?: string;
}

const state = ref<InterviewState>("idle");
const starting = ref(false);
const submitting = ref(false);
const totalQuestions = ref(3);
const sessionId = ref("");
const currentIndex = ref(0);
const currentQuestion = ref("");
const turns = ref<LocalTurn[]>([]);
const micActive = ref(false);
const micError = ref("");
const textAnswer = ref("");
let stopListen: (() => void) | null = null;

const statusText = computed(() => {
  switch (state.value) {
    case "idle":
      return "等待开始";
    case "loading":
      return "准备题目中…";
    case "asking":
      return "面试官提问中";
    case "listening":
      return "轮到你回答";
    case "thinking":
      return "面试官点评中";
    case "done":
      return "面试结束";
    default:
      return "";
  }
});

const progressPercent = computed(() => {
  if (state.value === "idle") return 0;
  const total = totalQuestions.value || 1;
  return Math.min(
    100,
    Math.round(
      ((currentIndex.value + (state.value === "done" ? 1 : 0)) / total) * 100,
    ),
  );
});

onMounted(() => {
  preloadVoices();
});

onBeforeUnmount(() => {
  stopSpeaking();
  stopListen?.();
});

async function startInterview() {
  starting.value = true;
  micError.value = "";
  try {
    const { session, question } = await createInterviewSession(
      totalQuestions.value,
    );
    sessionId.value = session.id;
    totalQuestions.value = session.totalQuestions;
    currentIndex.value = 0;
    turns.value = [{ index: 0, question, id: "pending" }];
    currentQuestion.value = question;
    state.value = "asking";
    speakQuestion(question);
  } catch (error: any) {
    micError.value =
      error?.response?.data?.message || error?.message || "启动面试失败";
    state.value = "idle";
  } finally {
    starting.value = false;
  }
}

function speakQuestion(text: string) {
  state.value = "asking";
  speak(text, { onEnd: () => (state.value = "listening") });
}

function skipSpeaking() {
  stopSpeaking();
  state.value = "listening";
}

function toggleMic() {
  if (micActive.value) {
    stopListen?.();
    stopListen = null;
    micActive.value = false;
    return;
  }
  micActive.value = true;
  micError.value = "";
  stopListen = startListening({
    onStart: () => {
      micActive.value = true;
    },
    onResult: (text) => {
      micActive.value = false;
      stopListen = null;
      submitAnswer(text);
    },
    onError: (message) => {
      micActive.value = false;
      stopListen = null;
      micError.value = message;
    },
  });
  if (!stopListen) micActive.value = false;
}

async function submitAnswer(answer: string) {
  const clean = (answer ?? "").trim();
  if (!clean || submitting.value || !sessionId.value) return;
  if (state.value !== "listening") return;

  submitting.value = true;
  stopListen?.();
  stopListen = null;
  micActive.value = false;
  textAnswer.value = "";
  state.value = "thinking";

  try {
    const result = await submitInterviewAnswer(sessionId.value, clean);
    // 更新当前轮次（answer/feedback）
    const idx = turns.value.findIndex((t) => t.index === result.turn.index);
    if (idx >= 0) {
      turns.value[idx] = {
        ...turns.value[idx],
        answer: clean,
        feedback: result.feedback,
        id: result.turn.id,
      };
    }
    if (result.done) {
      currentIndex.value = result.currentIndex;
      state.value = "done";
    } else {
      currentIndex.value = result.currentIndex;
      turns.value.push({
        index: result.currentIndex,
        question: result.nextQuestion,
        id: `q-${result.currentIndex}`,
      });
      currentQuestion.value = result.nextQuestion;
      // 先播报点评，再播下一题
      const feedback = result.feedback;
      speak(feedback, {
        onEnd: () => speakQuestion(result.nextQuestion),
      });
      state.value = "asking";
    }
  } catch (error: any) {
    micError.value =
      error?.response?.data?.message || error?.message || "提交失败";
    state.value = "listening";
  } finally {
    submitting.value = false;
  }
}

function resetInterview() {
  stopSpeaking();
  state.value = "idle";
  sessionId.value = "";
  currentIndex.value = 0;
  currentQuestion.value = "";
  turns.value = [];
  textAnswer.value = "";
  micError.value = "";
  micActive.value = false;
  stopListen?.();
  stopListen = null;
}
</script>

<style scoped>
.content {
  flex: 1;
  overflow-y: auto;
  padding: var(--content-padding);
}

.mock-page {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100%;
}

/* ===== 舞台 ===== */
.stage {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: 26px 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  box-shadow: var(--shadow-sm);
}

.avatar-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid transparent;
}

.avatar-ring.asking {
  border-color: #6366f1;
  animation: ring-pulse 1.4s ease-out infinite;
}

.avatar-ring.listening {
  border-color: #22c55e;
  animation: ring-pulse 1.6s ease-out infinite;
}

.avatar-ring.thinking {
  border-color: #f59f00;
}

@keyframes ring-pulse {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  70% {
    transform: scale(1.14);
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

.avatar {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.18);
}

.avatar.asking {
  animation: bob 1s ease-in-out infinite;
}

.avatar.listening .avatar-ring {
  border-color: #22c55e;
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.sound-wave {
  position: absolute;
  right: -14px;
  bottom: 6px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}

.sound-wave i {
  width: 3px;
  background: #6366f1;
  border-radius: 2px;
  animation: wave 0.8s ease-in-out infinite;
}

.sound-wave i:nth-child(1) {
  height: 6px;
}
.sound-wave i:nth-child(2) {
  height: 12px;
}
.sound-wave i:nth-child(3) {
  height: 16px;
}
.sound-wave i:nth-child(4) {
  height: 10px;
}
.sound-wave i:nth-child(5) {
  height: 6px;
}

@keyframes wave {
  0%,
  100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}

.status-text {
  font-size: 13px;
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  padding: 5px 14px;
  border-radius: 999px;
}

/* ===== 进度 ===== */
.progress-area {
  width: 100%;
  display: grid;
  gap: 8px;
}

.progress-label {
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
}

.progress-track {
  height: 6px;
  background: var(--color-surface-muted);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 999px;
  transition: width 0.4s ease;
}

/* ===== 对话气泡 ===== */
.dialogue {
  min-height: 64px;
}

.bubble {
  padding: 14px 18px;
  border-radius: 14px;
  line-height: 1.7;
  font-size: 15px;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top-left-radius: 4px;
}

.bubble .who {
  display: block;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
  font-weight: 600;
}

.bubble.hint {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.08),
    rgba(34, 197, 94, 0.04)
  );
  border-color: rgba(34, 197, 94, 0.3);
  text-align: center;
  color: #15803d;
}

.bubble.thinking {
  color: var(--color-text-muted);
}

/* ===== 历史轮次 ===== */
.history {
  display: grid;
  gap: 12px;
  flex: 1;
}

.turn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 14px 16px;
  display: grid;
  gap: 8px;
}

.turn.current {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.turn-q {
  font-weight: 600;
  font-size: 14.5px;
  line-height: 1.6;
}

.qno {
  display: inline-block;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 11px;
  border-radius: 6px;
  padding: 2px 7px;
  margin-right: 8px;
  vertical-align: 1px;
}

.turn-a,
.turn-f {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--color-text);
}

.turn-f {
  color: var(--color-text-muted);
}

.tag {
  font-size: 11px;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 5px;
  padding: 1px 6px;
  margin-right: 8px;
}

/* ===== 控制区 ===== */
.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
}

.start-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.qty {
  font-size: 14px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty select {
  padding: 7px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  font-size: 14px;
}

.primary-btn {
  padding: 11px 26px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #7c6cf6);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
  transition: transform 0.15s ease;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.mic-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 26px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.35);
}

.mic-btn.listening {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  animation: mic-pulse 1.2s ease-in-out infinite;
}

@keyframes mic-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.ghost-btn {
  padding: 9px 18px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ghost-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.ghost-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.text-row {
  display: flex;
  gap: 8px;
  width: 100%;
  max-width: 480px;
}

.text-row input {
  flex: 1;
  padding: 9px 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 14px;
  background: var(--color-surface);
}

.tip {
  font-size: 12.5px;
  color: var(--color-text-muted);
  text-align: center;
  margin: 0;
}

.mic-error {
  font-size: 12.5px;
  color: var(--color-danger, #dc2626);
  margin: 0;
}

.thinking-hint {
  color: var(--color-text-muted);
  font-size: 14px;
}

@media (max-width: 768px) {
  .content {
    padding: 0;
  }
  .stage {
    border-radius: 0 0 16px 16px;
    padding: 18px 14px 14px;
  }
  .controls {
    border-radius: 16px;
    margin: 0 10px 12px;
  }
}
</style>
