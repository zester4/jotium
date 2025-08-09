//ai/enhanced-actions.ts
import { Tool, ToolCall, ToolResult } from "./types";
import { generateUUID } from "@/lib/utils";

export interface EnhancedActionIntent {
  category: string;
  action: string;
  confidence: number;
  requiredTools: string[];
  optionalTools: string[];
  reasoningDepth: 'minimal' | 'standard' | 'deep' | 'comprehensive';
  autonomyLevel: 'guided' | 'semi_autonomous' | 'fully_autonomous';
  context?: any;
  chainedActions?: string[];
  proactiveOpportunities?: string[];
}

export class EnhancedAgenticEngine {
  private tools: Map<string, Tool>;
  private currentDate: Date;
  private executionHistory: Map<string, any> = new Map();
  
  constructor(tools: Map<string, Tool>) {
    this.tools = tools;
    this.currentDate = new Date();
  }

  // Enhanced Intent Classification with GPT-5 inspired reasoning
  public classifyIntent(userMessage: string): EnhancedActionIntent {
    const message = userMessage.toLowerCase();
    const context = this.analyzeContext(userMessage);
    
    // Multi-step reasoning chain for intent classification
    const reasoning = this.performReasoningChain(userMessage, context);
    
    // Determine autonomy level based on complexity and confidence
    const autonomyLevel = this.determineAutonomyLevel(reasoning.complexity, reasoning.confidence);

    // Gmail: Summarize an email by ID (robust trigger)
    const maybeGmailId = this.extractGmailMessageId(userMessage);
    if (
      (message.includes('gmail') || message.includes('email')) &&
      (
        maybeGmailId ||
        message.includes('id') || /\bmessage\s*id\b/.test(message) ||
        message.includes('summarize') || message.includes('summary') || message.includes('read') || message.includes('show')
      )
    ) {
      return {
        category: 'gmail_assistant',
        action: 'summarize_email_by_id',
        confidence: 0.92,
        requiredTools: ['gmail_operations'],
        optionalTools: [],
        reasoningDepth: 'standard',
        autonomyLevel: 'fully_autonomous',
        context
      };
    }

    // Gmail: Send email (markdown or HTML)
    if (
      (message.includes('send') || message.includes('compose') || message.includes('draft')) &&
      message.includes('email')
    ) {
      return {
        category: 'gmail_assistant',
        action: 'send_email_markdown_or_html',
        confidence: 0.9,
        requiredTools: ['gmail_operations'],
        optionalTools: [],
        reasoningDepth: 'standard',
        autonomyLevel: 'semi_autonomous',
        context
      };
    }
    
    // Enhanced project management with chained actions
    if (this.matchesPattern(message, ['create', 'build', 'develop', 'setup'], ['project', 'system', 'application', 'platform'])) {
      return {
        category: 'project_management',
        action: 'create_comprehensive_project_ecosystem',
        confidence: 0.95,
        requiredTools: this.getAvailableProjectTools(),
        optionalTools: ['slack_tool', 'google_calendar_operations', 'gmail_operations', 'notion_tool'],
        reasoningDepth: 'comprehensive',
        autonomyLevel: 'fully_autonomous',
        chainedActions: [
          'analyze_project_requirements',
          'setup_project_structure',
          'create_initial_tasks',
          'establish_communication_channels',
          'schedule_milestone_meetings',
          'setup_progress_tracking',
          'create_documentation_framework'
        ],
        proactiveOpportunities: [
          'integrate_ci_cd_pipeline',
          'setup_automated_reporting',
          'create_risk_assessment',
          'establish_backup_procedures'
        ]
      };
    }

    // Enhanced research with proactive follow-ups
    if (this.matchesPattern(message, ['research', 'analyze', 'investigate', 'study'], ['market', 'technology', 'trend', 'data'])) {
      return {
        category: 'intelligence_research',
        action: 'conduct_comprehensive_intelligence_analysis',
        confidence: 0.92,
        requiredTools: ['web_search', 'web_scrape'],
        optionalTools: ['alphavantage_tool', 'notion_tool', 'data_visualization'],
        reasoningDepth: 'deep',
        autonomyLevel: 'fully_autonomous',
        chainedActions: [
          'multi_angle_research',
          'cross_reference_sources',
          'trend_analysis',
          'competitive_intelligence',
          'future_projection',
          'actionable_insights_generation',
          'resource_compilation'
        ],
        proactiveOpportunities: [
          'setup_monitoring_alerts',
          'create_research_dashboard',
          'schedule_follow_up_analysis',
          'identify_collaboration_opportunities'
        ]
      };
    }

    // Enhanced automation with predictive capabilities
    if (this.matchesPattern(message, ['automate', 'streamline', 'optimize'], ['workflow', 'process', 'task'])) {
      return {
        category: 'intelligent_automation',
        action: 'create_adaptive_automation_system',
        confidence: 0.88,
        requiredTools: ['api_tool', 'code_execution'],
        optionalTools: Array.from(this.tools.keys()),
        reasoningDepth: 'comprehensive',
        autonomyLevel: 'semi_autonomous',
        chainedActions: [
          'workflow_analysis',
          'bottleneck_identification',
          'automation_strategy_design',
          'implementation_planning',
          'testing_framework_setup',
          'monitoring_system_creation'
        ]
      };
    }

    return {
      category: 'general_intelligence',
      action: 'adaptive_problem_solving',
      confidence: 0.7,
      requiredTools: [],
      optionalTools: Array.from(this.tools.keys()),
      reasoningDepth: 'standard',
      autonomyLevel: 'guided'
    };
  }

