<template>
  <div class="content">
    <div class="mock-page">
      <!-- ===== 顶部：面试官形象 ===== -->
      <div class="stage">
        <div class="avatar-scene">
          <div class="halo" :class="state"></div>
          <div class="avatar" :class="state">
            <svg
              viewBox="0 0 160 180"
              width="148"
              height="166"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#ffd9b8" />
                  <stop offset="100%" stop-color="#f0b88f" />
                </linearGradient>
                <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#4c5fd5" />
                  <stop offset="100%" stop-color="#3648b8" />
                </linearGradient>
                <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#5b4632" />
                  <stop offset="100%" stop-color="#3a2c1e" />
                </linearGradient>
              </defs>
              <!-- 身体 -->
              <path
                d="M40 178 Q40 140 56 128 Q60 118 80 114 Q100 118 104 128 Q120 140 120 178 Z"
                fill="url(#suit)"
              />
              <path
                d="M60 178 Q64 138 80 130 Q96 138 100 178 Z"
                fill="#fdf6ec"
              />
              <path d="M74 130 L80 138 L86 130 Z" fill="#f97316" />
              <!-- 衣领 -->
              <path
                d="M70 126 L80 118 L90 126 L84 134 L76 134 Z"
                fill="#eef2ff"
                stroke="#c7d2fe"
                stroke-width="1"
              />
              <!-- 脖子 -->
              <rect
                x="73"
                y="96"
                width="14"
                height="12"
                rx="4"
                fill="url(#skin)"
              />
              <!-- 头 -->
              <ellipse cx="80" cy="78" rx="34" ry="38" fill="url(#skin)" />
              <!-- 耳朵 -->
              <ellipse cx="46" cy="80" rx="6" ry="9" fill="url(#skin)" />
              <ellipse cx="114" cy="80" rx="6" ry="9" fill="url(#skin)" />
              <!-- 头发 -->
              <path
                d="M46 76 Q44 38 80 34 Q116 38 114 76 Q110 52 96 46 Q80 40 64 46 Q50 52 46 76 Z"
                fill="url(#hair)"
              />
              <path
                d="M46 70 Q46 56 58 50"
                stroke="#2c2014"
                stroke-width="2.5"
                fill="none"
                stroke-linecap="round"
              />
              <!-- 眉毛 -->
              <path
                d="M60 62 Q68 58 76 61"
                stroke="#4a3728"
                stroke-width="2.2"
                fill="none"
                stroke-linecap="round"
              />
              <path
                d="M84 61 Q92 58 100 62"
                stroke="#4a3728"
                stroke-width="2.2"
                fill="none"
                stroke-linecap="round"
              />
              <!-- 眼睛 -->
              <template v-if="state === 'thinking'">
                <circle cx="68" cy="72" r="4.4" fill="#2b2b2b" />
                <circle cx="92" cy="72" r="4.4" fill="#2b2b2b" />
                <circle cx="69.5" cy="70.5" r="1.5" fill="#fff" />
                <circle cx="93.5" cy="70.5" r="1.5" fill="#fff" />
              </template>
              <template v-else>
                <ellipse cx="68" cy="72" rx="4.6" ry="5.4" fill="#2b2b2b" />
                <ellipse cx="92" cy="72" rx="4.6" ry="5.4" fill="#2b2b2b" />
                <circle cx="69.5" cy="70" r="1.7" fill="#fff" />
                <circle cx="93.5" cy="70" r="1.7" fill="#fff" />
              </template>
              <!-- 眼镜 -->
              <circle
                cx="68"
                cy="72"
                r="10"
                fill="none"
                stroke="#64748b"
                stroke-width="1.6"
              />
              <circle
                cx="92"
                cy="72"
                r="10"
                fill="none"
                stroke="#64748b"
                stroke-width="1.6"
              />
              <line
                x1="78"
                y1="72"
                x2="82"
                y2="72"
                stroke="#64748b"
                stroke-width="1.6"
              />
              <line
                x1="58"
                y1="70"
                x2="52"
                y2="67"
                stroke="#64748b"
                stroke-width="1.6"
              />
              <!-- 腮红 -->
              <ellipse
                cx="56"
                cy="82"
                rx="5"
                ry="3"
                fill="#f9a8d4"
                opacity="0.45"
              />
              <ellipse
                cx="104"
                cy="82"
                rx="5"
                ry="3"
                fill="#f9a8d4"
                opacity="0.45"
              />
              <!-- 嘴 -->
              <template v-if="state === 'asking'">
                <ellipse cx="80" cy="96" rx="8" ry="7" fill="#c0392b" />
                <path
                  d="M72 93 Q80 90 88 93"
                  stroke="#fff"
                  stroke-width="2.4"
                  fill="none"
                  stroke-linecap="round"
                />
              </template>
              <template v-else-if="state === 'listening'">
                <path
                  d="M70 94 Q80 100 90 94"
                  stroke="#b03a2e"
                  stroke-width="2.6"
                  fill="none"
                  stroke-linecap="round"
                />
              </template>
              <template v-else-if="state === 'done'">
                <path
                  d="M68 93 Q80 102 92 93"
                  stroke="#b03a2e"
                  stroke-width="2.8"
                  fill="none"
                  stroke-linecap="round"
                />
              </template>
              <template v-else>
                <path
                  d="M70 96 Q80 90 90 96"
                  stroke="#b03a2e"
                  stroke-width="2.6"
                  fill="none"
                  stroke-linecap="round"
                />
              </template>
              <!-- 领带结 -->
              <path d="M78 138 L80 145 L82 138 L80 132 Z" fill="#f97316" />
            </svg>
            <!-- 说话声波 -->
            <div v-if="state === 'asking'" class="sound-wave">
              <i
                v-for="n in 5"
                :key="n"
                :style="{ animationDelay: n * 0.12 + 's' }"
              ></i>
            </div>
          </div>
          <div class="status-pill" :class="state">
            <span class="dot"></span>{{ statusText }}
          </div>
        </div>

        <!-- 进度 -->
        <div class="progress-area">
          <div class="progress-label">
            <template v-if="state === 'idle'">准备开始模拟面试</template>
            <template v-else
              >第 {{ currentIndex + 1 }} / {{ totalQuestions }} 题</template
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

      <!-- ===== 对话区 ===== -->
      <div class="dialogue-area">
        <div v-if="state === 'idle'" class="dialogue idle">
          <div class="dialogue-title">🎤 语音模拟面试</div>
          <div class="dialogue-desc">
            面试官基于你的简历资料现场出题，语音提问、语音回答，每题给出专业点评。建议在安静环境、使用
            Chrome 浏览器。
          </div>
          <div class="start-row">
            <label class="qty">
              面试题数
              <select v-model="totalQuestions">
                <option :value="5">5 题（约 15 分钟）</option>
                <option :value="8">8 题（约 25 分钟）</option>
                <option :value="10">10 题（约 30 分钟）</option>
                <option :value="15">15 题（约 45 分钟）</option>
                <option :value="20">20 题（约 60 分钟）</option>
              </select>
            </label>
            <button
              class="primary-btn"
              @click="startInterview"
              :disabled="starting"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              {{ starting ? "准备中…" : "开始面试" }}
            </button>
          </div>
          <p v-if="micError" class="mic-error">{{ micError }}</p>
        </div>

        <template v-else>
          <!-- 当前题 -->
          <div class="question-card">
            <div class="q-head">
              <span class="q-badge">{{ currentIndex + 1 }}</span>
              <span class="q-label">面试官提问</span>
            </div>
            <div class="q-text">{{ currentQuestion }}</div>
          </div>

          <!-- 状态条 -->
          <div class="state-bar" :class="state">
            <template v-if="state === 'asking'">
              <span class="spinner"></span>面试官正在提问…
            </template>
            <template v-else-if="state === 'listening'">
              <svg
                class="bar-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z"
                />
                <path
                  d="M19 11a1 1 0 0 1 2 0 9 9 0 0 1-8 8.94V22h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2.06A9 9 0 0 1 3 11a1 1 0 1 1 2 0 7 7 0 0 0 14 0z"
                />
              </svg>
              请开始回答（说完自动识别，或点击停止）
            </template>
            <template v-else-if="state === 'thinking'">
              <span class="spinner"></span>面试官正在思考你的回答…
            </template>
            <template v-else-if="state === 'done'">
              本次模拟面试结束 🎉
            </template>
          </div>
        </template>
      </div>

      <!-- ===== 历史轮次 ===== -->
      <div v-if="turns.length" class="history">
        <div
          v-for="t in turns"
          :key="t.id"
          class="turn"
          :class="{ current: t.index === currentIndex && state !== 'done' }"
        >
          <div class="turn-q">
            <span class="qno">{{ t.index + 1 }}</span>
            {{ t.question }}
          </div>
          <div v-if="t.answer" class="turn-row">
            <span class="tag you">你</span>{{ t.answer }}
          </div>
          <div v-if="t.feedback" class="turn-row feedback">
            <span class="tag ai">面试官</span>{{ t.feedback }}
          </div>
        </div>
      </div>

      <!-- ===== 控制区 ===== -->
      <div v-if="state === 'listening'" class="controls listening">
        <button
          class="mic-btn"
          :class="{ active: micActive }"
          @click="toggleMic"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
            <path
              d="M19 11a1 1 0 0 1 2 0 9 9 0 0 1-8 8.94V22h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2.06A9 9 0 0 1 3 11a1 1 0 1 1 2 0 7 7 0 0 0 14 0z"
            />
          </svg>
          <span>{{ micActive ? "停止录音" : "点击说话" }}</span>
        </button>
        <div class="controls-side">
          <button
            class="ghost-btn"
            @click="submitAnswer('（本题跳过）')"
            :disabled="submitting"
          >
            跳过
          </button>
          <div class="text-row">
            <input
              v-model="textAnswer"
              placeholder="或输入文字回答，回车提交"
              @keyup.enter="submitAnswer(textAnswer)"
              :disabled="submitting"
            />
            <button
              class="ghost-btn send"
              @click="submitAnswer(textAnswer)"
              :disabled="!textAnswer.trim() || submitting"
            >
              提交
            </button>
          </div>
        </div>
        <p v-if="micError" class="mic-error">{{ micError }}</p>
      </div>

      <div v-else-if="state === 'asking'" class="controls">
        <button class="ghost-btn" @click="skipSpeaking">
          跳过语音（直接回答）
        </button>
      </div>

      <div v-else-if="state === 'done'" class="controls">
        <button class="primary-btn" @click="resetInterview">再来一场</button>
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
const totalQuestions = ref(10);
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

