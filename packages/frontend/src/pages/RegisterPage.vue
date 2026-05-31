<template>
  <div class="auth-page">
    <!-- 背景装饰 -->
    <div class="bg-layer">
      <div class="bg-blob bg-blob-1"></div>
      <div class="bg-blob bg-blob-2"></div>
      <div class="bg-blob bg-blob-3"></div>
      <div class="bg-dots"></div>
      <svg
        class="bg-geo bg-geo-1"
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle
          cx="100"
          cy="100"
          r="96"
          stroke="rgba(79,110,247,0.06)"
          stroke-width="2"
          stroke-dasharray="8 6"
        />
        <circle
          cx="100"
          cy="100"
          r="64"
          stroke="rgba(79,110,247,0.08)"
          stroke-width="1.5"
          stroke-dasharray="4 8"
        />
        <circle cx="100" cy="100" r="32" fill="rgba(79,110,247,0.04)" />
      </svg>
      <svg
        class="bg-geo bg-geo-2"
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
      >
        <rect
          x="16"
          y="16"
          width="128"
          height="128"
          rx="24"
          stroke="rgba(124,110,240,0.06)"
          stroke-width="2"
          transform="rotate(15 80 80)"
        />
        <rect
          x="40"
          y="40"
          width="80"
          height="80"
          rx="16"
          fill="rgba(124,110,240,0.05)"
          transform="rotate(15 80 80)"
        />
        <circle
          cx="80"
          cy="80"
          r="20"
          stroke="rgba(124,110,240,0.08)"
          stroke-width="1.5"
        />
      </svg>
      <svg
        class="bg-geo bg-geo-3"
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
      >
        <polygon
          points="60,8 112,38 112,98 60,128 8,98 8,38"
          stroke="rgba(79,110,247,0.06)"
          stroke-width="2"
        />
        <polygon
          points="60,28 92,44 92,84 60,100 28,84 28,44"
          fill="rgba(79,110,247,0.04)"
        />
      </svg>
    </div>

    <!-- 左侧品牌区 -->
    <div class="auth-panel">
      <div class="panel-inner">
        <div class="panel-logo">
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h2 class="panel-title">开始你的面试准备</h2>
        <p class="panel-desc">
          注册账号，解锁智能面试模拟、AI 实时评估和个性化练习体验。
        </p>

        <!-- 注册场景插图 -->
        <div class="panel-illustration">
          <svg
            viewBox="0 0 320 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="rg1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#4f6ef7" stop-opacity="0.12" />
                <stop offset="100%" stop-color="#7c6ef0" stop-opacity="0.06" />
              </linearGradient>
              <linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#4f6ef7" />
                <stop offset="100%" stop-color="#7c6ef0" />
              </linearGradient>
              <linearGradient id="rg3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#eef1ff" />
                <stop offset="100%" stop-color="#f8f9fd" />
              </linearGradient>
            </defs>

            <!-- 目标/靶心 -->
            <circle
              cx="88"
              cy="90"
              r="42"
              fill="url(#rg1)"
              stroke="#d0d6ff"
              stroke-width="1.5"
            />
            <circle
              cx="88"
              cy="90"
              r="28"
              stroke="#d0d6ff"
              stroke-width="1.5"
              stroke-dasharray="6 4"
            />
            <circle
              cx="88"
              cy="90"
              r="14"
              fill="url(#rg2)"
              opacity="0.12"
              stroke="#4f6ef7"
              stroke-width="1.5"
            />
            <circle cx="88" cy="90" r="5" fill="#4f6ef7" opacity="0.5" />
            <!-- 对勾在靶心中 -->
            <path
              d="M82 90 L87 95 L94 85"
              stroke="#4f6ef7"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- 文档/简历 -->
            <rect
              x="160"
              y="65"
              width="60"
              height="76"
              rx="8"
              fill="white"
              stroke="#dde0e8"
              stroke-width="1.5"
            />
            <rect x="172" y="78" width="36" height="4" rx="2" fill="#e8ecf5" />
            <rect x="172" y="88" width="28" height="4" rx="2" fill="#e8ecf5" />
            <rect x="172" y="98" width="36" height="4" rx="2" fill="#e8ecf5" />
            <rect x="172" y="108" width="24" height="4" rx="2" fill="#e8ecf5" />
            <rect x="172" y="118" width="30" height="4" rx="2" fill="#e8ecf5" />
            <rect x="172" y="128" width="20" height="4" rx="2" fill="#e8ecf5" />
            <!-- 校徽/评级 -->
            <circle
              cx="215"
              cy="64"
              r="14"
              fill="#17a34d"
              fill-opacity="0.08"
              stroke="#17a34d"
              stroke-width="1"
              stroke-opacity="0.3"
            />
            <path
              d="M210 64 L213 67 L220 60"
              stroke="#17a34d"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- 人物 -->
            <circle
              cx="206"
              cy="38"
              r="20"
              fill="url(#rg3)"
              stroke="#d0d6ff"
              stroke-width="2"
            />
            <circle cx="199" cy="34" r="3" fill="#505a6e" />
            <circle cx="213" cy="34" r="3" fill="#505a6e" />
            <path
              d="M200 44 Q206 50 212 44"
              stroke="#505a6e"
              stroke-width="1.8"
              stroke-linecap="round"
              fill="none"
            />
            <rect
              x="196"
              y="56"
              width="20"
              height="24"
              rx="6"
              fill="url(#rg2)"
              opacity="0.7"
            />

            <!-- 步骤指示器 -->
            <rect
              x="42"
              y="148"
              width="56"
              height="28"
              rx="8"
              fill="white"
              stroke="#dde0e8"
              stroke-width="1"
            />
            <circle cx="56" cy="162" r="8" fill="#4f6ef7" opacity="0.15" />
            <text
              x="56"
              y="166"
              text-anchor="middle"
              fill="#4f6ef7"
              font-size="10"
              font-weight="700"
            >
              1
            </text>
            <rect x="56" y="159" width="12" height="2" rx="1" fill="#dde0e8" />
            <rect
              x="104"
              y="148"
              width="56"
              height="28"
              rx="8"
              fill="white"
              stroke="#dde0e8"
              stroke-width="1"
            />
            <circle cx="118" cy="162" r="8" fill="#e8ecf5" />
            <text
              x="118"
              y="166"
              text-anchor="middle"
              fill="#9ba2b3"
              font-size="10"
              font-weight="600"
            >
              2
            </text>
            <rect x="118" y="159" width="12" height="2" rx="1" fill="#dde0e8" />
            <rect
              x="166"
              y="148"
              width="56"
              height="28"
              rx="8"
              fill="white"
              stroke="#dde0e8"
              stroke-width="1"
            />
            <circle cx="180" cy="162" r="8" fill="#e8ecf5" />
            <text
              x="180"
              y="166"
              text-anchor="middle"
              fill="#9ba2b3"
              font-size="10"
              font-weight="600"
            >
              3
            </text>

            <!-- 连接虚线 -->
            <path
              d="M130 90 Q150 85 160 86"
              stroke="#d0d6ff"
              stroke-width="1.5"
              stroke-dasharray="5 4"
              fill="none"
            />

            <!-- 装饰 -->
            <circle cx="44" cy="48" r="2" fill="#4f6ef7" opacity="0.15" />
            <circle cx="270" cy="120" r="2" fill="#7c6ef0" opacity="0.15" />
            <circle cx="290" cy="30" r="1.5" fill="#4f6ef7" opacity="0.12" />
          </svg>
        </div>

        <div class="panel-features">
          <div class="feature-item">
            <div class="feature-icon">
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span>免费使用，无需绑定支付</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span>海量面试题库覆盖</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span>安全加密，隐私无忧</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="form-panel">
      <div class="form-card">
        <div class="form-header">
          <h1>创建账号</h1>
          <p>开始你的面试准备之旅</p>
        </div>

        <form class="auth-form" @submit.prevent="onSubmit">
          <div class="form-field">
            <label>昵称 <span class="optional">(选填)</span></label>
            <div class="input-wrapper">
              <svg
                class="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                v-model="name"
                type="text"
                class="input"
                placeholder="你的名字"
                autocomplete="name"
              />
            </div>
          </div>

          <div class="form-field">
            <label>邮箱地址</label>
            <div class="input-wrapper">
              <svg
                class="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                v-model="email"
                type="email"
                class="input"
                placeholder="请输入邮箱"
                autocomplete="email"
              />
            </div>
          </div>

          <div class="form-field">
            <label>密码</label>
            <div class="input-wrapper">
              <svg
                class="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                v-model="password"
                type="password"
                class="input"
                placeholder="至少 6 位"
                autocomplete="new-password"
              />
            </div>
          </div>

          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

          <button class="submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? "注册中..." : "注册" }}
          </button>
        </form>

        <div class="auth-footer">
          已有账号？<RouterLink to="/login">立即登录</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");

