import api from "./index";

export interface InterviewSession {
  id: string;
  userId: string;
  status: string;
  totalQuestions: number;
  currentIndex: number;
  topic?: string | null;
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
  turns?: InterviewTurn[];
  _count?: { turns: number };
}

export interface InterviewTurn {
  id: string;
  sessionId: string;
  index: number;
  question: string;
  answer?: string | null;
  feedback?: string | null;
  createdAt: string;
}

export async function createInterviewSession(totalQuestions = 3): Promise<{
  session: InterviewSession;
  question: string;
}> {
  const { data } = await api.post("/interview/sessions", { totalQuestions });
  return data;
}

export async function listInterviewSessions(): Promise<InterviewSession[]> {
  const { data } = await api.get("/interview/sessions");
  return data.sessions ?? [];
}

export async function getInterviewSession(
  id: string,
): Promise<InterviewSession> {
  const { data } = await api.get(`/interview/sessions/${id}`);
  return data.session;
}

export async function submitInterviewAnswer(
  sessionId: string,
  answer: string,
): Promise<{
  feedback: string;
  nextQuestion: string;
  done: boolean;
  turn: InterviewTurn;
  currentIndex: number;
  totalQuestions: number;
}> {
  const { data } = await api.post(`/interview/sessions/${sessionId}/answer`, {
    answer,
  });
  return data;
}