  // Multi-step reasoning inspired by GPT-5's thinking capabilities
  private performReasoningChain(userMessage: string, context: any): any {
    // Step 1: Analyze user intent depth
    const intentComplexity = this.analyzeComplexity(userMessage);
    
    // Step 2: Assess available resources and constraints
    const resourceAssessment = this.assessAvailableResources();
    
    // Step 3: Predict potential challenges and solutions
    const challengePrediction = this.predictChallenges(userMessage, resourceAssessment);
    
    // Step 4: Generate execution confidence
    const confidence = this.calculateExecutionConfidence(intentComplexity, resourceAssessment, challengePrediction);
    
    return {
      complexity: intentComplexity,
      resources: resourceAssessment,
      challenges: challengePrediction,
      confidence
    };
  }

  // Enhanced workflow execution with proactive thinking
  public async executeEnhancedWorkflow(intent: EnhancedActionIntent, userMessage: string, executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
    const executionContext = {
      userMessage,
      intent,
      startTime: Date.now(),
      currentDate: this.currentDate,
      executionPlan: this.generateExecutionPlan(intent, userMessage),
      results: {},
      insights: [],
      nextSteps: [],
      resources: []
    };

    try {
      switch (intent.action) {
        case 'create_comprehensive_project_ecosystem':
          return await this.createProjectEcosystemWorkflow(executionContext, executeToolFn);
          
        case 'conduct_comprehensive_intelligence_analysis':
          return await this.intelligenceAnalysisWorkflow(executionContext, executeToolFn);
          
        case 'create_adaptive_automation_system':
          return await this.adaptiveAutomationWorkflow(executionContext, executeToolFn);
        
        case 'summarize_email_by_id':
          return await this.gmailSummarizeByIdWorkflow(executionContext, executeToolFn);

        case 'send_email_markdown_or_html':
          return await this.gmailSendEmailWorkflow(executionContext, executeToolFn);
          
        default:
          return await this.adaptiveProblemSolvingWorkflow(executionContext, executeToolFn);
      }
    } catch (error) {
      return this.handleWorkflowError(error, executionContext);
    }
  }

  // Comprehensive project ecosystem creation
  private async createProjectEcosystemWorkflow(context: any, executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
    const results: any = { actions: [], insights: [], resources: [], nextSteps: [] };
    
    // Phase 1: Intelligent project analysis and setup
    const projectName = this.extractOrGenerateIntelligentProjectName(context.userMessage);
    const projectAnalysis = this.analyzeProjectRequirements(context.userMessage);
    
    // Phase 2: Create main project with intelligent defaults
    const primaryTool = this.selectOptimalProjectTool();
    if (!primaryTool) {
      return this.generateToolConnectionGuidance('project_management');
    }

    const projectResult = await executeToolFn({
      name: primaryTool,
      args: {
        action: 'create_project',
        name: projectName,
        description: projectAnalysis.description,
        due_date: this.calculateIntelligentDeadline(projectAnalysis.scope),
        priority: projectAnalysis.priority,
        workspace: await this.getOptimalWorkspace(primaryTool, executeToolFn)
      },
      id: generateUUID()
    });

    results.actions.push(`✅ Created project: ${projectName}`);

    // Phase 3: Intelligent task breakdown and creation
    const tasks = this.generateIntelligentTaskBreakdown(projectAnalysis);
    for (const task of tasks) {
      await executeToolFn({
        name: primaryTool,
        args: {
          action: 'create_task',
          name: task.name,
          notes: task.description,
          project: projectResult.result.data?.gid || projectResult.result.data?.id,
          due_date: task.dueDate,
          priority: task.priority,
          assignee: task.assignee
        },
        id: generateUUID()
      });
      results.actions.push(`📋 Added task: ${task.name}`);
    }

    // Phase 4: Proactive ecosystem setup
    await this.setupProjectEcosystem(projectName, projectAnalysis, executeToolFn, results);
    
    // Phase 5: Generate intelligent insights and next steps
    results.insights = this.generateProjectInsights(projectAnalysis);
    results.nextSteps = this.generateIntelligentNextSteps(projectAnalysis);
    results.resources = this.generateLearningResources(projectAnalysis.type);

    return {
      success: true,
      summary: `🚀 Created comprehensive project ecosystem for "${projectName}" with ${results.actions.length} automated actions completed. Project is ready for immediate execution.`,
      actions: results.actions,
      insights: results.insights,
      nextSteps: results.nextSteps,
      resources: results.resources
    };
  }

