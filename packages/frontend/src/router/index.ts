import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../pages/LoginPage.vue"),
      meta: { guest: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../pages/RegisterPage.vue"),
      meta: { guest: true },
    },
    {
      path: "/",
      name: "home",
      component: () => import("../pages/HomePage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/workspace",
      name: "workspace",
      component: () => import("../pages/WorkspacePage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/qa",
      name: "qa",
      component: () => import("../pages/QAPage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/materials",
      name: "materials",
      component: () => import("../pages/MaterialsPage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/favorites",
      name: "favorites",
      component: () => import("../pages/FavoritesPage.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("access_token");

  if (to.meta.requiresAuth && !token) {
    next({ name: "login", query: { redirect: to.fullPath } });
  } else if (to.meta.guest && token) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
