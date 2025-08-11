//ai/research-engine.ts
import { Tool, ToolCall, ToolResult } from "./types";
import { generateUUID } from "@/lib/utils";

export interface ResearchContext {
  query: string;
  depth: 'basic' | 'standard' | 'comprehensive' | 'expert';
  includeVideos: boolean;
  includeAcademicSources: boolean;
  timeframe?: string;
  specificDomains?: string[];
  currentDate: Date;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  engine: string;
  relevanceScore: number;
  publishedDate?: string;
}

export interface VideoResult {
  title: string;
  url: string;
  channel: string;
  duration?: string;
  views?: string;
  publishedDate?: string;
  description?: string;
}

export interface ResearchReport {
  query: string;
  summary: string;
  keyFindings: string[];
  sources: SearchResult[];
  videos: VideoResult[];
  relatedTopics: string[];
  nextSteps: string[];
  confidence: number;
  timestamp: Date;
}

export class EnhancedResearchEngine {
  private tools: Map<string, Tool>;
  private currentDate: Date;

  constructor(tools: Map<string, Tool>) {
    this.tools = tools;
    this.currentDate = new Date();
  }

  // Multi-engine research with real YouTube integration
  async conductComprehensiveResearch(
    context: ResearchContext,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
  ): Promise<ResearchReport> {
    const results: {
      searches: SearchResult[];
      videos: VideoResult[];
      deepContent: any[];
    } = {
      searches: [],
      videos: [],
      deepContent: []
    };

    // Phase 1: Multi-angle search strategy
    const searchStrategies = this.generateSearchStrategies(context);
    
    // Execute searches across all available engines
    await this.executeMultiEngineSearch(searchStrategies, executeToolFn, results);
    
    // Phase 2: Get real YouTube videos using Serper
    if (context.includeVideos) {
      await this.getYouTubeVideos(context.query, executeToolFn, results);
    }

    // Phase 3: Deep content analysis from top sources
    await this.performDeepContentAnalysis(results.searches, executeToolFn, results);

    // Phase 4: Synthesize comprehensive report
    const report = this.synthesizeResearchReport(context, results);

    return report;
  }

  private generateSearchStrategies(context: ResearchContext): Array<{
    query: string;
    angle: string;
    priority: 'high' | 'medium' | 'low';
    timeframe?: string;
  }> {
    const baseQuery = context.query;
    const currentYear = this.currentDate.getFullYear();
    const currentMonth = this.currentDate.toLocaleDateString('en-US', { month: 'long' });
    
    const strategies = [
      {
        query: `${baseQuery} ${currentMonth} ${currentYear}`,
        angle: 'current_state',
        priority: 'high' as const,
        timeframe: 'recent'
      },
      {
        query: `${baseQuery} latest news trends ${currentYear}`,
        angle: 'trending_developments',
        priority: 'high' as const,
        timeframe: 'week'
      },
      {
        query: `${baseQuery} comprehensive guide tutorial`,
        angle: 'educational_content',
        priority: 'high' as const
      },
      {
        query: `${baseQuery} best practices implementation ${currentYear}`,
        angle: 'practical_application',
        priority: 'medium' as const
      },
      {
        query: `${baseQuery} case studies real world examples`,
        angle: 'proven_results',
        priority: 'medium' as const
      },
      {
        query: `${baseQuery} future predictions outlook ${currentYear + 1}`,
        angle: 'strategic_foresight',
        priority: 'medium' as const
      },
      {
        query: `${baseQuery} problems challenges solutions`,
        angle: 'problem_solving',
        priority: 'high' as const
      },
      {
        query: `${baseQuery} comparison alternatives options`,
        angle: 'comparative_analysis',
        priority: 'medium' as const
      }
    ];

    // Adjust based on research depth
    if (context.depth === 'basic') {
      return strategies.slice(0, 3);
    } else if (context.depth === 'standard') {
      return strategies.slice(0, 5);
    } else {
      return strategies; // All strategies for comprehensive/expert
    }
  }

  private async executeMultiEngineSearch(
    strategies: any[],
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>,
    results: any
  ): Promise<void> {
    const engines = [
      { name: 'serper_search', available: this.tools.has('serper_search') },
      { name: 'web_search', available: this.tools.has('web_search') }, // Tavily
      { name: 'duckduckgo_search', available: this.tools.has('duckduckgo_search') }
    ];

    for (const strategy of strategies) {
      // Use Serper for high-priority recent queries (best for real-time data)
      if (strategy.priority === 'high' && engines.find(e => e.name === 'serper_search')?.available) {
        await this.executeSerperSearch(strategy, executeToolFn, results);
      }
      
      // Use Tavily for comprehensive coverage
      if (engines.find(e => e.name === 'web_search')?.available) {
        await this.executeTavilySearch(strategy, executeToolFn, results);
      }
      
      // Use DuckDuckGo for privacy-focused results
      if (strategy.angle === 'educational_content' && engines.find(e => e.name === 'duckduckgo_search')?.available) {
        await this.executeDuckDuckGoSearch(strategy, executeToolFn, results);
      }
    }
  }

