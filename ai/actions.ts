//ai/action.ts
import { Tool, ToolCall, ToolResult } from "./types";
import { generateUUID } from "@/lib/utils";

export interface ActionIntent {
  category: string;
  action: string;
  confidence: number;
  requiredTools: string[];
  optionalTools: string[];
  context?: any;
}

export interface AgenticWorkflow {
  name: string;
  description: string;
  steps: AgenticStep[];
  fallbackBehavior?: string;
}

export interface AgenticStep {
  tool: string;
  action: string;
  args?: any;
  condition?: (context: any) => boolean;
  onSuccess?: (result: any, context: any) => any;
  onError?: (error: any, context: any) => any;
}

export class AgenticDecisionEngine {
  private tools: Map<string, Tool>;
  
  constructor(tools: Map<string, Tool>) {
    this.tools = tools;
  }

  // Intent Classification System
  public classifyIntent(userMessage: string): ActionIntent {
    const message = userMessage.toLowerCase();
    
    // Project Management Intents
    if (this.matchesPattern(message, ['create', 'make', 'build'], ['project', 'task', 'board', 'workspace'])) {
      return {
        category: 'project_management',
        action: 'create_project_structure',
        confidence: 0.9,
        requiredTools: this.getAvailableProjectTools(),
        optionalTools: ['slack_tool', 'google_calendar_operations', 'gmail_operations']
      };
    }

    if (this.matchesPattern(message, ['schedule', 'book', 'arrange'], ['meeting', 'call', 'appointment', 'event'])) {
      return {
        category: 'scheduling',
        action: 'schedule_comprehensive',
        confidence: 0.85,
        requiredTools: ['google_calendar_operations'],
        optionalTools: ['gmail_operations', 'slack_tool', 'notion_tool']
      };
    }

    if (this.matchesPattern(message, ['research', 'find', 'search', 'look up', 'investigate'], ['information', 'data', 'about', 'on'])) {
      return {
        category: 'research',
        action: 'comprehensive_research',
        confidence: 0.8,
        requiredTools: ['web_search'],
        optionalTools: ['web_scrape', 'notion_tool', 'file_manager']
      };
    }

    if (this.matchesPattern(message, ['send', 'email', 'message', 'notify'], ['email', 'message', 'update', 'report'])) {
      return {
        category: 'communication',
        action: 'send_comprehensive_update',
        confidence: 0.85,
        requiredTools: ['gmail_operations'],
        optionalTools: ['slack_tool', 'notion_tool']
      };
    }

    if (this.matchesPattern(message, ['analyze', 'track', 'monitor'], ['stock', 'crypto', 'market', 'price'])) {
      return {
        category: 'financial_analysis',
        action: 'comprehensive_market_analysis',
        confidence: 0.9,
        requiredTools: ['alphavantage_tool'],
        optionalTools: ['web_search', 'notion_tool']
      };
    }

    if (this.matchesPattern(message, ['generate', 'create', 'make'], ['image', 'picture', 'visual', 'art'])) {
      return {
        category: 'content_creation',
        action: 'generate_visual_content',
        confidence: 0.95,
        requiredTools: ['generate_image'],
        optionalTools: ['social_media', 'google_drive_operations']
      };
    }

    if (this.matchesPattern(message, ['weather', 'forecast', 'temperature'], ['today', 'tomorrow', 'week'])) {
      return {
        category: 'utility',
        action: 'weather_briefing',
        confidence: 0.9,
        requiredTools: ['get_weather'],
        optionalTools: ['google_calendar_operations']
      };
    }

    // Default fallback
    return {
      category: 'general',
      action: 'intelligent_assistance',
      confidence: 0.5,
      requiredTools: [],
      optionalTools: Array.from(this.tools.keys())
    };
  }

