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
  interviewerId?: string;
  interviewerLabel?: string;
  references?: InterviewReference[];
}

export interface InterviewSummary {
  markdown: string;
  createdAt: string;
  references: InterviewReference[];
}

export interface InterviewSkill {
  id: string;
  label: string;
  instruction: string;
}

export interface InterviewerPresetConfig {
  id: string;
  label: string;
  title: string;
  agencyRoles: string[];
  skills: string[];
  skillDetails: InterviewSkill[];
  style: string;
  personality: string;
  focusAreas: string[];
  evaluationDimensions: string[];
}

export interface InterviewPreset {
  id: string;
  label: string;
  summary: string;
  interviewerIds: string[];
  interviewers: InterviewerPresetConfig[];
}

export interface InterviewSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  jobDescription: string;
  focusHint: string;
  scopes: string[];
  presetId: string;
  presetLabel: string;
  presetSummary: string;
  currentInterviewerIndex: number;
  interviewers: InterviewerPresetConfig[];
  messages: InterviewMessage[];
  summary: InterviewSummary | null;
}

export const interviewBackendUrl =
  process.env.NEXT_PUBLIC_INTERVIEW_API_BASE || "http://127.0.0.1:3334";

export const defaultInterviewPresetId = "senior-frontend";
