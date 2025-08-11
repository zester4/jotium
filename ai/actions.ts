//ai/actions.ts
import { Tool, ToolCall, ToolResult } from "./types";
import { generateUUID } from "@/lib/utils";

export interface ResearchWorkflow {
  queries: string[];
  sources: string[];
  visualizations?: string[];
  reportStructure: string[];
  requiresVisualization?: boolean;
}

export interface EmailSummaryWorkflow {
  emailIds: string[];
  summaries: string[];
  actionItems: string[];
  nextSteps: string[];
}

export interface ProjectAnalysisWorkflow {
  platform: 'linear' | 'notion' | 'clickup' | 'trello' | 'asana';
  workspaceId?: string;
  projectIds: string[];
  taskSummaries: string[];
  insights: string[];
}

export interface DataVisualizationWorkflow {
  dataSource: string;
  chartTypes: string[];
  visualizations: any[];
  insights: string[];
}

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

interface ReasoningChain {
  userGoal: string;
  subGoals: string[];
  toolStrategy: string[];
  executionPlan: ExecutionStep[];
  riskAssessment: string[];
  successCriteria: string[];
}

interface ExecutionStep {
  id: string;
  action: string;
  tool: string;
  params: Record<string, any>;
  dependencies: string[];
  fallbackTools: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  adaptable: boolean;
}

interface ExecutionContext {
  results: Map<string, any>;
  insights: string[];
  adaptations: string[];
  nextOpportunities: string[];
  failureRecovery: string[];
}

export class EnhancedAgenticEngine {
  private tools: Map<string, Tool>;
  private executionMemory: Map<string, ExecutionContext> = new Map();
  private learningPatterns: Map<string, number> = new Map();

  constructor(tools: Map<string, Tool>) {
    this.tools = tools;
  }

  public classifyIntent(userMessage: string): EnhancedActionIntent {
    const reasoning = this.performDeepReasoning(userMessage);
    const intent = this.synthesizeIntent(reasoning, userMessage);
    
    // Learn from pattern success rates
    this.updateLearningPatterns(intent.action, intent.confidence);
    
    return intent;
  }

  public async executeEnhancedWorkflow(
    intent: EnhancedActionIntent,
    userMessage: string,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
  ): Promise<any> {
    const reasoning = this.performDeepReasoning(userMessage);
    const context: ExecutionContext = {
      results: new Map(),
      insights: [],
      adaptations: [],
      nextOpportunities: [],
      failureRecovery: []
    };

    try {
      // Intelligent workflow orchestration
      return await this.executeIntelligentWorkflow(reasoning, intent, context, executeToolFn);
    } catch (error) {
      return await this.handleIntelligentFailure(error, reasoning, context, executeToolFn);
    }
  }

  // Deep Multi-Layer Reasoning Engine
  private performDeepReasoning(message: string): ReasoningChain {
    // Layer 1: Semantic Analysis
    const semantics = this.analyzeSemantics(message);
    
    // Layer 2: Intent Decomposition 
    const userGoal = this.extractPrimaryGoal(semantics);
    const subGoals = this.decomposeIntoSubGoals(userGoal, semantics);
    
    // Layer 3: Tool Strategy Planning
    const toolStrategy = this.planToolStrategy(subGoals, semantics);
    
    // Layer 4: Dynamic Execution Planning
    const executionPlan = this.generateAdaptiveExecutionPlan(subGoals, toolStrategy);
    
    // Layer 5: Risk & Success Analysis
    const riskAssessment = this.assessExecutionRisks(executionPlan);
    const successCriteria = this.defineSuccessCriteria(userGoal, subGoals);

    return {
      userGoal,
      subGoals,
      toolStrategy,
      executionPlan,
      riskAssessment,
      successCriteria
    };
  }

  private analyzeSemantics(message: string): any {
    const entities = this.extractEntities(message);
    const actions = this.extractActionPatterns(message);
    const context = this.extractContextualCues(message);
    const urgency = this.assessUrgency(message);
    const complexity = this.assessComplexity(message);
    
    return { entities, actions, context, urgency, complexity };
  }

  private extractPrimaryGoal(semantics: any): string {
    const { actions, entities, context } = semantics;
    
    // Multi-signal goal detection
    if (this.detectPattern(['flight', 'book', 'travel'], entities, actions, context)) {
      return 'Execute intelligent flight booking with price optimization';
    }
    
    if (this.detectPattern(['research', 'analyze', 'study'], entities, actions, context)) {
      return 'Conduct comprehensive multi-source research with expert analysis';
    }
    
    if (this.detectPattern(['create', 'project', 'build'], entities, actions, context)) {
      return 'Establish complete project ecosystem with intelligent automation';
    }
    
    if (this.detectPattern(['email', 'send', 'gmail'], entities, actions, context)) {
      return 'Provide intelligent email management with contextual understanding';
    }
    
    if (this.detectPattern(['stock', 'financial', 'market'], entities, actions, context)) {
      return 'Execute comprehensive financial analysis with actionable insights';
    }
    
    return 'Provide adaptive intelligent assistance';
  }

  private decomposeIntoSubGoals(primaryGoal: string, semantics: any): string[] {
    const goalDecomposition: Record<string, string[]> = {
      'Execute intelligent flight booking with price optimization': [
        'Parse travel requirements with intelligent defaults',
        'Execute multi-provider flight search',
        'Analyze pricing patterns and alternatives',
        'Provide booking optimization recommendations',
        'Set up price monitoring if requested'
      ],
      'Conduct comprehensive multi-source research with expert analysis': [
        'Execute multi-engine search across sources',
        'Discover relevant educational videos',
        'Synthesize insights from multiple perspectives',
        'Generate expert-level analysis and recommendations',
        'Create structured research report with next steps'
      ],
      'Establish complete project ecosystem with intelligent automation': [
        'Analyze project requirements and optimal toolchain',
        'Create project structure with intelligent defaults',
        'Generate adaptive task breakdown',
        'Integrate communication and tracking systems',
        'Establish automation workflows and monitoring'
      ],
      'Provide intelligent email management with contextual understanding': [
        'Parse email context and intent',
        'Execute appropriate email operation',
        'Apply intelligent formatting and optimization',
        'Provide follow-up suggestions and automation'
      ],
      'Execute comprehensive financial analysis with actionable insights': [
        'Gather multi-source financial data',
        'Perform technical and fundamental analysis',
        'Research market sentiment and news',
        'Generate risk-adjusted recommendations',
        'Create monitoring and alert systems'
      ]
    };
    
    return goalDecomposition[primaryGoal] || ['Provide contextual assistance', 'Generate actionable insights'];
  }

  private planToolStrategy(subGoals: string[], semantics: any): string[] {
    const strategy: string[] = [];
    const availableTools = Array.from(this.tools.keys());
    
    // Intelligent tool selection based on goals and availability
    for (const goal of subGoals) {
      if (goal.includes('search') || goal.includes('research')) {
        const searchTools = this.rankSearchTools();
        strategy.push(`Primary: ${searchTools[0]}, Fallback: ${searchTools[1]}`);
      }
      
      if (goal.includes('project') && this.tools.has('asana_tool')) {
        strategy.push('Use Asana for project management with intelligent task generation');
      }
      
      if (goal.includes('flight') && this.tools.has('flight_booking')) {
        strategy.push('Use flight booking with intelligent parameter optimization');
      }
      
      if (goal.includes('financial') && this.tools.has('alphavantage_tool')) {
        strategy.push('Use AlphaVantage with web search for comprehensive analysis');
      }
      
      if (goal.includes('email') && this.tools.has('gmail_operations')) {
        strategy.push('Use Gmail operations with intelligent context processing');
      }
    }
    
    return strategy.length > 0 ? strategy : ['Use available tools adaptively'];
  }