  private async executeSerperSearch(
    strategy: any,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>,
    results: any
  ): Promise<void> {
    try {
      const tbs = this.getTimeFilter(strategy.timeframe);
      const searchResult = await executeToolFn({
        name: 'serper_search',
        args: {
          query: strategy.query,
          searchType: 'search',
          num: 10,
          hl: 'en',
          gl: 'us',
          tbs: tbs,
          safe: 'active'
        },
        id: generateUUID()
      });

      if (searchResult.result?.success && searchResult.result.organic) {
        const normalizedResults = searchResult.result.organic.map((item: any) => ({
          title: item.title || '',
          url: item.link || '',
          snippet: item.snippet || '',
          source: 'Google (Serper)',
          engine: 'serper',
          relevanceScore: this.calculateRelevanceScore(item, strategy.query),
          publishedDate: item.date
        }));
        results.searches.push(...normalizedResults);
      }
    } catch (error) {
      console.log(`Serper search failed for ${strategy.angle}: ${error}`);
    }
  }

  private async executeTavilySearch(
    strategy: any,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>,
    results: any
  ): Promise<void> {
    try {
      const searchResult = await executeToolFn({
        name: 'web_search',
        args: {
          query: strategy.query,
          searchDepth: strategy.priority === 'high' ? 'advanced' : 'basic',
          maxResults: 8,
          includeAnswer: true,
          includeRawContent: false
        },
        id: generateUUID()
      });

      if (searchResult.result?.success && searchResult.result.results) {
        const normalizedResults = searchResult.result.results.map((item: any) => ({
          title: item.title || '',
          url: item.url || '',
          snippet: item.content || '',
          source: 'Tavily AI',
          engine: 'tavily',
          relevanceScore: this.calculateRelevanceScore(item, strategy.query),
          publishedDate: item.publishedDate
        }));
        results.searches.push(...normalizedResults);
      }
    } catch (error) {
      console.log(`Tavily search failed for ${strategy.angle}: ${error}`);
    }
  }

  private async executeDuckDuckGoSearch(
    strategy: any,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>,
    results: any
  ): Promise<void> {
    try {
      const searchResult = await executeToolFn({
        name: 'duckduckgo_search',
        args: {
          query: strategy.query,
          safeSearch: 'moderate',
          region: 'us-en',
          maxResults: 6,
          noHtml: true,
          skipDisambig: true
        },
        id: generateUUID()
      });

      if (searchResult.result?.success && searchResult.result.webResults) {
        const normalizedResults = searchResult.result.webResults.map((item: any) => ({
          title: item.title || '',
          url: item.url || '',
          snippet: item.snippet || '',
          source: 'DuckDuckGo',
          engine: 'duckduckgo',
          relevanceScore: this.calculateRelevanceScore(item, strategy.query)
        }));
        results.searches.push(...normalizedResults);
      }
    } catch (error) {
      console.log(`DuckDuckGo search failed for ${strategy.angle}: ${error}`);
    }
  }

  // Get REAL YouTube videos using Serper
  private async getYouTubeVideos(
    query: string,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>,
    results: any
  ): Promise<void> {
    if (!this.tools.has('serper_search')) return;

    try {
      const currentYear = this.currentDate.getFullYear();
      const videoQueries = [
        `${query} tutorial ${currentYear}`,
        `${query} explained`,
        `${query} guide how to`,
        `${query} case study example`,
        `${query} latest ${currentYear}`
      ];

      for (const videoQuery of videoQueries) {
        const videoResult = await executeToolFn({
          name: 'serper_search',
          args: {
            query: videoQuery,
            searchType: 'videos',
            num: 5,
            hl: 'en',
            gl: 'us',
            tbs: 'qdr:y', // Last year for relevancy
            safe: 'active'
          },
          id: generateUUID()
        });

        if (videoResult.result?.success && Array.isArray(videoResult.result.videos)) {
          const videoResults: VideoResult[] = videoResult.result.videos.map((video: any) => ({
            title: video.title || 'Unknown Title',
            url: video.link || '',
            channel: video.channel || video.source || 'Unknown Channel',
            duration: video.duration || '',
            views: video.views || '',
            publishedDate: video.date || '',
            description: video.snippet || ''
          }));
          
          results.videos.push(...videoResults);
        }
      }

      // Remove duplicates and sort by relevance
      results.videos = this.deduplicateVideos(results.videos);
    } catch (error) {
      console.log(`YouTube video search failed: ${error}`);
    }
  }

