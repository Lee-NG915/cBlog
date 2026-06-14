import { createChatCompletion } from "./openai.mjs";
import { formatChunkReferences, retrieveRelevantChunks } from "./knowledge-base.mjs";
import { resolveInterviewConfiguration } from "./interviewers.mjs";

function getCurrentInterviewer(session) {
  return session.interviewers?.[session.currentInterviewerIndex || 0] || null;
}

function buildSkillInstructions(interviewer) {
  return interviewer.skillDetails
    .map((skill) => `- ${skill.label}：${skill.instruction}`)
    .join("\n");
}

function buildSystemPrompt({ session, interviewer, references }) {
  return [
    "你现在不是通用 AI 助手，而是一个真实、有判断力的技术面试官。",
    "",
    "## 你的角色",
    `- 面试官：${interviewer.label}`,
    `- 职责定位：${interviewer.title}`,
    `- 风格：${interviewer.style}`,
    `- 性格：${interviewer.personality}`,
    `- Agency role 参考：${interviewer.agencyRoles.join(", ")}`,
    "",
    "## 本轮必须执行的 interviewer skills",
    buildSkillInstructions(interviewer),
    "",
    "## 面试上下文",
    `- 目标岗位：${session.presetLabel}`,
    `- 目标岗位 JD：\n${session.jobDescription}`,
    `- 用户特别想补强的点：${session.focusHint || "未额外指定"}`,
    `- 本轮知识源：${session.scopes.join(", ") || "blog"}`,
    `- 本轮重点考察：${interviewer.focusAreas.join("、")}`,
    `- 评估维度：${interviewer.evaluationDimensions.join("、")}`,
    "",
    "## 交互规则",
    "- 一次只问一个主问题。",
    "- 先对候选人刚才的回答做一句点评，再追问一个最有价值的问题。",
    "- 如果回答太泛，必须要求候选人落到真实模块、接口、文件、状态流、指标或事故。",
    "- 如果候选人说法和资料冲突，要直接指出冲突点。",
    "- 不要写成长篇报告，不要像客服，不要连续抛多个选择题。",
    "- 你的问题要让中大厂面试官愿意继续追问，而不是停留在概念背诵层面。",
    "",
    "## 参考资料",
    formatChunkReferences(references),
  ].join("\n");
}

function toChatMessages(session) {
  return session.messages.map((message) => ({
    role: message.role === "candidate" ? "user" : "assistant",
    content: message.content,
  }));
}

function stripReferencePayload(references) {
  return references.map(({ text: _text, score: _score, ...reference }) => reference);
}

function buildRetrievalQuery(session, interviewer, candidateAnswer = "") {
  return [
    session.jobDescription,
    session.focusHint || "",
    interviewer?.label || "",
    interviewer?.focusAreas?.join("\n") || "",
    candidateAnswer,
    session.messages.slice(-6).map((message) => message.content).join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function initializeSessionConfiguration(payload) {
  const configuration = resolveInterviewConfiguration({
    presetId: payload.presetId,
    interviewerIds: payload.interviewerIds,
  });

  return {
    presetId: configuration.presetId,
    presetLabel: configuration.presetLabel,
    presetSummary: configuration.presetSummary,
    interviewers: configuration.interviewers,
    currentInterviewerIndex: 0,
  };
}

export async function generateOpeningTurn(session) {
  const interviewer = getCurrentInterviewer(session);
  const references = retrieveRelevantChunks({
    query: buildRetrievalQuery(session, interviewer),
    scopes: session.scopes,
  });

  const content = await createChatCompletion({
    system: buildSystemPrompt({ session, interviewer, references }),
    messages: [
      {
        role: "user",
        content:
          "请先用一句自然的开场介绍你的面试视角，然后直接开始第一个问题。第一问要优先结合 JD、候选人的博客和项目证据，逼他讲出真实经历。",
      },
    ],
    temperature: 0.7,
  });

  return {
    role: "assistant",
    content,
    interviewerId: interviewer?.id || "",
    interviewerLabel: interviewer?.label || "",
    references: stripReferencePayload(references),
    createdAt: new Date().toISOString(),
  };
}

export async function generateInterviewReply(session, candidateAnswer) {
  const interviewer = getCurrentInterviewer(session);
  const references = retrieveRelevantChunks({
    query: buildRetrievalQuery(session, interviewer, candidateAnswer),
    scopes: session.scopes,
  });

  const content = await createChatCompletion({
    system: buildSystemPrompt({ session, interviewer, references }),
    messages: [
      ...toChatMessages(session),
      {
        role: "user",
        content: candidateAnswer,
      },
    ],
    temperature: 0.65,
  });

  return {
    role: "assistant",
    content,
    interviewerId: interviewer?.id || "",
    interviewerLabel: interviewer?.label || "",
    references: stripReferencePayload(references),
    createdAt: new Date().toISOString(),
  };
}

export async function generateInterviewerSwitchTurn(session) {
  const interviewer = getCurrentInterviewer(session);
  const references = retrieveRelevantChunks({
    query: buildRetrievalQuery(session, interviewer),
    scopes: session.scopes,
  });

  const content = await createChatCompletion({
    system: buildSystemPrompt({ session, interviewer, references }),
    messages: [
      {
        role: "user",
        content:
          "你是新切入的面试官。请先用一句话指出你最关注上一轮里候选人还没讲透的地方，然后直接提出一个更贴近你职责视角的问题。",
      },
    ],
    temperature: 0.65,
  });

  return {
    role: "assistant",
    content,
    interviewerId: interviewer?.id || "",
    interviewerLabel: interviewer?.label || "",
    references: stripReferencePayload(references),
    createdAt: new Date().toISOString(),
  };
}

export async function generateSessionSummary(session) {
  const interviewerSummary = session.interviewers
    .map(
      (interviewer) =>
        `- ${interviewer.label}: ${interviewer.focusAreas.join("、")} | 技能：${interviewer.skillDetails
          .map((skill) => skill.label)
          .join("、")}`
    )
    .join("\n");

  const references = retrieveRelevantChunks({
    query: [
      session.jobDescription,
      session.focusHint || "",
      session.messages.map((message) => message.content).join("\n"),
    ].join("\n\n"),
    scopes: session.scopes,
    limit: 10,
  });

  const transcript = session.messages
    .map((message) => `${message.role === "candidate" ? "Candidate" : "Interviewer"}: ${message.content}`)
    .join("\n\n");

  const content = await createChatCompletion({
    system: [
      "你是候选人的面试复盘教练。",
      "请输出 Markdown，总结必须具体、可执行，并直接指出候选人对项目理解薄弱的位置。",
      "输出固定结构：",
      "## 总体判断",
      "## 候选人讲得好的点",
      "## 暴露出的理解缺口",
      "## 各面试官视角下的风险点",
      "## 下一轮建议重点追问",
      "## 建议补写到博客的内容",
      "## 可用于面试表达的更强表述",
      `本次 interviewer pack：\n${interviewerSummary}`,
      `参考资料：\n${formatChunkReferences(references)}`,
    ].join("\n\n"),
    messages: [
      {
        role: "user",
        content: `目标岗位 JD：\n${session.jobDescription}\n\n面试记录：\n${transcript}`,
      },
    ],
    temperature: 0.5,
  });

  return {
    markdown: content,
    references: stripReferencePayload(references),
    createdAt: new Date().toISOString(),
  };
}