  private generateAdaptiveExecutionPlan(subGoals: string[], toolStrategy: string[]): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    
    // Dynamic step generation based on goals and available tools
    subGoals.forEach((goal, index) => {
      const step = this.createIntelligentStep(goal, toolStrategy[index] || toolStrategy[0], index);
      if (step) steps.push(step);
    });
    
    // Add adaptive coordination steps
    if (steps.length > 2) {
      steps.push({
        id: 'synthesize_results',
        action: 'Synthesize insights from all execution steps',
        tool: 'internal',
        params: { type: 'synthesis' },
        dependencies: steps.map(s => s.id),
        fallbackTools: [],
        priority: 'high',
        adaptable: true
      });
    }
    
    return steps;
  }

  private createIntelligentStep(goal: string, strategy: string, index: number): ExecutionStep | null {
    const stepId = `step_${index}_${Date.now()}`;
    
    // Flight booking steps
    if (goal.includes('flight')) {
      return {
        id: stepId,
        action: goal,
        tool: 'flight_booking',
        params: { action: 'intelligent_search' },
        dependencies: [],
        fallbackTools: ['web_search'],
        priority: 'critical',
        adaptable: true
      };
    }
    
    // Research steps
    if (goal.includes('search') || goal.includes('research')) {
      const searchTool = this.selectOptimalSearchTool();
      return {
        id: stepId,
        action: goal,
        tool: searchTool,
        params: { enhanced: true, depth: 'comprehensive' },
        dependencies: [],
        fallbackTools: this.getFallbackSearchTools(searchTool),
        priority: 'critical',
        adaptable: true
      };
    }
    
    // Project management steps
    if (goal.includes('project')) {
      const projectTool = this.selectOptimalProjectTool();
      return {
        id: stepId,
        action: goal,
        tool: projectTool,
        params: { intelligent: true },
        dependencies: [],
        fallbackTools: ['notion_tool'],
        priority: 'high',
        adaptable: true
      };
    }
    
    return null;
  }

  // Intelligent Workflow Execution
  private async executeIntelligentWorkflow(
    reasoning: ReasoningChain,
    intent: EnhancedActionIntent,
    context: ExecutionContext,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
  ): Promise<any> {
    const { executionPlan } = reasoning;
    
    for (const step of executionPlan) {
      // Check if dependencies are satisfied
      if (!this.areDependenciesSatisfied(step.dependencies, context)) {
        if (step.priority === 'critical') {
          // Try alternative approach
          const alternative = await this.findAlternativeExecution(step, context, executeToolFn);
          if (alternative) {
            context.adaptations.push(`Adapted ${step.action} using alternative approach`);
            context.results.set(step.id, alternative);
            continue;
          }
        } else {
          context.insights.push(`Skipped non-critical step: ${step.action}`);
          continue;
        }
      }
      
      try {
        const result = await this.executeIntelligentStep(step, context, executeToolFn);
        context.results.set(step.id, result);
        
        // Real-time adaptation based on results
        if (step.adaptable && this.shouldAdapt(result, step)) {
          const adaptation = await this.adaptExecution(step, result, executionPlan, executeToolFn);
          if (adaptation) {
            context.adaptations.push(`Adapted execution based on ${step.action} results`);
          }
        }
        
      } catch (error) {
        const recovery = await this.attemptIntelligentRecovery(step, error, executeToolFn);
        if (recovery) {
          context.results.set(step.id, recovery);
          context.failureRecovery.push(`Recovered from ${step.action} failure`);
        } else if (step.priority === 'critical') {
          throw new Error(`Critical step failed: ${step.action}`);
        }
      }
    }
    
    // Generate intelligent insights and next steps
    return this.synthesizeIntelligentResults(reasoning, context, intent);
  }

  private async executeIntelligentStep(
    step: ExecutionStep,
    context: ExecutionContext,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
  ): Promise<any> {
    // Enhance parameters with context
    const enhancedParams = this.enhanceParametersWithContext(step.params, context);
    
    const toolCall: ToolCall = {
      name: step.tool,
      args: enhancedParams,
      id: generateUUID()
    };
    
    return await executeToolFn(toolCall);
  }

  private async findAlternativeExecution(
    step: ExecutionStep,
    context: ExecutionContext,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
  ): Promise<any> {
    // Try fallback tools
    for (const fallbackTool of step.fallbackTools) {
      if (this.tools.has(fallbackTool)) {
        try {
          const alternativeStep = { ...step, tool: fallbackTool };
          return await this.executeIntelligentStep(alternativeStep, context, executeToolFn);
        } catch (error) {
          continue;
        }
      }
    }
    return null;
  }

  private synthesizeIntelligentResults(
    reasoning: ReasoningChain,
    context: ExecutionContext,
    intent: EnhancedActionIntent
  ): any {
    const successfulSteps = Array.from(context.results.values()).filter(r => r?.result?.success !== false).length;
    const totalSteps = reasoning.executionPlan.length;
    const successRate = successfulSteps / totalSteps;
    
    // Generate intelligent summary
    const summary = this.generateIntelligentSummary(reasoning, context, successRate);
    
    // Extract actionable insights
    const insights = this.extractActionableInsights(context.results, reasoning);
    
    // Generate proactive next steps
    const nextSteps = this.generateProactiveNextSteps(reasoning, context, intent);
    
    // Identify new opportunities
    const opportunities = this.identifyNewOpportunities(context.results, reasoning);
    
    return {
      success: successRate > 0.5,
      summary,
      insights,
      nextSteps,
      opportunities,
      actions: this.generateActionsSummary(context),
      adaptations: context.adaptations,
      executionStats: {
        successRate: Math.round(successRate * 100),
        stepsCompleted: successfulSteps,
        totalSteps,
        adaptationsMade: context.adaptations.length
      }
    };
  }

  // Utility methods for intelligent operations
  private rankSearchTools(): string[] {
    const tools = ['serper_search', 'web_search', 'duckduckgo_search'];
    return tools.filter(tool => this.tools.has(tool)).sort((a, b) => {
      // Rank based on learning patterns and capabilities
      const aScore = this.learningPatterns.get(a) || 0.5;
      const bScore = this.learningPatterns.get(b) || 0.5;
      return bScore - aScore;
    });
  }

  private selectOptimalSearchTool(): string {
    return this.rankSearchTools()[0] || 'web_search';
  }

  private selectOptimalProjectTool(): string {
    const tools = ['asana_tool', 'linear_management', 'notion_tool'];
    return tools.find(tool => this.tools.has(tool)) || 'notion_tool';
  }

  private getFallbackSearchTools(primary: string): string[] {
    return this.rankSearchTools().filter(tool => tool !== primary);
  }

  private detectPattern(keywords: string[], entities: any, actions: any, context: any): boolean {
    const entityMatch = keywords.some(k => entities.some((e: string) => e.toLowerCase().includes(k)));
    const actionMatch = keywords.some(k => actions.some((a: string) => a.toLowerCase().includes(k)));
    const contextMatch = keywords.some(k => context.toLowerCase().includes(k));
    
    return entityMatch || actionMatch || contextMatch;
  }

  private extractEntities(message: string): string[] {
    // Enhanced entity extraction
    const entities = [];
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const stockPattern = /\$[A-Z]{2,5}|\b[A-Z]{2,5}\b(?=\s|$)/g;
    const datePattern = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g;
    const airportPattern = /\b[A-Z]{3}\b/g;
    
    entities.push(...(message.match(emailPattern) || []));
    entities.push(...(message.match(stockPattern) || []));
    entities.push(...(message.match(datePattern) || []));
    entities.push(...(message.match(airportPattern) || []));
    
    return entities;
  }

  private extractActionPatterns(message: string): string[] {
    const actionWords = [
      'create', 'build', 'develop', 'setup', 'initialize', 'generate',
      'search', 'find', 'research', 'analyze', 'investigate', 'study',
      'send', 'compose', 'draft', 'reply', 'forward',
      'book', 'reserve', 'schedule', 'plan',
      'track', 'monitor', 'watch', 'alert'
    ];
    
    return actionWords.filter(word => message.toLowerCase().includes(word));
  }

  private extractContextualCues(message: string): string {
    return message.toLowerCase();
  }

  private assessUrgency(message: string): 'low' | 'medium' | 'high' | 'critical' {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];
    const highKeywords = ['soon', 'quickly', 'today', 'now'];
    
    if (urgentKeywords.some(k => message.toLowerCase().includes(k))) return 'critical';
    if (highKeywords.some(k => message.toLowerCase().includes(k))) return 'high';
    return 'medium';
  }

  private assessComplexity(message: string): 'low' | 'medium' | 'high' {
    const complexKeywords = ['comprehensive', 'detailed', 'complete', 'full', 'thorough'];
    const simpleKeywords = ['simple', 'basic', 'quick', 'brief'];
    
    if (complexKeywords.some(k => message.toLowerCase().includes(k))) return 'high';
    if (simpleKeywords.some(k => message.toLowerCase().includes(k))) return 'low';
    return 'medium';
  }

  private synthesizeIntent(reasoning: ReasoningChain, message: string): EnhancedActionIntent {
    const confidence = this.calculateIntentConfidence(reasoning);
    const category = this.categorizeIntent(reasoning.userGoal);
    
    return {
      category,
      action: reasoning.userGoal.replace(/\s+/g, '_').toLowerCase(),
      confidence,
      requiredTools: this.extractRequiredTools(reasoning),
      optionalTools: this.extractOptionalTools(reasoning),
      reasoningDepth: confidence > 0.9 ? 'comprehensive' : 'deep',
      autonomyLevel: confidence > 0.85 ? 'fully_autonomous' : 'semi_autonomous',
      context: { reasoning, originalMessage: message },
      chainedActions: reasoning.subGoals,
      proactiveOpportunities: this.identifyProactiveOpportunities(reasoning)
    };
  }

  // Additional helper methods
  private updateLearningPatterns(action: string, confidence: number): void {
    const current = this.learningPatterns.get(action) || 0.5;
    const updated = (current * 0.8) + (confidence * 0.2); // Moving average
    this.learningPatterns.set(action, updated);
  }

  private calculateIntentConfidence(reasoning: ReasoningChain): number {
    // Multi-factor confidence calculation
    const goalClarity = reasoning.subGoals.length > 0 ? 0.3 : 0.1;
    const toolAvailability = reasoning.toolStrategy.length > 0 ? 0.3 : 0.1;
    const executionFeasibility = reasoning.executionPlan.length > 0 ? 0.3 : 0.1;
    const riskLevel = reasoning.riskAssessment.length < 3 ? 0.1 : 0.05;
    
    return Math.min(0.95, goalClarity + toolAvailability + executionFeasibility + riskLevel);
  }

  private categorizeIntent(goal: string): string {
    if (goal.includes('flight')) return 'travel_management';
    if (goal.includes('research')) return 'knowledge_discovery';
    if (goal.includes('project')) return 'project_orchestration';
    if (goal.includes('email')) return 'communication_management';
    if (goal.includes('financial')) return 'financial_intelligence';
    return 'adaptive_assistance';
  }

  // Placeholder implementations for remaining methods
  private assessExecutionRisks(plan: ExecutionStep[]): string[] { return []; }
  private defineSuccessCriteria(goal: string, subGoals: string[]): string[] { return []; }
  private areDependenciesSatisfied(deps: string[], context: ExecutionContext): boolean { return true; }
  private shouldAdapt(result: any, step: ExecutionStep): boolean { return false; }
  private async adaptExecution(step: ExecutionStep, result: any, plan: ExecutionStep[], executeToolFn: any): Promise<any> { return null; }
  private async attemptIntelligentRecovery(step: ExecutionStep, error: any, executeToolFn: any): Promise<any> { return null; }
  private enhanceParametersWithContext(params: any, context: ExecutionContext): any { return params; }
  private generateIntelligentSummary(reasoning: ReasoningChain, context: ExecutionContext, rate: number): string { return 'Intelligent execution completed'; }
  private extractActionableInsights(results: Map<string, any>, reasoning: ReasoningChain): string[] { return []; }
  private generateProactiveNextSteps(reasoning: ReasoningChain, context: ExecutionContext, intent: EnhancedActionIntent): string[] { return []; }
  private identifyNewOpportunities(results: Map<string, any>, reasoning: ReasoningChain): string[] { return []; }
  private generateActionsSummary(context: ExecutionContext): string[] { return []; }
  private extractRequiredTools(reasoning: ReasoningChain): string[] { return []; }
  private extractOptionalTools(reasoning: ReasoningChain): string[] { return []; }
  private identifyProactiveOpportunities(reasoning: ReasoningChain): string[] { return []; }
  private async handleIntelligentFailure(error: any, reasoning: ReasoningChain, context: ExecutionContext, executeToolFn: any): Promise<any> { 
    return { success: false, error: error.message, useDefaultFlow: true }; 
  }

