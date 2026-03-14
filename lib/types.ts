export interface ToolCallEvent {
  id?: string;
  name: string;
  args?: Record<string, unknown>;
  content?: string;
  status?: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: string;
  content: string;
  thinking?: string | null;
  toolCalls?: ToolCallEvent[] | null;
  isStreaming?: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
}

export type StreamChunk =
  | { type: "thinking"; content: string }
  | { type: "message"; content: string }
  | { type: "tool_call"; toolCall: ToolCallEvent };
