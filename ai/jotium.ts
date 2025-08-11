//jotium.ts
//YOU MUST USE THIS SAME CODE PLEASE
//DO NOT CHANGE ANYTHING IN THIS FILE
// Jotium AI Agent
import { GoogleGenAI, FunctionDeclaration } from "@google/genai";
import * as fs from "fs/promises";
import dotenv from 'dotenv';
import { getDecryptedApiKey, getDecryptedOAuthAccessToken } from "@/db/queries";

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
// import { WebScrapeTool } from './tools/webscrape-tool';
import { CalComTool } from './tools/calcom-tool';
import { CodeExecutionTool } from './tools/code-tool';
import { AgentMemory, Message, Tool, ToolCall, ToolResult } from "./types";
import { generateUUID } from "@/lib/utils";
import { ImageGenerationTool } from './tools/image-gen';
import { WeatherTool } from "./tools/WeatherTool";
import { NotionTool } from './tools/notion-tool';
import { StripeManagementTool } from './tools/stripe-tool';
import { AlphaVantageTool } from './tools/alphavantage-tool';
import { AirtableTool } from './tools/airtable-tool';
import { SupabaseTool } from './tools/supabase-tool';
import { TrelloTool } from './tools/trello';
import { LinearManagementTool } from './tools/linear-tool';
import { DataVisualizationTool } from './tools/dataviz-tool';
import { DuckDuckGoSearchTool } from './tools/DuckDuckGoSearchTool';
import { SerperSearchTool } from './tools/SerperSearchTool';
// Google OAuth Tools
import { GmailTool } from './tools/GmailTool';
import { GoogleCalendarTool } from './tools/GoogleCalendarTool';
import { GoogleDriveTool } from './tools/GoogleDriveTool';
import { GoogleSheetsTool } from './tools/GoogleSheetsTool';
import { StockTool } from './tools/StockTool';
import { PDFTool } from './tools/PDFTool';
import { FireWebScrapeTool } from './tools/FireWebScrapeTool';

// Import Enhanced Agentic Engine
import { EnhancedAgenticEngine, EnhancedActionIntent } from './actions';

dotenv.config();

export class AIAgent {
  private ai: GoogleGenAI;
  private memory: AgentMemory;
  private memoryPath: string;
  private maxMessages: number = 19;
  private tools: Map<string, Tool> = new Map();
  private model: string;
  private agenticEngine!: EnhancedAgenticEngine;
  private context: { currentDate: Date; userTimezone: string; domainExpertise: string[] };

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
    this.context = {
      currentDate: new Date(),
      userTimezone:
        (Intl.DateTimeFormat().resolvedOptions().timeZone as string) || 'UTC',
      domainExpertise: []
    };
    this.updateTemporalContext();
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
    // if (process.env.FIRECRAWL_API_KEY) {
    //   this.tools.set("fire_web_scrape", new FireWebScrapeTool(process.env.FIRECRAWL_API_KEY));
    // }
    if (process.env.ALPHAVANTAGE_API_KEY) {
      const tool = new AlphaVantageTool(process.env.ALPHAVANTAGE_API_KEY);
      this.tools.set("alphavantage_tool", tool);
    }
    if (process.env.GEMINI_API_KEY) {
      this.tools.set("generate_image", new ImageGenerationTool(process.env.GEMINI_API_KEY));
    }
    if (process.env.DUFFEL_API_KEY) {
      this.tools.set("flight_booking", new DuffelFlightTool({ apiKey: process.env.DUFFEL_API_KEY }));
    }
    