async function onSubmit() {
  if (!email.value.trim() || !password.value || password.value.length < 6) {
    errorMsg.value = "密码至少 6 位";
    return;
  }
  errorMsg.value = "";
  loading.value = true;
  try {
    await authStore.register(
      email.value.trim(),
      password.value,
      name.value.trim() || undefined,
    );
    router.push("/");
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || "注册失败，请重试";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  min-height: 100vh;
  position: relative;
  background: #f8fafd;
}

/* ===== 背景装饰 ===== */
.bg-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.bg-blob-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(
    circle,
    rgba(79, 110, 247, 0.12) 0%,
    transparent 70%
  );
  top: -120px;
  right: -100px;
  animation: float-blob 20s ease-in-out infinite;
}

.bg-blob-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(124, 110, 240, 0.1) 0%,
    transparent 70%
  );
  bottom: -80px;
  left: -80px;
  animation: float-blob 24s ease-in-out infinite reverse;
}

.bg-blob-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(
    circle,
    rgba(99, 140, 255, 0.08) 0%,
    transparent 70%
  );
  top: 50%;
  left: 45%;
  animation: float-blob 18s ease-in-out infinite 3s;
}

@keyframes float-blob {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.05);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95);
  }
}

.bg-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle,
    rgba(79, 110, 247, 0.06) 1px,
    transparent 1px
  );
  background-size: 32px 32px;
}