onMounted(() => preloadVoices());

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
      speak(result.feedback, {
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
  background: linear-gradient(
    180deg,
    rgba(99, 102, 241, 0.045),
    transparent 320px
  );
}

.mock-page {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
}

/* ===== 形象区 ===== */
.stage {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 22px;
  padding: 30px 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.07);
  position: relative;
  overflow: hidden;
}

.stage::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    600px 200px at 50% -40px,
    rgba(99, 102, 241, 0.09),
    transparent
  );
  pointer-events: none;
}

.avatar-scene {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.halo {
  position: absolute;
  top: 8px;
  width: 168px;
  height: 168px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    rgba(99, 102, 241, 0.16),
    rgba(139, 92, 246, 0.16),
    rgba(99, 102, 241, 0.16)
  );
  filter: blur(2px);
  animation: halo-rotate 12s linear infinite;
}

.halo.asking {
  animation:
    halo-rotate 12s linear infinite,
    halo-bright 1.4s ease-in-out infinite;
}

.halo.listening {
  background: conic-gradient(
    from 0deg,
    rgba(34, 197, 94, 0.16),
    rgba(16, 185, 129, 0.16),
    rgba(34, 197, 94, 0.16)
  );
}

@keyframes halo-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes halo-bright {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

.avatar {
  position: relative;
  width: 148px;
  height: 166px;
  filter: drop-shadow(0 10px 24px rgba(79, 70, 229, 0.22));
  transition: transform 0.3s ease;
}

.avatar.asking {
  animation: bob 1.1s ease-in-out infinite;
}

.avatar.listening {
  animation: lean 2.4s ease-in-out infinite;
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes lean {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-2deg) translateY(-2px);
  }
  75% {
    transform: rotate(2deg) translateY(-1px);
  }
}

