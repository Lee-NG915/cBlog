export interface InterviewSourceSummary {
  sourceId: string;
  label: string;
  kind: string;
  available: boolean;
  fileCount: number;
  chunkCount: number;
}

export interface InterviewReference {
  sourceId: string;
  sourceLabel: string;
  title: string;
  path: string;
  kind: string;
  excerpt: string;
}

export interface InterviewMessage {
  role: "assistant" | "candidate";
  content: string;
  createdAt: string;
  references?: InterviewReference[];
}

export interface InterviewSummary {
  markdown: string;
  createdAt: string;
  references: InterviewReference[];
}

export interface InterviewSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  jobDescription: string;
  mode: string;
  focusHint: string;
  scopes: string[];
  messages: InterviewMessage[];
  summary: InterviewSummary | null;
}

export const interviewBackendUrl =
  process.env.NEXT_PUBLIC_INTERVIEW_API_BASE || "http://127.0.0.1:3334";

export const interviewModes = [
  { value: "technical", label: "技术深挖" },
  { value: "project-deep-dive", label: "项目追问" },
  { value: "architecture", label: "架构设计" },
  { value: "behavioral", label: "表达与行为面" },
] as const;
