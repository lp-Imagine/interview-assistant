<template>
  <div class="content">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-orb hero-orb--1"></div>
      <div class="hero-orb hero-orb--2"></div>
      <div class="hero-orb hero-orb--3"></div>
      <div class="hero-inner">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          AI 驱动智能面试准备
        </div>
        <h1 class="hero-title">
          用<span class="text-gradient"> AI </span>高效备战<br />拿下心仪 Offer
        </h1>
        <p class="hero-desc">
          上传简历和岗位 JD，AI 自动分析技术栈与项目经验，<br />生成个性化面试题和高分回答，让你面试胸有成竹
        </p>
        <div class="hero-actions">
          <button class="hero-cta" @click="router.push('/workspace')">
            <span>开始使用</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button class="hero-secondary" @click="router.push('/materials')">
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            上传资料
          </button>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section
      class="stats-bar"
      ref="statsRef"
      :class="{ visible: statsVisible }"
    >
      <div class="stat-item">
        <div class="stat-value">{{ questionsStore.totalCount || "--" }}</div>
        <div class="stat-label">已生成面试题</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-value">4</div>
        <div class="stat-label">考察维度分类</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-value">{{ docsStore.documents.length || "--" }}</div>
        <div class="stat-label">已上传资料</div>
      </div>
    </section>

    <!-- How it works -->
    <section class="section-header">
      <h2 class="section-title">三步开始</h2>
      <p class="section-sub">从上传资料到生成面试题，简单高效</p>
    </section>

    <div class="steps" ref="stepsRef" :class="{ visible: stepsVisible }">
      <div
        class="step-card"
        v-for="(s, i) in steps"
        :key="s.title"
        :style="{ transitionDelay: i * 0.1 + 's' }"
      >
        <div class="step-number">{{ i + 1 }}</div>
        <div class="step-content">
          <div class="step-icon" v-html="s.icon"></div>
          <div class="step-title">{{ s.title }}</div>
          <div class="step-desc">{{ s.desc }}</div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div
      v-if="hasQuestions"
      class="cta-card"
      ref="ctaRef"
      :class="{ visible: ctaVisible }"
    >
      <div class="cta-left">
        <div class="cta-check">
          <svg
            width="20"
            height="20"
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
        </div>
        <div>
          <div class="cta-title">准备就绪</div>
          <div class="cta-desc">
            已有 <strong>{{ questionsStore.totalCount }}</strong> 道面试题待复习
          </div>
        </div>
      </div>
      <button class="hero-cta" @click="router.push('/workspace')">
        进入工作台
      </button>
    </div>

    <div
      v-else-if="docsReady"
      class="cta-card"
      ref="ctaRef"
      :class="{ visible: ctaVisible }"
    >
      <div class="cta-left">
        <div class="cta-check ready">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div>
          <div class="cta-title">文档分析完成</div>
          <div class="cta-desc">可以基于分析结果生成面试题了</div>
        </div>
      </div>
      <button class="hero-cta" @click="onStartGenerate" :disabled="generating">
        {{ generating ? "生成中..." : "生成面试题" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useRouter } from "vue-router";

import { useDocumentsStore } from "../stores/documents";
import { useQuestionsStore } from "../stores/questions";

const router = useRouter();
const docsStore = useDocumentsStore();
const questionsStore = useQuestionsStore();

const hasQuestions = computed(() => questionsStore.questions.length > 0);
const docsReady = computed(() =>
  docsStore.documents.some((d) => d.status === ("COMPLETED" as any)),
);

const generating = ref(false);

async function onStartGenerate() {
  generating.value = true;
  try {
    await questionsStore.generateQuestions();
    await questionsStore.fetchQuestions();
  } finally {
    generating.value = false;
  }
}

const steps = [
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    title: "上传资料",
    desc: "上传简历、岗位 JD 或面试经验文档，支持 PDF / DOCX / TXT / 文本 / 链接",
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    title: "AI 智能分析",
    desc: "系统自动提取技术栈、项目经验、岗位关键词，分析考察重点和频次",
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    title: "生成面试题",
    desc: "一键生成分类型面试题 + 高质量回答 + 高频追问 + 面试官考察点",
  },
];

// Scroll animations
const statsRef = ref<HTMLElement>();
const stepsRef = ref<HTMLElement>();
const ctaRef = ref<HTMLElement>();

const statsVisible = ref(false);
const stepsVisible = ref(false);
const ctaVisible = ref(false);

let observer: IntersectionObserver | null = null;

onMounted(() => {
  docsStore.fetchDocuments();
  questionsStore.fetchQuestions();

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        if (el === statsRef.value) {
          statsVisible.value = true;
        }
        if (el === stepsRef.value) stepsVisible.value = true;
        if (el === ctaRef.value) ctaVisible.value = true;
      }
    },
    { threshold: 0.2 },
  );
  if (statsRef.value) observer.observe(statsRef.value);
  if (stepsRef.value) observer.observe(stepsRef.value);
  if (ctaRef.value) observer.observe(ctaRef.value);
});

onUnmounted(() => observer?.disconnect());
</script>

<style scoped>
.content {
  flex: 1;
  overflow-y: auto;
  padding: var(--content-padding);
}

/* === Hero === */
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #f5f7ff 0%, #edeffd 30%, #f3f5fc 100%);
  border-radius: var(--radius-2xl);
  padding: 72px 48px 64px;
  margin-bottom: var(--space-6);
  border: 1px solid rgba(79, 110, 247, 0.08);
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  pointer-events: none;
}