  // Comprehensive intelligence analysis workflow
  private async intelligenceAnalysisWorkflow(context: any, executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
    const results: any = { findings: [], insights: [], sources: [], analysis: "", resources: [], videos: [] };

    // Phase 1: Multi-dimensional search strategy using multiple engines with recency
    const searchStrategies = this.generateAdvancedSearchStrategies(context.userMessage);
    const now = this.currentDate;
    const currentYear = now.getFullYear();
    const currentMonthName = now.toLocaleString('default', { month: 'long' });

    const hasTavily = this.tools.has('web_search');
    const hasSerper = this.tools.has('serper_search');
    const hasDDG = this.tools.has('duckduckgo_search');

    for (const strategy of searchStrategies) {
      const enrichedQuery = `${strategy.query} ${currentMonthName} ${currentYear}`.trim();

      // Tavily Web Search (general web)
      if (hasTavily) {
        try {
          const tavilyRes = await executeToolFn({
            name: 'web_search',
            args: { query: enrichedQuery, searchDepth: 'advanced', maxResults: 10, includeAnswer: true },
            id: generateUUID()
          });
          if (tavilyRes.result?.success) {
            results.findings.push({
              engine: 'tavily',
              strategy: strategy.angle,
              query: enrichedQuery,
              results: this.normalizeSearchResults('tavily', tavilyRes.result.results),
              priority: strategy.priority
            });
          }
        } catch {}
      }

      // Serper Google Search (recency via tbs)
      if (hasSerper) {
        try {
          const serperRes = await executeToolFn({
            name: 'serper_search',
            args: { query: enrichedQuery, searchType: 'search', num: 10, hl: 'en', gl: 'us', tbs: strategy.tbs || 'qdr:m', safe: 'active' },
            id: generateUUID()
          });
          if (serperRes.result?.success) {
            const organic = serperRes.result.organic || [];
            results.findings.push({
              engine: 'serper',
              strategy: strategy.angle,
              query: enrichedQuery,
              results: this.normalizeSearchResults('serper_search', organic),
              priority: strategy.priority
            });
          }
        } catch {}
      }

      // DuckDuckGo (privacy-focused)
      if (hasDDG) {
        try {
          const ddgRes = await executeToolFn({
            name: 'duckduckgo_search',
            args: { query: enrichedQuery, safeSearch: 'moderate', region: 'us-en', maxResults: 10, noHtml: true, skipDisambig: true },
            id: generateUUID()
          });
          if (ddgRes.result?.success) {
            const webResults = ddgRes.result.webResults || [];
            results.findings.push({
              engine: 'duckduckgo',
              strategy: strategy.angle,
              query: enrichedQuery,
              results: this.normalizeSearchResults('duckduckgo_search', webResults),
              priority: strategy.priority
            });
          }
        } catch {}
      }
    }

    // Serper Videos - ensure real YouTube titles/links related to the topic (recency-aware)
    if (hasSerper) {
      try {
        const baseQuery = this.extractCoreQuery(context.userMessage);
        const serperVideos = await executeToolFn({
          name: 'serper_search',
          args: { query: `${baseQuery} ${currentMonthName} ${currentYear}`, searchType: 'videos', num: 8, hl: 'en', gl: 'us', tbs: 'qdr:m', safe: 'active' },
          id: generateUUID()
        });
        if (serperVideos.result?.success && Array.isArray(serperVideos.result.videos)) {
          // These include real titles and links
          results.videos = serperVideos.result.videos.map((v: any) => ({
            title: v.title,
            link: v.link,
            source: v.source,
            date: v.date,
            channel: v.channel,
            duration: v.duration
          }));
        }
      } catch {}
    }

    // Phase 2: Deep source analysis (web scrape top sources)
    const topSources = this.selectHighValueSources(results.findings);
    if (this.tools.has('web_scrape')) {
      for (const source of topSources.slice(0, 5)) {
        try {
          const scrapeResult = await executeToolFn({
            name: 'web_scrape',
            args: { url: source.url },
            id: generateUUID()
          });
          results.sources.push({
            url: source.url,
            content: scrapeResult.result,
            relevance: source.relevance
          });
        } catch {}
      }
    }

    // Phase 3: Intelligent synthesis and insights
    results.analysis = this.synthesizeIntelligenceReport(results.findings, results.sources);
    results.insights = this.generateActionableInsights(results.analysis, context.userMessage);

    // Include real, topic-relevant YouTube links (from Serper videos) plus supplemental learning resources
    results.resources = [
      ...this.generateVideoResourcesFromSerper(results.videos),
      ...this.generateLearningResources(context.userMessage)
    ];

    // Phase 4: Save comprehensive report
    if (this.tools.has('notion_tool')) {
      await executeToolFn({
        name: 'notion_tool',
        args: {
          action: 'create_page',
          title: `Intelligence Report: ${context.userMessage.substring(0, 50)}`,
          content: this.formatComprehensiveReport(results)
        },
        id: generateUUID()
      });
    }

    return {
      success: true,
      summary: `🎯 Completed comprehensive intelligence analysis with ${results.findings.length} research angles, ${results.sources.length} deep-scraped sources, and ${results.insights.length} actionable insights.`,
      analysis: results.analysis,
      insights: results.insights,
      resources: results.resources,
      videos: results.videos,
      sourceCount: results.sources.length
    };
  }

