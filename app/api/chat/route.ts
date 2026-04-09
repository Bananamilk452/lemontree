import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { ChatVertexAI } from "@langchain/google-vertexai";
import { format } from "date-fns";
import { createAgent } from "langchain";
import { z } from "zod";

import { chat } from "~/lib/models/chat";
import { agentSystemPrompt } from "~/lib/prompts";
import { ChatService } from "~/lib/services";
import {
  createGetDiariesByDateTool,
  createGetMemoriesByDateTool,
  createSearchMemoriesTool,
} from "~/lib/tools";
import { getValidSession } from "~/utils/action";

import type { ToolCallEvent } from "~/lib/types";

const chatSchema = z.object({
  chatId: z.string().min(1),
  content: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getValidSession();
  const userId = session.user.id;

  const body = await request.json();
  const { chatId, content } = chatSchema.parse(body);

  // Fix 3: fetch chat history
  const previousMessages = await chat.findMessagesByChatId(chatId);
  const historyMessages = previousMessages.flatMap(
    (m): (HumanMessage | AIMessage | ToolMessage)[] => {
      if (m.role === "user") return [new HumanMessage(m.content)];
      const toolCalls = m.toolCalls as ToolCallEvent[] | null | undefined;
      if (toolCalls && toolCalls.length > 0) {
        return [
          new AIMessage({
            content: m.content,
            tool_calls: toolCalls.map((tc, i) => ({
              id: tc.id ?? `legacy_${i}`,
              name: tc.name,
              args: tc.args ?? {},
              type: "tool_call" as const,
            })),
          }),
          ...toolCalls.map(
            (tc, i) =>
              new ToolMessage({
                content: tc.content ?? "",
                tool_call_id: tc.id ?? `legacy_${i}`,
              }),
          ),
        ];
      }
      return [new AIMessage(m.content)];
    },
  );

  // Save user message
  const chatService = new ChatService({ userId });
  await chatService.createMessage(chatId, { role: "user", content });

  const model = new ChatVertexAI({
    model: "gemini-3-flash-preview",
    temperature: 0.2,
    maxReasoningTokens: 0,
    location: "global",
  });

  const getMemoriesByDateTool = createGetMemoriesByDateTool(userId);
  const searchMemoriesTool = createSearchMemoriesTool(userId);
  const getDiariesByDateTool = createGetDiariesByDateTool(userId);
  const agent = createAgent({
    model,
    tools: [getMemoriesByDateTool, searchMemoriesTool, getDiariesByDateTool],
    systemPrompt: agentSystemPrompt.replace(
      "{{CURRENT_DATE}}",
      format(new Date(), "yyyy-MM-dd eeee"),
    ),
  });

  const stream = await agent.stream(
    {
      messages: [...historyMessages, new HumanMessage(content)],
    },
    {
      streamMode: ["messages", "updates"],
    },
  );

  const { readable, writable } = new TransformStream();

  (async () => {
    const reader = stream.getReader();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    let fullResponse = "";
    const toolCallsBuffer: ToolCallEvent[] = [];

    function sendChunk(chunk: object) {
      return writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
    }

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          await chatService.createMessage(chatId, {
            role: "assistant",
            content: fullResponse,
            toolCalls:
              toolCallsBuffer.length > 0
                ? (toolCallsBuffer as object[])
                : undefined,
          });
          break;
        }

        if (!value) continue;

        // value is [eventType, eventData] in streamMode array format
        const [eventType, eventData] = value as [string, unknown];

        if (eventType === "updates") {
          const updates = eventData as Record<string, unknown>;
          const toolsNode = updates.tools as
            | { messages?: unknown[] }
            | undefined;
          if (toolsNode?.messages) {
            for (const msg of toolsNode.messages) {
              const toolMsg = msg as {
                tool_call_id?: string;
                name?: string;
                content?: string;
              };
              // find the matching tool call name from buffer
              const tc: ToolCallEvent = {
                id: toolMsg.tool_call_id,
                name: toolMsg.name ?? "",
                content:
                  typeof toolMsg.content === "string" ? toolMsg.content : "",
              };
              const existing = toolCallsBuffer.find((t) => t.id === tc.id);
              if (existing) {
                existing.content = tc.content;
                existing.status = "done";
              } else {
                toolCallsBuffer.push(tc);
              }
              await sendChunk({ type: "tool_call", toolCall: tc });
            }
          }
        } else if (eventType === "messages") {
          const messages = eventData as unknown[];
          for (const msg of messages) {
            const m = msg as {
              type?: string;
              content?: string | { type?: string; text?: string }[];
            };
            if (m.type !== "ai") continue;

            const contents = Array.isArray(m.content)
              ? m.content
              : [{ type: "text", text: m.content as string }];

            for (const part of contents) {
              if (typeof part === "string") {
                fullResponse += part;
                await sendChunk({ type: "message", content: part });
              } else if (part.type === "text" && part.text) {
                if (part.text.startsWith("[Thought] ")) {
                  const thinkingText = part.text.slice("[Thought] ".length);
                  await sendChunk({ type: "thinking", content: thinkingText });
                } else {
                  fullResponse += part.text;
                  await sendChunk({ type: "message", content: part.text });
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("스트림 처리 오류:", error);
    } finally {
      writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
