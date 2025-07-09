import { FunctionDeclaration, Type } from "@google/genai";
import { tavily } from "@tavily/core";

export class WebSearchTool {
  private tavilyClient: any;

  constructor(apiKey: string) {
    this.tavilyClient = tavily({ apiKey });
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "web_search",
      description: "Search the web for current information using Tavily search engine. Use this for real-time information, news, research, or when you need to find current data.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: "The search query to find information about"
          },
          maxResults: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (default: 5, max: 20)"
          },
          searchDepth: {
            type: Type.STRING,
            description: "Search depth: 'basic' for quick results or 'advanced' for comprehensive search (default: advanced)"
          },
          includeAnswer: {
            type: Type.BOOLEAN,
            description: "Whether to include a summarized answer from the search results (default: true)"
          },
          includeDomains: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of domains to specifically include in search results"
          },
          excludeDomains: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of domains to exclude from search results"
          }
        },
        required: ["query"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`🔍 Searching: "${args.query}"`);
      
      const searchOptions: any = {
        searchDepth: args.searchDepth || "advanced",
        maxResults: Math.min(args.maxResults || 5, 20),
        includeAnswer: args.includeAnswer !== false
      };

      // Add domain filters if provided
      if (args.includeDomains && args.includeDomains.length > 0) {
        searchOptions.includeDomains = args.includeDomains;
      }
      
      if (args.excludeDomains && args.excludeDomains.length > 0) {
        searchOptions.excludeDomains = args.excludeDomains;
      }

      const result = await this.tavilyClient.search(args.query, searchOptions);

      // Process and clean results
      const processedResults = result.results?.map((item: any) => ({
        title: item.title,
        url: item.url,
        content: item.content,
        score: item.score,
        publishedDate: item.published_date
      })) || [];

      return {
        success: true,
        query: args.query,
        answer: result.answer || null,
        results: processedResults,
        resultsCount: processedResults.length,
        searchTime: new Date().toISOString(),
        images: result.images || [],
        followUpQuestions: result.follow_up_questions || []
      };

    } catch (error: unknown) {
      console.error("❌ Web search failed:", error);
      return {
        success: false,
        error: `Web search failed: ${error instanceof Error ? error.message : String(error)}`,
        query: args.query
      };
    }
  }
}