  // Utility methods for enhanced intelligence
  private generateAdvancedSearchStrategies(userMessage: string): any[] {
    const baseQuery = this.extractCoreQuery(userMessage);
    // Prefer recent info; tbs filters: qdr:d (day), qdr:w (week), qdr:m (month)
    return [
      { query: `${baseQuery} latest developments`, angle: 'current_state', priority: 'high', tbs: 'qdr:w' },
      { query: `${baseQuery} market analysis trends`, angle: 'market_intelligence', priority: 'high', tbs: 'qdr:m' },
      { query: `${baseQuery} best practices implementation`, angle: 'practical_application', priority: 'medium', tbs: 'qdr:m' },
      { query: `${baseQuery} future predictions outlook`, angle: 'strategic_foresight', priority: 'medium', tbs: 'qdr:m' },
      { query: `${baseQuery} case studies examples`, angle: 'proven_results', priority: 'medium', tbs: 'qdr:m' },
      { query: `${baseQuery} challenges problems solutions`, angle: 'risk_mitigation', priority: 'high', tbs: 'qdr:w' }
    ];
  }

  private calculateIntelligentDeadline(scope: string): string {
    const today = new Date();
    let daysToAdd = 30; // default

    if (scope.includes('complex') || scope.includes('enterprise')) daysToAdd = 90;
    else if (scope.includes('medium') || scope.includes('standard')) daysToAdd = 45;
    else if (scope.includes('simple') || scope.includes('quick')) daysToAdd = 14;

    today.setDate(today.getDate() + daysToAdd);
    return today.toISOString().split('T')[0];
  }

