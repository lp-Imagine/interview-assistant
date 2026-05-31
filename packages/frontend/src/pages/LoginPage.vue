<template>
  <div class="auth-page">
    <!-- 背景装饰 -->
    <div class="bg-layer">
      <div class="bg-blob bg-blob-1"></div>
      <div class="bg-blob bg-blob-2"></div>
      <div class="bg-blob bg-blob-3"></div>
      <div class="bg-dots"></div>
      <!-- 抽象几何装饰 -->
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
        <h2 class="panel-title">AI 面试准备助手</h2>
        <p class="panel-desc">
          智能生成面试题目，实时 AI 回答评估，助你从容应对每一次面试。
        </p>

        <!-- 面试场景插图 -->
        <div class="panel-illustration">
          <svg
            viewBox="0 0 320 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#4f6ef7" stop-opacity="0.12" />
                <stop offset="100%" stop-color="#7c6ef0" stop-opacity="0.06" />
              </linearGradient>
              <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#4f6ef7" />
                <stop offset="100%" stop-color="#7c6ef0" />
              </linearGradient>
              <linearGradient id="lg3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#eef1ff" />
                <stop offset="100%" stop-color="#f8f9fd" />
              </linearGradient>
            </defs>

            <!-- 桌面设备 -->
            <rect
              x="170"
              y="24"
              width="128"
              height="88"
              rx="10"
              fill="white"
              stroke="#dde0e8"
              stroke-width="1.5"
            />
            <rect
              x="178"
              y="34"
              width="112"
              height="68"
              rx="4"
              fill="#f8f9fd"
            />
            <!-- 对话界面 -->
            <rect
              x="186"
              y="42"
              width="70"
              height="8"
              rx="4"
              fill="#4f6ef7"
              opacity="0.12"
            />
            <rect x="186" y="56" width="96" height="6" rx="3" fill="#e8ecf5" />
            <rect x="186" y="68" width="80" height="6" rx="3" fill="#e8ecf5" />
            <rect x="186" y="80" width="60" height="6" rx="3" fill="#e8ecf5" />
            <rect x="186" y="92" width="50" height="6" rx="3" fill="#e8ecf5" />
            <!-- 输入框 -->
            <rect
              x="186"
              y="106"
              width="96"
              height="20"
              rx="6"
              fill="white"
              stroke="#dde0e8"
              stroke-width="1"
            />
            <rect
              x="260"
              y="112"
              width="12"
              height="8"
              rx="3"
              fill="#4f6ef7"
              opacity="0.4"
            />
            <!-- 设备底座 -->
            <rect x="196" y="112" width="76" height="4" rx="2" fill="#dde0e8" />
            <rect x="210" y="116" width="48" height="8" rx="3" fill="#e8ecf5" />

            <!-- 人物 -->
            <circle
              cx="124"
              cy="76"
              r="24"
              fill="url(#lg3)"
              stroke="#d0d6ff"
              stroke-width="2"
            />
            <circle cx="115" cy="72" r="3.5" fill="#505a6e" />
            <circle cx="133" cy="72" r="3.5" fill="#505a6e" />
            <path
              d="M117 84 Q124 92 131 84"
              stroke="#505a6e"
              stroke-width="2"
              stroke-linecap="round"
              fill="none"
            />
            <rect
              x="112"
              y="98"
              width="24"
              height="28"
              rx="6"
              fill="url(#lg2)"
              opacity="0.8"
            />

            <!-- 大脑/AI 元素 -->
            <circle
              cx="82"
              cy="40"
              r="26"
              fill="url(#lg1)"
              stroke="#d0d6ff"
              stroke-width="1.5"
            />
            <!-- 电路/AI 节点 -->
            <circle cx="74" cy="34" r="3" fill="#4f6ef7" opacity="0.5" />
            <circle cx="90" cy="34" r="3" fill="#7c6ef0" opacity="0.5" />
            <circle cx="82" cy="48" r="3" fill="#4f6ef7" opacity="0.4" />
            <line
              x1="74"
              y1="34"
              x2="82"
              y2="48"
              stroke="#4f6ef7"
              stroke-width="1"
              opacity="0.25"
            />
            <line
              x1="90"
              y1="34"
              x2="82"
              y2="48"
              stroke="#7c6ef0"
              stroke-width="1"
              opacity="0.25"
            />
            <line
              x1="74"
              y1="34"
              x2="90"
              y2="34"
              stroke="#4f6ef7"
              stroke-width="1"
              opacity="0.25"
            />

            <!-- 连接线 (虚线) -->
            <path
              d="M108 40 Q140 30 170 50"
              stroke="#d0d6ff"
              stroke-width="1.5"
              stroke-dasharray="5 4"
              fill="none"
            />

            <!-- 装饰点 -->
            <circle cx="50" cy="82" r="2" fill="#4f6ef7" opacity="0.15" />
            <circle cx="280" cy="140" r="2" fill="#7c6ef0" opacity="0.15" />
            <circle cx="62" cy="110" r="1.5" fill="#4f6ef7" opacity="0.12" />
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
            <span>个性化题目生成</span>
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
            <span>AI 深度回答评估</span>
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
            <span>追问式练习模式</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="form-panel">
      <div class="form-card">
        <div class="form-header">
          <h1>欢迎回来</h1>
          <p>登录你的账号继续使用</p>
        </div>

        <form class="auth-form" @submit.prevent="onSubmit">
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
                placeholder="请输入密码"
                autocomplete="current-password"
              />
            </div>
          </div>

          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

          <button class="submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? "登录中..." : "登录" }}
          </button>
        </form>

        <div class="auth-footer">
          还没有账号？<RouterLink to="/register">立即注册</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");

async function onSubmit() {
  if (!email.value.trim() || !password.value) return;
  errorMsg.value = "";
  loading.value = true;
  try {
    await authStore.login(email.value.trim(), password.value);
    const redirect = (route.query.redirect as string) || "/";
    router.push(redirect);
  } catch (err: any) {
    errorMsg.value =
      err.response?.data?.message || "登录失败，请检查邮箱和密码";
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
