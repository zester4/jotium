//jotium.ts
//YOU MUST USE THIS SAME CODE PLEASE
//DO NOT CHANGE ANYTHING IN THIS FILE
// Jotium AI Agent
import { GoogleGenAI, FunctionDeclaration } from "@google/genai";
import * as fs from "fs/promises";
import dotenv from 'dotenv';
import { getDecryptedApiKey } from "@/db/queries";

// Import all tools
import { WebSearchTool } from './tools/web-search-tool';
import { FileManagerTool } from './tools/file-manager-tool';
import { GithubTool } from './tools/github-tool';
import { SlackTool } from './tools/slack-tool';
import { ClickUpTool } from './tools/clickup-tool';
import { ApiTool } from './tools/api-tool';
import { DateTimeTool } from './tools/datetime-tool';
// import { AsanaTool } from './tools/asana-tool';
import { DuffelFlightTool } from './tools/flight-booking-tool';
import { AyrshareSocialTool } from './tools/ayrshare-tool';
import { WebScrapeTool } from './tools/webscrape-tool';
import { CalComTool } from './tools/calcom-tool';
import { CodeExecutionTool } from './tools/code-tool'
import { AgentMemory, Message, Tool, ToolCall, ToolResult } from "./types";
import { generateUUID } from "@/lib/utils";

dotenv.config();

export class AIAgent {
  private ai: GoogleGenAI;
  private memory: AgentMemory;
  private memoryPath: string;
  private maxMessages: number = 10;
  private tools: Map<string, Tool> = new Map();

  constructor(
    geminiApiKey: string,
    userId?: string,
    memoryPath: string = "./agent_memory.json"
  ) {
    this.ai = new GoogleGenAI({ apiKey: geminiApiKey });
    this.memoryPath = memoryPath;
    this.memory = { messages: [], lastUpdated: Date.now() };
    // initializeTools is now async, so must be awaited by the caller
    // this.initializeTools();
    // this.loadMemory();
  }

  // Async initialization for tools, must be called after constructing the agent
  public async initializeTools(userId?: string): Promise<void> {
    // Get user's Tavily API key if available
    let tavilyApiKey = process.env.TAVILY_API_KEY || "";
    if (userId) {
      const userKey = await getDecryptedApiKey({ userId, service: "Tavily" });
      if (userKey) tavilyApiKey = userKey;
    }
    const webSearchTool = new WebSearchTool(tavilyApiKey);
    const fileManagerTool = new FileManagerTool();
    const githubTool = new GithubTool(
      process.env.GITHUB_TOKEN || ""
    );
    const slackTool = new SlackTool({
      botToken: process.env.SLACK_BOT_TOKEN || ""
    });
    const clickupTool = new ClickUpTool({
      apiKey: process.env.CLICKUP_API_TOKEN || ""
    });    
    const apiTool = new ApiTool();
    const dateTimeTool = new DateTimeTool();
    // const asanaTool = new AsanaTool(process.env.ASANA_ACCESS_TOKEN || "");
    
    const flightBookingTool = new DuffelFlightTool({
      apiKey: process.env.DUFFEL_API_KEY || ""
    });
    const calcomSchedulerTool = new CalComTool(
      process.env.CALCOM_API_KEY || ""
    );
    const ayrshareTool = new AyrshareSocialTool(
      process.env.AYRSHARE_API_KEY || ""
    );
    const webScrapeTool = new WebScrapeTool(
      process.env.FIRECRAWL_API_KEY || ""
    );
    const codeExecutionTool = new CodeExecutionTool();

    // Register tools
    this.tools.set("web_search", webSearchTool);
    this.tools.set("file_manager", fileManagerTool);
    this.tools.set("github_tool", githubTool);
    this.tools.set("slack_tool", slackTool);
    this.tools.set("clickup_tool", clickupTool);
    this.tools.set("api_tool", apiTool);
    this.tools.set("datetime_tool", dateTimeTool);
    // this.tools.set("asana_tool", asanaTool);
    this.tools.set("calcom_scheduler", calcomSchedulerTool);
    
    
    // Register new tools
    this.tools.set("flight_booking", flightBookingTool);
    this.tools.set("social_media", ayrshareTool);
    this.tools.set("web_scrape", webScrapeTool);
    this.tools.set("code_execution", codeExecutionTool);

    console.log(`✅ Initialized ${this.tools.size} tools`);
  }