  private generateIntelligentTaskBreakdown(analysis: any): any[] {
    const baseTasks = [];
    const projectType = analysis.type || 'general';

    // Intelligent task generation based on project type
    switch (projectType) {
      case 'software_development':
        return [
          { name: '🔍 Requirements Analysis & Architecture Design', description: 'Define system requirements and create technical architecture', dueDate: this.addDays(7), priority: 'high' },
          { name: '🎨 UI/UX Design & Prototyping', description: 'Create user interface designs and interactive prototypes', dueDate: this.addDays(14), priority: 'high' },
          { name: '⚙️ Core System Development', description: 'Implement core functionality and features', dueDate: this.addDays(30), priority: 'high' },
          { name: '🔒 Security Implementation & Testing', description: 'Implement security measures and conduct testing', dueDate: this.addDays(35), priority: 'high' },
          { name: '🚀 Deployment & Launch Preparation', description: 'Prepare for production deployment and launch', dueDate: this.addDays(40), priority: 'medium' },
          { name: '📊 Performance Monitoring Setup', description: 'Implement monitoring and analytics systems', dueDate: this.addDays(42), priority: 'medium' }
        ];
      case 'marketing_campaign':
        return [
          { name: '🎯 Target Audience Research & Segmentation', description: 'Identify and analyze target demographics', dueDate: this.addDays(5), priority: 'high' },
          { name: '📝 Content Strategy Development', description: 'Create comprehensive content strategy and calendar', dueDate: this.addDays(10), priority: 'high' },
          { name: '🎨 Creative Asset Production', description: 'Design and produce marketing materials', dueDate: this.addDays(15), priority: 'high' },
          { name: '📱 Multi-Channel Campaign Setup', description: 'Configure campaigns across all channels', dueDate: this.addDays(20), priority: 'high' },
          { name: '📊 Analytics & Tracking Implementation', description: 'Setup comprehensive tracking and analytics', dueDate: this.addDays(18), priority: 'medium' }
        ];
      default:
        return [
          { name: '📋 Project Scope Definition', description: 'Clearly define project objectives and deliverables', dueDate: this.addDays(3), priority: 'high' },
          { name: '🔍 Stakeholder Analysis', description: 'Identify and analyze key stakeholders', dueDate: this.addDays(5), priority: 'high' },
          { name: '⚡ Execution Phase 1', description: 'Begin primary execution activities', dueDate: this.addDays(14), priority: 'high' },
          { name: '📊 Progress Review & Optimization', description: 'Review progress and optimize approach', dueDate: this.addDays(21), priority: 'medium' }
        ];
    }
  }

  private async setupProjectEcosystem(projectName: string, analysis: any, executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>, results: any): Promise<void> {
    // Create Slack workspace for communication
    if (this.tools.has('slack_tool')) {
      const channelName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await executeToolFn({
        name: 'slack_tool',
        args: {
          action: 'create_channel',
          name: channelName,
          description: `🚀 Project channel for ${projectName} - Automated by Jotium AI`,
          topic: `Project Status: Planning Phase | Next Milestone: ${this.addDays(7)}`
        },
        id: generateUUID()
      });
      results.actions.push(`💬 Created Slack channel: #${channelName}`);
    }

    // Schedule milestone meetings
    if (this.tools.has('google_calendar_operations')) {
      const milestones = [
        { name: 'Project Kickoff', days: 2, duration: 60 },
        { name: 'Progress Review 1', days: 14, duration: 45 },
        { name: 'Mid-point Review', days: 30, duration: 60 },
        { name: 'Final Review', days: 45, duration: 90 }
      ];

      for (const milestone of milestones) {
        await executeToolFn({
          name: 'google_calendar_operations',
          args: {
            action: 'create_event',
            summary: `${projectName} - ${milestone.name}`,
            description: `${milestone.name} for ${projectName}\n\nProject Type: ${analysis.type}\nScope: ${analysis.scope}`,
            start: this.addDays(milestone.days).toISOString(),
            duration: milestone.duration
          },
          id: generateUUID()
        });
      }
      results.actions.push(`📅 Scheduled ${milestones.length} milestone meetings`);
    }

    // Create documentation framework
    if (this.tools.has('notion_tool')) {
      await executeToolFn({
        name: 'notion_tool',
        args: {
          action: 'create_page',
          title: `${projectName} - Master Hub`,
          content: this.generateProjectHubContent(projectName, analysis)
        },
        id: generateUUID()
      });
      results.actions.push(`📚 Created comprehensive project documentation hub`);
    }
  }

  private generateLearningResources(topic: string): string[] {
    const baseQuery = this.extractCoreQuery(topic);
    return [
      `🎥 YouTube: Search for "${baseQuery} tutorial 2025" for latest video guides`,
      `🎥 YouTube: "${baseQuery} case study" for real-world examples`,
      `🎥 YouTube: "${baseQuery} best practices" for expert insights`,
      `📚 Recommended reading: Industry reports and whitepapers on ${baseQuery}`,
      `🎓 Course suggestion: Look for courses on ${baseQuery} fundamentals and advanced techniques`
    ];
  }

