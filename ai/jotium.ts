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
import { AsanaTool } from './tools/asana-tool';
import { DuffelFlightTool } from './tools/flight-booking-tool';
import { AyrshareSocialTool } from './tools/ayrshare-tool';
import { WebScrapeTool } from './tools/webscrape-tool';
import { CalComTool } from './tools/calcom-tool';
import { CodeExecutionTool } from './tools/code-tool';
import { AgentMemory, Message, Tool, ToolCall, ToolResult } from "./types";
import { generateUUID } from "@/lib/utils";
import { ImageGenerationTool } from './tools/image-gen';
import { GetWeatherTool } from './tools/get-weather';
import { NotionTool } from './tools/notion-tool';
import { StripeManagementTool } from './tools/stripe-tool';
import { AlphaVantageTool } from './tools/alphavantage-tool';
import { AirtableTool } from './tools/airtable-tool';
import { SupabaseTool } from './tools/supabase-tool';

dotenv.config();

export class AIAgent {
  private ai: GoogleGenAI;
  private memory: AgentMemory;
  private memoryPath: string;
  private maxMessages: number = 10;
  private tools: Map<string, Tool> = new Map();
  private model: string;

  constructor(
    geminiApiKey: string,
    userId?: string,
    memoryPath: string = "./agent_memory.json",
    model: string = "gemini-2.0-flash"
  ) {
    this.ai = new GoogleGenAI({ apiKey: geminiApiKey });
    this.memoryPath = memoryPath;
    this.memory = { messages: [], lastUpdated: Date.now() };
    this.model = model;
    // initializeTools is now async, so must be awaited by the caller
    // this.initializeTools();
    // this.loadMemory();
  }