// Enhanced Research Workflow
private async executeAdvancedResearch(
  query: string,
  context: ExecutionContext,
  executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
): Promise<any> {
  const researchPlan = this.createResearchPlan(query);
  const searchResults: any[] = [];
  
  console.log(`🔬 Executing advanced research: ${researchPlan.queries.length} queries across multiple sources`);
  
  // Execute parallel searches across all available search tools
  const searchTools = this.getAvailableSearchTools();
  
  for (const searchQuery of researchPlan.queries) {
    console.log(`📊 Researching: ${searchQuery}`);
    
    // Search with multiple tools for comprehensive coverage
    for (const tool of searchTools) {
      try {
        const toolCall: ToolCall = {
          name: tool,
          args: { 
            query: searchQuery,
            num_results: 10,
            region: 'global'
          },
          id: generateUUID()
        };
        
        const result = await executeToolFn(toolCall);
        if (result.result && result.result.success) {
          searchResults.push({
            query: searchQuery,
            tool: tool,
            data: result.result
          });
        }
      } catch (error) {
        console.log(`⚠️ Search failed on ${tool}: ${error}`);
        continue;
      }
    }
    
    // Add small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Synthesize and analyze results
  const analysis = await this.synthesizeResearchResults(searchResults, query, executeToolFn);
  
  // Generate data visualizations if needed
  if (researchPlan.requiresVisualization) {
    const visualizations = await this.generateResearchVisualizations(analysis, executeToolFn);
    analysis.visualizations = visualizations;
  }
  
  return {
    success: true,
    summary: `Completed comprehensive research on: ${query}`,
    findings: analysis.findings,
    sources: analysis.sources,
    visualizations: analysis.visualizations || [],
    recommendations: analysis.recommendations,
    nextSteps: this.generateResearchNextSteps(analysis)
  };
}

private createResearchPlan(query: string): ResearchWorkflow {
  // Create comprehensive research queries
  const baseQuery = query.toLowerCase();
  const queries: string[] = [query]; // Start with original query
  
  // Add complementary research angles
  if (baseQuery.includes('market') || baseQuery.includes('industry')) {
    queries.push(`${query} market trends 2024 2025`);
    queries.push(`${query} industry analysis statistics`);
    queries.push(`${query} competitive landscape research`);
  }
  
  if (baseQuery.includes('technology') || baseQuery.includes('tech')) {
    queries.push(`${query} latest developments 2024`);
    queries.push(`${query} implementation guide best practices`);
    queries.push(`${query} case studies success stories`);
  }
  
  if (baseQuery.includes('company') || baseQuery.includes('business')) {
    queries.push(`${query} financial performance analysis`);
    queries.push(`${query} business model strategy`);
    queries.push(`${query} news updates recent`);
  }
  
  // Add educational content searches
  queries.push(`${query} educational video tutorial`);
  queries.push(`${query} expert analysis research paper`);
  queries.push(`${query} practical applications examples`);
  
  const requiresVisualization = this.shouldCreateVisualizations(query);
  return {
    queries: queries.slice(0, 8), // Limit to prevent excessive API calls
    sources: [],
    visualizations: requiresVisualization ? ['trends', 'comparison'] : [],
    reportStructure: ['executive_summary', 'detailed_analysis', 'recommendations', 'sources'],
    requiresVisualization
  };
}

private getAvailableSearchTools(): string[] {
  const searchTools = ['serper_search', 'web_search', 'duckduckgo_search'];
  return searchTools.filter(tool => this.tools.has(tool));
}

private shouldCreateVisualizations(query: string): boolean {
  const visualKeywords = ['trend', 'comparison', 'analysis', 'data', 'statistics', 'market', 'performance'];
  return visualKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

private async synthesizeResearchResults(
  searchResults: any[],
  originalQuery: string,
  executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
): Promise<any> {
  // Group results by relevance and quality
  const groupedResults = this.groupSearchResults(searchResults);
  
  // Extract key findings
  const findings = this.extractKeyFindings(groupedResults);
  
  // Identify reliable sources
  const sources = this.identifyReliableSources(groupedResults);
  
  // Generate expert-level recommendations
  const recommendations = this.generateExpertRecommendations(findings, originalQuery);
  
  return {
    findings,
    sources,
    recommendations,
    dataPoints: this.extractDataPoints(groupedResults)
  };
}

private generateResearchNextSteps(analysis: any): string[] {
  return [
    "Review and validate key findings against additional sources",
    "Implement recommended strategies based on research insights",
    "Set up monitoring for ongoing developments in this area",
    "Consider conducting deeper analysis on specific findings of interest",
    "Schedule follow-up research to track changes and trends"
  ];
}

// Helper methods for research synthesis
private groupSearchResults(results: any[]): any {
  // Group by source quality and relevance
  return results.reduce((groups, result) => {
    const quality = this.assessResultQuality(result);
    if (!groups[quality]) groups[quality] = [];
    groups[quality].push(result);
    return groups;
  }, {});
}

private assessResultQuality(result: any): 'high' | 'medium' | 'low' {
  // Simple quality assessment based on source and content
  if (result.data?.results) {
    const hasReliableSource = result.data.results.some((r: any) => 
      r.url?.includes('.edu') || 
      r.url?.includes('.gov') || 
      r.url?.includes('research') ||
      r.title?.toLowerCase().includes('study')
    );
    return hasReliableSource ? 'high' : 'medium';
  }
  return 'low';
}

private extractKeyFindings(groupedResults: any): string[] {
  const findings: string[] = [];
  
  // Process high-quality results first
  if (groupedResults.high) {
    findings.push(...this.extractFindingsFromResults(groupedResults.high));
  }
  
  // Add medium quality insights
  if (groupedResults.medium) {
    findings.push(...this.extractFindingsFromResults(groupedResults.medium));
  }
  
  return findings.slice(0, 10); // Top 10 findings
}

private extractFindingsFromResults(results: any[]): string[] {
  return results.flatMap((result: any) => {
    if (result.data?.results) {
      return result.data.results.slice(0, 3).map((item: any) => 
        `${item.title}: ${item.snippet || item.description || ''}`
      );
    }
    return [];
  });
}

private identifyReliableSources(groupedResults: any): string[] {
  const sources = new Set<string>();
  
  Object.values(groupedResults).flat().forEach((result: any) => {
    if (result.data?.results) {
      result.data.results.forEach((item: any) => {
        if (item.url) sources.add(item.url);
      });
    }
  });
  
  return Array.from(sources).slice(0, 15); // Top 15 sources
}

private generateExpertRecommendations(findings: string[], query: string): string[] {
  // Generate intelligent recommendations based on findings
  const recommendations = [
    `Based on comprehensive research, focus on the top 3 findings most relevant to: ${query}`,
    "Cross-reference multiple sources before making strategic decisions",
    "Monitor ongoing developments to stay current with trends"
  ];
  
  // Add domain-specific recommendations
  if (query.toLowerCase().includes('investment') || query.toLowerCase().includes('financial')) {
    recommendations.push("Conduct thorough risk assessment before investment decisions");
    recommendations.push("Consider consulting with financial advisors for personalized guidance");
  }
  
  if (query.toLowerCase().includes('technology') || query.toLowerCase().includes('software')) {
    recommendations.push("Evaluate implementation complexity and resource requirements");
    recommendations.push("Consider pilot testing before full deployment");
  }
  
  return recommendations;
}

private extractDataPoints(groupedResults: any): any[] {
  // Extract quantitative data for potential visualization
  const dataPoints: any[] = [];
  
  Object.values(groupedResults).flat().forEach((result: any) => {
    if (result.data?.results) {
      result.data.results.forEach((item: any) => {
        // Look for numerical data in titles and snippets
        const text = `${item.title || ''} ${item.snippet || item.description || ''}`;
        const numbers = text.match(/\$?[\d,]+\.?\d*[%]?/g);
        if (numbers) {
          dataPoints.push({
            source: item.url,
            values: numbers,
            context: item.title
          });
        }
      });
    }
  });
  
  return dataPoints.slice(0, 20); // Limit data points
}

  private async generateResearchVisualizations(
  analysis: any,
  executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
): Promise<any[]> {
  if (!this.tools.has('data_visualization') || !analysis.dataPoints?.length) {
    return [];
  }
  
  try {
    const toolCall: ToolCall = {
      name: 'data_visualization',
      args: {
        data: analysis.dataPoints,
        chartTypes: ['bar', 'line', 'pie'],
        title: 'Research Analysis Visualization',
        colorScheme: 'professional'
      },
      id: generateUUID()
    };
    
    const result = await executeToolFn(toolCall);
    return result.result?.visualizations || [];
  } catch (error) {
    console.log('Visualization generation failed:', error);
    return [];
  }
}

// Enhanced Data Visualization Workflow
private async executeDataVisualization(
  intent: EnhancedActionIntent,
  context: ExecutionContext,
  executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
): Promise<any> {
  console.log('🎨 Executing enhanced data visualization workflow');
  
  // Detect file uploads or data sources
  const dataFiles = this.detectDataSources(intent.context?.originalMessage || '');
  const visualizations: any[] = [];
  
  for (const dataFile of dataFiles) {
    try {
      // Create comprehensive visualizations
      const vizResult = await this.createComprehensiveVisualizations(dataFile, executeToolFn);
      if (vizResult.success) {
        visualizations.push(vizResult);
      }
    } catch (error) {
      console.log(`Visualization failed for ${dataFile}:`, error);
    }
  }
  
  return {
    success: visualizations.length > 0,
    summary: `Created ${visualizations.length} comprehensive data visualizations`,
    visualizations,
    insights: this.generateVisualizationInsights(visualizations),
    recommendations: this.generateVisualizationRecommendations(visualizations)
  };
}

private detectDataSources(message: string): string[] {
  // Detect CSV files, data mentions, or uploaded files
  const csvPattern = /\b\w+\.csv\b/gi;
  const csvFiles = message.match(csvPattern) || [];
  
  // Also check for data-related keywords
  const dataKeywords = ['data', 'dataset', 'spreadsheet', 'file', 'upload'];
  const hasDataContext = dataKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
  
  if (csvFiles.length > 0) {
    return csvFiles;
  } else if (hasDataContext) {
    // Return a placeholder for generic data processing
    return ['uploaded_data'];
  }
  
  return [];
}

private async createComprehensiveVisualizations(
  dataSource: string,
  executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
): Promise<any> {
  // Professional color schemes
  const colorSchemes = {
    professional: ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#3D5A80'],
    modern: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'],
    vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    elegant: ['#1B263B', '#415A77', '#778DA9', '#E0E1DD', '#F8F9FA']
  };
  
  const visualizationConfigs = [
    {
      type: 'comprehensive_analysis',
      chartTypes: ['bar', 'line', 'scatter', 'heatmap'],
      colorScheme: colorSchemes.professional,
      options: {
        responsive: true,
        animations: true,
        gradients: true,
        shadows: true
      }
    },
    {
      type: 'trend_analysis',
      chartTypes: ['line', 'area'],
      colorScheme: colorSchemes.modern,
      options: {
        smoothCurves: true,
        fillGradients: true,
        interactive: true
      }
    },
    {
      type: 'distribution_analysis',
      chartTypes: ['histogram', 'box', 'violin'],
      colorScheme: colorSchemes.vibrant,
      options: {
        showStats: true,
        outliers: true,
        confidence: true
      }
    }
  ];
  
  const results = [];
  
  for (const config of visualizationConfigs) {
    try {
      const toolCall: ToolCall = {
        name: 'data_visualization',
        args: {
          dataSource: dataSource,
          analysisType: config.type,
          chartTypes: config.chartTypes,
          colorPalette: config.colorScheme,
          styling: {
            theme: 'professional',
            fontSize: 12,
            fontFamily: 'Inter, sans-serif',
            gridLines: true,
            legend: true,
            tooltips: true,
            ...config.options
          },
          advanced: {
            correlationMatrix: true,
            trendlines: true,
            statisticalOverlay: true,
            dataLabels: true
          }
        },
        id: generateUUID()
      };
      
      const result = await executeToolFn(toolCall);
      if (result.result?.success) {
        results.push({
          type: config.type,
          charts: result.result.charts,
          insights: result.result.insights
        });
      }
    } catch (error) {
      console.log(`Failed to create ${config.type}:`, error);
    }
  }
  
  return {
    success: results.length > 0,
    dataSource,
    visualizations: results,
    summary: `Created ${results.length} visualization sets with ${results.reduce((sum, r) => sum + (r.charts?.length || 0), 0)} total charts`
  };
}

private generateVisualizationInsights(visualizations: any[]): string[] {
  const insights: string[] = [];
  
  visualizations.forEach(viz => {
    if (viz.visualizations) {
      viz.visualizations.forEach((v: any) => {
        if (v.insights) {
          insights.push(...v.insights);
        }
      });
    }
  });
  
  // Add meta-insights about the visualization process
  insights.push(
    `Generated comprehensive visualizations across ${visualizations.length} different analysis types`,
    'Visualizations use professional color schemes optimized for clarity and accessibility',
    'Interactive elements enable detailed data exploration and analysis'
  );
  
  return insights.slice(0, 10);
}

  private generateVisualizationRecommendations(visualizations: any[]): string[] {
  return [
    'Review trend patterns in line charts for forecasting opportunities',
    'Examine distribution charts for outliers and data quality insights',
    'Use correlation matrices to identify relationships between variables',
    'Consider creating dashboard views for ongoing monitoring',
    'Export high-resolution versions for presentations and reports',
    'Set up automated visualization updates for live data sources'
  ];
}

// Enhanced Email Management Workflow
private async executeEmailAnalysis(
  intent: EnhancedActionIntent,
  context: ExecutionContext,
  executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
): Promise<any> {
  console.log('📧 Executing comprehensive email analysis workflow');
  
  try {
    // Step 1: Get email list
    const emailListCall: ToolCall = {
      name: 'gmail_operations',
      args: {
        action: 'list_emails',
        maxResults: 10,
        query: 'in:inbox',
        includeSpam: false
      },
      id: generateUUID()
    };
    
    const emailListResult = await executeToolFn(emailListCall);
    
    if (!emailListResult.result?.success || !emailListResult.result?.emails) {
      return {
        success: false,
        error: 'Failed to retrieve email list'
      };
    }
    
    // Step 2: Get detailed content for top 3-5 emails
    const emails = emailListResult.result.emails.slice(0, 5);
    const emailDetails: any[] = [];
    
    for (const email of emails) {
      try {
        const detailCall: ToolCall = {
          name: 'gmail_operations',
          args: {
            action: 'get_email',
            emailId: email.id
          },
          id: generateUUID()
        };
        
        const detailResult = await executeToolFn(detailCall);
        if (detailResult.result?.success) {
          emailDetails.push({
            id: email.id,
            ...detailResult.result.email
          });
        }
      } catch (error) {
        console.log(`Failed to get details for email ${email.id}:`, error);
      }
    }
    
    // Step 3: Analyze and categorize emails
    const analysis = this.analyzeEmailContent(emailDetails);
    
    // Step 4: Generate actionable insights
    const insights = this.generateEmailInsights(analysis);
    
    return {
      success: true,
      summary: `Analyzed ${emailDetails.length} emails with comprehensive insights`,
      emailSummaries: analysis.summaries,
      categories: analysis.categories,
      actionItems: analysis.actionItems,
      insights,
      nextSteps: this.generateEmailNextSteps(analysis)
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Email analysis failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Enhanced Project Management Analysis
private async executeProjectAnalysis(
  platform: string,
  intent: EnhancedActionIntent,
  context: ExecutionContext,
  executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
): Promise<any> {
  console.log(`🔧 Executing comprehensive ${platform} project analysis`);
  
  const platformMethods = {
    linear: () => this.analyzeLinearProjects(executeToolFn),
    notion: () => this.analyzeNotionWorkspace(executeToolFn),
    clickup: () => this.analyzeClickUpProjects(executeToolFn),
    trello: () => this.analyzeTrelloBoards(executeToolFn),
    asana: () => this.analyzeAsanaProjects(executeToolFn)
  };
  
  const method = platformMethods[platform as keyof typeof platformMethods];
  if (!method) {
    return {
      success: false,
      error: `Unsupported platform: ${platform}`
    };
  }
  
  return await method();
}

// Linear Analysis
private async analyzeLinearProjects(executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
  try {
    // Get teams/workspaces
    const teamsCall: ToolCall = {
      name: 'linear_management',
      args: { action: 'get_teams' },
      id: generateUUID()
    };
    
    const teamsResult = await executeToolFn(teamsCall);
    if (!teamsResult.result?.success) {
      return { success: false, error: 'Failed to get Linear teams' };
    }
    
    const teams = teamsResult.result.teams || [];
    const projectAnalysis: any[] = [];
    
    // Analyze each team's issues
    for (const team of teams.slice(0, 3)) { // Limit to 3 teams
      const issuesCall: ToolCall = {
        name: 'linear_management',
        args: {
          action: 'get_issues',
          teamId: team.id,
          limit: 10
        },
        id: generateUUID()
      };
      
      const issuesResult = await executeToolFn(issuesCall);
      if (issuesResult.result?.success) {
        const issues = issuesResult.result.issues || [];
        projectAnalysis.push({
          team: team.name,
          teamId: team.id,
          issueCount: issues.length,
          issues: issues.map((issue: any) => ({
            id: issue.id,
            title: issue.title,
            status: issue.state?.name || 'Unknown',
            priority: issue.priority,
            assignee: issue.assignee?.name || 'Unassigned',
            createdAt: issue.createdAt
          }))
        });
      }
    }
    
    return {
      success: true,
      platform: 'Linear',
      summary: `Analyzed ${projectAnalysis.length} teams with ${projectAnalysis.reduce((sum, p) => sum + p.issueCount, 0)} total issues`,
      projects: projectAnalysis,
      insights: this.generateLinearInsights(projectAnalysis),
      nextSteps: this.generateLinearNextSteps(projectAnalysis)
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Linear analysis failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Notion Analysis
private async analyzeNotionWorkspace(executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
  try {
    // Get databases
    const databasesCall: ToolCall = {
      name: 'notion_tool',
      args: { action: 'search_databases' },
      id: generateUUID()
    };
    
    const databasesResult = await executeToolFn(databasesCall);
    if (!databasesResult.result?.success) {
      return { success: false, error: 'Failed to get Notion databases' };
    }
    
    const databases = databasesResult.result.databases || [];
    const workspaceAnalysis: any[] = [];
    
    // Analyze each database
    for (const db of databases.slice(0, 3)) { // Limit to 3 databases
      const pagesCall: ToolCall = {
        name: 'notion_tool',
        args: {
          action: 'query_database',
          databaseId: db.id,
          pageSize: 10
        },
        id: generateUUID()
      };
      
      const pagesResult = await executeToolFn(pagesCall);
      if (pagesResult.result?.success) {
        const pages = pagesResult.result.pages || [];
        workspaceAnalysis.push({
          database: db.title?.[0]?.plain_text || 'Untitled',
          databaseId: db.id,
          pageCount: pages.length,
          pages: pages.map((page: any) => ({
            id: page.id,
            title: this.extractNotionTitle(page),
            createdAt: page.created_time,
            lastEdited: page.last_edited_time
          }))
        });
      }
    }
    
    return {
      success: true,
      platform: 'Notion',
      summary: `Analyzed ${workspaceAnalysis.length} databases with ${workspaceAnalysis.reduce((sum, w) => sum + w.pageCount, 0)} total pages`,
      workspace: workspaceAnalysis,
      insights: this.generateNotionInsights(workspaceAnalysis),
      nextSteps: this.generateNotionNextSteps(workspaceAnalysis)
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Notion analysis failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Helper methods for analysis
private analyzeEmailContent(emails: any[]): any {
  const summaries = emails.map(email => ({
    id: email.id,
    from: email.from,
    subject: email.subject,
    summary: this.generateEmailSummary(email.body || email.snippet || ''),
    priority: this.assessEmailPriority(email),
    category: this.categorizeEmail(email)
  }));
  
  const categories = this.groupEmailsByCategory(summaries);
  const actionItems = this.extractActionItems(emails);
  
  return { summaries, categories, actionItems };
}

private generateEmailSummary(content: string): string {
  // Simple email summarization
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length <= 2) return content.substring(0, 150) + '...';
  
  // Return first two meaningful sentences
  return sentences.slice(0, 2).join('. ') + '.';
}

private assessEmailPriority(email: any): 'high' | 'medium' | 'low' {
  const highPriorityKeywords = ['urgent', 'asap', 'important', 'deadline', 'critical'];
  const subject = (email.subject || '').toLowerCase();
  const body = (email.body || email.snippet || '').toLowerCase();
  
  if (highPriorityKeywords.some(keyword => subject.includes(keyword) || body.includes(keyword))) {
    return 'high';
  }
  
  return email.unread ? 'medium' : 'low';
}

private categorizeEmail(email: any): string {
  const subject = (email.subject || '').toLowerCase();
  const body = (email.body || email.snippet || '').toLowerCase();
  const content = subject + ' ' + body;
  
  if (content.includes('meeting') || content.includes('calendar')) return 'meetings';
  if (content.includes('project') || content.includes('task')) return 'work';
  if (content.includes('invoice') || content.includes('payment')) return 'financial';
  if (content.includes('newsletter') || content.includes('unsubscribe')) return 'newsletters';
  
  return 'general';
}

private groupEmailsByCategory(summaries: any[]): any {
  return summaries.reduce((groups, email) => {
    if (!groups[email.category]) groups[email.category] = [];
    groups[email.category].push(email);
    return groups;
  }, {});
}

private extractActionItems(emails: any[]): string[] {
  const actionItems: string[] = [];
  
  emails.forEach(email => {
    const content = (email.subject || '') + ' ' + (email.body || email.snippet || '');
    
    // Look for action-oriented language
    if (content.toLowerCase().includes('please') || content.toLowerCase().includes('need')) {
      actionItems.push(`Follow up on: ${email.subject}`);
    }
    
    if (content.toLowerCase().includes('review') || content.toLowerCase().includes('approve')) {
      actionItems.push(`Review required: ${email.subject}`);
    }
    
    if (content.toLowerCase().includes('deadline') || content.toLowerCase().includes('due')) {
      actionItems.push(`Deadline alert: ${email.subject}`);
    }
  });
  
  return actionItems.slice(0, 10);
}

private generateEmailInsights(analysis: any): string[] {
  const insights = [];
  const totalEmails = analysis.summaries.length;
  const highPriority = analysis.summaries.filter((e: any) => e.priority === 'high').length;
  const categories = Object.keys(analysis.categories);
  
  insights.push(`Analyzed ${totalEmails} recent emails with ${highPriority} high-priority items`);
  insights.push(`Email distribution across ${categories.length} categories: ${categories.join(', ')}`);
  
  // Category-specific insights
  Object.entries(analysis.categories).forEach(([category, emails]: [string, any]) => {
    if (emails.length > 1) {
      insights.push(`${category.charAt(0).toUpperCase() + category.slice(1)} category has ${emails.length} emails requiring attention`);
    }
  });
  
  if (analysis.actionItems.length > 0) {
    insights.push(`Identified ${analysis.actionItems.length} actionable items requiring follow-up`);
  }
  
  return insights;
}

private generateEmailNextSteps(analysis: any): string[] {
  const nextSteps = [];
  
  // Priority-based recommendations
  const highPriorityEmails = analysis.summaries.filter((e: any) => e.priority === 'high');
  if (highPriorityEmails.length > 0) {
    nextSteps.push(`Immediately address ${highPriorityEmails.length} high-priority emails`);
  }
  
  // Category-based recommendations
  if (analysis.categories.meetings && analysis.categories.meetings.length > 0) {
    nextSteps.push('Review meeting-related emails and update calendar accordingly');
  }
  
  if (analysis.categories.work && analysis.categories.work.length > 0) {
    nextSteps.push('Process work-related emails and update project management tools');
  }
  
  // General recommendations
  nextSteps.push('Set up email filters for better organization');
  nextSteps.push('Schedule regular email processing sessions');
  nextSteps.push('Consider automating responses for common email types');
  
  return nextSteps;
}

// ClickUp Analysis
private async analyzeClickUpProjects(executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
  try {
    // Get workspaces
    const workspacesCall: ToolCall = {
      name: 'clickup_tool',
      args: { action: 'get_workspaces' },
      id: generateUUID()
    };
    
    const workspacesResult = await executeToolFn(workspacesCall);
    if (!workspacesResult.result?.success) {
      return { success: false, error: 'Failed to get ClickUp workspaces' };
    }
    
    const workspaces = workspacesResult.result.workspaces || [];
    const projectAnalysis: any[] = [];
    
    // Analyze each workspace
    for (const workspace of workspaces.slice(0, 2)) {
      // Get spaces in workspace
      const spacesCall: ToolCall = {
        name: 'clickup_tool',
        args: {
          action: 'get_spaces',
          workspaceId: workspace.id
        },
        id: generateUUID()
      };
      
      const spacesResult = await executeToolFn(spacesCall);
      if (spacesResult.result?.success) {
        const spaces = spacesResult.result.spaces || [];
        
        for (const space of spaces.slice(0, 3)) {
          // Get tasks in space
          const tasksCall: ToolCall = {
            name: 'clickup_tool',
            args: {
              action: 'get_tasks',
              spaceId: space.id,
              limit: 15
            },
            id: generateUUID()
          };
          
          const tasksResult = await executeToolFn(tasksCall);
          if (tasksResult.result?.success) {
            const tasks = tasksResult.result.tasks || [];
            projectAnalysis.push({
              workspace: workspace.name,
              space: space.name,
              spaceId: space.id,
              taskCount: tasks.length,
              tasks: tasks.map((task: any) => ({
                id: task.id,
                name: task.name,
                status: task.status?.status || 'Unknown',
                priority: task.priority?.priority || 'Normal',
                assignees: task.assignees?.map((a: any) => a.username) || [],
                dueDate: task.due_date
              }))
            });
          }
        }
      }
    }
    
    return {
      success: true,
      platform: 'ClickUp',
      summary: `Analyzed ${projectAnalysis.length} spaces with ${projectAnalysis.reduce((sum, p) => sum + p.taskCount, 0)} total tasks`,
      projects: projectAnalysis,
      insights: this.generateClickUpInsights(projectAnalysis),
      nextSteps: this.generateClickUpNextSteps(projectAnalysis)
    };
    
  } catch (error) {
    return {
      success: false,
      error: `ClickUp analysis failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Trello Analysis
private async analyzeTrelloBoards(executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
  try {
    // Get boards
    const boardsCall: ToolCall = {
      name: 'trello_tool',
      args: { action: 'get_boards' },
      id: generateUUID()
    };
    
    const boardsResult = await executeToolFn(boardsCall);
    if (!boardsResult.result?.success) {
      return { success: false, error: 'Failed to get Trello boards' };
    }
    
    const boards = boardsResult.result.boards || [];
    const boardAnalysis: any[] = [];
    
    // Analyze each board
    for (const board of boards.slice(0, 3)) {
      // Get cards in board
      const cardsCall: ToolCall = {
        name: 'trello_tool',
        args: {
          action: 'get_cards',
          boardId: board.id
        },
        id: generateUUID()
      };
      
      const cardsResult = await executeToolFn(cardsCall);
      if (cardsResult.result?.success) {
        const cards = cardsResult.result.cards || [];
        boardAnalysis.push({
          board: board.name,
          boardId: board.id,
          cardCount: cards.length,
          cards: cards.map((card: any) => ({
            id: card.id,
            name: card.name,
            list: card.list?.name || 'Unknown',
            description: card.desc || '',
            dueDate: card.due,
            members: card.members?.map((m: any) => m.fullName) || []
          }))
        });
      }
    }
    
    return {
      success: true,
      platform: 'Trello',
      summary: `Analyzed ${boardAnalysis.length} boards with ${boardAnalysis.reduce((sum, b) => sum + b.cardCount, 0)} total cards`,
      projects: boardAnalysis,
      insights: this.generateTrelloInsights(boardAnalysis),
      nextSteps: this.generateTrelloNextSteps(boardAnalysis)
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Trello analysis failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Asana Analysis
private async analyzeAsanaProjects(executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>): Promise<any> {
  try {
    // Get workspaces
    const workspacesCall: ToolCall = {
      name: 'asana_tool',
      args: { action: 'get_workspaces' },
      id: generateUUID()
    };
    
    const workspacesResult = await executeToolFn(workspacesCall);
    if (!workspacesResult.result?.success) {
      return { success: false, error: 'Failed to get Asana workspaces' };
    }
    
    const workspaces = workspacesResult.result.workspaces || [];
    const projectAnalysis: any[] = [];
    
    // Analyze each workspace
    for (const workspace of workspaces.slice(0, 2)) {
      // Get projects in workspace
      const projectsCall: ToolCall = {
        name: 'asana_tool',
        args: {
          action: 'get_projects',
          workspaceId: workspace.gid
        },
        id: generateUUID()
      };
      
      const projectsResult = await executeToolFn(projectsCall);
      if (projectsResult.result?.success) {
        const projects = projectsResult.result.projects || [];
        
        for (const project of projects.slice(0, 3)) {
          // Get tasks in project
          const tasksCall: ToolCall = {
            name: 'asana_tool',
            args: {
              action: 'get_tasks',
              projectId: project.gid
            },
            id: generateUUID()
          };
          
          const tasksResult = await executeToolFn(tasksCall);
          if (tasksResult.result?.success) {
            const tasks = tasksResult.result.tasks || [];
            projectAnalysis.push({
              workspace: workspace.name,
              project: project.name,
              projectId: project.gid,
              taskCount: tasks.length,
              tasks: tasks.map((task: any) => ({
                id: task.gid,
                name: task.name,
                completed: task.completed,
                assignee: task.assignee?.name || 'Unassigned',
                dueDate: task.due_on,
                notes: task.notes || ''
              }))
            });
          }
        }
      }
    }
    
    return {
      success: true,
      platform: 'Asana',
      summary: `Analyzed ${projectAnalysis.length} projects with ${projectAnalysis.reduce((sum, p) => sum + p.taskCount, 0)} total tasks`,
      projects: projectAnalysis,
      insights: this.generateAsanaInsights(projectAnalysis),
      nextSteps: this.generateAsanaNextSteps(projectAnalysis)
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Asana analysis failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Platform-specific insight generators
private generateLinearInsights(projects: any[]): string[] {
  const insights = [];
  const totalIssues = projects.reduce((sum, p) => sum + p.issueCount, 0);
  
  insights.push(`Total of ${totalIssues} issues across ${projects.length} teams`);
  
  projects.forEach(project => {
    const priorities = project.issues.reduce((acc: any, issue: any) => {
      acc[issue.priority || 'None'] = (acc[issue.priority || 'None'] || 0) + 1;
      return acc;
    }, {});
    
    const highPriority = priorities['High'] || priorities['Urgent'] || 0;
    if (highPriority > 0) {
      insights.push(`${project.team} has ${highPriority} high-priority issues requiring attention`);
    }
  });
  
  return insights;
}

private generateLinearNextSteps(projects: any[]): string[] {
  return [
    'Review and prioritize high-priority issues across all teams',
    'Identify unassigned issues and distribute workload',
    'Set up automated progress tracking and notifications',
    'Consider creating sprint planning based on current issue distribution',
    'Implement regular team standup meetings for better coordination'
  ];
}

private generateNotionInsights(workspace: any[]): string[] {
  const insights = [];
  const totalPages = workspace.reduce((sum, w) => sum + w.pageCount, 0);
  
  insights.push(`Found ${totalPages} pages across ${workspace.length} databases`);
  
  workspace.forEach(db => {
    if (db.pageCount > 10) {
      insights.push(`${db.database} database is actively used with ${db.pageCount} pages`);
    }
    
    // Analyze recent activity
    const recentPages = db.pages.filter((page: any) => {
      const lastEdited = new Date(page.lastEdited);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastEdited > weekAgo;
    });
    
    if (recentPages.length > 0) {
      insights.push(`${db.database} has ${recentPages.length} recently updated pages`);
    }
  });
  
  return insights;
}

private generateNotionNextSteps(workspace: any[]): string[] {
  return [
    'Review and organize database structures for better efficiency',
    'Set up templates for commonly used page types',
    'Implement proper tagging and categorization system',
    'Create automated workflows between databases',
    'Schedule regular content audits and archiving of outdated pages'
  ];
}

private generateClickUpInsights(projects: any[]): string[] {
  const insights = [];
  const totalTasks = projects.reduce((sum, p) => sum + p.taskCount, 0);
  
  insights.push(`Managing ${totalTasks} tasks across ${projects.length} spaces`);
  
  projects.forEach(project => {
    const overdueTasks = project.tasks.filter((task: any) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date();
    });
    
    if (overdueTasks.length > 0) {
      insights.push(`${project.space} has ${overdueTasks.length} overdue tasks`);
    }
    
    const unassignedTasks = project.tasks.filter((task: any) => !task.assignees.length);
    if (unassignedTasks.length > 0) {
      insights.push(`${project.space} has ${unassignedTasks.length} unassigned tasks`);
    }
  });
  
  return insights;
}

private generateClickUpNextSteps(projects: any[]): string[] {
  return [
    'Address overdue tasks and reschedule as necessary',
    'Assign unassigned tasks to appropriate team members',
    'Set up automated task prioritization and notifications',
    'Create task templates for recurring work patterns',
    'Implement time tracking for better project estimation'
  ];
}

private generateTrelloInsights(boards: any[]): string[] {
  const insights = [];
  const totalCards = boards.reduce((sum, b) => sum + b.cardCount, 0);
  
  insights.push(`Tracking ${totalCards} cards across ${boards.length} boards`);
  
  boards.forEach(board => {
    const cardsWithDueDates = board.cards.filter((card: any) => card.dueDate);
    const overdueCards = cardsWithDueDates.filter((card: any) => 
      new Date(card.dueDate) < new Date()
    );
    
    if (overdueCards.length > 0) {
      insights.push(`${board.board} has ${overdueCards.length} overdue cards`);
    }
    
    const unassignedCards = board.cards.filter((card: any) => !card.members.length);
    if (unassignedCards.length > 0) {
      insights.push(`${board.board} has ${unassignedCards.length} unassigned cards`);
    }
  });
  
  return insights;
}

private generateTrelloNextSteps(boards: any[]): string[] {
  return [
    'Review and update overdue cards with new deadlines',
    'Assign team members to unassigned cards',
    'Organize cards by priority and project phase',
    'Set up automated card movement rules based on progress',
    'Create regular board review meetings with the team'
  ];
}

private generateAsanaInsights(projects: any[]): string[] {
  const insights = [];
  const totalTasks = projects.reduce((sum, p) => sum + p.taskCount, 0);
  const completedTasks = projects.reduce((sum, p) => 
    sum + p.tasks.filter((task: any) => task.completed).length, 0
  );
  
  insights.push(`Managing ${totalTasks} tasks with ${completedTasks} completed (${Math.round((completedTasks/totalTasks)*100)}% completion rate)`);
  
  projects.forEach(project => {
    const overdueTasks = project.tasks.filter((task: any) => {
      if (!task.dueDate || task.completed) return false;
      return new Date(task.dueDate) < new Date();
    });
    
    if (overdueTasks.length > 0) {
      insights.push(`${project.project} has ${overdueTasks.length} overdue incomplete tasks`);
    }
    
    const unassignedTasks = project.tasks.filter((task: any) => 
      task.assignee === 'Unassigned' && !task.completed
    );
    if (unassignedTasks.length > 0) {
      insights.push(`${project.project} has ${unassignedTasks.length} unassigned active tasks`);
    }
  });
  
  return insights;
}

private generateAsanaNextSteps(projects: any[]): string[] {
  return [
    'Address overdue tasks and update deadlines where necessary',
    'Assign ownership to unassigned tasks',
    'Celebrate completed milestones and archive finished tasks',
    'Set up project templates for recurring work types',
    'Implement progress tracking dashboards for better visibility'
  ];
}

// Helper method for Notion title extraction
private extractNotionTitle(page: any): string {
  if (page.properties && page.properties.Name && page.properties.Name.title) {
    return page.properties.Name.title.map((t: any) => t.plain_text).join('') || 'Untitled';
  }
  if (page.properties && page.properties.Title && page.properties.Title.title) {
    return page.properties.Title.title.map((t: any) => t.plain_text).join('') || 'Untitled';
  }
  return 'Untitled';
}
}
