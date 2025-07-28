import { FunctionDeclaration, Type } from "@google/genai";

export class NotionTool {
  private baseUrl = "https://api.notion.com/v1";
  private accessToken: string;
  private notionVersion = "2022-06-28";

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "notion_tool",
      description: "A comprehensive tool for managing Notion resources and operations. Provides functionality to: Create/update/delete pages and databases, manage blocks and content, handle users and workspaces, search across all content, manage page properties and database schemas. Supports full CRUD operations on all major Notion entities with automatic ID resolution - you can reference items by name and the tool will find their IDs automatically.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform with the Notion tool",
            enum: [
              // Search and discovery operations
              "search",
              "search_by_title",
              "get_page_by_title",
              "get_database_by_title",
              "find_page_in_database",
              "list_all_pages",
              "list_all_databases",
              
              // Page operations
              "get_page",
              "create_page",
              "create_workspace_page",
              "update_page",
              "delete_page",
              "archive_page",
              "restore_page",
              "get_page_properties",
              "update_page_properties",
              "get_page_content",
              
              // Database operations
              "get_database",
              "create_database",
              "update_database",
              "query_database",
              "get_database_schema",
              "add_database_property",
              "update_database_property",
              "remove_database_property",
              
              // Block operations
              "get_block",
              "get_block_children",
              "append_block_children",
              "update_block",
              "delete_block",
              "create_block",
              
              // User operations
              "get_user",
              "get_users",
              "get_current_user",
              "get_bot_user",
              
              // Workspace operations
              "get_workspace",
              
              // Comment operations
              "get_comments",
              "create_comment",
              
              // Utility operations
              "get_all_workspace_content",
              "backup_page",
              "backup_database",
              "duplicate_page",
              "duplicate_database",
              "bulk_update_pages",
              "bulk_create_pages"
            ]
          },
          
          // Common parameters
          id: {
            type: Type.STRING,
            description: "The ID of the Notion object (page, database, block, etc.)"
          },
          
          // Search parameters
          query: {
            type: Type.STRING,
            description: "Search query text"
          },
          
          title: {
            type: Type.STRING,
            description: "Title to search for or name of the page/database"
          },
          
          filter: {
            type: Type.OBJECT,
            description: "Search filter criteria",
            properties: {
              value: { type: Type.STRING, enum: ["page", "database"] },
              property: { type: Type.STRING, enum: ["object"] }
            }
          },
          
          sort: {
            type: Type.OBJECT,
            description: "Sort criteria for search results",
            properties: {
              direction: { type: Type.STRING, enum: ["ascending", "descending"] },
              timestamp: { type: Type.STRING, enum: ["last_edited_time"] }
            }
          },
          
          // Page parameters
          pageData: {
            type: Type.OBJECT,
            description: "Page data for creating or updating pages",
            properties: {
              parent: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["page_id", "database_id", "workspace"] },
                  page_id: { type: Type.STRING },
                  database_id: { type: Type.STRING }
                }
              },
              properties: { type: Type.OBJECT },
              children: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              icon: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["emoji", "external", "file"] },
                  emoji: { type: Type.STRING },
                  external: { type: Type.OBJECT },
                  file: { type: Type.OBJECT }
                }
              },
              cover: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["external", "file"] },
                  external: { type: Type.OBJECT },
                  file: { type: Type.OBJECT }
                }
              }
            }
          },
          
          // Database parameters
          databaseData: {
            type: Type.OBJECT,
            description: "Database data for creating or updating databases",
            properties: {
              parent: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["page_id", "workspace"] },
                  page_id: { type: Type.STRING }
                }
              },
              title: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              properties: { type: Type.OBJECT },
              icon: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["emoji", "external", "file"] },
                  emoji: { type: Type.STRING },
                  external: { type: Type.OBJECT },
                  file: { type: Type.OBJECT }
                }
              },
              cover: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["external", "file"] },
                  external: { type: Type.OBJECT },
                  file: { type: Type.OBJECT }
                }
              },
              description: { type: Type.ARRAY, items: { type: Type.OBJECT } }
            }
          },
          
          // Database query parameters
          databaseQuery: {
            type: Type.OBJECT,
            description: "Query parameters for database queries",
            properties: {
              filter: { type: Type.OBJECT },
              sorts: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              start_cursor: { type: Type.STRING },
              page_size: { type: Type.NUMBER }
            }
          },
          
          // Property parameters
          propertyName: {
            type: Type.STRING,
            description: "Name of the property to work with"
          },
          
          propertyData: {
            type: Type.OBJECT,
            description: "Property definition data",
            properties: {
              type: { 
                type: Type.STRING, 
                enum: ["title", "rich_text", "number", "select", "multi_select", "date", "person", "file", "checkbox", "url", "email", "phone_number", "formula", "relation", "rollup", "created_time", "created_by", "last_edited_time", "last_edited_by"]
              },
              title: { type: Type.OBJECT },
              rich_text: { type: Type.OBJECT },
              number: { type: Type.OBJECT },
              select: { type: Type.OBJECT },
              multi_select: { type: Type.OBJECT },
              date: { type: Type.OBJECT },
              people: { type: Type.OBJECT },
              files: { type: Type.OBJECT },
              checkbox: { type: Type.OBJECT },
              url: { type: Type.OBJECT },
              email: { type: Type.OBJECT },
              phone_number: { type: Type.OBJECT },
              formula: { type: Type.OBJECT },
              relation: { type: Type.OBJECT },
              rollup: { type: Type.OBJECT }
            }
          },
          
          // Block parameters
          blockData: {
            type: Type.OBJECT,
            description: "Block data for creating or updating blocks",
            properties: {
              type: { 
                type: Type.STRING,
                enum: ["paragraph", "heading_1", "heading_2", "heading_3", "bulleted_list_item", "numbered_list_item", "to_do", "toggle", "child_page", "child_database", "embed", "image", "video", "file", "pdf", "bookmark", "callout", "quote", "equation", "divider", "table_of_contents", "column", "column_list", "link_preview", "synced_block", "template", "link_to_page", "table", "table_row"]
              },
              paragraph: { type: Type.OBJECT },
              heading_1: { type: Type.OBJECT },
              heading_2: { type: Type.OBJECT },
              heading_3: { type: Type.OBJECT },
              bulleted_list_item: { type: Type.OBJECT },
              numbered_list_item: { type: Type.OBJECT },
              to_do: { type: Type.OBJECT },
              toggle: { type: Type.OBJECT },
              child_page: { type: Type.OBJECT },
              child_database: { type: Type.OBJECT },
              embed: { type: Type.OBJECT },
              image: { type: Type.OBJECT },
              video: { type: Type.OBJECT },
              file: { type: Type.OBJECT },
              pdf: { type: Type.OBJECT },
              bookmark: { type: Type.OBJECT },
              callout: { type: Type.OBJECT },
              quote: { type: Type.OBJECT },
              equation: { type: Type.OBJECT },
              divider: { type: Type.OBJECT },
              table_of_contents: { type: Type.OBJECT },
              link_to_page: { type: Type.OBJECT },
              table: { type: Type.OBJECT },
              table_row: { type: Type.OBJECT }
            }
          },
          
          children: {
            type: Type.ARRAY,
            description: "Array of child blocks to append",
            items: { type: Type.OBJECT }
          },
          
          // Comment parameters
          commentData: {
            type: Type.OBJECT,
            description: "Comment data",
            properties: {
              parent: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["page_id", "block_id"] },
                  page_id: { type: Type.STRING },
                  block_id: { type: Type.STRING }
                }
              },
              rich_text: { type: Type.ARRAY, items: { type: Type.OBJECT } }
            }
          },
          
          // Utility parameters
          parentId: {
            type: Type.STRING,
            description: "Parent page or database ID"
          },
          
          parentType: {
            type: Type.STRING,
            description: "Type of parent (page, database, workspace)",
            enum: ["page", "database", "workspace"]
          },
          
          recursive: {
            type: Type.BOOLEAN,
            description: "Whether to perform operation recursively on child pages/blocks"
          },
          
          includeContent: {
            type: Type.BOOLEAN,
            description: "Whether to include full content in responses"
          },
          
          archiveInsteadOfDelete: {
            type: Type.BOOLEAN,
            description: "Whether to archive instead of permanently delete"
          },
          
          // Pagination parameters
          startCursor: {
            type: Type.STRING,
            description: "Cursor for pagination"
          },
          
          pageSize: {
            type: Type.NUMBER,
            description: "Number of results per page (max 100)"
          },
          
          // Bulk operation parameters
          bulkData: {
            type: Type.ARRAY,
            description: "Array of data for bulk operations",
            items: { type: Type.OBJECT }
          },
          
          // Template parameters
          templateData: {
            type: Type.OBJECT,
            description: "Template data for creating pages from templates"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      switch (args.action) {
        // Search and discovery operations
        case "search":
          return this.search(args.query, args.filter, args.sort, args.startCursor, args.pageSize);
        case "search_by_title":
          return this.searchByTitle(args.title, args.filter);
        case "get_page_by_title":
          return this.getPageByTitle(args.title, args.parentId);
        case "get_database_by_title":
          return this.getDatabaseByTitle(args.title, args.parentId);
        case "find_page_in_database":
          return this.findPageInDatabase(args.id, args.title, args.databaseQuery);
        case "list_all_pages":
          return this.listAllPages(args.includeContent);
        case "list_all_databases":
          return this.listAllDatabases();
          
        // Page operations
        case "get_page":
          return this.getPage(args.id);
        case "create_page":
          return this.createPage(args.pageData, args.parentId, args.parentType);
        case "create_workspace_page":
          return this.createPage(args.pageData, undefined, 'workspace');
        case "update_page":
          return this.updatePage(args.id, args.pageData);
        case "delete_page":
          return this.deletePage(args.id, args.archiveInsteadOfDelete);
        case "archive_page":
          return this.archivePage(args.id);
        case "restore_page":
          return this.restorePage(args.id);
        case "get_page_properties":
          return this.getPageProperties(args.id);
        case "update_page_properties":
          return this.updatePageProperties(args.id, args.pageData.properties);
        case "get_page_content":
          return this.getPageContent(args.id, args.recursive);
          
        // Database operations
        case "get_database":
          return this.getDatabase(args.id);
        case "create_database":
          return this.createDatabase(args.databaseData, args.parentId, args.parentType);
        case "update_database":
          return this.updateDatabase(args.id, args.databaseData);
        case "query_database":
          return this.queryDatabase(args.id, args.databaseQuery);
        case "get_database_schema":
          return this.getDatabaseSchema(args.id);
        case "add_database_property":
          return this.addDatabaseProperty(args.id, args.propertyName, args.propertyData);
        case "update_database_property":
          return this.updateDatabaseProperty(args.id, args.propertyName, args.propertyData);
        case "remove_database_property":
          return this.removeDatabaseProperty(args.id, args.propertyName);
          
        // Block operations
        case "get_block":
          return this.getBlock(args.id);
        case "get_block_children":
          return this.getBlockChildren(args.id, args.startCursor, args.pageSize);
        case "append_block_children":
          return this.appendBlockChildren(args.id, args.children);
        case "update_block":
          return this.updateBlock(args.id, args.blockData);
        case "delete_block":
          return this.deleteBlock(args.id);
        case "create_block":
          return this.createBlock(args.parentId, args.blockData);
          
        // User operations
        case "get_user":
          return this.getUser(args.id);
        case "get_users":
          return this.getUsers(args.startCursor, args.pageSize);
        case "get_current_user":
          return this.getCurrentUser();
        case "get_bot_user":
          return this.getBotUser();
          
        // Workspace operations
        case "get_workspace":
          return this.getWorkspace();
          
        // Comment operations
        case "get_comments":
          return this.getComments(args.id);
        case "create_comment":
          return this.createComment(args.commentData);
          
        // Utility operations
        case "get_all_workspace_content":
          return this.getAllWorkspaceContent();
        case "backup_page":
          return this.backupPage(args.id, args.recursive);
        case "backup_database":
          return this.backupDatabase(args.id);
        case "duplicate_page":
          return this.duplicatePage(args.id, args.title, args.parentId);
        case "duplicate_database":
          return this.duplicateDatabase(args.id, args.title, args.parentId);
        case "bulk_update_pages":
          return this.bulkUpdatePages(args.bulkData);
        case "bulk_create_pages":
          return this.bulkCreatePages(args.bulkData, args.parentId, args.parentType);
          
        default:
          throw new Error(`Unknown action: ${args.action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        action: args.action
      };
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': this.notionVersion
      }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorBody}`);
    }

    return response.json();
  }

  // Search and discovery operations
  private async search(query?: string, filter?: any, sort?: any, startCursor?: string, pageSize?: number): Promise<any> {
    const data: any = {};
    
    if (query) data.query = query;
    if (filter) data.filter = filter;
    if (sort) data.sort = sort;
    if (startCursor) data.start_cursor = startCursor;
    if (pageSize) data.page_size = Math.min(pageSize, 100);

    const result = await this.makeRequest('/search', 'POST', data);
    return {
      success: true,
      action: "search",
      data: result.results,
      has_more: result.has_more,
      next_cursor: result.next_cursor
    };
  }

  private async searchByTitle(title: string, filter?: any): Promise<any> {
    const searchResult = await this.search(title, filter);
    const exactMatches = searchResult.data.filter((item: any) => {
      if (item.object === 'page' && item.properties?.title) {
        const pageTitle = this.extractTextFromRichText(item.properties.title);
        return pageTitle.toLowerCase() === title.toLowerCase();
      }
      if (item.object === 'database' && item.title) {
        const dbTitle = this.extractTextFromRichText(item.title);
        return dbTitle.toLowerCase() === title.toLowerCase();
      }
      return false;
    });

    return {
      success: true,
      action: "search_by_title",
      data: exactMatches,
      total_results: exactMatches.length
    };
  }

  private async getPageByTitle(title: string, parentId?: string): Promise<any> {
    const filter = { value: "page", property: "object" };
    const searchResult = await this.searchByTitle(title, filter);
    
    let pages = searchResult.data;
    
    // If parentId is provided, filter by parent
    if (parentId && pages.length > 0) {
      pages = pages.filter((page: any) => {
        return page.parent?.page_id === parentId || 
               page.parent?.database_id === parentId;
      });
    }

    if (pages.length === 0) {
      throw new Error(`Page with title "${title}" not found${parentId ? ` in parent ${parentId}` : ''}.`);
    }

    return {
      success: true,
      action: "get_page_by_title",
      data: pages[0],
      id: pages[0].id,
      title: title,
      all_matches: pages
    };
  }

  private async getDatabaseByTitle(title: string, parentId?: string): Promise<any> {
    const filter = { value: "database", property: "object" };
    const searchResult = await this.searchByTitle(title, filter);
    
    let databases = searchResult.data;
    
    // If parentId is provided, filter by parent
    if (parentId && databases.length > 0) {
      databases = databases.filter((db: any) => {
        return db.parent?.page_id === parentId;
      });
    }

    if (databases.length === 0) {
      throw new Error(`Database with title "${title}" not found${parentId ? ` in parent ${parentId}` : ''}.`);
    }

    return {
      success: true,
      action: "get_database_by_title",
      data: databases[0],
      id: databases[0].id,
      title: title,
      all_matches: databases
    };
  }

  private async findPageInDatabase(databaseId: string, title: string, query?: any): Promise<any> {
    const searchQuery = {
      filter: {
        and: [
          {
            property: "title",
            title: {
              contains: title
            }
          }
        ]
      },
      ...query
    };

    const result = await this.queryDatabase(databaseId, searchQuery);
    const exactMatches = result.data.filter((page: any) => {
      const pageTitle = this.extractTitleFromPage(page);
      return pageTitle.toLowerCase() === title.toLowerCase();
    });

    return {
      success: true,
      action: "find_page_in_database",
      data: exactMatches,
      all_results: result.data,
      database_id: databaseId
    };
  }

  private async listAllPages(includeContent: boolean = false): Promise<any> {
    const filter = { value: "page", property: "object" };
    const allPages = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const result = await this.search(undefined, filter, undefined, startCursor, 100);
      allPages.push(...result.data);
      hasMore = result.has_more;
      startCursor = result.next_cursor;
    }

    // If includeContent is true, fetch full content for each page
    if (includeContent) {
      for (const page of allPages) {
        try {
          const fullPage = await this.getPage(page.id);
          Object.assign(page, fullPage.data);
        } catch (error) {
          // Skip pages that can't be accessed
          page.access_error = error instanceof Error ? error.message : String(error);
        }
      }
    }

    return {
      success: true,
      action: "list_all_pages",
      data: allPages,
      total_count: allPages.length
    };
  }

  private async listAllDatabases(): Promise<any> {
    const filter = { value: "database", property: "object" };
    const allDatabases = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const result = await this.search(undefined, filter, undefined, startCursor, 100);
      allDatabases.push(...result.data);
      hasMore = result.has_more;
      startCursor = result.next_cursor;
    }

    return {
      success: true,
      action: "list_all_databases",
      data: allDatabases,
      total_count: allDatabases.length
    };
  }

  // Page operations
  private async getPage(id: string): Promise<any> {
    const result = await this.makeRequest(`/pages/${id}`);
    return {
      success: true,
      action: "get_page",
      data: result
    };
  }

  private async createPage(pageData: any, parentId?: string, parentType?: string): Promise<any> {
    // Auto-resolve parent if needed
    if (parentId && parentType) {
      if (parentType === 'page') {
        pageData.parent = { type: 'page_id', page_id: parentId };
      } else if (parentType === 'database') {
        pageData.parent = { type: 'database_id', database_id: parentId };
      } else if (parentType === 'workspace') {
        pageData.parent = { type: 'workspace', workspace: true };
      }
    }

    const result = await this.makeRequest('/pages', 'POST', pageData);
    return {
      success: true,
      action: "create_page",
      data: result
    };
  }

  private async updatePage(id: string, pageData: any): Promise<any> {
    const result = await this.makeRequest(`/pages/${id}`, 'PATCH', pageData);
    return {
      success: true,
      action: "update_page",
      data: result
    };
  }

  private async deletePage(id: string, archiveInsteadOfDelete: boolean = true): Promise<any> {
    if (archiveInsteadOfDelete) {
      return this.archivePage(id);
    }
    
    const result = await this.makeRequest(`/pages/${id}`, 'DELETE');
    return {
      success: true,
      action: "delete_page",
      data: { id, deleted: true }
    };
  }

  private async archivePage(id: string): Promise<any> {
    const result = await this.makeRequest(`/pages/${id}`, 'PATCH', { archived: true });
    return {
      success: true,
      action: "archive_page",
      data: result
    };
  }

  private async restorePage(id: string): Promise<any> {
    const result = await this.makeRequest(`/pages/${id}`, 'PATCH', { archived: false });
    return {
      success: true,
      action: "restore_page",
      data: result
    };
  }

  private async getPageProperties(id: string): Promise<any> {
    const page = await this.getPage(id);
    return {
      success: true,
      action: "get_page_properties",
      data: page.data.properties,
      page_id: id
    };
  }

  private async updatePageProperties(id: string, properties: any): Promise<any> {
    const result = await this.makeRequest(`/pages/${id}`, 'PATCH', { properties });
    return {
      success: true,
      action: "update_page_properties",
      data: result
    };
  }

  private async getPageContent(id: string, recursive: boolean = false): Promise<any> {
    const blocks = await this.getBlockChildren(id);
    
    if (recursive) {
      // Recursively get content for child pages and blocks with children
      for (const block of blocks.data) {
        if (block.has_children) {
          const childContent = await this.getPageContent(block.id, true);
          block.children = childContent.data;
        }
      }
    }

    return {
      success: true,
      action: "get_page_content",
      data: blocks.data,
      page_id: id
    };
  }

  // Database operations
  private async getDatabase(id: string): Promise<any> {
    const result = await this.makeRequest(`/databases/${id}`);
    return {
      success: true,
      action: "get_database",
      data: result
    };
  }

  private async createDatabase(databaseData: any, parentId?: string, parentType?: string): Promise<any> {
    // Auto-resolve parent if needed
    if (parentId && parentType) {
      if (parentType === 'page') {
        databaseData.parent = { type: 'page_id', page_id: parentId };
      } else if (parentType === 'workspace') {
        databaseData.parent = { type: 'workspace', workspace: true };
      }
    }

    const result = await this.makeRequest('/databases', 'POST', databaseData);
    return {
      success: true,
      action: "create_database",
      data: result
    };
  }

  private async updateDatabase(id: string, databaseData: any): Promise<any> {
    const result = await this.makeRequest(`/databases/${id}`, 'PATCH', databaseData);
    return {
      success: true,
      action: "update_database",
      data: result
    };
  }

  private async queryDatabase(id: string, query?: any): Promise<any> {
    const result = await this.makeRequest(`/databases/${id}/query`, 'POST', query);
    return {
      success: true,
      action: "query_database",
      data: result.results,
      has_more: result.has_more,
      next_cursor: result.next_cursor
    };
  }

  private async getDatabaseSchema(id: string): Promise<any> {
    const database = await this.getDatabase(id);
    return {
      success: true,
      action: "get_database_schema",
      data: database.data.properties,
      database_id: id,
      title: database.data.title
    };
  }

  private async addDatabaseProperty(id: string, propertyName: string, propertyData: any): Promise<any> {
    const properties = { [propertyName]: propertyData };
    const result = await this.makeRequest(`/databases/${id}`, 'PATCH', { properties });
    return {
      success: true,
      action: "add_database_property",
      data: result,
      property_name: propertyName
    };
  }

  private async updateDatabaseProperty(id: string, propertyName: string, propertyData: any): Promise<any> {
    const properties = { [propertyName]: propertyData };
    const result = await this.makeRequest(`/databases/${id}`, 'PATCH', { properties });
    return {
      success: true,
      action: "update_database_property",
      data: result,
      property_name: propertyName
    };
  }

  private async removeDatabaseProperty(id: string, propertyName: string): Promise<any> {
    const properties = { [propertyName]: null };
    const result = await this.makeRequest(`/databases/${id}`, 'PATCH', { properties });
    return {
      success: true,
      action: "remove_database_property",
      data: result,
      property_name: propertyName
    };
  }

  // Block operations
  private async getBlock(id: string): Promise<any> {
    const result = await this.makeRequest(`/blocks/${id}`);
    return {
      success: true,
      action: "get_block",
      data: result
    };
  }

  private async getBlockChildren(id: string, startCursor?: string, pageSize?: number): Promise<any> {
    let endpoint = `/blocks/${id}/children`;
    const params = new URLSearchParams();
    
    if (startCursor) params.append('start_cursor', startCursor);
    if (pageSize) params.append('page_size', Math.min(pageSize, 100).toString());
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_block_children",
      data: result.results,
      has_more: result.has_more,
      next_cursor: result.next_cursor
    };
  }

  private async appendBlockChildren(id: string, children: any[]): Promise<any> {
    const result = await this.makeRequest(`/blocks/${id}/children`, 'PATCH', { children });
    return {
      success: true,
      action: "append_block_children",
      data: result.results
    };
  }

  private async updateBlock(id: string, blockData: any): Promise<any> {
    const result = await this.makeRequest(`/blocks/${id}`, 'PATCH', blockData);
    return {
      success: true,
      action: "update_block",
      data: result
    };
  }

  private async deleteBlock(id: string): Promise<any> {
    const result = await this.makeRequest(`/blocks/${id}`, 'DELETE');
    return {
      success: true,
      action: "delete_block",
      data: { id, deleted: true }
    };
  }

  private async createBlock(parentId: string, blockData: any): Promise<any> {
    const result = await this.appendBlockChildren(parentId, [blockData]);
    return {
      success: true,
      action: "create_block",
      data: result.data[0]
    };
  }

  // User operations
  private async getUser(id: string): Promise<any> {
    const result = await this.makeRequest(`/users/${id}`);
    return {
      success: true,
      action: "get_user",
      data: result
    };
  }

  private async getUsers(startCursor?: string, pageSize?: number): Promise<any> {
    let endpoint = '/users';
    const params = new URLSearchParams();
    
    if (startCursor) params.append('start_cursor', startCursor);
    if (pageSize) params.append('page_size', Math.min(pageSize, 100).toString());
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_users",
      data: result.results,
      has_more: result.has_more,
      next_cursor: result.next_cursor
    };
  }

  private async getCurrentUser(): Promise<any> {
    const result = await this.makeRequest('/users/me');
    return {
      success: true,
      action: "get_current_user",
      data: result
    };
  }

  private async getBotUser(): Promise<any> {
    const result = await this.makeRequest('/users/me');
    return {
      success: true,
      action: "get_bot_user",
      data: result
    };
  }

  // Workspace operations
  private async getWorkspace(): Promise<any> {
    // Note: Notion API doesn't have a direct workspace endpoint
    // We'll get workspace info through the current user
    const user = await this.getCurrentUser();
    return {
      success: true,
      action: "get_workspace",
      data: {
        workspace_name: user.data.workspace_name || "Unknown Workspace",
        user: user.data
      }
    };
  }

  // Comment operations
  private async getComments(id: string): Promise<any> {
    const result = await this.makeRequest(`/comments?block_id=${id}`);
    return {
      success: true,
      action: "get_comments",
      data: result.results,
      block_id: id
    };
  }

  private async createComment(commentData: any): Promise<any> {
    const result = await this.makeRequest('/comments', 'POST', commentData);
    return {
      success: true,
      action: "create_comment",
      data: result
    };
  }

  // Utility operations
  private async getAllWorkspaceContent(): Promise<any> {
    const pages = await this.listAllPages();
    const databases = await this.listAllDatabases();
    
    return {
      success: true,
      action: "get_all_workspace_content",
      data: {
        pages: pages.data,
        databases: databases.data,
        total_pages: pages.total_count,
        total_databases: databases.total_count
      }
    };
  }

  private async backupPage(id: string, recursive: boolean = false): Promise<any> {
    const page = await this.getPage(id);
    const content = await this.getPageContent(id, recursive);
    
    const backup = {
      page: page.data,
      content: content.data,
      backup_timestamp: new Date().toISOString(),
      recursive: recursive
    };

    return {
      success: true,
      action: "backup_page",
      data: backup,
      page_id: id
    };
  }

  private async backupDatabase(id: string): Promise<any> {
    const database = await this.getDatabase(id);
    const allPages = await this.queryDatabase(id);
    
    const backup = {
      database: database.data,
      pages: allPages.data,
      backup_timestamp: new Date().toISOString(),
      total_pages: allPages.data.length
    };

    return {
      success: true,
      action: "backup_database",
      data: backup,
      database_id: id
    };
  }

  private async duplicatePage(id: string, newTitle?: string, parentId?: string): Promise<any> {
    // Get the original page
    const originalPage = await this.getPage(id);
    const originalContent = await this.getPageContent(id, true);
    
    // Prepare new page data
    const newPageData = {
      parent: parentId ? 
        { type: 'page_id', page_id: parentId } : 
        originalPage.data.parent,
      properties: { ...originalPage.data.properties },
      children: originalContent.data
    };

    // Update title if provided
    if (newTitle && newPageData.properties.title) {
      newPageData.properties.title = {
        title: [{ text: { content: newTitle } }]
      };
    }

    const newPage = await this.createPage(newPageData);
    
    return {
      success: true,
      action: "duplicate_page",
      data: newPage.data,
      original_id: id,
      new_id: newPage.data.id
    };
  }

  private async duplicateDatabase(id: string, newTitle?: string, parentId?: string): Promise<any> {
    // Get the original database
    const originalDb = await this.getDatabase(id);
    
    // Prepare new database data
    const newDbData = {
      parent: parentId ? 
        { type: 'page_id', page_id: parentId } : 
        originalDb.data.parent,
      title: newTitle ? 
        [{ text: { content: newTitle } }] : 
        originalDb.data.title,
      properties: { ...originalDb.data.properties }
    };

    const newDb = await this.createDatabase(newDbData);
    
    // Optionally copy all pages from original database
    const originalPages = await this.queryDatabase(id);
    const copiedPages = [];
    
    for (const page of originalPages.data) {
      try {
        const newPageData = {
          parent: { type: 'database_id', database_id: newDb.data.id },
          properties: { ...page.properties }
        };
        const copiedPage = await this.createPage(newPageData);
        copiedPages.push(copiedPage.data);
      } catch (error) {
        // Log error but continue copying other pages
        console.warn(`Failed to copy page ${page.id}:`, error);
      }
    }
    
    return {
      success: true,
      action: "duplicate_database",
      data: newDb.data,
      original_id: id,
      new_id: newDb.data.id,
      copied_pages: copiedPages.length,
      total_original_pages: originalPages.data.length
    };
  }

  private async bulkUpdatePages(bulkData: any[]): Promise<any> {
    const results = [];
    const errors = [];

    for (const item of bulkData) {
      try {
        const result = await this.updatePage(item.id, item.data);
        results.push(result.data);
      } catch (error) {
        errors.push({
          id: item.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return {
      success: true,
      action: "bulk_update_pages",
      data: results,
      errors: errors,
      successful_updates: results.length,
      failed_updates: errors.length
    };
  }

  private async bulkCreatePages(bulkData: any[], parentId?: string, parentType?: string): Promise<any> {
    const results = [];
    const errors = [];

    for (const pageData of bulkData) {
      try {
        const result = await this.createPage(pageData, parentId, parentType);
        results.push(result.data);
      } catch (error) {
        errors.push({
          data: pageData,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return {
      success: true,
      action: "bulk_create_pages",
      data: results,
      errors: errors,
      successful_creates: results.length,
      failed_creates: errors.length
    };
  }

  // Helper methods for text extraction and utilities
  private extractTextFromRichText(richText: any[]): string {
    if (!richText || !Array.isArray(richText)) return '';
    return richText.map(text => text.plain_text || text.text?.content || '').join('');
  }

  private extractTitleFromPage(page: any): string {
    if (page.properties?.title) {
      return this.extractTextFromRichText(page.properties.title.title);
    }
    if (page.properties?.Name) {
      return this.extractTextFromRichText(page.properties.Name.title);
    }
    // Look for any title-type property
    for (const [key, prop] of Object.entries(page.properties || {})) {
      if ((prop as any).type === 'title') {
        return this.extractTextFromRichText((prop as any).title);
      }
    }
    return 'Untitled';
  }

  // Utility method to create rich text objects
  public createRichText(text: string, annotations?: any): any[] {
    return [{
      type: 'text',
      text: { content: text },
      annotations: annotations || {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: 'default'
      }
    }];
  }

  // Utility method to create common block types
  public createBlockObject(type: string, content: string, annotations?: any): any {
    const richText = this.createRichText(content, annotations);
    
    const blockMap: { [key: string]: any } = {
      paragraph: { paragraph: { rich_text: richText } },
      heading_1: { heading_1: { rich_text: richText } },
      heading_2: { heading_2: { rich_text: richText } },
      heading_3: { heading_3: { rich_text: richText } },
      bulleted_list_item: { bulleted_list_item: { rich_text: richText } },
      numbered_list_item: { numbered_list_item: { rich_text: richText } },
      to_do: { to_do: { rich_text: richText, checked: false } },
      callout: { callout: { rich_text: richText, icon: { emoji: '💡' } } },
      quote: { quote: { rich_text: richText } }
    };

    return {
      object: 'block',
      type: type,
      ...blockMap[type]
    };
  }

  // Utility method to create database properties
  public createDatabaseProperty(type: string, config?: any): any {
    const propertyMap: { [key: string]: any } = {
      title: { title: {} },
      rich_text: { rich_text: {} },
      number: { number: config || { format: 'number' } },
      select: { select: { options: config?.options || [] } },
      multi_select: { multi_select: { options: config?.options || [] } },
      date: { date: {} },
      checkbox: { checkbox: {} },
      url: { url: {} },
      email: { email: {} },
      phone_number: { phone_number: {} },
      people: { people: {} },
      files: { files: {} },
      formula: { formula: config || { expression: '' } },
      relation: { relation: config || { database_id: '', type: 'single_property' } },
      rollup: { rollup: config || { relation_property_name: '', rollup_property_name: '', function: 'count' } }
    };

    return {
      type: type,
      ...propertyMap[type]
    };
  }

  // Connection validation
  public async validateConnection(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Token management
  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  // Get workspace summary for agent context
  public async getWorkspaceSummary(): Promise<any> {
    try {
      const [user, pages, databases] = await Promise.all([
        this.getCurrentUser(),
        this.listAllPages(),
        this.listAllDatabases()
      ]);

      return {
        success: true,
        data: {
          user: user.data,
          workspace_stats: {
            total_pages: pages.total_count,
            total_databases: databases.total_count
          },
          recent_pages: pages.data.slice(0, 10),
          recent_databases: databases.data.slice(0, 10)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
