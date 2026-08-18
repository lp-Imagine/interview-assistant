<template>
  <div class="content">
    <div class="card">
      <div class="card-title">AI 配置</div>
      <p class="settings-hint">
        在这里配置 AI 服务（问答、题目生成、RAG
        向量化）。保存后后端会自动重启，约 5 秒生效。
      </p>

      <div v-if="loading" class="settings-loading">加载中...</div>

      <form
        id="settings-form"
        v-else
        class="settings-form"
        @submit.prevent="onSave"
      >
        <fieldset>
          <legend>LLM（问答 / 题目生成）</legend>

          <label>
            <span>API Key</span>
            <input
              v-model="form.LLM_API_KEY"
              type="password"
              autocomplete="off"
              placeholder="留空则不修改"
            />
            <small v-if="current.LLM_API_KEY"
              >当前：{{ current.LLM_API_KEY }}</small
            >
          </label>

          <label>
            <span>Base URL</span>
            <input
              v-model="form.LLM_BASE_URL"
              type="url"
              placeholder="https://api.openai.com/v1"
            />
          </label>

          <label>
            <span>模型名</span>
            <input
              v-model="form.LLM_MODEL"
              placeholder="gpt-4.1 / deepseek-chat"
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Embedding（RAG 向量化）</legend>

          <label>
            <span>API Key</span>
            <input
              v-model="form.EMBEDDING_API_KEY"
              type="password"
              autocomplete="off"
              placeholder="留空则不修改"
            />
            <small v-if="current.EMBEDDING_API_KEY"
              >当前：{{ current.EMBEDDING_API_KEY }}</small
            >
          </label>

          <label>
            <span>Base URL</span>
            <input
              v-model="form.EMBEDDING_BASE_URL"
              type="url"
              placeholder="https://api.openai.com/v1"
            />
          </label>

          <label>
            <span>模型名</span>
            <input
              v-model="form.EMBEDDING_MODEL"
              placeholder="text-embedding-3-small"
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>语音（模拟面试 TTS / ASR）</legend>

          <label>
            <span>语音合成模型（TTS_MODEL，火山方舟 doubao-tts）</span>
            <input
              v-model="form.TTS_MODEL"
              placeholder="如 doubao-tts-seed-240628，留空则回退浏览器语音"
            />
          </label>

          <label>
            <span>语音合成音色（TTS_VOICE）</span>
            <input v-model="form.TTS_VOICE" placeholder="如 zh_female_xiaohe" />
          </label>

          <label>
            <span>语音识别模型（ASR_MODEL，火山方舟 doubao-asr）</span>
            <input
              v-model="form.ASR_MODEL"
              placeholder="如 doubao-asr-1-240826，留空则语音识别不可用"
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>其他</legend>

          <label>
            <span>允许的跨域来源（CORS_ORIGINS，逗号分隔）</span>
            <input
              v-model="form.CORS_ORIGINS"
              placeholder="https://interview.draftly.cn"
            />
          </label>
        </fieldset>

        <p class="settings-warn">
          ⚠️ API Key 会明文保存到服务器
          <code>.env</code> 文件；请勿在多人共享环境中随意修改。
          密钥输入框留空表示不修改（页面只显示脱敏后的当前值）。
        </p>
      </form>
    </div>

    <!-- 固定右下角的保存按钮（必须在 .card 外：.card:hover 的 transform
         会破坏 fixed 的视口定位，导致鼠标滑到卡片时按钮消失） -->
    <div class="settings-actions">
      <p v-if="message" class="settings-message" :class="{ error: isError }">
        {{ message }}
      </p>
      <button type="submit" form="settings-form" :disabled="saving">
        {{ saving ? "保存中..." : "保存配置" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchSettings, saveSettings } from "../api/settings";

const loading = ref(true);
const saving = ref(false);
const message = ref("");
const isError = ref(false);

const current = ref<Record<string, string>>({});
const form = ref<Record<string, string>>({});

const FIELD_LABELS: Record<string, string> = {
  LLM_API_KEY: "LLM API Key",
  LLM_BASE_URL: "LLM Base URL",
  LLM_MODEL: "LLM 模型",
  EMBEDDING_API_KEY: "Embedding API Key",
  EMBEDDING_BASE_URL: "Embedding Base URL",
  EMBEDDING_MODEL: "Embedding 模型",
  TTS_MODEL: "语音合成模型",
  TTS_VOICE: "语音合成音色",
  ASR_MODEL: "语音识别模型",
  CORS_ORIGINS: "CORS_ORIGINS",
};

async function load() {
  loading.value = true;
  try {
    current.value = await fetchSettings();
    // 非密钥字段直接回填输入框（用户能看到/修改当前配置）；
    // 密钥字段保持留空（脱敏值不能当真实 key 提交，留空=不修改）
    const next: Record<string, string> = {};
    for (const [key, value] of Object.entries(current.value)) {
      if (key === "LLM_API_KEY" || key === "EMBEDDING_API_KEY") continue;
      next[key] = value ?? "";
    }
    form.value = next;
  } catch {
    message.value = "读取配置失败，请确认已登录";
    isError.value = true;
  } finally {
    loading.value = false;
  }
}

async function onSave() {
  saving.value = true;
  message.value = "";
  isError.value = false;
  try {
    const patch: Record<string, string> = {};
    for (const [key, value] of Object.entries(form.value)) {
      if (value && value.trim() !== "") patch[key] = value.trim();
    }
    const result = await saveSettings(patch);
    message.value = result.message ?? "已保存";
    if (result.changed?.length) {
      message.value += `（${result.changed.map((k) => FIELD_LABELS[k] ?? k).join("、")}）`;
    }
    // 保存后重新加载脱敏值
    setTimeout(load, 3000);
  } catch (error: any) {
    message.value =
      error?.response?.data?.message || error?.message || "保存失败";
    isError.value = true;
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.content {
  flex: 1;
  overflow-y: auto;
  padding: var(--content-padding);
  box-sizing: border-box;
}
.settings-hint {
  color: var(--text-secondary, #999);
  font-size: 13px;
  margin: 0 0 16px;
}
.settings-loading {
  padding: 24px 0;
  color: #999;
  font-size: 14px;
}
.settings-form {
  display: grid;
  gap: 18px;
  /* 给固定右下角的保存按钮留空间，避免遮挡最后字段 */
  padding-bottom: 88px;
}
.settings-form fieldset {
  border: 1px solid var(--border-color, #eee);
  border-radius: 10px;
  padding: 14px 16px;
  display: grid;
  gap: 12px;
}
.settings-form legend {
  font-weight: 600;
  font-size: 14px;
  padding: 0 6px;
  color: var(--text-primary, #222);
}
.settings-form label {
  display: grid;
  gap: 5px;
}
.settings-form label > span {
  font-size: 12px;
  color: #666;
}
.settings-form input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  font-size: 14px;
}
.settings-form input:focus {
  outline: none;
  border-color: var(--primary, #3b82f6);
}
.settings-form label small {
  color: #aaa;
  font-size: 12px;
}
.settings-actions {
  position: fixed;
  right: 28px;
  bottom: 24px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: calc(100% - 56px);
}
.settings-actions button {
  padding: 12px 28px;
  border: 0;
  border-radius: 10px;
  background: var(--primary, #3b82f6);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
  white-space: nowrap;
}
.settings-actions button:disabled {
  opacity: 0.6;
  cursor: default;
}
.settings-message {
  font-size: 13px;
  color: var(--success, #16a34a);
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 10px;
  border-radius: 8px;
}
.settings-message.error {
  color: var(--error, #dc2626);
}
.settings-warn {
  font-size: 12px;
  color: #b45309;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
}
.settings-warn code {
  background: #fff7ed;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11px;
}
</style>