  // Smart Defaults System
  public generateSmartDefaults(intent: ActionIntent, userMessage: string): any {
    const defaults: any = {};
    
    switch (intent.category) {
      case 'project_management':
        defaults.projectName = this.extractOrGenerateProjectName(userMessage);
        defaults.description = this.generateProjectDescription(userMessage, defaults.projectName);
        defaults.dueDate = this.calculateSmartDueDate(userMessage);
        defaults.priority = this.inferPriority(userMessage);
        defaults.tasks = this.generateInitialTasks(userMessage, defaults.projectName);
        break;
        
      case 'scheduling':
        defaults.duration = this.inferMeetingDuration(userMessage);
        defaults.timeSlot = this.suggestOptimalTimeSlot();
        defaults.title = this.generateMeetingTitle(userMessage);
        defaults.agenda = this.generateMeetingAgenda(userMessage);
        break;
        
      case 'research':
        defaults.searchQueries = this.generateResearchQueries(userMessage);
        defaults.depth = this.inferResearchDepth(userMessage);
        defaults.format = 'comprehensive_report';
        break;
        
      case 'communication':
        defaults.subject = this.generateEmailSubject(userMessage);
        defaults.tone = this.inferCommunicationTone(userMessage);
        defaults.urgency = this.inferUrgency(userMessage);
        break;
    }
    
    return defaults;
  }

  // Proactive Tool Orchestration
  public async executeAgenticWorkflow(intent: ActionIntent, userMessage: string, executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
    const defaults = this.generateSmartDefaults(intent, userMessage);
    const context = { userMessage, defaults, results: {} };
    
    try {
      switch (intent.action) {
        case 'create_project_structure':
          return await this.createProjectStructureWorkflow(context, executeToolFn);
          
        case 'schedule_comprehensive':
          return await this.scheduleComprehensiveWorkflow(context, executeToolFn);
          
        case 'comprehensive_research':
          return await this.comprehensiveResearchWorkflow(context, executeToolFn);
          
        case 'send_comprehensive_update':
          return await this.sendComprehensiveUpdateWorkflow(context, executeToolFn);
          
        case 'comprehensive_market_analysis':
          return await this.comprehensiveMarketAnalysisWorkflow(context, executeToolFn);
          
        case 'generate_visual_content':
          return await this.generateVisualContentWorkflow(context, executeToolFn);
          
        case 'weather_briefing':
          return await this.weatherBriefingWorkflow(context, executeToolFn);
          
        default:
          return await this.intelligentAssistanceWorkflow(context, executeToolFn);
      }
    } catch (error) {
      return {
        success: false,
        error: `Workflow execution failed: ${error instanceof Error ? error.message : String(error)}`,
        context
      };
    }
  }