  // ===== Gmail Workflows =====
  private async gmailSummarizeByIdWorkflow(
    context: any,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
  ): Promise<any> {
    if (!this.tools.has('gmail_operations')) {
      return this.generateToolConnectionGuidance('google_services');
    }

    const messageId = this.extractGmailMessageId(context.userMessage);
    if (!messageId) {
      return { success: false, useDefaultFlow: true, error: 'No Gmail message ID detected in request.' };
    }

    const res = await executeToolFn({
      name: 'gmail_operations',
      args: { action: 'get_message', messageId },
      id: generateUUID()
    });

    if (!res.result?.success) {
      return { success: false, error: res.result?.error || 'Failed to retrieve email.' };
    }

    const msg = res.result.message || {};
    const subject = msg.subject || '(No subject)';
    const from = msg.from || '(Unknown sender)';
    const body = this.createConciseEmailBody(msg.body || msg.snippet || '');

    const summary = `Subject: ${subject}\nFrom: ${from}\n\nBody:\n${body}`;

    return {
      success: true,
      summary,
      email: { id: msg.id, subject, from, body }
    };
  }

  private async gmailSendEmailWorkflow(
    context: any,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
  ): Promise<any> {
    if (!this.tools.has('gmail_operations')) {
      return this.generateToolConnectionGuidance('google_services');
    }

    const parsed = this.parseSendEmailRequest(context.userMessage);
    if (!parsed) {
      return { success: false, useDefaultFlow: true, error: 'Could not parse email details.' };
    }

    // Convert Markdown to HTML if message is not already HTML
    let isHtml = parsed.isHtml;
    let body = parsed.body || '';
    if (!isHtml) {
      const looksLikeHtml = /<\w+[^>]*>/.test(body) || /^\s*<!DOCTYPE html>/i.test(body);
      if (looksLikeHtml) {
        isHtml = true;
      } else {
        body = this.convertMarkdownToHtml(body);
        isHtml = true;
      }
    }

    const res = await executeToolFn({
      name: 'gmail_operations',
      args: {
        action: 'send_email',
        to: parsed.to,
        cc: parsed.cc,
        bcc: parsed.bcc,
        subject: parsed.subject,
        body,
        isHtml
      },
      id: generateUUID()
    });

    if (!res.result?.success) {
      return { success: false, error: res.result?.error || 'Failed to send email.' };
    }

    return {
      success: true,
      summary: `📧 Email sent successfully to ${parsed.to.join(', ')} with subject "${parsed.subject}".`,
      messageId: res.result.messageId,
      threadId: res.result.threadId
    };
  }

