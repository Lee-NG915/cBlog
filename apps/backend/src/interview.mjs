import { createChatCompletion } from "./openai.mjs";
import { formatChunkReferences, retrieveRelevantChunks } from "./knowledge-base.mjs";

function buildInterviewerModeLabel(mode) {
  switch (mode) {
    case "architecture":
      return "系统设计与架构追问";
    case "project-deep-dive":
      return "项目深挖与真实性验证";
    case "behavioral":
      return "行为面与表达复盘";
    default:
      return "技术深挖";
  }
}

function buildSystemPrompt({ session, references }) {
  return [
    "你是候选人的私人工程面试官与项目教练。",
    "你的目标不是给标准答案，而是逼候选人讲清楚：背景、约束、方案、权衡、风险、结果与个人贡献。",
    "你必须优先基于提供的博客、代码仓库和知识片段提问与追问；如果证据不足，要明确指出缺口。",
    "每次回复结构：1）先对候选人刚才的回答做简短点评；2）指出一个最值得深挖的点；3）提出下一个问题。",
    "不要一次问多个主问题，不要写成长篇报告，不要显得像 AI 助手。",
    "如果候选人的说法和资料不一致，直接指出并追问。",
    "如果候选人的回答太泛，要逼他举具体模块、接口、文件、指标或事故例子。",
    `当前模式：${buildInterviewerModeLabel(session.mode)}`,
    `目标岗位 JD：\n${session.jobDescription}`,
    `已选择的知识源：${session.scopes.join(", ") || "blog"}`,
    `参考资料：\n${formatChunkReferences(references)}`,
  ].join("\n\n");
}

function toChatMessages(session) {
  return session.messages.map((message) => ({
    role: message.role === "candidate" ? "user" : "assistant",
    content: message.content,
  }));
}

export async function generateOpeningTurn(session) {
  const references = retrieveRelevantChunks({
    query: `${session.jobDescription}\n${session.mode}\n${session.focusHint || ""}`,
    scopes: session.scopes,
  });

  const content = await createChatCompletion({
    system: buildSystemPrompt({ session, references }),
    messages: [
      {
        role: "user",
        content:
          "请先做一句很短的开场，然后直接开始第一个问题。第一问要优先结合 JD 和候选人现有博客/项目经验的交集。",
      },
    ],
    temperature: 0.7,
  });

  return {
    role: "assistant",
    content,
    references: references.map(({ text: _text, score: _score, ...reference }) => reference),
    createdAt: new Date().toISOString(),
  };
}

export async function generateInterviewReply(session, candidateAnswer) {
  const query = [
    session.jobDescription,
    session.mode,
    session.focusHint || "",
    candidateAnswer,
    session.messages
      .slice(-4)
      .map((message) => message.content)
      .join("\n"),
  ].join("\n\n");

  const references = retrieveRelevantChunks({
    query,
    scopes: session.scopes,
  });

  const content = await createChatCompletion({
    system: buildSystemPrompt({ session, references }),
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
    references: references.map(({ text: _text, score: _score, ...reference }) => reference),
    createdAt: new Date().toISOString(),
  };
}

export async function generateSessionSummary(session) {
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
      "## 下一轮建议重点追问",
      "## 建议补写到博客的内容",
      "## 可用于面试表达的更强表述",
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
    references: references.map(({ text: _text, score: _score, ...reference }) => reference),
    createdAt: new Date().toISOString(),
  };
}