.hero-orb--1 {
  width: 280px;
  height: 280px;
  background: rgba(79, 110, 247, 0.15);
  top: -60px;
  right: -40px;
}

.hero-orb--2 {
  width: 200px;
  height: 200px;
  background: rgba(124, 110, 240, 0.12);
  bottom: -40px;
  left: -30px;
}

.hero-orb--3 {
  width: 160px;
  height: 160px;
  background: rgba(79, 110, 247, 0.08);
  top: 40%;
  right: 30%;
}

.hero-inner {
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 16px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--color-primary-border);
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--space-6);
  backdrop-filter: blur(8px);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: pulse 2s ease-in-out infinite;
}

.hero-title {
  font-size: 44px;
  font-weight: 800;
  margin-bottom: var(--space-4);
  color: var(--color-text);
  letter-spacing: -1px;
  line-height: 1.25;
}

.text-gradient {
  background: linear-gradient(135deg, var(--color-primary), #7c6ef0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  max-width: 520px;
  margin: 0 auto var(--space-7);
  line-height: 1.8;
  color: var(--color-text-muted);
  font-size: var(--text-md);
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 14px 28px;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-primary), #5c7cf7);
  color: white;
  font-size: var(--text-md);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(79, 110, 247, 0.3);
  position: relative;
  overflow: hidden;
}

.hero-cta::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), transparent);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.hero-cta:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(79, 110, 247, 0.4);
}

.hero-cta:hover:not(:disabled)::after {
  opacity: 1;
}

.hero-cta:active:not(:disabled) {
  transform: translateY(0);
}

.hero-cta:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hero-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 14px 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-text-secondary);
  font-size: var(--text-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.hero-secondary:hover {
  border-color: var(--color-primary-border);
  color: var(--color-primary);
  background: var(--color-primary-light);
  transform: translateY(-1px);
}

/* === Stats bar === */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-10);
  padding: var(--space-6) var(--space-7);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-8);
  box-shadow: var(--shadow-sm);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.stats-bar.visible {
  opacity: 1;
  transform: translateY(0);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.5px;
  margin-bottom: var(--space-1);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border-light);
}

/* === Section headers === */
.section-header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.section-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.section-sub {
  font-size: var(--text-base);
  color: var(--color-text-muted);
}

/* === Steps === */
.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
  margin-bottom: var(--space-8);
}

.steps .step-card {
  opacity: 0;
  transform: translateY(24px);
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.steps.visible .step-card {
  opacity: 1;
  transform: translateY(0);
}

.step-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  transition: all 0.25s ease;
}

.step-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-border);
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary), #7c6ef0);
  color: white;
  font-weight: 800;
  font-size: var(--text-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(79, 110, 247, 0.25);
}

.step-icon {
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.step-title {
  font-weight: 700;
  font-size: var(--text-md);
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.step-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* === CTA card === */
.cta-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5) var(--space-6);
  box-shadow: var(--shadow-sm);
  opacity: 0;
  transform: translateY(16px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.cta-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.cta-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.cta-check {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-success-bg);
  color: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cta-check.ready {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.cta-title {
  font-weight: 700;
  font-size: var(--text-md);
  color: var(--color-text);
  margin-bottom: 2px;
}

.cta-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.cta-desc strong {
  color: var(--color-text);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

@media (max-width: 1000px) {
  .steps {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 12px;
  }

  .hero {
    padding: 32px 20px 28px;
    border-radius: 20px;
    margin-bottom: 16px;
    text-align: center;
  }

  .hero-badge {
    padding: 4px 14px;
    font-size: 12px;
    margin-bottom: 20px;
  }

  .hero-title {
    font-size: 26px;
    letter-spacing: -0.5px;
    line-height: 1.3;
    margin-bottom: 10px;
  }

  .hero-desc {
    font-size: 14px;
    max-width: 100%;
    line-height: 1.6;
    margin-bottom: 22px;
  }

  .hero-desc br {
    display: none;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .hero-cta,
  .hero-secondary {
    justify-content: center;
    padding: 15px 20px;
    font-size: 16px;
  }

  .hero-orb--1 {
    width: 180px;
    height: 180px;
    top: -40px;
    right: -50px;
  }

  .hero-orb--2 {
    width: 140px;
    height: 140px;
  }

  .hero-orb--3 {
    width: 100px;
    height: 100px;
    opacity: 0.3;
  }

  .stats-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    padding: 16px 8px;
    margin-bottom: 24px;
    border-radius: 16px;
    text-align: center;
  }

  .stat-item {
    padding: 8px 4px;
  }

  .stat-value {
    font-size: 20px;
    margin-bottom: 2px;
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-divider {
    display: none;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .section-sub {
    font-size: 13px;
  }

  .steps {
    gap: 10px;
    margin-bottom: 24px;
  }

  .step-card {
    padding: 16px;
    border-radius: 14px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .step-title {
    font-size: 15px;
  }

  .step-desc {
    font-size: 13px;
  }

  .cta-card {
    flex-direction: column;
    gap: 14px;
    text-align: center;
    padding: 16px;
    border-radius: 16px;
  }

  .cta-left {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .cta-desc {
    font-size: 13px;
  }

  .cta-card .hero-cta {
    width: 100%;
    justify-content: center;
  }
}
</style>
