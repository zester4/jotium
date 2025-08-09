import { FunctionDeclaration, Type } from "@google/genai";

export class SerperSearchTool {
  private apiKey: string;
  private baseUrl: string = "https://google.serper.dev";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "serper_search",
      description: "Search Google using Serper.dev API for web results, images, places, news, and shopping. Provides comprehensive search capabilities with various result types.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: "The search query to find information about"
          },
          searchType: {
            type: Type.STRING,
            description: "Type of search: 'search' (web), 'images', 'places', 'news', 'shopping', 'videos' (default: search)"
          },
          num: {
            type: Type.NUMBER,
            description: "Number of results to return (default: 10, max: 100)"
          },
          gl: {
            type: Type.STRING,
            description: "Country code for geolocation (e.g., 'us', 'uk', 'ca')"
          },
          hl: {
            type: Type.STRING,
            description: "Language code (e.g., 'en', 'es', 'fr')"
          },
          location: {
            type: Type.STRING,
            description: "Location for local search (e.g., 'New York, NY' - mainly for places search)"
          },
          tbs: {
            type: Type.STRING,
            description: "Time-based search filters (e.g., 'qdr:d' for past day, 'qdr:w' for past week)"
          },
          safe: {
            type: Type.STRING,
            description: "Safe search setting: 'active' or 'off' (default: active)"
          }
        },
        required: ["query"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`🔍 Serper searching (${args.searchType || 'web'}): "${args.query}"`);

      const searchType = args.searchType || 'search';
      const endpoint = `${this.baseUrl}/${searchType}`;

      const requestBody: any = {
        q: args.query,
        num: Math.min(args.num || 10, 100)
      };

      // Add optional parameters if provided
      if (args.gl) requestBody.gl = args.gl;
      if (args.hl) requestBody.hl = args.hl;
      if (args.location) requestBody.location = args.location;
      if (args.tbs) requestBody.tbs = args.tbs;
      if (args.safe) requestBody.safe = args.safe;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Process different types of results
      const processedResult: any = {
        success: true,
        query: args.query,
        searchType: searchType,
        searchTime: new Date().toISOString()
      };

      // Handle different search types
      switch (searchType) {
        case 'search':
          processedResult.organic = result.organic?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            date: item.date,
            position: item.position
          })) || [];
          
          processedResult.answerBox = result.answerBox || null;
          processedResult.peopleAlsoAsk = result.peopleAlsoAsk || [];
          processedResult.relatedSearches = result.relatedSearches || [];
          processedResult.knowledgeGraph = result.knowledgeGraph || null;
          break;

        case 'images':
          processedResult.images = result.images?.map((item: any) => ({
            title: item.title,
            imageUrl: item.imageUrl,
            imageWidth: item.imageWidth,
            imageHeight: item.imageHeight,
            thumbnailUrl: item.thumbnailUrl,
            source: item.source,
            link: item.link
          })) || [];
          break;

        case 'places':
          processedResult.places = result.places?.map((item: any) => ({
            title: item.title,
            address: item.address,
            latitude: item.latitude,
            longitude: item.longitude,
            rating: item.rating,
            ratingCount: item.ratingCount,
            category: item.category,
            phoneNumber: item.phoneNumber,
            website: item.website,
            cid: item.cid
          })) || [];
          break;

        case 'news':
          processedResult.news = result.news?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            date: item.date,
            source: item.source,
            imageUrl: item.imageUrl
          })) || [];
          break;

        case 'shopping':
          processedResult.shopping = result.shopping?.map((item: any) => ({
            title: item.title,
            price: item.price,
            source: item.source,
            link: item.link,
            imageUrl: item.imageUrl,
            rating: item.rating,
            ratingCount: item.ratingCount,
            delivery: item.delivery
          })) || [];
          break;

        case 'videos':
          processedResult.videos = result.videos?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            date: item.date,
            source: item.source,
            channel: item.channel,
            duration: item.duration,
            imageUrl: item.imageUrl
          })) || [];
          break;
      }

      processedResult.resultsCount = this.getResultCount(processedResult, searchType);
      return processedResult;

    } catch (error: unknown) {
      console.error("❌ Serper search failed:", error);
      return {
        success: false,
        error: `Serper search failed: ${error instanceof Error ? error.message : String(error)}`,
        query: args.query,
        searchType: args.searchType || 'search'
      };
    }
  }

  private getResultCount(result: any, searchType: string): number {
    switch (searchType) {
      case 'search':
        return result.organic?.length || 0;
      case 'images':
        return result.images?.length || 0;
      case 'places':
        return result.places?.length || 0;
      case 'news':
        return result.news?.length || 0;
      case 'shopping':
        return result.shopping?.length || 0;
      case 'videos':
        return result.videos?.length || 0;
      default:
        return 0;
    }
  }
}