import { FunctionDeclaration, Type } from "@google/genai";

export class DuckDuckGoSearchTool {
  private baseUrl: string = "https://api.duckduckgo.com";
  private userAgent: string = "Mozilla/5.0 (compatible; SearchBot/1.0)";

  constructor() {
    // DuckDuckGo doesn't require an API key for basic searches
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "duckduckgo_search",
      description: "Search using DuckDuckGo's privacy-focused search engine. Provides web results, instant answers, and related topics without tracking users.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: "The search query to find information about"
          },
          format: {
            type: Type.STRING,
            description: "Response format: 'json' (default) or 'xml'"
          },
          noRedirect: {
            type: Type.BOOLEAN,
            description: "Skip redirects for !bang commands (default: false)"
          },
          noHtml: {
            type: Type.BOOLEAN,
            description: "Remove HTML from text (default: true)"
          },
          skipDisambig: {
            type: Type.BOOLEAN,
            description: "Skip disambiguation pages (default: true)"
          },
          safeSearch: {
            type: Type.STRING,
            description: "Safe search setting: 'strict', 'moderate', or 'off' (default: moderate)"
          },
          region: {
            type: Type.STRING,
            description: "Region code for localized results (e.g., 'us-en', 'uk-en', 'de-de')"
          },
          maxResults: {
            type: Type.NUMBER,
            description: "Maximum number of web results to fetch (default: 10, max: 50)"
          }
        },
        required: ["query"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`🦆 DuckDuckGo searching: "${args.query}"`);

      // First, get instant answer from DuckDuckGo API
      const instantAnswer = await this.getInstantAnswer(args);
      
      // Then, scrape web results (since DDG doesn't provide a public web search API)
      const webResults = await this.getWebResults(args);

      return {
        success: true,
        query: args.query,
        searchTime: new Date().toISOString(),
        instantAnswer: instantAnswer,
        webResults: webResults,
        resultsCount: webResults.length,
        source: "DuckDuckGo"
      };

    } catch (error: unknown) {
      console.error("❌ DuckDuckGo search failed:", error);
      return {
        success: false,
        error: `DuckDuckGo search failed: ${error instanceof Error ? error.message : String(error)}`,
        query: args.query
      };
    }
  }

  private async getInstantAnswer(args: any): Promise<any> {
    try {
      const params = new URLSearchParams({
        q: args.query,
        format: args.format || 'json',
        no_redirect: args.noRedirect ? '1' : '0',
        no_html: args.noHtml !== false ? '1' : '0',
        skip_disambig: args.skipDisambig !== false ? '1' : '0'
      });

      if (args.safeSearch) {
        params.append('safe_search', args.safeSearch);
      }

      const response = await fetch(`${this.baseUrl}/?${params.toString()}`, {
        headers: {
          'User-Agent': this.userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        abstract: result.Abstract || null,
        abstractText: result.AbstractText || null,
        abstractSource: result.AbstractSource || null,
        abstractUrl: result.AbstractURL || null,
        image: result.Image || null,
        heading: result.Heading || null,
        answer: result.Answer || null,
        answerType: result.AnswerType || null,
        definition: result.Definition || null,
        definitionSource: result.DefinitionSource || null,
        definitionUrl: result.DefinitionURL || null,
        relatedTopics: result.RelatedTopics?.map((topic: any) => ({
          text: topic.Text,
          firstUrl: topic.FirstURL
        })) || [],
        infobox: result.Infobox || null,
        type: result.Type || null
      };

    } catch (error) {
      console.warn("Could not fetch instant answer:", error);
      return null;
    }
  }

  private async getWebResults(args: any): Promise<any[]> {
    try {
      // Note: This is a simplified approach. For production use, you might want to use
      // a proper web scraping library or service like Puppeteer, Playwright, or a proxy service
      
      const maxResults = Math.min(args.maxResults || 10, 50);
      const query = encodeURIComponent(args.query);
      const region = args.region || 'us-en';
      const safeSearch = args.safeSearch || 'moderate';
      
      // DuckDuckGo HTML search URL
      const searchUrl = `https://html.duckduckgo.com/html/?q=${query}&kl=${region}&s=${safeSearch === 'strict' ? 'strict' : safeSearch === 'off' ? 'off' : 'moderate'}`;

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Parse HTML to extract results (simplified parsing)
      const results = this.parseSearchResults(html, maxResults);
      
      return results;

    } catch (error) {
      console.warn("Could not fetch web results:", error);
      return [];
    }
  }

  private parseSearchResults(html: string, maxResults: number): any[] {
    const results: any[] = [];
    
    try {
      // Simple regex-based parsing (in production, use a proper HTML parser)
      const resultPattern = /<div class="result__body">[\s\S]*?<a rel="nofollow" href="([^"]+)"[\s\S]*?<h2.*?>([\s\S]*?)<\/h2>[\s\S]*?<a class="result__snippet"[\s\S]*?>([\s\S]*?)<\/a>/g;
      
      let match;
      let count = 0;
      
      while ((match = resultPattern.exec(html)) !== null && count < maxResults) {
        const url = match[1];
        const title = match[2].replace(/<[^>]+>/g, '').trim();
        const snippet = match[3].replace(/<[^>]+>/g, '').trim();
        
        if (url && title && snippet) {
          results.push({
            title: title,
            url: this.decodeUrl(url),
            snippet: snippet,
            position: count + 1
          });
          count++;
        }
      }
      
      // Fallback: try alternative parsing pattern
      if (results.length === 0) {
        const altPattern = /<a class="result__a" href="([^"]+)">([^<]+)<\/a>[\s\S]*?<span class="result__snippet">([^<]+)<\/span>/g;
        
        count = 0;
        while ((match = altPattern.exec(html)) !== null && count < maxResults) {
          results.push({
            title: match[2].trim(),
            url: this.decodeUrl(match[1]),
            snippet: match[3].trim(),
            position: count + 1
          });
          count++;
        }
      }
      
    } catch (error) {
      console.warn("Error parsing search results:", error);
    }
    
    return results;
  }

  private decodeUrl(encodedUrl: string): string {
    try {
      // DuckDuckGo encodes URLs, decode them
      const decodedUrl = decodeURIComponent(encodedUrl);
      
      // Remove DuckDuckGo tracking parameters if present
      const urlMatch = decodedUrl.match(/uddg=([^&]+)/);
      if (urlMatch) {
        return decodeURIComponent(urlMatch[1]);
      }
      
      return decodedUrl;
    } catch (error) {
      return encodedUrl;
    }
  }
}