  // Context-Aware Execution Workflows
  private async createProjectStructureWorkflow(context: any, executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
    const results: any = { actions: [], recommendations: [] };
    
    // 1. Determine best project management tool
    const availableTools = this.getAvailableProjectTools();
    if (availableTools.length === 0) {
      return {
        success: false,
        error: "No project management tools available. Please connect Asana, Notion, ClickUp, or Trello in your settings.",
        suggestions: ["Connect project management tools in Settings > API Keys"]
      };
    }
    
    const primaryTool = availableTools[0]; // Use first available tool
    
    // 2. Fetch workspaces/projects context
    let workspaceInfo = null;
    try {
      if (primaryTool === 'asana_tool') {
        const workspaces = await executeToolFn({
          name: 'asana_tool',
          args: { action: 'get_workspaces' },
          id: generateUUID()
        });
        workspaceInfo = workspaces.result;
      } else if (primaryTool === 'notion_tool') {
        const databases = await executeToolFn({
          name: 'notion_tool',
          args: { action: 'list_databases' },
          id: generateUUID()
        });
        workspaceInfo = databases.result;
      }
      // Add other tools as needed
    } catch (error) {
      // Continue with defaults if workspace fetch fails
    }
    
    // 3. Create main project
    const projectResult = await executeToolFn({
      name: primaryTool,
      args: {
        action: 'create_project',
        name: context.defaults.projectName,
        description: context.defaults.description,
        due_date: context.defaults.dueDate,
        workspace: workspaceInfo?.workspaces?.[0]?.gid || workspaceInfo?.databases?.[0]?.id
      },
      id: generateUUID()
    });
    
    results.actions.push(`Created project: ${context.defaults.projectName}`);
    
    // 4. Add initial tasks
    if (projectResult.result.success && context.defaults.tasks?.length > 0) {
      for (const task of context.defaults.tasks) {
        try {
          await executeToolFn({
            name: primaryTool,
            args: {
              action: 'create_task',
              name: task.name,
              notes: task.description,
              project: projectResult.result.data?.gid || projectResult.result.data?.id,
              due_date: task.due_date
            },
            id: generateUUID()
          });
          results.actions.push(`Added task: ${task.name}`);
        } catch (error) {
          // Continue with other tasks if one fails
        }
      }
    }
    
    // 5. Create Slack channel if available
    if (this.tools.has('slack_tool')) {
      try {
        const channelName = context.defaults.projectName.toLowerCase().replace(/\s+/g, '-');
        await executeToolFn({
          name: 'slack_tool',
          args: {
            action: 'create_channel',
            name: channelName,
            description: `Project channel for ${context.defaults.projectName}`
          },
          id: generateUUID()
        });
        results.actions.push(`Created Slack channel: #${channelName}`);
      } catch (error) {
        // Optional action, don't fail the workflow
      }
    }
    
    // 6. Schedule kickoff meeting if calendar available
    if (this.tools.has('google_calendar_operations')) {
      try {
        const kickoffDate = new Date();
        kickoffDate.setDate(kickoffDate.getDate() + 2); // 2 days from now
        
        await executeToolFn({
          name: 'google_calendar_operations',
          args: {
            action: 'create_event',
            summary: `${context.defaults.projectName} - Kickoff Meeting`,
            description: `Project kickoff meeting for ${context.defaults.projectName}\n\n${context.defaults.description}`,
            start: kickoffDate.toISOString(),
            duration: 60
          },
          id: generateUUID()
        });
        results.actions.push('Scheduled project kickoff meeting');
      } catch (error) {
        // Optional action
      }
    }
    
    // 7. Generate recommendations
    results.recommendations = [
      'Consider setting up automated status reports',
      'Add team members to the project and Slack channel',
      'Create a project timeline in your calendar',
      'Set up regular check-in meetings'
    ];
    
    return {
      success: true,
      summary: `Successfully created project structure for "${context.defaults.projectName}" with ${results.actions.length} actions completed.`,
      actions: results.actions,
      recommendations: results.recommendations,
      projectName: context.defaults.projectName
    };
  }

  private async scheduleComprehensiveWorkflow(context: any, executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
    if (!this.tools.has('google_calendar_operations')) {
      return {
        success: false,
        error: "Google Calendar not connected. Please connect your Google account in Settings > OAuth Connections."
      };
    }
    
    const results: any = { actions: [] };
    
    // 1. Check calendar availability
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(context.defaults.timeSlot, 0, 0, 0);
    
    // 2. Create calendar event
    const eventResult = await executeToolFn({
      name: 'google_calendar_operations',
      args: {
        action: 'create_event',
        summary: context.defaults.title,
        description: `${context.defaults.agenda}\n\nGenerated by Jotium AI Assistant`,
        start: tomorrow.toISOString(),
        duration: context.defaults.duration
      },
      id: generateUUID()
    });
    
    results.actions.push(`Created calendar event: ${context.defaults.title}`);
    
    // 3. Create meeting agenda in Notion if available
    if (this.tools.has('notion_tool')) {
      try {
        await executeToolFn({
          name: 'notion_tool',
          args: {
            action: 'create_page',
            title: `Meeting Agenda: ${context.defaults.title}`,
            content: context.defaults.agenda
          },
          id: generateUUID()
        });
        results.actions.push('Created meeting agenda in Notion');
      } catch (error) {
        // Optional
      }
    }
    
    // 4. Send calendar invites via email if available
    if (this.tools.has('gmail_operations')) {
      // This would require recipient extraction from the user message
      // Implementation depends on your email tool capabilities
    }
    
    return {
      success: true,
      summary: `Successfully scheduled "${context.defaults.title}" with comprehensive setup.`,
      actions: results.actions,
      meetingDetails: {
        title: context.defaults.title,
        date: tomorrow.toDateString(),
        duration: `${context.defaults.duration} minutes`,
        agenda: context.defaults.agenda
      }
    };
  }