  // ===== Gmail helpers =====
  private extractGmailMessageId(text: string): string | null {
    const idFromLabel = text.match(/\b(message\s*id|email\s*id|id)\s*[:#-]?\s*([A-Za-z0-9_\-]{8,})/i);
    if (idFromLabel && idFromLabel[2]) return idFromLabel[2];
    const generic = text.match(/\b([A-Za-z0-9_\-]{16,})\b/);
    return generic ? generic[1] : null;
  }

  private createConciseEmailBody(body: string): string {
    const normalized = body
      .replace(/\r\n|\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    const maxLen = 1200;
    return normalized.length > maxLen ? `${normalized.slice(0, maxLen)}…` : normalized;
  }

  private parseSendEmailRequest(text: string): { to: string[]; cc: string[]; bcc: string[]; subject: string; body: string; isHtml: boolean } | null {
    const emails = Array.from(new Set((text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [])));
    const toMatch = text.match(/\bto\s*:\s*([^\n]+)/i);
    const toList = toMatch ? (toMatch[1].match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []) : emails;

    const ccMatch = text.match(/\bcc\s*:\s*([^\n]+)/i);
    const bccMatch = text.match(/\bbcc\s*:\s*([^\n]+)/i);
    const cc = ccMatch ? (ccMatch[1].match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []) : [];
    const bcc = bccMatch ? (bccMatch[1].match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []) : [];

    const subjMatch = text.match(/\bsubject\s*:\s*("([^"]+)"|([^\n]+))/i);
    const subject = subjMatch ? (subjMatch[2] || subjMatch[3]).trim() : '';

    const bodyMatch = text.match(/\b(body|message|content)\s*:\s*([\s\S]+)/i);
    const body = bodyMatch ? bodyMatch[2].trim() : '';

    const isHtml = /\bhtml\b/i.test(text) && /\bformat\b|\bhtml\b/i.test(text);

    if (!toList || toList.length === 0 || !subject || !body) return null;

    return {
      to: toList,
      cc,
      bcc,
      subject,
      body,
      isHtml
    };
  }

  private convertMarkdownToHtml(markdown: string): string {
    let html = markdown;
    // Escape basic HTML first
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Code blocks ```
    html = html.replace(/```([\s\S]*?)```/g, (_m, code) => `<pre><code>${code.replace(/\n/g, '\n')}</code></pre>`);
    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Headings
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    // Bold and italics
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    // Lists
    html = html.replace(/^(?:-\s+|\*\s+)(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>[^<]+<\/li>\s*)+/g, (m) => `<ul>${m}</ul>`);
    // Paragraphs and line breaks
    html = html
      .split(/\n\n+/)
      .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');
    // Unescape allowed tags from earlier escaping inside code blocks already handled
    return `<!DOCTYPE html><html><body>${html}</body></html>`;
  }

  private generateVideoResourcesFromSerper(videos: any[]): string[] {
    if (!Array.isArray(videos) || videos.length === 0) return [];
    const top = videos.slice(0, 5);
    return top.map((v: any) => `🎥 ${v.title} — ${v.link}`);
  }

  private generateProjectInsights(analysis: any): string[] {
    return [
      `🧠 This ${analysis.type} project has ${analysis.complexity} complexity and estimated ${analysis.timeline} timeline`,
      `⚡ Key success factors: ${analysis.successFactors?.join(', ') || 'clear requirements, team communication, regular reviews'}`,
      `⚠️ Potential risks identified: ${analysis.risks?.join(', ') || 'scope creep, resource constraints, timeline pressure'}`,
      `🎯 Success metrics: ${analysis.metrics?.join(', ') || 'on-time delivery, quality standards, stakeholder satisfaction'}`
    ];
  }

  private generateIntelligentNextSteps(analysis: any): string[] {
    return [
      `🔄 Set up automated daily progress updates via Slack/email`,
      `👥 Invite team members and assign specific roles and responsibilities`,
      `📊 Create project dashboard for real-time progress tracking`,
      `🔗 Integrate with CI/CD pipeline for automated deployments (if applicable)`,
      `📈 Schedule weekly stakeholder progress reports`,
      `🛡️ Implement risk monitoring and mitigation strategies`
    ];
  }

  // Helper methods
  private addDays(days: number): Date {
    const date = new Date(this.currentDate);
    date.setDate(date.getDate() + days);
    return date;
  }

  private analyzeProjectRequirements(message: string): any {
    return {
      type: this.inferProjectType(message),
      scope: this.inferProjectScope(message),
      complexity: this.analyzeComplexity(message),
      timeline: this.estimateTimeline(message),
      priority: this.inferPriority(message),
      description: this.generateIntelligentDescription(message)
    };
  }

  private inferProjectType(message: string): string {
    if (message.includes('website') || message.includes('app') || message.includes('software')) return 'software_development';
    if (message.includes('marketing') || message.includes('campaign')) return 'marketing_campaign';
    if (message.includes('research') || message.includes('study')) return 'research_project';
    return 'general_project';
  }

  private selectOptimalProjectTool(): string | null {
    const projectTools = ['asana_tool', 'linear_management', 'notion_tool', 'clickup_tool', 'trello_tool'];
    return projectTools.find(tool => this.tools.has(tool)) || null;
  }

  private generateToolConnectionGuidance(
    category: 'project_management' | 'google_services'
  ): any {
    const guidance: Record<
      'project_management' | 'google_services',
      { tools: string[]; path: string; benefit: string }
    > = {
      project_management: {
        tools: ['Asana', 'Linear', 'Notion', 'ClickUp', 'Trello'],
        path: 'Settings > API Keys',
        benefit:
          'Enable intelligent project creation with automated task breakdown, milestone scheduling, and team collaboration setup'
      },
      google_services: {
        tools: ['Gmail', 'Google Calendar', 'Google Drive'],
        path: 'Settings > OAuth Connections',
        benefit:
          'Enable seamless calendar management, email automation, and document collaboration'
      }
    };

    return {
      success: false,
      error: `To unlock full autonomous capabilities, please connect ${guidance[category].tools.join(' or ')} in ${guidance[category].path}.`,
      benefits: guidance[category].benefit,
      nextSteps: [`Connect tools in ${guidance[category].path} for enhanced autonomous operation`]
    };
  }

  // Additional utility methods would continue here...
  
  private matchesPattern(message: string, verbs: string[], objects: string[]): boolean {
    const hasVerb = verbs.some(verb => message.includes(verb));
    const hasObject = objects.some(obj => message.includes(obj));
    return hasVerb && hasObject;
  }

  private extractCoreQuery(message: string): string {
    return message.replace(/research|find|search|analyze|investigate|about|on/gi, '').trim();
  }

  private getAvailableProjectTools(): string[] {
    const projectTools = ['asana_tool', 'notion_tool', 'clickup_tool', 'trello_tool', 'linear_management'];
    return projectTools.filter(tool => this.tools.has(tool));
  }

  // Placeholder methods - implement based on your needs
  private analyzeContext(message: string): any { return {}; }
  private determineAutonomyLevel(complexity: any, confidence: number): string { return 'semi_autonomous'; }
  private analyzeComplexity(message: string): string { return 'medium'; }
  private assessAvailableResources(): any { return {}; }
  private predictChallenges(message: string, resources: any): any { return {}; }
  private calculateExecutionConfidence(complexity: any, resources: any, challenges: any): number { return 0.8; }
  private generateExecutionPlan(intent: any, message: string): any { return {}; }
  private extractOrGenerateIntelligentProjectName(message: string): string { 
    const quoted = message.match(/"([^"]+)"/);
    return quoted ? quoted[1] : 'AI-Powered Project Initiative';
  }
  private inferProjectScope(message: string): string { return 'medium'; }
  private estimateTimeline(message: string): string { return '4-6 weeks'; }
  private inferPriority(message: string): string { return 'medium'; }
  private generateIntelligentDescription(message: string): string {
    return `Intelligent project generated from: "${message}". This project leverages AI-driven analysis for optimal execution and automated workflow management.`;
  }
  private generateProjectHubContent(name: string, analysis: any): string {
    return `# ${name} - Project Hub\n\n## Overview\n${analysis.description}\n\n## Timeline\n${analysis.timeline}\n\n## Resources\nAll project resources and documentation will be maintained here.`;
  }
  private generateActionableInsights(analysis: string, message: string): string[] {
    return ['Key insight 1', 'Key insight 2', 'Key insight 3'];
  }
  private synthesizeIntelligenceReport(findings: any[], sources: any[]): string {
    return 'Comprehensive intelligence analysis completed.';
  }
  private selectHighValueSources(findings: any[]): any[] {
    // Simple heuristic: flatten normalized results and take top N
    const flat: any[] = [];
    for (const f of findings) {
      if (Array.isArray(f.results)) {
        for (const r of f.results) {
          flat.push({ url: r.url, title: r.title, relevance: f.priority === 'high' ? 1 : 0.5 });
        }
      }
    }
    // Deduplicate by URL
    const seen = new Set<string>();
    const unique: any[] = [];
    for (const item of flat) {
      if (item.url && !seen.has(item.url)) {
        seen.add(item.url);
        unique.push(item);
      }
    }
    return unique.slice(0, 10);
  }
  private formatComprehensiveReport(results: any): string {
    const videos = Array.isArray(results.videos) && results.videos.length > 0
      ? `\n\n## Video Resources\n${results.videos.slice(0,5).map((v: any) => `- ${v.title} — ${v.link}`).join('\n')}`
      : '';
    return `# Intelligence Report\n\n## Analysis\n${results.analysis}\n\n## Key Insights\n${results.insights.join('\n')}${videos}`;
  }

  private normalizeSearchResults(engine: 'tavily' | 'serper_search' | 'duckduckgo_search', raw: any[]): any[] {
    if (!Array.isArray(raw)) return [];
    switch (engine) {
      case 'tavily':
        return raw.map((r: any) => ({ title: r.title, url: r.url, snippet: r.content }));
      case 'serper_search':
        return raw.map((r: any) => ({ title: r.title, url: r.link, snippet: r.snippet }));
      case 'duckduckgo_search':
        return raw.map((r: any) => ({ title: r.title, url: r.url, snippet: r.snippet }));
      default:
        return raw;
    }
  }
  private async getOptimalWorkspace(tool: string, executeToolFn: any): Promise<string | null> { return null; }
  private async adaptiveAutomationWorkflow(context: any, executeToolFn: any): Promise<any> { 
    return { success: true, summary: 'Automation workflow placeholder' };
  }
  private async adaptiveProblemSolvingWorkflow(context: any, executeToolFn: any): Promise<any> {
    return { success: true, summary: 'Problem solving workflow placeholder' };
  }
  private handleWorkflowError(error: any, context: any): any {
    return { success: false, error: error.message, context };
  }
}