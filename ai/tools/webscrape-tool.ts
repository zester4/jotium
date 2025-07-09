import { FunctionDeclaration, Type } from "@google/genai";
import FireCrawlApp from '@mendable/firecrawl-js';

interface Tool {
  getDefinition(): FunctionDeclaration;
  execute(args: any): Promise<any>;
}

export class WebScrapeTool implements Tool {
  private fireCrawlClient: FireCrawlApp;

  constructor(apiKey: string) {
    this.fireCrawlClient = new FireCrawlApp({ apiKey });
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "web_scrape",
      description: "Advanced web scraping tool with multiple modes: scrape single pages, crawl entire websites, or search and scrape results",
      parameters: {
        type: Type.OBJECT,
        properties: {
          mode: {
            type: Type.STRING,
            description: "Scraping mode: 'scrape' for single URL, 'crawl' for entire site, 'search' for search-based scraping",
            enum: ["scrape", "crawl", "search"]
          },
          url: {
            type: Type.STRING,
            description: "Target URL for scraping or crawling (required for scrape/crawl modes)"
          },
          query: {
            type: Type.STRING,
            description: "Search query for search mode (required for search mode)"
          },
          limit: {
            type: Type.NUMBER,
            description: "Maximum number of pages to process"
          },
          maxDepth: {
            type: Type.NUMBER,
            description: "Maximum crawl depth from starting URL"
          }
        },
        required: ["mode"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    const options = this.buildScrapeOptions(args);
    
    switch (args.mode) {
      case 'scrape':
        if (!args.url) throw new Error('URL is required for scrape mode');
        return await this.scrapeUrl(args.url, options);
      case 'crawl':
        if (!args.url) throw new Error('URL is required for crawl mode');
        return await this.crawlUrl(args.url, args, options);
      case 'search':
        if (!args.query) throw new Error('Query is required for search mode');
        return await this.searchAndScrape(args.query, args, options);
      default:
        throw new Error(`Unknown mode: ${args.mode}`);
    }
  }

  private buildScrapeOptions(args: any): any {
    const options: any = {
      formats: ["markdown"],
      onlyMainContent: args.onlyMainContent !== false,
      includeLinks: args.includeLinks || false
    };

    // Add optional parameters
    if (args.includeTags && args.includeTags.length > 0) {
      options.includeTags = args.includeTags;
    }

    if (args.excludeTags && args.excludeTags.length > 0) {
      options.excludeTags = args.excludeTags;
    }

    if (args.waitFor && args.waitFor <= 10000) {
      options.waitFor = args.waitFor;
    }

    if (args.screenshot) {
      options.screenshot = true;
    }

    if (args.extractSchema) {
      options.extractorOptions = {
        mode: "llm-extraction",
        extractionSchema: args.extractSchema
      };
    }

    if (args.timeout && args.timeout <= 60000) {
      options.timeout = args.timeout;
    }

    if (args.headers) {
      options.headers = args.headers;
    }

    return options;
  }

  private async scrapeUrl(url: string, scrapeOptions: any): Promise<any> {
    console.log(`📄 Scraping: ${url}`);
    
    const result = await this.fireCrawlClient.scrapeUrl(url, scrapeOptions);
    
    if (!result.success) {
      throw new Error(`Scraping failed: ${result.error || 'Unknown error'}`);
    }

    return {
      url: url,
      title: result.metadata?.title || 'No title',
      description: result.metadata?.description || '',
      content: result.markdown || '',
      metadata: {
        ...result.metadata,
        contentLength: result.markdown?.length || 0,
        links: result.links || [],
        images: result.metadata?.images || []
      },
      screenshot: result.screenshot || null
    };
  }

  private async crawlUrl(url: string, args: any, scrapeOptions: any): Promise<any> {
    console.log(`🕸️ Crawling: ${url}`);
    
    const crawlOptions: any = {
      limit: Math.min(args.limit || 5, 50),
      scrapeOptions: scrapeOptions
    };

    // Add crawl-specific options
    if (args.allowedDomains && args.allowedDomains.length > 0) {
      crawlOptions.allowedDomains = args.allowedDomains;
    }

    if (args.excludePaths && args.excludePaths.length > 0) {
      crawlOptions.excludePaths = args.excludePaths;
    }

    if (args.maxDepth && args.maxDepth <= 5) {
      crawlOptions.maxDepth = args.maxDepth;
    }

    const result = await this.fireCrawlClient.crawlUrl(url, crawlOptions);
    
    if (!result.success) {
      throw new Error(`Crawling failed: ${result.error || 'Unknown error'}`);
    }

    const pages = result.data || [];
    const totalContent = pages.map((page: any) => page.markdown || page.content || '').join('\n\n---\n\n');

    return {
      startUrl: url,
      pagesFound: pages.length,
      totalContentLength: totalContent.length,
      pages: pages.map((page: any) => ({
        url: page.metadata?.sourceURL || page.url,
        title: page.metadata?.title || 'No title',
        content: page.markdown || page.content || '',
        contentLength: (page.markdown || page.content || '').length,
        links: page.links || [],
        statusCode: page.metadata?.statusCode
      })),
      combinedContent: totalContent,
      metadata: {
        crawlDepth: crawlOptions.maxDepth || 2,
        totalLinks: pages.reduce((acc: number, page: any) => acc + (page.links?.length || 0), 0),
        uniqueDomains: [...new Set(pages.map((page: any) => 
          new URL(page.metadata?.sourceURL || page.url || '').hostname
        ).filter(Boolean))]
      }
    };
  }

  private async searchAndScrape(query: string, args: any, scrapeOptions: any): Promise<any> {
    console.log(`🔍 Searching and scraping: "${query}"`);
    
    const searchOptions = {
      limit: Math.min(args.limit || 10, 50),
      scrapeOptions: scrapeOptions
    };

    const result = await this.fireCrawlClient.search(query, searchOptions);
    
    if (!result.success) {
      throw new Error(`Search failed: ${result.error || 'Unknown error'}`);
    }

    const results = result.data || [];
    const totalContent = results.map((item: any) => item.markdown || item.content || '').join('\n\n---\n\n');

    return {
      query: query,
      resultsCount: results.length,
      totalContentLength: totalContent.length,
      results: results.map((item: any) => ({
        url: item.metadata?.sourceURL || item.url,
        title: item.metadata?.title || 'No title', 
        snippet: item.metadata?.description || '',
        content: item.markdown || item.content || '',
        contentLength: (item.markdown || item.content || '').length,
        relevanceScore: item.metadata?.score || 0
      })),
      combinedContent: totalContent,
      metadata: {
        searchTerms: query.split(' '),
        averageContentLength: Math.round(totalContent.length / (results.length || 1)),
        topDomains: this.getTopDomains(results)
      }
    };
  }

  private getTopDomains(results: any[]): string[] {
    const domainCounts: { [key: string]: number } = {};
    
    results.forEach(result => {
      try {
        const domain = new URL(result.metadata?.sourceURL || result.url || '').hostname;
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      } catch (e) {
        // Skip invalid URLs
      }
    });

    return Object.entries(domainCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([domain]) => domain);
  }
}

// Usage Examples:
/*
// Initialize the tool
const scraper = new WebScrapeTool("your-firecrawl-api-key");

// Single page scraping
const scrapeResult = await scraper.execute({
    mode: "scrape",
    url: "https://example.com",
    onlyMainContent: true,
    includeLinks: true,
    screenshot: true
});

// Website crawling
const crawlResult = await scraper.execute({
    mode: "crawl", 
    url: "https://example.com",
    limit: 10,
    maxDepth: 2,
    allowedDomains: ["example.com"],
    excludePaths: ["/admin", "/login"]
});

// Search and scrape
const searchResult = await scraper.execute({
    mode: "search",
    query: "TypeScript web scraping tutorials",
    limit: 5,
    onlyMainContent: true
});

// Advanced extraction with schema
const extractResult = await scraper.execute({
    mode: "scrape",
    url: "https://news-site.com/article",
    extractSchema: {
        title: "string",
        author: "string", 
        publishDate: "string",
        content: "string",
        tags: "array"
    }
});
*/
