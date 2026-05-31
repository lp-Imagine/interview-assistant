import { defineStore } from "pinia";
import { ref, computed } from "vue";
import router from "../router";
import {
  login as loginApi,
  register as registerApi,
  getMe,
  type AuthResponse,
} from "../api/auth";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("access_token"));
  const user = ref<AuthResponse["user"] | null>(null);
  const isAuthenticated = computed(() => !!token.value);

  function setAuth(data: AuthResponse) {
    token.value = data.access_token;
    user.value = data.user;
    localStorage.setItem("access_token", data.access_token);
  }

  function clearAuth() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("access_token");
  }

  async function login(email: string, password: string) {
    const data = await loginApi({ email, password });
    setAuth(data);
  }

  async function register(email: string, password: string, name?: string) {
    const data = await registerApi({ email, password, name });
    setAuth(data);
  }

  async function fetchProfile() {
    if (!token.value) return;
    try {
      user.value = await getMe();
    } catch {
      clearAuth();
    }
  }

  function logout() {
    clearAuth();
    router.push("/login");
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    fetchProfile,
    logout,
    clearAuth,
  };
});
