import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Question, QuestionCategory } from "../types";
import {
  generateQuestions as generateApi,
  regenerateQuestions as regenerateApi,
  continueGeneration as continueApi,
  getQuestions as listApi,
  deleteQuestion as deleteApi,
  clearAllQuestions as clearApi,
} from "../api/questions";

export const useQuestionsStore = defineStore("questions", () => {
  const questions = ref<Question[]>([]);
  const currentQuestion = ref<Question | null>(null);
  const categoryFilter = ref<QuestionCategory | null>(null);
  const searchQuery = ref("");
  const isLoading = ref(false);
  const batchIndex = ref(0);
  const currentPage = ref(1);
  const totalCount = ref(0);
  const pageSize = ref(20);
  const categoryCounts = ref<Record<string, number>>({});

  const filteredQuestions = computed(() => questions.value);

  async function generateQuestions(batchSize = 20) {
    isLoading.value = true;
    try {
      const { data } = await generateApi(batchSize);
      questions.value = [...questions.value, ...data.questions];
      batchIndex.value = data.batchIndex;
      await refreshCounts();
    } finally {
      isLoading.value = false;
    }
  }

  async function regenerateQuestions(batchSize = 20) {
    isLoading.value = true;
    try {
      const { data } = await regenerateApi(batchSize);
      questions.value = data.questions;
      batchIndex.value = data.batchIndex;
      await refreshCounts();
    } finally {
      isLoading.value = false;
    }
  }

  async function continueGeneration(batchSize = 20) {
    isLoading.value = true;
    try {
      const { data } = await continueApi(batchSize);
      questions.value = [...questions.value, ...data.questions];
      batchIndex.value = data.batchIndex;
      await refreshCounts();
    } finally {
      isLoading.value = false;
    }
  }

  async function refreshCounts() {
    try {
      const { data } = await listApi({ pageSize: 1 });
      totalCount.value = data.total;
      categoryCounts.value = data.categoryCounts || {};
    } catch {
      // ignore
    }
  }

  async function fetchQuestions(params?: {
    category?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params?.page ?? currentPage.value;
    const ps = params?.pageSize ?? pageSize.value;
    const category =
      params?.category !== undefined
        ? params.category
        : categoryFilter.value || undefined;
    const search =
      params?.search !== undefined
        ? params.search
        : searchQuery.value || undefined;
    const { data } = await listApi({ category, search, page, pageSize: ps });
    questions.value = data.data;
    totalCount.value = data.total;
    currentPage.value = page;
    categoryCounts.value = data.categoryCounts || {};
  }

  function goToPage(page: number) {
    const maxPage = Math.max(1, Math.ceil(totalCount.value / pageSize.value));
    if (page < 1 || page > maxPage || page === currentPage.value) return;
    fetchQuestions({ page });
  }

  function setPageSize(size: number) {
    pageSize.value = size;
    currentPage.value = 1;
    fetchQuestions({ pageSize: size });
  }

  async function clearAllQuestions() {
    await clearApi();
    questions.value = [];
    currentQuestion.value = null;
    batchIndex.value = 0;
    totalCount.value = 0;
    categoryCounts.value = {};
  }

  async function deleteQuestion(id: string) {
    await deleteApi(id);
    questions.value = questions.value.filter((q) => q.id !== id);
    if (currentQuestion.value?.id === id) {
      currentQuestion.value = null;
    }
    await refreshCounts();
  }

  function selectQuestion(id: string) {
    const q = questions.value.find((q) => q.id === id);
    if (q) currentQuestion.value = q;
  }

  function markAnswered(questionId: string) {
    const q = questions.value.find((q) => q.id === questionId);
    if (q) {
      if (!q.answers) (q as any).answers = [];
      if (!q.answers!.some((a) => a.answer)) {
        q.answers!.push({
          id: "",
          questionId,
          answer: ".",
          followUps: [],
          createdAt: "",
        });
      }
    }
  }

  function setCategoryFilter(category: QuestionCategory | null) {
    categoryFilter.value = categoryFilter.value === category ? null : category;
    currentPage.value = 1;
    fetchQuestions();
  }

  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  function setSearchQuery(query: string) {
    searchQuery.value = query;
    currentPage.value = 1;
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      fetchQuestions();
    }, 300);
  }

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalCount.value / pageSize.value)),
  );

  return {
    questions,
    currentQuestion,
    categoryFilter,
    searchQuery,
    isLoading,
    batchIndex,
    currentPage,
    totalCount,
    totalPages,
    pageSize,
    categoryCounts,
    filteredQuestions,
    generateQuestions,
    regenerateQuestions,
    continueGeneration,
    fetchQuestions,
    goToPage,
    setPageSize,
    clearAllQuestions,
    deleteQuestion,
    selectQuestion,
    markAnswered,
    setCategoryFilter,
    setSearchQuery,
  };
});
