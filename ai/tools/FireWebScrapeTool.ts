import { FunctionDeclaration, Type } from "@google/genai";

export class FireWebScrapeTool {
  private apiKey: string;
  private baseUrl: string = "https://api.firecrawl.dev";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "fire_web_scrape",
      description: "Scrape, crawl, extract, or search web content using Firecrawl. Supports single URL scraping, full website crawling, structured data extraction, and web search with content retrieval.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Action to perform: 'scrape' (single URL), 'crawl' (multiple pages), 'extract' (structured data), 'search' (web search), or 'check_crawl_status' (check crawl job)"
          },
          url: {
            type: Type.STRING,
            description: "URL to scrape/crawl (required for scrape, crawl, extract actions)"
          },
          query: {
            type: Type.STRING,
            description: "Search query (required for search action)"
          },
          jobId: {
            type: Type.STRING,
            description: "Crawl job ID to check status (required for check_crawl_status action)"
          },
          formats: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Output formats: ['markdown', 'html', 'json'] (default: ['markdown'])"
          },
          limit: {
            type: Type.NUMBER,
            description: "Number of pages to crawl or search results to return (default: 10, max: 100 for crawl)"
          },
          onlyMainContent: {
            type: Type.BOOLEAN,
            description: "Extract only main content, removing navigation, ads, etc. (default: true)"
          },
          parsePDF: {
            type: Type.BOOLEAN,
            description: "Parse PDF files if encountered (default: false)"
          },
          maxAge: {
            type: Type.NUMBER,
            description: "Maximum age of cached content in milliseconds (default: 14400000 = 4 hours)"
          },
          extractionSchema: {
            type: Type.OBJECT,
            description: "JSON schema for structured data extraction (for extract action)"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const action = args.action;
      console.log(`🔥 Firecrawl ${action}: ${args.url || args.query || args.jobId}`);

      switch (action) {
        case 'scrape':
          return await this.scrapeUrl(args);
        case 'crawl':
          return await this.crawlUrl(args);
        case 'extract':
          return await this.extractFromUrl(args);
        case 'search':
          return await this.searchWeb(args);
        case 'check_crawl_status':
          return await this.checkCrawlStatus(args);
        default:
          throw new Error(`Unknown action: ${action}`);
      }

    } catch (error: unknown) {
      console.error("❌ Firecrawl operation failed:", error);
      return {
        success: false,
        error: `Firecrawl operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action
      };
    }
  }

  private async scrapeUrl(args: any): Promise<any> {
    if (!args.url) {
      throw new Error("URL is required for scrape action");
    }

    const scrapeOptions: any = {
      formats: args.formats || ['markdown']
    };

    if (args.onlyMainContent !== undefined) scrapeOptions.onlyMainContent = args.onlyMainContent;
    if (args.parsePDF !== undefined) scrapeOptions.parsePDF = args.parsePDF;
    if (args.maxAge !== undefined) scrapeOptions.maxAge = args.maxAge;

    const response = await fetch(`${this.baseUrl}/v1/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: args.url,
        ...scrapeOptions
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: result.success || true,
      action: 'scrape',
      url: args.url,
      data: result.data || result,
      formats: scrapeOptions.formats,
      timestamp: new Date().toISOString()
    };
  }

  private async crawlUrl(args: any): Promise<any> {
    if (!args.url) {
      throw new Error("URL is required for crawl action");
    }

    const crawlOptions: any = {
      limit: Math.min(args.limit || 10, 100),
      scrapeOptions: {
        formats: args.formats || ['markdown']
      }
    };

    if (args.onlyMainContent !== undefined) crawlOptions.scrapeOptions.onlyMainContent = args.onlyMainContent;
    if (args.parsePDF !== undefined) crawlOptions.scrapeOptions.parsePDF = args.parsePDF;
    if (args.maxAge !== undefined) crawlOptions.scrapeOptions.maxAge = args.maxAge;

    const response = await fetch(`${this.baseUrl}/v1/crawl`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: args.url,
        ...crawlOptions
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: result.success || true,
      action: 'crawl',
      url: args.url,
      jobId: result.id || result.jobId,
      data: result.data || result,
      limit: crawlOptions.limit,
      timestamp: new Date().toISOString()
    };
  }

  private async extractFromUrl(args: any): Promise<any> {
    if (!args.url) {
      throw new Error("URL is required for extract action");
    }

    if (!args.extractionSchema) {
      throw new Error("extractionSchema is required for extract action");
    }

    const extractOptions: any = {
      formats: ['json'],
      jsonOptions: {
        schema: args.extractionSchema
      }
    };

    if (args.onlyMainContent !== undefined) extractOptions.onlyMainContent = args.onlyMainContent;
    if (args.parsePDF !== undefined) extractOptions.parsePDF = args.parsePDF;
    if (args.maxAge !== undefined) extractOptions.maxAge = args.maxAge;

    const response = await fetch(`${this.baseUrl}/v1/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: args.url,
        ...extractOptions
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: result.success || true,
      action: 'extract',
      url: args.url,
      extractedData: result.data?.json || result.json,
      schema: args.extractionSchema,
      timestamp: new Date().toISOString()
    };
  }

  private async searchWeb(args: any): Promise<any> {
    if (!args.query) {
      throw new Error("Query is required for search action");
    }

    const searchOptions: any = {
      limit: Math.min(args.limit || 5, 20),
      scrapeOptions: {
        formats: args.formats || ['markdown']
      }
    };

    if (args.onlyMainContent !== undefined) searchOptions.scrapeOptions.onlyMainContent = args.onlyMainContent;
    if (args.parsePDF !== undefined) searchOptions.scrapeOptions.parsePDF = args.parsePDF;
    if (args.maxAge !== undefined) searchOptions.scrapeOptions.maxAge = args.maxAge;

    const response = await fetch(`${this.baseUrl}/v1/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: args.query,
        ...searchOptions
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: result.success || true,
      action: 'search',
      query: args.query,
      results: result.data || result,
      limit: searchOptions.limit,
      timestamp: new Date().toISOString()
    };
  }

  private async checkCrawlStatus(args: any): Promise<any> {
    if (!args.jobId) {
      throw new Error("jobId is required for check_crawl_status action");
    }

    const response = await fetch(`${this.baseUrl}/v1/crawl/${args.jobId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      action: 'check_crawl_status',
      jobId: args.jobId,
      status: result.status,
      data: result.data,
      total: result.total,
      completed: result.completed,
      creditsUsed: result.creditsUsed,
      expiresAt: result.expiresAt,
      timestamp: new Date().toISOString()
    };
  }
}