.sound-wave {
  position: absolute;
  right: 2px;
  bottom: 16px;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 18px;
}

.sound-wave i {
  width: 3.5px;
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
  border-radius: 2px;
  animation: wave 0.8s ease-in-out infinite;
}

.sound-wave i:nth-child(1) {
  height: 7px;
}
.sound-wave i:nth-child(2) {
  height: 13px;
}
.sound-wave i:nth-child(3) {
  height: 18px;
}
.sound-wave i:nth-child(4) {
  height: 11px;
}
.sound-wave i:nth-child(5) {
  height: 7px;
}

@keyframes wave {
  0%,
  100% {
    transform: scaleY(0.45);
  }
  50% {
    transform: scaleY(1);
  }
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  padding: 6px 16px;
  border-radius: 999px;
}

.status-pill .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
}

.status-pill.asking .dot {
  background: #6366f1;
  animation: dot-blink 1s ease-in-out infinite;
}

.status-pill.listening .dot {
  background: #22c55e;
  animation: dot-blink 1.2s ease-in-out infinite;
}

.status-pill.thinking .dot {
  background: #f59f0b;
}

.status-pill.done .dot {
  background: #8b5cf6;
}

@keyframes dot-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

/* ===== 进度 ===== */
.progress-area {
  width: 100%;
  max-width: 420px;
  display: grid;
  gap: 8px;
}

