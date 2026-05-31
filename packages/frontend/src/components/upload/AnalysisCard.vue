<template>
  <div class="card">
    <div class="card-title">AI 分析结果</div>
    <div v-if="store.isLoading" class="hint">正在分析文档...</div>
    <div v-else-if="analysis">
      <div class="analysis-tags">
        <div v-for="tag in allTags" :key="tag" class="tag">{{ tag }}</div>
      </div>
      <div v-if="!allTags.length" class="hint">
        上传文档后自动分析技术栈和关键信息
      </div>
    </div>
    <div v-else class="hint">上传文档后自动分析技术栈和关键信息</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDocumentsStore } from "../../stores/documents";

const store = useDocumentsStore();

const analysis = computed(() => store.currentAnalysis);

const allTags = computed(() => {
  if (!analysis.value) return [];
  return [...analysis.value.techStack, ...analysis.value.keywords];
});
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

.analysis-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.tag {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-weight: 500;
  font-size: var(--text-sm);
}

.hint {
  color: var(--color-text-placeholder);
  padding: var(--space-6) 0;
}
</style>