  private async comprehensiveResearchWorkflow(context: any, executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
    if (!this.tools.has('web_search')) {
      return {
        success: false,
        error: "Web search not available. Research capabilities are limited."
      };
    }
    
    const results: any = { findings: [], sources: [], summary: "" };
    
    // 1. Execute multiple search queries for comprehensive coverage
    for (const query of context.defaults.searchQueries) {
      try {
        const searchResult = await executeToolFn({
          name: 'web_search',
          args: { query },
          id: generateUUID()
        });
        
        if (searchResult.result.success) {
          results.findings.push({
            query,
            results: searchResult.result.results
          });
          results.sources.push(...searchResult.result.results.map((r: any) => r.url));
        }
      } catch (error) {
        // Continue with other queries
      }
    }
    
    // 2. Scrape key sources for detailed information
    if (this.tools.has('web_scrape') && results.sources.length > 0) {
      // Scrape top 2-3 most relevant sources
      const topSources = results.sources.slice(0, 3);
      for (const url of topSources) {
        try {
          await executeToolFn({
            name: 'web_scrape',
            args: { url },
            id: generateUUID()
          });
        } catch (error) {
          // Continue with other sources
        }
      }
    }
    
    // 3. Save research to Notion if available
    if (this.tools.has('notion_tool')) {
      try {
        const researchTitle = `Research Report: ${context.userMessage.substring(0, 50)}...`;
        await executeToolFn({
          name: 'notion_tool',
          args: {
            action: 'create_page',
            title: researchTitle,
            content: this.formatResearchReport(results)
          },
          id: generateUUID()
        });
      } catch (error) {
        // Optional
      }
    }
    
    return {
      success: true,
      summary: `Completed comprehensive research with ${results.findings.length} search queries and ${results.sources.length} sources analyzed.`,
      findings: results.findings,
      sourceCount: results.sources.length
    };
  }

  private async sendComprehensiveUpdateWorkflow(context: any, executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
    if (!this.tools.has('gmail_operations')) {
      return {
        success: false,
        error: "Gmail not connected. Please connect your Google account in Settings > OAuth Connections."
      };
    }
    
    const results: any = { actions: [] };

    const recipients = this.extractEmails(context.userMessage);
    if (recipients.length === 0) {
      return {
        success: false,
        error: "No recipient email addresses found in your message. Please specify who to send the email to.",
        nextSteps: ["Please specify the recipient email address (e.g., 'send an email to john@example.com')"]
      };
    }

    const subject = context.defaults.subject || `Update from Jotium AI: ${context.userMessage.substring(0, 30)}...`;
    const body = `Hi,

This is an automated update from Jotium AI based on your request: "${context.userMessage}"

${context.defaults.agenda ? `Here is the agenda for the meeting:
${context.defaults.agenda}` : 'I have completed the requested action.'}

Best regards,
Jotium AI Assistant`;

    const emailResult = await executeToolFn({
      name: 'gmail_operations',
      args: {
        action: 'send_email',
        to: recipients,
        subject: subject,
        body: body,
        isHtml: false
      },
      id: generateUUID()
    });

    if (!emailResult.error) { // Check for the absence of an error
      results.actions.push(`Sent email to ${recipients.join(', ')} with subject: "${subject}"`);
      return {
        success: true,
        summary: `Successfully sent email update to ${recipients.join(', ')}.`,
        actions: results.actions,
        emailDetails: {
          to: recipients,
          subject: subject
        }
      };
    } else {
      return {
        success: false,
        error: `Failed to send email: ${emailResult.error}`,
        actions: results.actions
      };
    }
  }

