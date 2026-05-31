<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-icon">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <div class="brand-text">
        <span class="brand-name">Interview AI</span>
        <span class="brand-sub">面试准备助手</span>
      </div>
    </div>

    <nav class="nav-section">
      <div class="nav-label">导航</div>
      <div
        v-for="item in mainMenu"
        :key="item.path"
        class="nav-item"
        :class="{ active: route.path === item.path }"
        @click="onClick(item.path)"
      >
        <svg
          v-html="item.icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <span class="nav-text">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-card">
        <div class="user-avatar">👤</div>
        <div class="user-info">
          <div class="user-name">{{ displayName }}</div>
          <div class="user-role">面试准备中</div>
        </div>
        <button class="logout-btn" title="退出登录" @click.stop="handleLogout">
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const emit = defineEmits<{ navigate: [] }>();

const displayName = computed(
  () => authStore.user?.name || authStore.user?.email || "用户",
);

function handleLogout() {
  authStore.logout();
}

function onClick(path: string) {
  router.push(path);
  emit("navigate");
}

const mainMenu = [
  {
    label: "首页",
    path: "/",
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  },
  {
    label: "面试工作台",
    path: "/workspace",
    icon: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  },
  {
    label: "AI 问答",
    path: "/qa",
    icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  },
  {
    label: "我的资料",
    path: "/materials",
    icon: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  },
  {
    label: "我的收藏",
    path: "/favorites",
    icon: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  },
];
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-4) var(--space-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-primary), #7c6ef0);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.brand-name {
  font-size: var(--text-md);
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
}

.brand-sub {
  font-size: var(--text-xs);
  color: var(--sidebar-text);
}

.nav-section {
  flex: 1;
  padding: var(--space-3) var(--space-3);
  overflow-y: auto;
}

.nav-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.25);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: var(--space-2) var(--space-3);
  margin-top: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--sidebar-text);
  transition: all 0.15s ease;
  font-weight: 500;
  font-size: var(--text-base);
  position: relative;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: var(--sidebar-item-hover);
  color: var(--sidebar-text-active);
}

.nav-item.active {
  background: var(--sidebar-item-active);
  color: var(--sidebar-text-active);
  font-weight: 600;
}

.nav-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: var(--color-primary);
  border-radius: 0 3px 3px 0;
}

.nav-text {
  flex: 1;
}

.nav-badge {
  background: var(--color-primary);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  min-width: 18px;
  text-align: center;
  line-height: 16px;
}

.sidebar-footer {
  padding: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.user-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.15s ease;
}

.user-card:hover {
  background: var(--sidebar-item-hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--sidebar-text-active);
}

.user-role {
  font-size: var(--text-xs);
  color: var(--sidebar-text);
}

.logout-btn {
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--sidebar-text);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.user-card:hover .logout-btn {
  opacity: 1;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

@media (max-width: 1200px) {
  .sidebar {
    height: 100dvh;
    padding-top: env(safe-area-inset-top, 0px);
  }

  .nav-item {
    padding: 12px 14px;
  }

  .logout-btn {
    opacity: 1;
    padding: 8px;
  }

  .user-card {
    padding: 10px 12px;
  }
}
</style>
