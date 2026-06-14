import { ProxyAgent, fetch as undiciFetch } from "undici";
import { openAIConfig, proxyConfig } from "./config.mjs";

let proxyDispatcher = null;

function getProxyDispatcher() {
  if (!proxyConfig.url) {
    return undefined;
  }

  if (!proxyDispatcher) {
    proxyDispatcher = new ProxyAgent(proxyConfig.url);
  }

  return proxyDispatcher;
}

export async function createChatCompletion({
  system,
  messages,
  temperature = 0.6,
}) {
  if (!openAIConfig.apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured for the local interview backend.",
    );
  }

  const dispatcher = getProxyDispatcher();
  const response = await undiciFetch(
    `${openAIConfig.baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: openAIConfig.model,
        temperature,
        messages: [
          {
            role: "system",
            content: system,
          },
          ...messages,
        ],
      }),
      ...(dispatcher ? { dispatcher } : {}),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorBody}`);
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content?.trim() || "";
}