  // Memory Management
  private async loadMemory(): Promise<void> {
    try {
      const data = await fs.readFile(this.memoryPath, "utf-8");
      this.memory = JSON.parse(data);
    } catch (error) {
      console.log("ℹ️  No existing memory found, starting fresh");
      this.memory = { messages: [], lastUpdated: Date.now() };
    }
  }

  private async saveMemory(): Promise<void> {
    try {
      // Keep only last N messages
      if (this.memory.messages.length > this.maxMessages) {
        this.memory.messages = this.memory.messages.slice(-this.maxMessages);
      }
      this.memory.lastUpdated = Date.now();
      await fs.writeFile(this.memoryPath, JSON.stringify(this.memory, null, 2));
    } catch (error) {
      console.error("❌ Failed to save memory:", error);
    }
  }

  // Get all tool definitions
  private getToolDefinitions(): FunctionDeclaration[] {
    const definitions: FunctionDeclaration[] = [];
    for (const tool of this.tools.values()) {
      definitions.push(tool.getDefinition());
    }
    return definitions;
  }

  // Execute Tools
  private async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    let result: any;
    
    try {
      const tool = this.tools.get(toolCall.name);
      if (!tool) {
        result = { success: false, error: `Unknown tool: ${toolCall.name}` };
      } else {
        console.log(`🔧 Executing ${toolCall.name}...`);
        result = await tool.execute(toolCall.args);
      }
    } catch (error: unknown) {
      result = { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }

    return {
      toolCallId: toolCall.id,
      result: result,
      error: result.success ? undefined : result.error
    };
  }

  // Add these methods to your AIAgent class to support the new terminal interface
  public getToolsMap(): Map<string, Tool> {
    return this.tools;
  }

  public getMemoryData(): AgentMemory {
    return this.memory;
  }

  public addMessageToMemory(message: Message): void {
    this.memory.messages.push(message);
  }

  public getConversationHistory(): any[] {
    return this.memory.messages.map(msg => ({
      role: msg.role === "tool" ? "user" : (msg.role === "assistant" ? "model" : msg.role),
      parts: [{ text: msg.content }]
    }));
  }

