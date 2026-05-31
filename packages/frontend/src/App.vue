<template>
  <n-dialog-provider>
    <n-message-provider>
      <div v-if="isGuestRoute" class="guest-layout">
        <RouterView />
      </div>

      <div v-else class="app-layout">
        <div
          class="overlay"
          :class="{ visible: menuOpen }"
          @click="menuOpen = false"
        ></div>

        <AppSidebar :class="{ open: menuOpen }" @navigate="menuOpen = false" />
        <main class="main">
          <AppTopbar :title="pageTitle" @toggle-menu="menuOpen = !menuOpen" />
          <RouterView v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </main>
      </div>
    </n-message-provider>
  </n-dialog-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { NDialogProvider, NMessageProvider } from "naive-ui";
import AppSidebar from "./components/layout/AppSidebar.vue";
import AppTopbar from "./components/layout/AppTopbar.vue";
import { useAuthStore } from "./stores/auth";

const route = useRoute();
const authStore = useAuthStore();
const menuOpen = ref(false);

const isGuestRoute = computed(() => route.meta.guest === true);

const pageTitles: Record<string, string> = {
  "/": "AI 面试准备助手",
  "/workspace": "面试准备工作台",
  "/qa": "AI 问答",
  "/materials": "我的资料",
  "/favorites": "我的收藏",
};

const pageTitle = computed(() => pageTitles[route.path] || "AI 面试准备助手");

onMounted(() => {
  if (authStore.token) {
    authStore.fetchProfile();
  }
});
</script>

<style>
#app {
  height: 100vh;
}

.guest-layout {
  min-height: 100vh;
}

.app-layout {
  display: flex;
  height: 100vh;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 99;
  transition: background 0.3s ease;
  pointer-events: none;
}

.overlay.visible {
  background: rgba(15, 23, 42, 0.45);
  pointer-events: auto;
}

/* === 移动端侧边栏 === */
@media (max-width: 1200px) {
  .overlay {
    display: block;
  }

  .app-layout .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    height: 100dvh;
    width: 280px;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: none;
  }

  .app-layout .sidebar.open {
    transform: translateX(0);
    box-shadow: 4px 0 40px rgba(15, 23, 42, 0.25);
  }
}

@media (max-width: 768px) {
  #app {
    height: 100dvh;
  }

  .app-layout {
    height: 100dvh;
  }

  .main {
    min-width: 0;
  }
}

/* === 代码块 === */
.code-block-wrapper {
  position: relative;
  margin: 12px 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--color-surface-muted);
  border-bottom: 1px solid var(--color-border);
}

.code-lang {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.code-copy-btn {
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  cursor: pointer;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  font-weight: 500;
}

.code-copy-btn:hover {
  background: var(--color-border);
  color: var(--color-text-secondary);
}

.code-copy-btn.copied {
  color: var(--color-success);
}

.code-block-wrapper pre {
  margin: 0 !important;
  border-radius: 0 !important;
}

/* === 页面切换动画 === */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
