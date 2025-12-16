import { ChatVertexAI } from "@langchain/google-vertexai";
import { format } from "date-fns";
import { createAgent } from "langchain";

import { agentSchema, agentSystemPrompt } from "~/lib/prompts";
import { ChatService } from "~/lib/services";
import {
  createGetDiariesByDateTool,
  createGetMemoriesByDateTool,
  createSearchMemoriesTool,
} from "~/lib/tools";
import { getValidSession } from "~/utils/action";

export async function POST(request: Request) {
  const session = await getValidSession();
  const userId = session.user.id;

  const body = await request.json();
  const { chatId, message } = agentSchema.parse(body);

  const model = new ChatVertexAI({
    model: "gemini-2.5-flash",
    temperature: 0.2,
    maxReasoningTokens: 0,
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
    { messages: [{ role: "user", content: message }] },
    {
      encoding: "text/event-stream",
      streamMode: "messages",
    },
  );

  const { readable, writable } = new TransformStream();

  // 비동기로 스트림 처리
  (async () => {
    const reader = stream.getReader();
    const writer = writable.getWriter();
    let fullResponse = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          const chatService = new ChatService({ userId });
          await chatService.createMessage(chatId, {
            role: "assistant",
            content: fullResponse,
          });
          break;
        }

        if (value) {
          const text = new TextDecoder().decode(value);
          if (text.includes("data: ")) {
            const contents = JSON.parse(text.split("data: ")[1]) as {
              content: string;
              type: string;
            }[];

            if (contents[0].type === "ai") {
              fullResponse += contents[0].content;
              await writer.write(value);
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
    },
  });
}