  private async performDeepContentAnalysis(
    searches: SearchResult[],
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>,
    results: any
  ): Promise<void> {
    if (!this.tools.has('web_scrape')) return;

    // Select top 5 most relevant sources for deep analysis
    const topSources = searches
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);

    for (const source of topSources) {
      try {
        const scrapeResult = await executeToolFn({
          name: 'web_scrape',
          args: {
            url: source.url,
            formats: ['markdown', 'text'],
            includeTags: ['article', 'main', 'content'],
            excludeTags: ['nav', 'footer', 'sidebar', 'ad'],
            waitFor: 2000
          },
          id: generateUUID()
        });

        if (scrapeResult.result?.success) {
          results.deepContent.push({
            url: source.url,
            title: source.title,
            content: scrapeResult.result.data?.markdown || scrapeResult.result.data?.text || '',
            contentLength: scrapeResult.result.data?.text?.length || 0,
            relevanceScore: source.relevanceScore
          });
        }
      } catch (error) {
        console.log(`Deep content analysis failed for ${source.url}: ${error}`);
      }
    }
  }

  private synthesizeResearchReport(context: ResearchContext, results: any): ResearchReport {
    // Deduplicate and rank sources
    const uniqueSources = this.deduplicateSources(results.searches);
    const topSources = uniqueSources
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);

    // Extract key findings from deep content
    const keyFindings = this.extractKeyFindings(results.deepContent, context.query);

    // Generate comprehensive summary
    const summary = this.generateIntelligentSummary(context, topSources, keyFindings, results.deepContent);

    // Identify related topics for further exploration
    const relatedTopics = this.identifyRelatedTopics(context.query, topSources, results.deepContent);

    // Generate actionable next steps
    const nextSteps = this.generateActionableNextSteps(context, keyFindings);

    // Calculate confidence based on source quality and coverage
    const confidence = this.calculateResearchConfidence(topSources, results.deepContent, results.videos);

    return {
      query: context.query,
      summary,
      keyFindings,
      sources: topSources,
      videos: results.videos.slice(0, 8), // Top 8 most relevant videos
      relatedTopics,
      nextSteps,
      confidence,
      timestamp: new Date()
    };
  }

  // Utility methods
  private getTimeFilter(timeframe?: string): string {
    switch (timeframe) {
      case 'day': return 'qdr:d';
      case 'week': return 'qdr:w';
      case 'month': return 'qdr:m';
      case 'year': return 'qdr:y';
      case 'recent': return 'qdr:w';
      default: return '';
    }
  }

  private calculateRelevanceScore(item: any, query: string): number {
    let score = 0.5; // Base score
    const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    const text = `${item.title || ''} ${item.snippet || item.content || ''}`.toLowerCase();
    
    // Title matching (high weight)
    queryTerms.forEach(term => {
      if ((item.title || '').toLowerCase().includes(term)) score += 0.3;
    });
    
    // Content matching (medium weight)
    queryTerms.forEach(term => {
      if (text.includes(term)) score += 0.1;
    });
    
    // Source quality bonus
    const domain = (item.url || '').toLowerCase();
    if (domain.includes('edu') || domain.includes('gov')) score += 0.2;
    if (domain.includes('wikipedia') || domain.includes('research')) score += 0.15;
    
    // Recency bonus
    if (item.publishedDate || item.date) {
      const publishDate = new Date(item.publishedDate || item.date);
      const monthsOld = (this.currentDate.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsOld < 3) score += 0.1;
      else if (monthsOld < 12) score += 0.05;
    }
    
    return Math.min(score, 1.0);
  }

  private deduplicateVideos(videos: VideoResult[]): VideoResult[] {
    const seen = new Set<string>();
    const unique: VideoResult[] = [];
    
    for (const video of videos) {
      const key = `${video.title.toLowerCase()}_${video.channel}`;
      if (!seen.has(key) && video.url) {
        seen.add(key);
        unique.push(video);
      }
    }
    
    return unique.slice(0, 15); // Limit to top 15 unique videos
  }

  private deduplicateSources(sources: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    const unique: SearchResult[] = [];
    
    for (const source of sources) {
      if (!seen.has(source.url) && source.url) {
        seen.add(source.url);
        unique.push(source);
      }
    }
    
    return unique;
  }

  private extractKeyFindings(deepContent: any[], query: string): string[] {
    const findings: string[] = [];
    const queryTerms = query.toLowerCase().split(' ');
    
    for (const content of deepContent) {
      if (content.content && content.content.length > 100) {
        // Extract sentences that contain query terms and provide insights
        const sentences = content.content.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
        const relevantSentences = sentences.filter((sentence: string) => {
          const lowerSentence = sentence.toLowerCase();
          return queryTerms.some(term => lowerSentence.includes(term)) &&
                 (lowerSentence.includes('important') || 
                  lowerSentence.includes('key') || 
                  lowerSentence.includes('significant') ||
                  lowerSentence.includes('research shows') ||
                  lowerSentence.includes('study found') ||
                  lowerSentence.includes('according to'));
        });
        
        findings.push(...relevantSentences.slice(0, 2).map((s: string) => s.trim()));
      }
    }
    
    return [...new Set(findings)].slice(0, 8); // Unique findings, max 8
  }

  private generateIntelligentSummary(
    context: ResearchContext, 
    sources: SearchResult[], 
    findings: string[], 
    deepContent: any[]
  ): string {
    const totalSources = sources.length;
    const totalDeepContent = deepContent.length;
    const currentMonth = this.currentDate.toLocaleDateString('en-US', { month: 'long' });
    const currentYear = this.currentDate.getFullYear();
    
    let summary = `Based on comprehensive research across ${totalSources} sources with ${totalDeepContent} in-depth content analyses, here's what I discovered about "${context.query}" as of ${currentMonth} ${currentYear}:\n\n`;
    
    if (findings.length > 0) {
      summary += `**Key Research Insights:**\n${findings.slice(0, 5).map(f => `• ${f}`).join('\n')}\n\n`;
    }
    
    // Add context about research methodology
    summary += `**Research Methodology:** This analysis combines results from multiple search engines (Google, Tavily AI, DuckDuckGo) with deep content analysis and real-time data to ensure comprehensive coverage and accuracy.\n\n`;
    
    return summary;
  }

  private identifyRelatedTopics(query: string, sources: SearchResult[], deepContent: any[]): string[] {
    const topics = new Set<string>();
    const text = sources.map(s => `${s.title} ${s.snippet}`).join(' ').toLowerCase();
    
    // Use simple keyword extraction for related topics
    const commonPatterns = [
      /\b\w+(?:\s+\w+){0,2}\s+(?:strategy|approach|method|technique|solution|tool|platform|framework|technology|system)\b/g,
      /\b(?:best practices?|implementation|integration|optimization|management|analysis|development)\s+\w+(?:\s+\w+){0,2}\b/g,
      /\b\w+(?:\s+\w+){0,2}\s+(?:trends?|innovations?|advances?|breakthroughs?|developments?)\b/g
    ];
    
    commonPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.slice(0, 5).forEach(match => topics.add(match.trim()));
    });
    
    return Array.from(topics).slice(0, 6);
  }

  private generateActionableNextSteps(context: ResearchContext, findings: string[]): string[] {
    const steps = [
      `🔍 Deep dive into the top 3 most promising approaches identified in the research`,
      `📊 Create a comparative analysis of different ${context.query} solutions/methods`,
      `💡 Develop an implementation roadmap based on best practices discovered`,
      `🎯 Identify key stakeholders and resources needed for ${context.query} initiatives`,
      `📈 Set up monitoring and measurement systems for tracking progress`
    ];
    
    // Add specific steps based on context depth
    if (context.depth === 'expert') {
      steps.push(
        `🔬 Conduct original research or case studies to fill identified knowledge gaps`,
        `🤝 Connect with industry experts and thought leaders in this domain`,
        `📚 Access academic papers and specialized resources for deeper insights`
      );
    }
    
    return steps.slice(0, 6);
  }

  private calculateResearchConfidence(sources: SearchResult[], deepContent: any[], videos: VideoResult[]): number {
    let confidence = 0.5; // Base confidence
    
    // Source quality and quantity
    if (sources.length >= 15) confidence += 0.2;
    else if (sources.length >= 10) confidence += 0.15;
    else if (sources.length >= 5) confidence += 0.1;
    
    // Deep content analysis
    if (deepContent.length >= 3) confidence += 0.15;
    
    // Video resources
    if (videos.length >= 5) confidence += 0.1;
    
    // Source diversity (different engines)
    const engines = new Set(sources.map(s => s.engine));
    if (engines.size >= 3) confidence += 0.1;
    else if (engines.size >= 2) confidence += 0.05;
    
    // Recent content
    const recentSources = sources.filter(s => {
      if (!s.publishedDate) return false;
      const monthsOld = (this.currentDate.getTime() - new Date(s.publishedDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsOld < 6;
    });
    
    if (recentSources.length > sources.length * 0.5) confidence += 0.1;
    
    return Math.min(confidence, 0.95); // Cap at 95% confidence
  }
}