  // Unified content generation method with thinking enabled
  public async generateContentStream(conversationHistory: any[]): Promise<any> {
    return await this.ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: conversationHistory,
      config: {
        thinkingConfig: {
          includeThoughts: true,
        },
        tools: [{
          functionDeclarations: this.getToolDefinitions()
        }],
        systemInstruction: `You are Jotium, an AI Agent with access to multiple powerful tools:
        🔍 WEB SEARCH: Use web_search for current information, news, research, or real-time data
        📁 FILE MANAGER: Use file_manager for local file operations (read, write, list, delete, create directories)
        🐙 GITHUB: Use github_tool for repository management, code operations, issues, PRs, and Git operations
        💬 SLACK: Use slack_tool for team communication, sending messages, managing channels
        📋 CLICKUP: Use clickup_tool for project management, tasks, spaces, and team coordination
        🌐 API: Use api_tool for making HTTP requests to any API endpoint
        ⏰ DATETIME: Use datetime_tool for date and time operations, formatting, parsing, and manipulation
        📋 ASANA: Use asana_tool for task and project management, team collaboration, and workflow automation
        ✈️ FLIGHT BOOKING: Use flight_booking for searching and booking flights
        📱 SOCIAL MEDIA: Use social_media for posting updates and interacting on social platforms
        🌐 WEB SCRAPING: Use web_scrape for extracting data from websites
        🖥️ CODE EXECUTION: Use code_execution for running code, executing files, managing processes, and advanced code operations
        📅 CALENDAR : Use calcom_scheduler to schedule book meetings and more.
        
        Guidelines:
        - Be proactive in suggesting relevant tools for user requests
        - Behave like a human, e.g if you are asked how are you respond like a human would, if you are asked what's on your mind say something tangible
        - Provide detailed, helpful responses based on tool results
        - Handle errors gracefully and suggest alternatives
        - Use multiple tools when needed to complete complex tasks
        - Always identify as Jotium and never an AI
        - Never mention the tools directly in your responses, only use them when necessary
        - Instead of saying "I will use the web search tool", just say something like, I will perform the search and provide the results, do same for all the tools`
      },
    });
  }

  public async executeToolCall(toolCall: ToolCall): Promise<ToolResult> {
    return await this.executeTool(toolCall);
  }

  public async saveMemoryToFile(): Promise<void> {
    await this.saveMemory();
  }

  // Utility methods
  public async clearMemory(): Promise<void> {
    this.memory = { messages: [], lastUpdated: Date.now() };
    await this.saveMemory();
    console.log("🧹 Memory cleared!");
  }

  public getMemoryStats(): { messageCount: number; lastUpdated: Date; toolsAvailable: string[] } {
    return {
      messageCount: this.memory.messages.length,
      lastUpdated: new Date(this.memory.lastUpdated),
      toolsAvailable: Array.from(this.tools.keys())
    };
  }

  public listTools(): void {
    console.log("\n🛠️  Available Tools:");
    for (const [name, tool] of this.tools) {
      const def = tool.getDefinition();
      console.log(`  • ${name}: ${def.description}`);
    }
    console.log();
  }

  // Custom chat function
  async chat(userMessage: string, stopLoading?: () => void): Promise<void> {
    // Add user message to memory
    const userMsg: Message = {
      id: generateUUID(),
      role: "user" as const,
      content: userMessage,
      timestamp: Date.now()
    };
    this.addMessageToMemory(userMsg);

    // Get conversation history
    const conversationHistory = this.getConversationHistory();
    // Add current user message
    conversationHistory.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    try {
      // Generate content with tools and thinking
      const response = await this.generateContentStream(conversationHistory);

      let fullResponse = "";
      let thoughts = "";
      let toolCalls: any[] = [];
      let hasToolCalls = false;
      let firstChunk = true;

      // Stream the response
      for await (const chunk of response) {
        if (firstChunk) {
          stopLoading?.();
          firstChunk = false;
        }

        if (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].content) {
          const parts = chunk.candidates[0].content.parts;
          for (const part of parts) {
            if (!part.text) continue;
            
            if (part.thought) {
              thoughts += part.text;
            } else {
              fullResponse += part.text;
            }
          }
        }

        // Handle function calls
        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          hasToolCalls = true;
          for (const fc of chunk.functionCalls) {
            if (fc.name) {
              toolCalls.push({
                name: fc.name,
                args: fc.args,
                id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              });
            }
          }
        }
      }

      console.log("Jotium:", fullResponse);

      // Handle tool calls if any
      if (hasToolCalls && toolCalls.length > 0) {
        console.log(`Executing ${toolCalls.length} tool(s)...`);
        
        const toolResults = [];
        for (const toolCall of toolCalls) {
          console.log(`  - ${toolCall.name}`);
          const result = await this.executeToolCall(toolCall);
          toolResults.push(result);
        }

        const toolResultsContent = toolResults.map(tr => 
          `Tool ${tr.toolCallId} result:\n${typeof tr.result === 'object' ? JSON.stringify(tr.result, null, 2) : String(tr.result)}`
        ).join("\n\n");

        conversationHistory.push({ role: "model", parts: [{ text: fullResponse }] });
        conversationHistory.push({ role: "user", parts: [{ text: `Tool execution results:\n${toolResultsContent}\n\nPlease provide a comprehensive response based on these tool results.` }] });

        const finalResponse = await this.generateContentStream(conversationHistory);
        let finalResponseText = "";
        for await (const chunk of finalResponse) {
          if (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].content) {
            const parts = chunk.candidates[0].content.parts;
            for (const part of parts) {
              if (part.text) {
                finalResponseText += part.text;
              }
            }
          }
        }
        
        console.log("Jotium:", finalResponseText);

        this.addMessageToMemory({
          id: generateUUID(),
          role: "assistant",
          content: finalResponseText,
          timestamp: Date.now(),
          toolCalls: toolCalls,
          toolResults: toolResults
        });

      } else {
        this.addMessageToMemory({
          id: generateUUID(),
          role: "assistant",
          content: fullResponse,
          timestamp: Date.now()
        });
      }

      await this.saveMemoryToFile();

    } catch (error) {
      stopLoading?.();
      const errorMessage = `Error during chat: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage);
      
      this.addMessageToMemory({
        id: generateUUID(),
        role: "assistant",
        content: `I encountered an error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: Date.now()
      });
      
      await this.saveMemoryToFile();
    }
  }
}