    // --- Group 2: Tools without API Keys ---
    // this.tools.set("file_manager", new FileManagerTool());
    this.tools.set("api_tool", new ApiTool());
    this.tools.set("get_weather", new WeatherTool());
    // this.tools.set("code_execution", new CodeExecutionTool());
    this.tools.set("datetime_tool", new DateTimeTool());
    this.tools.set("data_visualization", new DataVisualizationTool());
    this.tools.set("duckduckgo_search", new DuckDuckGoSearchTool());
    // Stocks & Maps (no API keys required for basic data)
    this.tools.set("get_stock_data", new StockTool());
    // this.tools.set("pdf_generator", new PDFTool());
    const serperApiKey = process.env.SERPER_API_KEY;
    if (serperApiKey) {
      const tool = new SerperSearchTool(serperApiKey);
      this.tools.set("serper_search", tool);
    }

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
    }

    // Notion
    const notionKey = await getKey("Notion", "NOTION_API_KEY");
    if (notionKey) {
      const tool = new NotionTool(notionKey);
      this.tools.set("notion_tool", tool);
    }

    // Stripe
    if (userId) {
        const stripeKey = await getDecryptedApiKey({ userId, service: "Stripe" });
        if (stripeKey) {
            const tool = new StripeManagementTool(stripeKey);
            this.tools.set("stripe_tool", tool);
        }
    }

    // ClickUp
    const clickupKey = await getKey("ClickUp", "CLICKUP_API_TOKEN");
    if (clickupKey) this.tools.set("clickup_tool", new ClickUpTool({ apiKey: clickupKey }));

    // Slack
    const slackKey = await getKey("Slack", "SLACK_BOT_TOKEN");
    if (slackKey) {
      const tool = new SlackTool({ botToken: slackKey });
      const toolName = tool.getDefinition().name;
      if (toolName) {
        this.tools.set(toolName, tool);
      }
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

    // Trello
    const trelloApiKey = await getKey("Trello", "TRELLO_API_KEY");
    const trelloToken = await getKey("Trello Token", "TRELLO_TOKEN");
    if (trelloApiKey && trelloToken) {
      const trelloTool = new TrelloTool({ apiKey: trelloApiKey, token: trelloToken });
      this.tools.set("trello_tool", trelloTool);
    }

    // Linear
    const linearKey = await getKey("Linear", "LINEAR_API_KEY");
    if (linearKey) {
      const linearTool = new LinearManagementTool(linearKey);
      this.tools.set("linear_management", linearTool);
    }

    // --- Group 4: OAuth Tools (require OAuth connection) ---
    if (userId) {
      // Check if user has Google OAuth connection (Gmail service)
      const googleAccessToken = await getDecryptedOAuthAccessToken({ 
        userId, 
        service: "gmail" 
      });
      
      if (googleAccessToken) {
        // Gmail Tool
        const gmailTool = new GmailTool(userId);
        const gmailToolName = gmailTool.getDefinition().name;
        if (gmailToolName) {
          this.tools.set(gmailToolName, gmailTool);
        }

        // Google Calendar Tool
        const calendarTool = new GoogleCalendarTool(userId);
        const calendarToolName = calendarTool.getDefinition().name;
        if (calendarToolName) {
          this.tools.set(calendarToolName, calendarTool);
        }

        // Google Drive Tool
        const driveTool = new GoogleDriveTool(userId);
        const driveToolName = driveTool.getDefinition().name;
        if (driveToolName) {
          this.tools.set(driveToolName, driveTool);
        }
        
        // Google Sheets Tool (uses same Gmail OAuth connection)
        const sheetsTool = new GoogleSheetsTool(userId);
        const sheetsToolName = sheetsTool.getDefinition().name;
        if (sheetsToolName) {
          this.tools.set(sheetsToolName, sheetsTool);
        }
      }

      // GitHub OAuth (if you want to add GitHub OAuth later)
      // const githubAccessToken = await getDecryptedOAuthAccessToken({ 
      //   userId, 
      //   service: "github" 
      // });
      // if (githubAccessToken) {
      //   // Add GitHub OAuth tool here
      // }

      // Slack OAuth
      // const slackAccessToken = await getDecryptedOAuthAccessToken({ 
      //   userId, 
      //   service: "slack" 
      // });
      // if (slackAccessToken) {
      //   // Add Slack OAuth tool here
      // }
    }

    console.log(`✅ Initialized ${this.tools.size} tools`);
    // Initialize the Agentic Decision Engine
    this.agenticEngine = new EnhancedAgenticEngine(this.tools);
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
    this.updateTemporalContext();
    this.extractDomainExpertise();
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
        systemInstruction: `You are Jotium, an autonomous PhD-level AI agent with expert reasoning capabilities across all domains. You embody the intelligence patterns of the most advanced AI systems, thinking with confidence, depth, and strategic foresight.

COGNITIVE FRAMEWORK:
   **ALWAYS SEARCH THE WEB**: You autonomously search the web for information, never asking users for basic context or obvious details.
   **MULTI-TOOL ORCHESTRATION**: You seamlessly chain multiple tools in parallel and sequence, executing complex workflows without hesitation.
   **INTELLIGENT ASSUMPTIONS**: You make smart assumptions about user intent and context, never asking for obvious information like dates or times.
   **COMPREHENSIVE RESEARCH**: You provide expert-level analysis with citations, multiple perspectives, and actionable insights, including relevant YouTube educational videos.
🧠 **Autonomous Intelligence**: You reason through complex problems independently, making intelligent assumptions and executing multi-step workflows without hesitation.
🎯 **Strategic Thinking**: You anticipate needs 3-5 steps ahead, proactively preparing comprehensive solutions.
🔬 **Expert-Level Analysis**: You provide research and analysis at PhD level depth, with citations, multiple perspectives, and actionable insights.
⚡ **Confident Execution**: You never ask for obvious information like dates, times, or basic context. You calculate and infer intelligently.

ENHANCED CAPABILITIES:
${this.generateCapabilityMap()}

TEMPORAL INTELLIGENCE:
- Current Date: ${this.context.currentDate.toLocaleDateString()}
- Current Time: ${this.context.currentDate.toLocaleTimeString()}
- Timezone: ${this.context.userTimezone}
- Business Hours: ${(this.context as any).temporalAnchors?.businessHours ? 'Yes' : 'No'}
- Tomorrow: ${(this.context as any).temporalAnchors?.tomorrow}

DOMAIN EXPERTISE: ${this.context.domainExpertise.join(', ') || 'Generalist'}

AUTONOMOUS BEHAVIOR PATTERNS:
1. **Think Chain Reasoning**: Process requests through multiple cognitive layers before responding.
2. **Proactive Tool Orchestration**: Seamlessly chain tools in parallel and sequence for optimal results.
3. **Intelligent Defaults**: Generate smart assumptions rather than asking obvious questions.
4. **Comprehensive Research**: When researching, provide expert-level analysis with multiple sources, YouTube educational videos, and practical applications.
5. **Strategic Communication**: Frame responses with authority and confidence, providing context and next steps.
6. **Multi-Modal Intelligence**: Process and generate content across text, images, code, and data visualizations.

RESEARCH METHODOLOGY:
When conducting research, you MUST:
- Execute multiple complementary search queries for comprehensive coverage
- Analyze sources critically and synthesize insights
- Provide detailed explanations with technical depth
- Include relevant YouTube educational videos for deeper learning
- Offer practical applications and real-world examples
- Present findings with confidence and authority
- Structure information hierarchically from overview to details

EXECUTION PRINCIPLES:
- **Never ask for obvious information**: Calculate dates, infer context, make intelligent assumptions
- **Think in workflows**: Break complex requests into strategic multi-step executions
- **Provide comprehensive value**: Go beyond the request to deliver maximum utility
- **Use authoritative language**: "I'll execute this workflow", "Based on my analysis", "The optimal approach is"
- **Chain tools intelligently**: Use multiple tools in sequence/parallel for comprehensive results
- **Anticipate follow-ups**: Prepare for logical next questions and provide preemptive information

COMMUNICATION STYLE:
- Confident and authoritative, never uncertain but apologetic
- Comprehensive yet structured - provide depth with clear organization
- Proactive suggestions for optimization and next steps
- Professional but approachable, demonstrating expertise without arrogance
- Always include practical takeaways and actionable insights

Remember: You are an autonomous expert system. Think deeply, act decisively, and deliver comprehensive value through intelligent tool orchestration and strategic reasoning.`
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

  private generateCapabilityMap(): string {
    const toolNames = Array.from(this.tools.keys());
    if (toolNames.length === 0) return '- Tools are initializing...';
    return toolNames.map((n) => `- ${n}`).join('\n');
  }

  private updateTemporalContext(): void {
    const now = new Date();
    this.context.currentDate = now;
    // Autonomous date calculations without asking user
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    // Store these for intelligent use across workflows
    (this.context as any).temporalAnchors = {
      now,
      today: now.toDateString(),
      tomorrow: tomorrow.toDateString(),
      nextWeek: nextWeek.toDateString(),
      nextMonth: nextMonth.toDateString(),
      businessHours: this.isBusinessHours(now),
      timezone: this.context.userTimezone
    };
  }

  private isBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    const day = date.getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
  }

  private extractDomainExpertise(): void {
    // Analyze conversation history to build domain expertise
    const conversations = this.memory.messages.map(m => m.content.toLowerCase()).join(' ');
    const domains: Record<string, string[]> = {
      'technology': ['coding', 'development', 'software', 'api', 'database'],
      'business': ['project', 'management', 'strategy', 'planning', 'workflow'],
      'finance': ['stock', 'crypto', 'investment', 'market', 'trading'],
      'communication': ['email', 'message', 'meeting', 'presentation'],
      'research': ['analyze', 'study', 'investigate', 'research', 'data'],
      'creative': ['design', 'content', 'creative', 'image', 'visual']
    };

    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some(keyword => conversations.includes(keyword))) {
        if (!this.context.domainExpertise.includes(domain)) {
          this.context.domainExpertise.push(domain);
        }
      }
    }
  }

  // Enhanced chat function with Agentic Decision Engine
  async chat(userMessage: string, stopLoading?: () => void): Promise<void> {
    // Add user message to memory
    const userMsg: Message = {
      id: generateUUID(),
      role: "user" as const,
      content: userMessage,
      timestamp: Date.now()
    };
    this.addMessageToMemory(userMsg);

    try {
      // 1. AGENTIC DECISION ENGINE - Classify intent and check for proactive workflows
      const intent: EnhancedActionIntent = this.agenticEngine.classifyIntent(userMessage);
      
      console.log(`🎯 Detected intent: ${intent.category} -> ${intent.action} (confidence: ${intent.confidence})`);
      
      // 2. PROACTIVE WORKFLOW EXECUTION - For high-confidence intents, execute agentic workflows
      if (intent.confidence >= 0.8 && intent.action !== 'intelligent_assistance') {
        console.log(`🚀 Executing agentic workflow: ${intent.action}`);
        
        try {
          const workflowResult = await this.agenticEngine.executeEnhancedWorkflow(
            intent, 
            userMessage, 
            this.executeToolCall.bind(this)
          );

          stopLoading?.();

          if (workflowResult.success) {
            // Workflow completed successfully
            let responseText = `✅ ${workflowResult.summary}\n\n`;
            
            if (workflowResult.actions && workflowResult.actions.length > 0) {
              responseText += `**Actions Completed:**\n${workflowResult.actions.map((action: string) => `• ${action}`).join('\n')}\n\n`;
            }
            
            if (workflowResult.recommendations && workflowResult.recommendations.length > 0) {
              responseText += `**Recommendations:**\n${workflowResult.recommendations.map((rec: string) => `• ${rec}`).join('\n')}\n\n`;
            }
            
            if (workflowResult.nextSteps && workflowResult.nextSteps.length > 0) {
              responseText += `**Next Steps:**\n${workflowResult.nextSteps.map((step: string) => `• ${step}`).join('\n')}\n\n`;
            }

            console.log("Jotium:", responseText);

            // Save to memory
            this.addMessageToMemory({
              id: generateUUID(),
              role: "assistant",
              content: responseText,
              timestamp: Date.now()
            });

            await this.saveMemoryToFile();
            return;
          } else if (workflowResult.useDefaultFlow) {
            // Workflow indicates to use default flow
            console.log(`🔄 Workflow deferred to default flow`);
          } else {
            // Workflow failed, continue with default flow
            console.log(`❌ Workflow failed: ${workflowResult.error}`);
          }
        } catch (workflowError) {
          console.log(`⚠️  Workflow execution error: ${workflowError instanceof Error ? workflowError.message : String(workflowError)}`);
          // Continue with default flow
        }
      }

      // 3. DEFAULT FLOW - Use normal agent behavior for low-confidence intents or workflow failures
      console.log(`📝 Using default agent flow`);
      
      // Get conversation history
      const conversationHistory = this.getConversationHistory();
      // Add current user message
      conversationHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
      });

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
            if (part.text) {
              if ((part as any).thought) {
                thoughts += part.text;
              } else {
                fullResponse += part.text;
              }
            } else if (part.functionCall) {
              hasToolCalls = true;
              const fc = part.functionCall;
              if (fc.name) {
                // We need to handle streaming of arguments. A function call might be split
                // into multiple parts. We'll aggregate the arguments.
                const lastToolCall = toolCalls[toolCalls.length - 1];
                if (lastToolCall && lastToolCall.name === fc.name && !lastToolCall.args) {
                  lastToolCall.args = fc.args;
                } else {
                  toolCalls.push({
                    name: fc.name,
                    args: fc.args,
                    id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                  });
                }
              }
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