.bg-geo {
  position: absolute;
}

.bg-geo-1 {
  top: 8%;
  right: 55%;
  animation: float-geo 22s ease-in-out infinite;
}

.bg-geo-2 {
  bottom: 15%;
  right: 10%;
  animation: float-geo 18s ease-in-out infinite 2s reverse;
}

.bg-geo-3 {
  top: 20%;
  right: 20%;
  animation: float-geo 20s ease-in-out infinite 5s;
}

@keyframes float-geo {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(15px, -15px) rotate(5deg);
  }
  66% {
    transform: translate(-10px, 10px) rotate(-3deg);
  }
}

/* ===== 左侧品牌面板 ===== */
.auth-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
  position: relative;
  z-index: 1;
}

.panel-inner {
  max-width: 460px;
}

.panel-logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #4f6ef7, #7c6ef0);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 24px;
  box-shadow: 0 12px 32px rgba(79, 110, 247, 0.3);
}

.panel-title {
  font-size: 32px;
  font-weight: 700;
  color: #121826;
  margin: 0 0 12px;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.panel-desc {
  font-size: 16px;
  color: #6b7388;
  line-height: 1.7;
  margin: 0 0 28px;
}

.panel-illustration {
  margin-bottom: 28px;
  background: linear-gradient(135deg, #f8f9fd 0%, #f2f4f8 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(18, 24, 38, 0.04);
}

.panel-illustration svg {
  width: 100%;
  height: auto;
  display: block;
}

.optional {
  font-weight: 400;
  color: #9ba2b3;
}

.panel-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: #505a6e;
  font-weight: 500;
}

.feature-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #eef1ff;
  color: #4f6ef7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ===== 右侧表单面板 ===== */
.form-panel {
  width: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
  position: relative;
  z-index: 1;
}

.form-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 20px;
  padding: 44px 40px 36px;
  box-shadow:
    0 2px 4px rgba(18, 24, 38, 0.03),
    0 12px 32px rgba(18, 24, 38, 0.06),
    0 32px 64px rgba(18, 24, 38, 0.04);
  border: 1px solid rgba(18, 24, 38, 0.04);
}

.form-header {
  margin-bottom: 32px;
}

.form-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #121826;
  margin: 0 0 8px;
  letter-spacing: -0.3px;
}

.form-header p {
  font-size: 15px;
  color: #6b7388;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #505a6e;
  margin-bottom: 6px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #9ba2b3;
  pointer-events: none;
  z-index: 1;
}

.input {
  display: block;
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1.5px solid #dde0e8;
  border-radius: 12px;
  background: #f9fafc;
  font-size: 15px;
  color: #121826;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.input:focus {
  border-color: #4f6ef7;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(79, 110, 247, 0.08);
}

.input::placeholder {
  color: #9ba2b3;
}

.error-msg {
  padding: 10px 14px;
  background: #fef4f4;
  color: #e84c4c;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
}

.submit-btn {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4f6ef7, #5f7ef8);
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(79, 110, 247, 0.3);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #3b5de7, #4f6ef7);
  box-shadow: 0 6px 20px rgba(79, 110, 247, 0.4);
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.auth-footer {
  text-align: center;
  margin-top: 28px;
  font-size: 14px;
  color: #6b7388;
}

.auth-footer a {
  color: #4f6ef7;
  font-weight: 600;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* ===== 响应式 ===== */
@media (max-width: 900px) {
  .auth-panel {
    display: none;
  }

  .form-panel {
    width: 100%;
    padding: 24px 16px;
  }

  .form-card {
    padding: 28px 20px 24px;
  }
}

@media (max-width: 480px) {
  .form-panel {
    padding: 16px 12px;
  }

  .form-card {
    padding: 24px 16px 20px;
    border-radius: 16px;
  }

  .form-header h1 {
    font-size: 22px;
  }

  .form-header p {
    font-size: 14px;
  }

  .input {
    padding: 10px 12px 10px 38px;
    font-size: 16px;
  }

  .submit-btn {
    padding: 12px;
    font-size: 15px;
  }
}
</style>
