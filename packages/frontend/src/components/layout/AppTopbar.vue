<template>
  <header class="topbar">
    <button class="menu-btn" @click="$emit('toggleMenu')" aria-label="菜单">
      <span></span>
      <span></span>
      <span></span>
    </button>
    <div class="topbar-left">
      <span class="topbar-breadcrumb">面试准备</span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="breadcrumb-sep"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
      <span class="topbar-title">{{ title }}</span>
    </div>
    <div class="topbar-right">
      <div class="status-dot"></div>
      <span class="status-text">就绪</span>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();

defineEmits<{
  toggleMenu: [];
}>();
</script>

<style scoped>
.topbar {
  height: var(--topbar-height);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: 0 var(--content-padding);
  flex-shrink: 0;
  z-index: 10;
}

.menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  transition: background var(--transition);
  -webkit-tap-highlight-color: transparent;
}

.menu-btn:active {
  background: var(--color-surface-muted);
}

.menu-btn span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--color-text-secondary);
  border-radius: 2px;
  transition: all 0.2s ease;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
}

.topbar-breadcrumb {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: 500;
  white-space: nowrap;
}

.breadcrumb-sep {
  color: var(--color-text-placeholder);
  flex-shrink: 0;
}

.topbar-title {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 6px rgba(23, 163, 77, 0.4);
}

.status-text {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: 500;
}

@media (max-width: 1200px) {
  .menu-btn {
    display: flex;
  }
}

@media (max-width: 768px) {
  .topbar {
    height: 52px;
    padding: 0 12px;
    gap: 10px;
  }

  .topbar-left {
    gap: 4px;
  }

  .topbar-breadcrumb {
    display: none;
  }

  .breadcrumb-sep {
    display: none;
  }

  .topbar-title {
    font-size: 15px;
  }

  .status-text {
    display: none;
  }
}
</style>
