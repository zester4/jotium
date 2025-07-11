import { FunctionDeclaration } from "@google/genai";

export interface Message {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  timestamp: number;
  thoughts?: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  duration?: number; // Duration in ms for assistant's thought/response
}

export interface ToolCall {
  name: string;
  args: any;
  id: string;
}

export interface ToolResult {
  toolCallId: string;
  result: any;
  error?: string;
}

export interface AgentMemory {
  messages: Message[];
  lastUpdated: number;
}

export interface Tool {
  getDefinition(): FunctionDeclaration;
  execute(args: any): Promise<any>;
}
