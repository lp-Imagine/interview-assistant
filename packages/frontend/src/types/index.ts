export const DocumentType = {
  RESUME: "RESUME",
  JD: "JD",
  INTERVIEW_EXP: "INTERVIEW_EXP",
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const DocumentStatus = {
  UPLOADED: "UPLOADED",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
export type DocumentStatus =
  (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const QuestionCategory = {
  FUNDAMENTAL: "FUNDAMENTAL",
  PROJECT: "PROJECT",
  SCENARIO: "SCENARIO",
  COMPREHENSIVE: "COMPREHENSIVE",
} as const;
export type QuestionCategory =
  (typeof QuestionCategory)[keyof typeof QuestionCategory];

export const QuestionCategoryLabel: Record<QuestionCategory, string> = {
  [QuestionCategory.FUNDAMENTAL]: "基础八股",
  [QuestionCategory.PROJECT]: "项目深挖",
  [QuestionCategory.SCENARIO]: "场景题",
  [QuestionCategory.COMPREHENSIVE]: "综合题",
};

export interface Document {
  id: string;
  userId: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  status: DocumentStatus;
  createdAt: string;
  analysis?: AnalysisResult;
}

export interface AnalysisResult {
  id: string;
  documentId: string;
  techStack: string[];
  keywords: string[];
  summary?: string;
}

export interface Question {
  id: string;
  userId: string;
  category: QuestionCategory;
  title: string;
  frequency?: string | null;
  batchIndex: number;
  createdAt: string;
  answers?: QuestionAnswer[];
}

export const FrequencyLabel: Record<string, string> = {
  高: "高频",
  中: "中频",
  低: "低频",
};

export interface QuestionAnswer {
  id: string;
  questionId: string;
  answer: string;
  structure?: Array<{ step: number; content: string }>;
  followUps: string[];
  insight?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  categoryCounts?: Record<string, number>;
}

export interface SSEResponse {
  type: "answer" | "structure" | "followUps" | "insight" | "done" | "error";
  content: any;
  message?: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  question: string;
  answer: string;
  structure?: Array<{ step: number; content: string }> | null;
  followUps: string[];
  insight?: string | null;
  followUpThreads?: Array<{
    id: string;
    question: string;
    answer: string;
    isStreaming: boolean;
  }> | null;
  createdAt: string;
}