.progress-label {
  font-size: 12.5px;
  color: var(--color-text-muted);
  text-align: center;
  font-weight: 500;
}

.progress-track {
  height: 7px;
  background: var(--color-surface-muted);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 999px;
  transition: width 0.45s ease;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
}

/* ===== 对话区 ===== */
.dialogue-area {
  display: grid;
  gap: 12px;
}

.dialogue.idle {
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: 18px;
  padding: 30px 26px;
  text-align: center;
  display: grid;
  gap: 10px;
  justify-items: center;
}

.dialogue-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--color-text);
}

.dialogue-desc {
  font-size: 13.5px;
  color: var(--color-text-muted);
  line-height: 1.7;
  max-width: 460px;
}

.start-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.qty {
  font-size: 13.5px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty select {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  font-size: 14px;
  color: var(--color-text);
  cursor: pointer;
}

/* 题目卡 */
.question-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 20px 22px;
  box-shadow: var(--shadow-sm);
}

.q-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.q-badge {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(99, 102, 241, 0.35);
}

.q-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
}

.q-text {
  font-size: 15.5px;
  line-height: 1.85;
  color: var(--color-text);
}

/* 状态条 */
.state-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 13px 18px;
  border-radius: 14px;
  font-size: 13.5px;
  font-weight: 500;
  border: 1px solid transparent;
}

.state-bar.asking {
  color: #4f46e5;
  background: rgba(99, 102, 241, 0.07);
  border-color: rgba(99, 102, 241, 0.18);
}

.state-bar.listening {
  color: #15803d;
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.22);
}

.state-bar.thinking {
  color: #b45309;
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.2);
}

.state-bar.done {
  color: #7c3aed;
  background: rgba(139, 92, 246, 0.07);
  border-color: rgba(139, 92, 246, 0.18);
}

.bar-icon {
  flex: none;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== 历史轮次 ===== */
.history {
  display: grid;
  gap: 10px;
}

.turn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 14px 16px;
  display: grid;
  gap: 8px;
  opacity: 0.82;
  transition:
    opacity 0.2s ease,
    border-color 0.2s ease;
}

.turn:hover {
  opacity: 1;
}

.turn.current {
  opacity: 1;
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
}

.turn-q {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.65;
}

.qno {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 11.5px;
  font-weight: 700;
  margin-right: 8px;
  vertical-align: 1px;
}

.turn-row {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--color-text);
  padding-left: 30px;
}

.turn-row.feedback {
  color: var(--color-text-muted);
}

.tag {
  display: inline-block;
  font-size: 10.5px;
  font-weight: 600;
  border-radius: 6px;
  padding: 2px 8px;
  margin-right: 8px;
  vertical-align: 1.5px;
}

.tag.you {
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.1);
}

.tag.ai {
  color: #7c3aed;
  background: rgba(139, 92, 246, 0.1);
}

/* ===== 控制区 ===== */
.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
}

.controls.listening {
  gap: 14px;
}

.mic-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 30px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(34, 197, 94, 0.35);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.mic-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(34, 197, 94, 0.42);
}

.mic-btn.active {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 6px 18px rgba(239, 68, 68, 0.35);
  animation: mic-pulse 1.2s ease-in-out infinite;
}

@keyframes mic-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.04);
  }
}

.controls-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 500px;
}

.text-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.text-row input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: 14px;
  background: var(--color-surface);
  color: var(--color-text);
  transition: border-color 0.15s ease;
}

.text-row input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #7c6cf6);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 5px 16px rgba(99, 102, 241, 0.32);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 7px 20px rgba(99, 102, 241, 0.4);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.ghost-btn {
  padding: 9px 18px;
  border: 1px solid var(--color-border);
  border-radius: 11px;
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

.ghost-btn.send {
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #7c6cf6);
  border-color: transparent;
}

.mic-error {
  font-size: 12.5px;
  color: var(--color-danger, #dc2626);
  margin: 0;
}

@media (max-width: 768px) {
  .content {
    padding: 0;
  }
  .stage {
    border-radius: 0 0 20px 20px;
    padding: 22px 14px 16px;
  }
  .dialogue.idle {
    border-radius: 16px;
    margin: 0 10px;
  }
  .controls {
    border-radius: 16px;
    margin: 0 10px;
  }
  .start-row {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
