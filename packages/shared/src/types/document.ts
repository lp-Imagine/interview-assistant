export enum DocumentType {
  RESUME = "RESUME",
  JD = "JD",
  INTERVIEW_EXP = "INTERVIEW_EXP",
}

export enum DocumentStatus {
  UPLOADED = "UPLOADED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum QuestionCategory {
  FUNDAMENTAL = "FUNDAMENTAL",
  PROJECT = "PROJECT",
  SCENARIO = "SCENARIO",
  COMPREHENSIVE = "COMPREHENSIVE",
}

export interface Document {
  id: string;
  userId: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  status: DocumentStatus;
  createdAt: string;
}

export interface AnalysisResult {
  id: string;
  documentId: string;
  techStack: string[];
  keywords: string[];
  summary?: string;
}

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
}

export interface Question {
  id: string;
  userId: string;
  category: QuestionCategory;
  title: string;
  batchIndex: number;
  createdAt: string;
}

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
}