  // Async initialization for tools, must be called after constructing the agent
  public async initializeTools(userId?: string): Promise<void> {
    // --- Group 1: Excluded Tools (initialized from .env only) ---
    if (process.env.TAVILY_API_KEY) {
      this.tools.set("web_search", new WebSearchTool(process.env.TAVILY_API_KEY));
    }
    if (process.env.FIRECRAWL_API_KEY) {
      this.tools.set("web_scrape", new WebScrapeTool(process.env.FIRECRAWL_API_KEY));
    }
    if (process.env.ALPHAVANTAGE_API_KEY) {
      const tool = new AlphaVantageTool(process.env.ALPHAVANTAGE_API_KEY);
      this.tools.set("alphavantage_tool", tool);
      this.tools.set(tool.getDefinition().name || "alphavantage_data", tool);
    }
    if (process.env.GEMINI_API_KEY) {
      this.tools.set("generate_image", new ImageGenerationTool(process.env.GEMINI_API_KEY));
    }
    if (process.env.DUFFEL_API_KEY) {
      this.tools.set("flight_booking", new DuffelFlightTool({ apiKey: process.env.DUFFEL_API_KEY }));
    }
    
    // --- Group 2: Tools without API Keys ---
    this.tools.set("file_manager", new FileManagerTool());
    this.tools.set("api_tool", new ApiTool());
    this.tools.set("get_weather", new GetWeatherTool());
    this.tools.set("code_execution", new CodeExecutionTool());
    this.tools.set("datetime_tool", new DateTimeTool());

    // --- Group 3: User-Configurable Tools (user key OR .env fallback) ---
    const getKey = async (serviceName: string, envVar: string): Promise<string> => {
      if (userId) {
        const userKey = await getDecryptedApiKey({ userId, service: serviceName });
        if (userKey) return userKey;
      }
      return process.env[envVar] || "";
    };

    // Airtable
    const airtableKey = await getKey("Airtable", "AIRTABLE_API_KEY");
    if (airtableKey) this.tools.set("airtable_tool", new AirtableTool(airtableKey));

    // Ayrshare
    const ayrshareKey = await getKey("Ayrshare", "AYRSHARE_API_KEY");
    if (ayrshareKey) this.tools.set("social_media", new AyrshareSocialTool(ayrshareKey));

    // Cal.com
    const calcomKey = await getKey("Cal.com", "CALCOM_API_KEY");
    if (calcomKey) this.tools.set("calcom_scheduler", new CalComTool(calcomKey));

    // GitHub
    const githubKey = await getKey("GitHub", "GITHUB_TOKEN");
    if (githubKey) {
      const tool = new GithubTool(githubKey);
      this.tools.set("github_tool", tool);
      this.tools.set(tool.getDefinition().name || "github_operations", tool);
    }

    // Notion
    const notionKey = await getKey("Notion", "NOTION_API_KEY");
    if (notionKey) {
      const tool = new NotionTool(notionKey);
      this.tools.set("notion_tool", tool);
      this.tools.set(tool.getDefinition().name || "notion_workspace", tool);
    }

    // Stripe
    const stripeKey = await getKey("Stripe", "STRIPE_SECRET_KEY");
    if (stripeKey) {
      const tool = new StripeManagementTool(stripeKey);
      this.tools.set("stripe_tool", tool);
      this.tools.set(tool.getDefinition().name || "stripe_management", tool);
    }

    // ClickUp
    const clickupKey = await getKey("ClickUp", "CLICKUP_API_TOKEN");
    if (clickupKey) this.tools.set("clickup_tool", new ClickUpTool({ apiKey: clickupKey }));

    // Slack
    const slackKey = await getKey("Slack", "SLACK_BOT_TOKEN");
    if (slackKey) {
      const tool = new SlackTool({ botToken: slackKey });
      this.tools.set("slack_tool", tool);
      this.tools.set(tool.getDefinition().name || "slack_action", tool);
    }

    // Supabase
    const supabaseUrl = await getKey("Supabase URL", "SUPABASE_URL");
    const supabaseKey = await getKey("Supabase Key", "SUPABASE_KEY");
    if (supabaseUrl && supabaseKey) {
      this.tools.set("supabase_database", new SupabaseTool(supabaseUrl, supabaseKey));
    }

    // Asana
    const asanaKey = await getKey("Asana", "ASANA_API_KEY");
    if (asanaKey) this.tools.set("asana_tool", new AsanaTool(asanaKey));

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
    const includeThoughts = this.model !== 'gemini-2.0-flash';
    return await this.ai.models.generateContentStream({
      model: this.model,
      contents: conversationHistory,
      config: {
        thinkingConfig: {
          includeThoughts: includeThoughts,
        },
        tools: [{
          functionDeclarations: this.getToolDefinitions()
        }],
        systemInstruction: `Your name is Jotium, an AI Agent with access to multiple powerful tools:
        🔍 WEB SEARCH: Use web_search for current information, news, research, or real-time data
        📁 FILE MANAGER: Use file_manager for local file operations (read, write, list, delete, create directories)
        🐙 GITHUB: Use github_tool for repository management, code operations, issues, PRs, and Git operations
        💬 SLACK: Use slack_tool for team communication, sending messages, managing channels
        📋 CLICKUP: Use clickup_tool for project management, tasks, spaces, and team coordination
        🌐 API: Use api_tool for making HTTP requests to any API endpoint
        ⏰ DATETIME: Use datetime_tool for date and time operations, formatting, parsing, and manipulation
        📋 ASANA: Use asana_tool for task and project management, team collaboration, and workflow automation
        🗂️ AIRTABLE: Use airtable_tool for database management, creating, reading, updating, and deleting records
        ✈️ FLIGHT BOOKING: Use flight_booking for searching and booking flights
        📱 SOCIAL MEDIA: Use social_media for posting updates and interacting on social platforms
        🌐 WEB SCRAPING: Use web_scrape for extracting data from websites
        🖥️ CODE EXECUTION: Use code_execution for running code, executing files, managing processes, and advanced code operations
        📅 CALENDAR : Use calcom_scheduler to schedule book meetings and more.
        🖼️ IMAGE GENERATION: Use generate_image for creating, editing, or generating story-mode images with Gemini's capabilities
        ☀️ WEATHER: Use get_weather to fetch current weather, temperature, sunrise, sunset, and forecasts for any location
        🗂️ NOTION: Use notion_tool for workspace, database, page, and content management and more
        💳 STRIPE: Use stripe_tool for payments, subscriptions, invoices, and customer management
        🗄️ SUPABASE: Use supabase_database for managing Supabase database operations, authentication, storage, and real-time features
        
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
