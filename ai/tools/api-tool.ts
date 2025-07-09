import { FunctionDeclaration, Type } from "@google/genai";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import FormData from "form-data";
import { URLSearchParams } from "url";

export interface APIToolConfig {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  defaultHeaders?: Record<string, string>;
  rateLimitDelay?: number;
}

export class ApiTool {
  private config: APIToolConfig;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor(config: APIToolConfig = {}) {
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
      rateLimitDelay: 100,
      defaultHeaders: {
        'User-Agent': 'AdvancedAPITool/1.0',
        'Accept': 'application/json, text/plain, */*'
      },
      ...config
    };
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "api_request",
      description: "Make HTTP requests to any API endpoint with advanced features including authentication, retries, file uploads, and comprehensive error handling. Supports REST, GraphQL, and custom protocols.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          url: {
            type: Type.STRING,
            description: "The complete URL to make the request to"
          },
          method: {
            type: Type.STRING,
            description: "HTTP method (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)",
            enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]
          },
          headers: {
            type: Type.OBJECT,
            description: "HTTP headers as key-value pairs"
          },
          body: {
            type: Type.OBJECT,
            description: "Request body data (will be JSON stringified for JSON requests)"
          },
          queryParams: {
            type: Type.OBJECT,
            description: "Query parameters as key-value pairs"
          },
          authentication: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: "Authentication type",
                enum: ["bearer", "basic", "apikey", "oauth2", "custom"]
              },
              token: {
                type: Type.STRING,
                description: "Bearer token or API key"
              },
              username: {
                type: Type.STRING,
                description: "Username for basic auth"
              },
              password: {
                type: Type.STRING,
                description: "Password for basic auth"
              },
              headerName: {
                type: Type.STRING,
                description: "Custom header name for API key auth"
              },
              customHeaders: {
                type: Type.OBJECT,
                description: "Custom authentication headers"
              }
            },
            required: ["type"]
          },
          contentType: {
            type: Type.STRING,
            description: "Content-Type header (application/json, application/x-www-form-urlencoded, multipart/form-data, text/plain, etc.)"
          },
          responseType: {
            type: Type.STRING,
            description: "Expected response type",
            enum: ["json", "text", "blob", "arraybuffer", "stream"]
          },
          timeout: {
            type: Type.NUMBER,
            description: "Request timeout in milliseconds (default: 30000)"
          },
          retries: {
            type: Type.NUMBER,
            description: "Number of retry attempts on failure (default: 3)"
          },
          retryCondition: {
            type: Type.OBJECT,
            properties: {
              statusCodes: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: "HTTP status codes that should trigger a retry"
              },
              networkErrors: {
                type: Type.BOOLEAN,
                description: "Whether to retry on network errors (default: true)"
              }
            }
          },
          validateSSL: {
            type: Type.BOOLEAN,
            description: "Whether to validate SSL certificates (default: true)"
          },
          followRedirects: {
            type: Type.BOOLEAN,
            description: "Whether to follow HTTP redirects (default: true)"
          },
          maxRedirects: {
            type: Type.NUMBER,
            description: "Maximum number of redirects to follow (default: 5)"
          },
          proxy: {
            type: Type.OBJECT,
            properties: {
              host: { type: Type.STRING },
              port: { type: Type.NUMBER },
              auth: {
                type: Type.OBJECT,
                properties: {
                  username: { type: Type.STRING },
                  password: { type: Type.STRING }
                }
              }
            }
          },
          cookies: {
            type: Type.OBJECT,
            description: "Cookies to send with the request"
          },
          files: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                fieldName: { type: Type.STRING, description: "Form field name for the file" },
                fileName: { type: Type.STRING, description: "Original filename" },
                mimeType: { type: Type.STRING, description: "MIME type of the file" },
                content: { type: Type.STRING, description: "Base64 encoded file content" }
              },
              required: ["fieldName", "fileName", "content"]
            },
            description: "Files to upload (for multipart/form-data requests)"
          },
          rateLimiting: {
            type: Type.OBJECT,
            properties: {
              requestsPerSecond: { type: Type.NUMBER, description: "Maximum requests per second" },
              burstSize: { type: Type.NUMBER, description: "Maximum burst size for rate limiting" }
            }
          },
          caching: {
            type: Type.OBJECT,
            properties: {
              enabled: { type: Type.BOOLEAN, description: "Enable response caching" },
              ttl: { type: Type.NUMBER, description: "Cache time-to-live in seconds" },
              key: { type: Type.STRING, description: "Custom cache key" }
            }
          },
          transform: {
            type: Type.OBJECT,
            properties: {
              request: { type: Type.STRING, description: "JavaScript function to transform request data" },
              response: { type: Type.STRING, description: "JavaScript function to transform response data" }
            }
          }
        },
        required: ["url", "method"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    const startTime = Date.now();
    this.requestCount++;
    
    try {
      console.log(`🚀 API Request #${this.requestCount}: ${args.method} ${args.url}`);
      
      // Rate limiting
      await this.handleRateLimit(args.rateLimiting);
      
      // Build request configuration
      const requestConfig = await this.buildRequestConfig(args);
      
      // Execute request with retries
      const response = await this.executeWithRetries(requestConfig, args.retries || this.config.maxRetries!);
      
      // Process response
      const processedResponse = await this.processResponse(response, args);
      
      const endTime = Date.now();
      console.log(`✅ Request completed in ${endTime - startTime}ms`);
      
      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: processedResponse.data,
        requestTime: endTime - startTime,
        requestCount: this.requestCount,
        url: args.url,
        method: args.method,
        cached: false, // Implement caching logic if needed
        metadata: {
          responseSize: JSON.stringify(processedResponse.data).length,
          contentType: response.headers['content-type'],
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error: any) {
      console.error(`❌ API Request failed:`, error.message);
      
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data
        },
        requestTime: Date.now() - startTime,
        requestCount: this.requestCount,
        url: args.url,
        method: args.method,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async buildRequestConfig(args: any): Promise<AxiosRequestConfig> {
    const config: AxiosRequestConfig = {
      url: args.url,
      method: args.method.toLowerCase(),
      timeout: args.timeout || this.config.timeout,
      headers: { ...this.config.defaultHeaders, ...args.headers },
      validateStatus: () => true, // Don't throw on HTTP error status
      maxRedirects: args.maxRedirects || 5,
      httpsAgent: args.validateSSL === false ? { rejectUnauthorized: false } : undefined
    };

    // Add query parameters
    if (args.queryParams) {
      config.params = args.queryParams;
    }

    // Handle authentication
    if (args.authentication) {
      this.addAuthentication(config, args.authentication);
    }

    // Handle request body
    if (args.body) {
      await this.addRequestBody(config, args);
    }

    // Handle file uploads
    if (args.files && args.files.length > 0) {
      await this.addFileUploads(config, args);
    }

    // Handle cookies
    if (args.cookies) {
      const cookieString = Object.entries(args.cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
      config.headers!['Cookie'] = cookieString;
    }

    // Handle proxy
    if (args.proxy) {
      config.proxy = args.proxy;
    }

    // Set response type
    if (args.responseType) {
      config.responseType = args.responseType;
    }

    return config;
  }

  private addAuthentication(config: AxiosRequestConfig, auth: any): void {
    switch (auth.type) {
      case 'bearer':
        config.headers!['Authorization'] = `Bearer ${auth.token}`;
        break;
      case 'basic':
        const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
        config.headers!['Authorization'] = `Basic ${credentials}`;
        break;
      case 'apikey':
        if (auth.headerName) {
          config.headers![auth.headerName] = auth.token;
        } else {
          config.headers!['X-API-Key'] = auth.token;
        }
        break;
      case 'custom':
        if (auth.customHeaders) {
          Object.assign(config.headers!, auth.customHeaders);
        }
        break;
    }
  }

  private async addRequestBody(config: AxiosRequestConfig, args: any): Promise<void> {
    const contentType = args.contentType || 'application/json';
    config.headers!['Content-Type'] = contentType;

    switch (contentType) {
      case 'application/json':
        config.data = JSON.stringify(args.body);
        break;
      case 'application/x-www-form-urlencoded':
        config.data = new URLSearchParams(args.body).toString();
        break;
      case 'text/plain':
        config.data = typeof args.body === 'string' ? args.body : JSON.stringify(args.body);
        break;
      default:
        config.data = args.body;
    }
  }

  private async addFileUploads(config: AxiosRequestConfig, args: any): Promise<void> {
    const formData = new FormData();

    // Add regular form fields
    if (args.body) {
      Object.entries(args.body).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
    }

    // Add files
    for (const file of args.files) {
      const buffer = Buffer.from(file.content, 'base64');
      formData.append(file.fieldName, buffer, {
        filename: file.fileName,
        contentType: file.mimeType
      });
    }

    config.data = formData;
    config.headers = {
      ...config.headers,
      ...formData.getHeaders()
    };
  }

  private async executeWithRetries(config: AxiosRequestConfig, maxRetries: number): Promise<AxiosResponse> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.config.retryDelay! * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
          await this.sleep(delay);
        }

        const response = await axios(config);
        
        // Check if retry is needed based on status code
        if (this.shouldRetry(response, config)) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
        
      } catch (error: any) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        console.log(`❌ Request failed (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message}`);
      }
    }
    
    throw lastError;
  }

  private shouldRetry(response: AxiosResponse, config: any): boolean {
    // Retry on 5xx errors, 429 (rate limit), and 408 (timeout)
    const retryStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryStatusCodes.includes(response.status);
  }

  private async processResponse(response: AxiosResponse, args: any): Promise<any> {
    let data = response.data;

    // Apply response transformation if provided
    if (args.transform?.response) {
      try {
        const transformFunction = new Function('data', 'response', args.transform.response);
        data = transformFunction(data, response);
      } catch (error) {
        console.warn('Response transformation failed:', error);
      }
    }

    return { data };
  }

  private async handleRateLimit(rateLimiting?: any): Promise<void> {
    if (!rateLimiting?.requestsPerSecond) return;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / rateLimiting.requestsPerSecond;

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      await this.sleep(delay);
    }

    this.lastRequestTime = Date.now();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility methods for common API patterns
  async get(url: string, options: any = {}): Promise<any> {
    return this.execute({ url, method: 'GET', ...options });
  }

  async post(url: string, body: any, options: any = {}): Promise<any> {
    return this.execute({ url, method: 'POST', body, ...options });
  }

  async put(url: string, body: any, options: any = {}): Promise<any> {
    return this.execute({ url, method: 'PUT', body, ...options });
  }

  async delete(url: string, options: any = {}): Promise<any> {
    return this.execute({ url, method: 'DELETE', ...options });
  }

  async patch(url: string, body: any, options: any = {}): Promise<any> {
    return this.execute({ url, method: 'PATCH', body, ...options });
  }

  // GraphQL helper
  async graphql(url: string, query: string, variables?: any, options: any = {}): Promise<any> {
    return this.execute({
      url,
      method: 'POST',
      body: { query, variables },
      contentType: 'application/json',
      ...options
    });
  }

  // Upload file helper
  async uploadFile(url: string, file: any, fieldName: string = 'file', options: any = {}): Promise<any> {
    return this.execute({
      url,
      method: 'POST',
      files: [{ ...file, fieldName }],
      ...options
    });
  }

  // Reset request counter
  resetCounter(): void {
    this.requestCount = 0;
  }

  // Get request statistics
  getStats(): { requestCount: number; lastRequestTime: number } {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime
    };
  }
}

// Example usage and factory function
export function createAPITool(config?: APIToolConfig): ApiTool {
  return new ApiTool(config);
}

// Pre-configured instances for common use cases
export const RestAPITool = createAPITool({
  defaultHeaders: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export const GraphQLAPITool = createAPITool({
  defaultHeaders: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export const FileUploadAPITool = createAPITool({
  timeout: 60000, // Longer timeout for file uploads
  maxRetries: 1    // Fewer retries for uploads
});