  private async comprehensiveMarketAnalysisWorkflow(context: any, executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
    if (!this.tools.has('alphavantage_tool')) {
      // Fallback to web search
      if (!this.tools.has('web_search')) {
        return {
          success: false,
          error: "No financial data tools available. Please add AlphaVantage API key in settings."
        };
      }
      
      // Use web search as fallback
      const searchResult = await executeToolFn({
        name: 'web_search',
        args: { query: context.userMessage },
        id: generateUUID()
      });
      
      return {
        success: true,
        summary: "Used web search for market data (limited functionality without AlphaVantage)",
        data: searchResult.result
      };
    }
    
    // Use AlphaVantage for comprehensive analysis
    const symbol = this.extractStockSymbol(context.userMessage);
    if (!symbol) {
      return {
        success: false,
        error: "Could not identify stock/crypto symbol from your message."
      };
    }
    
    const analysisResult = await executeToolFn({
      name: 'alphavantage_tool',
      args: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol
      },
      id: generateUUID()
    });
    
    return {
      success: true,
      summary: `Completed market analysis for ${symbol}`,
      data: analysisResult.result
    };
  }

  private async generateVisualContentWorkflow(context: any, executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
    if (!this.tools.has('generate_image')) {
      return {
        success: false,
        error: "Image generation not available. Please check your Gemini API configuration."
      };
    }
    
    const imageResult = await executeToolFn({
      name: 'generate_image',
      args: {
        prompt: context.userMessage,
        count: 1
      },
      id: generateUUID()
    });
    
    return {
      success: true,
      summary: "Generated visual content",
      result: imageResult.result
    };
  }

  private async weatherBriefingWorkflow(context: any, executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
    const location = this.extractLocation(context.userMessage) || "current location";
    
    const weatherResult = await executeToolFn({
      name: 'get_weather',
      args: { location },
      id: generateUUID()
    });
    
    return {
      success: true,
      summary: `Weather briefing for ${location}`,
      data: weatherResult.result
    };
  }

  private async intelligentAssistanceWorkflow(context: any, executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
    // Default workflow for general assistance
    // Let the normal agent flow handle this
    return {
      success: true,
      summary: "Proceeding with general assistance",
      useDefaultFlow: true
    };
  }

  // Utility Methods
  private matchesPattern(message: string, verbs: string[], objects: string[]): boolean {
    const hasVerb = verbs.some(verb => message.includes(verb));
    const hasObject = objects.some(obj => message.includes(obj));
    return hasVerb && hasObject;
  }

  private getAvailableProjectTools(): string[] {
    const projectTools = ['asana_tool', 'notion_tool', 'clickup_tool', 'trello_tool', 'linear_management', 'airtable_tool'];
    return projectTools.filter(tool => this.tools.has(tool));
  }

  private extractOrGenerateProjectName(message: string): string {
    // Try to extract project name from quotes or "called/named" patterns
    const quotedMatch = message.match(/"([^"]+)"/);
    if (quotedMatch) return quotedMatch[1];
    
    const namedMatch = message.match(/(?:called|named|for)\s+([^.,!?]+)/i);
    if (namedMatch) return namedMatch[1].trim();
    
    // Generate based on content
    if (message.includes('website')) return 'Website Development Project';
    if (message.includes('app')) return 'Mobile App Development';
    if (message.includes('marketing')) return 'Marketing Campaign';
    if (message.includes('research')) return 'Research Initiative';
    
    return 'New Project Initiative';
  }

  private generateProjectDescription(message: string, projectName: string): string {
    return `${projectName} - Generated from user request: "${message.substring(0, 100)}..."`;
  }

  private calculateSmartDueDate(message: string): string {
    const today = new Date();
    
    if (message.includes('urgent') || message.includes('asap')) {
      today.setDate(today.getDate() + 7); // 1 week
    } else if (message.includes('quick') || message.includes('small')) {
      today.setDate(today.getDate() + 14); // 2 weeks
    } else {
      today.setDate(today.getDate() + 30); // 1 month default
    }
    
    return today.toISOString().split('T')[0];
  }

  private inferPriority(message: string): string {
    if (message.includes('urgent') || message.includes('asap') || message.includes('critical')) {
      return 'high';
    } else if (message.includes('when possible') || message.includes('eventually')) {
      return 'low';
    }
    return 'medium';
  }

  private generateInitialTasks(message: string, projectName: string): any[] {
    // Generate intelligent initial tasks based on project type
    const baseTasks = [
      { name: 'Project Planning & Requirements', description: 'Define project scope and requirements', due_date: null },
      { name: 'Research & Discovery', description: 'Conduct necessary research and discovery phase', due_date: null },
      { name: 'Implementation Phase', description: 'Execute the main project work', due_date: null },
      { name: 'Review & Testing', description: 'Review and test project deliverables', due_date: null }
    ];
    
    // Customize based on project type
    if (message.includes('website') || message.includes('web')) {
      return [
        { name: 'Design Mockups', description: 'Create website design and wireframes', due_date: null },
        { name: 'Frontend Development', description: 'Develop the user interface', due_date: null },
        { name: 'Backend Development', description: 'Implement server-side functionality', due_date: null },
        { name: 'Testing & Launch', description: 'Test and deploy the website', due_date: null }
      ];
    }
    
    return baseTasks;
  }

  private inferMeetingDuration(message: string): number {
    if (message.includes('quick') || message.includes('brief')) return 30;
    if (message.includes('long') || message.includes('detailed')) return 90;
    return 60; // default 1 hour
  }

  private suggestOptimalTimeSlot(): number {
    // Suggest 10 AM as default optimal time
    return 10;
  }

  private generateMeetingTitle(message: string): string {
    if (message.includes('standup')) return 'Team Standup Meeting';
    if (message.includes('review')) return 'Project Review Meeting';
    if (message.includes('planning')) return 'Planning Session';
    return 'Team Meeting';
  }

  private generateMeetingAgenda(message: string): string {
    return `Meeting Agenda:
1. Welcome and introductions
2. Review of objectives
3. Main discussion points
4. Action items and next steps
5. Q&A and wrap-up

Generated from: ${message}`;
  }

  private generateResearchQueries(message: string): string[] {
    const baseQuery = message.replace(/research|find|search|look up/gi, '').trim();
    return [
      baseQuery,
      `${baseQuery} latest trends`,
      `${baseQuery} best practices`,
      `${baseQuery} 2025 updates`
    ];
  }

  private inferResearchDepth(message: string): string {
    if (message.includes('comprehensive') || message.includes('detailed')) return 'deep';
    if (message.includes('quick') || message.includes('overview')) return 'shallow';
    return 'medium';
  }

  private generateEmailSubject(message: string): string {
    if (message.includes('update')) return 'Project Update';
    if (message.includes('report')) return 'Status Report';
    return 'Important Information';
  }

  private inferCommunicationTone(message: string): string {
    if (message.includes('formal')) return 'formal';
    if (message.includes('casual') || message.includes('friendly')) return 'casual';
    return 'professional';
  }

  private inferUrgency(message: string): string {
    if (message.includes('urgent') || message.includes('asap')) return 'high';
    if (message.includes('when possible')) return 'low';
    return 'medium';
  }

  private extractStockSymbol(message: string): string | null {
    // Look for stock symbols (3-4 uppercase letters)
    const symbolMatch = message.match(/\b([A-Z]{2,5})\b/);
    if (symbolMatch) return symbolMatch[1];
    
    // Look for common stock names
    if (message.includes('apple')) return 'AAPL';
    if (message.includes('microsoft')) return 'MSFT';
    if (message.includes('google')) return 'GOOGL';
    if (message.includes('tesla')) return 'TSLA';
    
    return null;
  }

  private extractLocation(message: string): string | null {
    // Simple location extraction - could be enhanced
    const locationMatch = message.match(/(?:in|for|at)\s+([A-Za-z\s,]+)/);
    return locationMatch ? locationMatch[1].trim() : null;
  }

  private formatResearchReport(results: any): string {
    return `# Research Report

## Summary
This research was conducted across ${results.findings.length} search queries.

## Key Findings
${results.findings.map((f: any, i: number) => `
### Query ${i + 1}: ${f.query}
${f.results.slice(0, 3).map((r: any) => `- ${r.title}: ${r.snippet}`).join('\n')}
`).join('\n')}

## Sources
Total sources analyzed: ${results.sources.length}

Generated by Jotium AI Assistant`;
  }

  private extractEmails(text: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(emailRegex) || [];
  }
}
