import http from "node:http";
import fs from "node:fs";
import { buildKnowledgeBase, getSourceSummaries } from "./knowledge-base.mjs";
import { serverConfig, paths } from "./config.mjs";
import { createSession, readSession, saveSession } from "./sessions.mjs";
import {
  generateInterviewReply,
  generateInterviewerSwitchTurn,
  generateOpeningTurn,
  generateSessionSummary,
  initializeSessionConfiguration,
} from "./interview.mjs";
import { getInterviewerPresets } from "./interviewers.mjs";

fs.mkdirSync(paths.sessionsDir, { recursive: true });

function sendJson(response, statusCode, payload, origin) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  response.end(JSON.stringify(payload));
}

function isLocalDevOrigin(origin) {
  try {
    const { hostname, protocol } = new URL(origin);
    return (
      (protocol === "http:" || protocol === "https:") &&
      (hostname === "localhost" || hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

function getAllowedOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) {
    return "*";
  }

  if (serverConfig.allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) {
    return origin;
  }

  return serverConfig.allowedOrigins[0];
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = http.createServer(async (request, response) => {
  const origin = getAllowedOrigin(request);

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {}, origin);
    return;
  }

  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(
        response,
        200,
        {
          ok: true,
          builtAt: buildKnowledgeBase().builtAt,
        },
        origin
      );
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/sources") {
      sendJson(
        response,
        200,
        {
          sources: getSourceSummaries(),
        },
        origin
      );
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/sources/reindex") {
      const knowledge = buildKnowledgeBase({ force: true });
      sendJson(
        response,
        200,
        {
          builtAt: knowledge.builtAt,
          sources: knowledge.sources,
        },
        origin
      );
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/interview/presets") {
      sendJson(
        response,
        200,
        {
          presets: getInterviewerPresets(),
        },
        origin
      );
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/interview/sessions") {
      const body = await readJsonBody(request);
      const session = createSession({
        jobDescription: body.jobDescription || "",
        focusHint: body.focusHint || "",
        scopes:
          Array.isArray(body.scopes) && body.scopes.length > 0
            ? body.scopes
            : ["blog"],
        ...initializeSessionConfiguration(body),
      });

      const opening = await generateOpeningTurn(session);
      session.messages.push(opening);
      saveSession(session);

      sendJson(response, 201, { session }, origin);
      return;
    }

    const sessionMatch = url.pathname.match(/^\/api\/interview\/sessions\/([^/]+)$/);
    if (request.method === "GET" && sessionMatch) {
      const session = readSession(sessionMatch[1]);
      if (!session) {
        sendJson(response, 404, { error: "Session not found" }, origin);
        return;
      }

      sendJson(response, 200, { session }, origin);
      return;
    }

    const messageMatch = url.pathname.match(
      /^\/api\/interview\/sessions\/([^/]+)\/message$/
    );
    if (request.method === "POST" && messageMatch) {
      const session = readSession(messageMatch[1]);
      if (!session) {
        sendJson(response, 404, { error: "Session not found" }, origin);
        return;
      }

      const body = await readJsonBody(request);
      const candidateMessage = {
        role: "candidate",
        content: body.answer || "",
        createdAt: new Date().toISOString(),
      };

      session.messages.push(candidateMessage);
      const reply = await generateInterviewReply(session, candidateMessage.content);
      session.messages.push(reply);
      saveSession(session);

      sendJson(response, 200, { session }, origin);
      return;
    }

    const switchMatch = url.pathname.match(
      /^\/api\/interview\/sessions\/([^/]+)\/switch$/
    );
    if (request.method === "POST" && switchMatch) {
      const session = readSession(switchMatch[1]);
      if (!session) {
        sendJson(response, 404, { error: "Session not found" }, origin);
        return;
      }

      const totalInterviewers = session.interviewers?.length || 0;
      if (totalInterviewers === 0) {
        sendJson(response, 400, { error: "No interviewers configured" }, origin);
        return;
      }

      session.currentInterviewerIndex =
        (session.currentInterviewerIndex + 1) % totalInterviewers;

      const switchTurn = await generateInterviewerSwitchTurn(session);
      session.messages.push(switchTurn);
      saveSession(session);

      sendJson(response, 200, { session }, origin);
      return;
    }

    const summaryMatch = url.pathname.match(
      /^\/api\/interview\/sessions\/([^/]+)\/summary$/
    );
    if (request.method === "POST" && summaryMatch) {
      const session = readSession(summaryMatch[1]);
      if (!session) {
        sendJson(response, 404, { error: "Session not found" }, origin);
        return;
      }

      const summary = await generateSessionSummary(session);
      session.summary = summary;
      saveSession(session);

      sendJson(response, 200, { session }, origin);
      return;
    }

    sendJson(response, 404, { error: "Not found" }, origin);
  } catch (error) {
    sendJson(
      response,
      500,
      {
        error: error instanceof Error ? error.message : "Unexpected server error",
      },
      getAllowedOrigin(request)
    );
  }
});

server.listen(serverConfig.port, serverConfig.host, () => {
  console.log(
    `Interview backend listening on http://${serverConfig.host}:${serverConfig.port}`
  );
});
