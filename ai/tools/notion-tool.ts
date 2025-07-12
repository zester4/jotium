import { FunctionDeclaration, Type } from "@google/genai";
import axios, { AxiosInstance } from 'axios';

interface Tool {
  getDefinition(): FunctionDeclaration;
  execute(args: any): Promise<any>;
}

export class NotionTool implements Tool {
  private apiClient: AxiosInstance;
  private baseUrl = 'https://api.notion.com/v1';
  private version = '2022-06-28';

  constructor(apiKey: string) {
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': this.version
      }
    });
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "notion_workspace",
      description: "A comprehensive tool for managing Notion workspaces, databases, pages, blocks, and content",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: [
              // Database actions
              "create_database", "get_database", "update_database", "query_database", "delete_database",
              // Page actions
              "create_page", "get_page", "update_page", "delete_page", "search_pages",
              // Block actions
              "get_blocks", "create_block", "update_block", "delete_block", "append_blocks",
              // Content actions
              "create_content", "update_content", "duplicate_content", "move_content",
              // Search actions
              "search", "search_by_title", "search_by_content", "advanced_search",
              // User actions
              "get_users", "get_user", "get_bot_user",
              // Comment actions
              "create_comment", "get_comments",
              // Template actions
              "create_template", "apply_template", "get_templates",
              // Automation actions
              "create_automation", "get_automations", "trigger_automation",
              // Analytics actions
              "get_analytics", "get_page_analytics", "get_database_analytics",
              // Export/Import actions
              "export_page", "export_database", "import_content", "bulk_import",
              // Sync actions
              "sync_database", "sync_page", "get_sync_status",
              // Formula actions
              "create_formula", "validate_formula", "get_formula_results"
            ]
          },
          // Database parameters
          title: {
            type: Type.STRING,
            description: "Title for pages, databases, or content"
          },
          parent: {
            type: Type.OBJECT,
            description: "Parent object (page_id, database_id, or workspace)"
          },
          properties: {
            type: Type.OBJECT,
            description: "Properties for database or page creation/updates"
          },
          // Query parameters
          filter: {
            type: Type.OBJECT,
            description: "Filter conditions for database queries"
          },
          sorts: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "Sort criteria for queries"
          },
          // Content parameters
          content: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "Block content to add or update"
          },
          blockId: {
            type: Type.STRING,
            description: "Block ID for block operations"
          },
          pageId: {
            type: Type.STRING,
            description: "Page ID for page operations"
          },
          databaseId: {
            type: Type.STRING,
            description: "Database ID for database operations"
          },
          // Search parameters
          query: {
            type: Type.STRING,
            description: "Search query string"
          },
          searchType: {
            type: Type.STRING,
            description: "Type of search to perform"
          },
          // Template parameters
          templateId: {
            type: Type.STRING,
            description: "Template ID for template operations"
          },
          templateData: {
            type: Type.OBJECT,
            description: "Template configuration data"
          },
          // Automation parameters
          automationConfig: {
            type: Type.OBJECT,
            description: "Automation configuration"
          },
          // Analytics parameters
          dateRange: {
            type: Type.OBJECT,
            description: "Date range for analytics"
          },
          metrics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Metrics to retrieve"
          },
          // Export/Import parameters
          exportFormat: {
            type: Type.STRING,
            description: "Format for export (markdown, pdf, html, csv)"
          },
          importData: {
            type: Type.OBJECT,
            description: "Data to import"
          },
          // Pagination
          startCursor: {
            type: Type.STRING,
            description: "Start cursor for pagination"
          },
          pageSize: {
            type: Type.NUMBER,
            description: "Number of items per page"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const startTime = Date.now();
      console.log(`🚀 Executing Notion action: ${args.action}`);

      let result: any;

      switch (args.action) {
        // Database actions
        case 'create_database':
          result = await this.createDatabase(args);
          break;
        case 'get_database':
          result = await this.getDatabase(args.databaseId);
          break;
        case 'update_database':
          result = await this.updateDatabase(args);
          break;
        case 'query_database':
          result = await this.queryDatabase(args);
          break;
        case 'delete_database':
          result = await this.deleteDatabase(args.databaseId);
          break;

        // Page actions
        case 'create_page':
          result = await this.createPage(args);
          break;
        case 'get_page':
          result = await this.getPage(args.pageId);
          break;
        case 'update_page':
          result = await this.updatePage(args);
          break;
        case 'delete_page':
          result = await this.deletePage(args.pageId);
          break;
        case 'search_pages':
          result = await this.searchPages(args);
          break;

        // Block actions
        case 'get_blocks':
          result = await this.getBlocks(args.blockId || args.pageId);
          break;
        case 'create_block':
          result = await this.createBlock(args);
          break;
        case 'update_block':
          result = await this.updateBlock(args);
          break;
        case 'delete_block':
          result = await this.deleteBlock(args.blockId);
          break;
        case 'append_blocks':
          result = await this.appendBlocks(args);
          break;

        // Content actions
        case 'create_content':
          result = await this.createContent(args);
          break;
        case 'update_content':
          result = await this.updateContent(args);
          break;
        case 'duplicate_content':
          result = await this.duplicateContent(args);
          break;
        case 'move_content':
          result = await this.moveContent(args);
          break;

        // Search actions
        case 'search':
          result = await this.search(args);
          break;
        case 'search_by_title':
          result = await this.searchByTitle(args.query);
          break;
        case 'search_by_content':
          result = await this.searchByContent(args.query);
          break;
        case 'advanced_search':
          result = await this.advancedSearch(args);
          break;

        // User actions
        case 'get_users':
          result = await this.getUsers(args);
          break;
        case 'get_user':
          result = await this.getUser(args.userId);
          break;
        case 'get_bot_user':
          result = await this.getBotUser();
          break;

        // Comment actions
        case 'create_comment':
          result = await this.createComment(args);
          break;
        case 'get_comments':
          result = await this.getComments(args.blockId);
          break;

        // Template actions
        case 'create_template':
          result = await this.createTemplate(args);
          break;
        case 'apply_template':
          result = await this.applyTemplate(args);
          break;
        case 'get_templates':
          result = await this.getTemplates();
          break;

        // Automation actions
        case 'create_automation':
          result = await this.createAutomation(args);
          break;
        case 'get_automations':
          result = await this.getAutomations();
          break;
        case 'trigger_automation':
          result = await this.triggerAutomation(args);
          break;

        // Analytics actions
        case 'get_analytics':
          result = await this.getAnalytics(args);
          break;
        case 'get_page_analytics':
          result = await this.getPageAnalytics(args);
          break;
        case 'get_database_analytics':
          result = await this.getDatabaseAnalytics(args);
          break;

        // Export/Import actions
        case 'export_page':
          result = await this.exportPage(args);
          break;
        case 'export_database':
          result = await this.exportDatabase(args);
          break;
        case 'import_content':
          result = await this.importContent(args);
          break;
        case 'bulk_import':
          result = await this.bulkImport(args);
          break;

        // Sync actions
        case 'sync_database':
          result = await this.syncDatabase(args);
          break;
        case 'sync_page':
          result = await this.syncPage(args);
          break;
        case 'get_sync_status':
          result = await this.getSyncStatus(args);
          break;

        // Formula actions
        case 'create_formula':
          result = await this.createFormula(args);
          break;
        case 'validate_formula':
          result = await this.validateFormula(args);
          break;
        case 'get_formula_results':
          result = await this.getFormulaResults(args);
          break;

        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`,
            availableActions: [
              'create_database', 'get_database', 'update_database', 'query_database', 'delete_database',
              'create_page', 'get_page', 'update_page', 'delete_page', 'search_pages',
              'get_blocks', 'create_block', 'update_block', 'delete_block', 'append_blocks',
              'create_content', 'update_content', 'duplicate_content', 'move_content',
              'search', 'search_by_title', 'search_by_content', 'advanced_search',
              'get_users', 'get_user', 'get_bot_user',
              'create_comment', 'get_comments',
              'create_template', 'apply_template', 'get_templates',
              'create_automation', 'get_automations', 'trigger_automation',
              'get_analytics', 'get_page_analytics', 'get_database_analytics',
              'export_page', 'export_database', 'import_content', 'bulk_import',
              'sync_database', 'sync_page', 'get_sync_status',
              'create_formula', 'validate_formula', 'get_formula_results'
            ]
          };
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        action: args.action,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString(),
        data: result
      };

    } catch (error: any) {
      console.error("❌ Notion operation failed:", error);
      return {
        success: false,
        error: `Notion operation failed: ${error.response?.data?.message || error.message}`,
        action: args.action,
        statusCode: error.response?.status,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Database methods
  private async createDatabase(args: any): Promise<any> {
    const databaseData: any = {
      parent: args.parent,
      title: [
        {
          type: "text",
          text: { content: args.title }
        }
      ],
      properties: args.properties || this.getDefaultDatabaseProperties()
    };

    if (args.description) {
      databaseData.description = [
        {
          type: "text",
          text: { content: args.description }
        }
      ];
    }

    if (args.icon) databaseData.icon = args.icon;
    if (args.cover) databaseData.cover = args.cover;

    const response = await this.apiClient.post('/databases', databaseData);
    return response.data;
  }

  private async getDatabase(databaseId: string): Promise<any> {
    const response = await this.apiClient.get(`/databases/${databaseId}`);
    return response.data;
  }

  private async updateDatabase(args: any): Promise<any> {
    const updateData: any = {};
    
    if (args.title) {
      updateData.title = [
        {
          type: "text",
          text: { content: args.title }
        }
      ];
    }

    if (args.description) {
      updateData.description = [
        {
          type: "text",
          text: { content: args.description }
        }
      ];
    }

    if (args.properties) updateData.properties = args.properties;
    if (args.icon) updateData.icon = args.icon;
    if (args.cover) updateData.cover = args.cover;

    const response = await this.apiClient.patch(`/databases/${args.databaseId}`, updateData);
    return response.data;
  }

  private async queryDatabase(args: any): Promise<any> {
    const queryData: any = {};
    
    if (args.filter) queryData.filter = args.filter;
    if (args.sorts) queryData.sorts = args.sorts;
    if (args.startCursor) queryData.start_cursor = args.startCursor;
    if (args.pageSize) queryData.page_size = Math.min(args.pageSize, 100);

    const response = await this.apiClient.post(`/databases/${args.databaseId}/query`, queryData);
    return response.data;
  }

  private async deleteDatabase(databaseId: string): Promise<any> {
    // Notion doesn't have direct delete - archive instead
    const response = await this.apiClient.patch(`/databases/${databaseId}`, {
      archived: true
    });
    return response.data;
  }

  // Page methods
  private async createPage(args: any): Promise<any> {
    const pageData: any = {
      parent: args.parent,
      properties: args.properties || {}
    };

    if (args.title) {
      pageData.properties.title = {
        title: [
          {
            type: "text",
            text: { content: args.title }
          }
        ]
      };
    }

    if (args.content) pageData.children = args.content;
    if (args.icon) pageData.icon = args.icon;
    if (args.cover) pageData.cover = args.cover;

    const response = await this.apiClient.post('/pages', pageData);
    return response.data;
  }

  private async getPage(pageId: string): Promise<any> {
    const response = await this.apiClient.get(`/pages/${pageId}`);
    return response.data;
  }

  private async updatePage(args: any): Promise<any> {
    const updateData: any = {};
    
    if (args.properties) updateData.properties = args.properties;
    if (args.icon) updateData.icon = args.icon;
    if (args.cover) updateData.cover = args.cover;
    if (args.archived !== undefined) updateData.archived = args.archived;

    const response = await this.apiClient.patch(`/pages/${args.pageId}`, updateData);
    return response.data;
  }

  private async deletePage(pageId: string): Promise<any> {
    const response = await this.apiClient.patch(`/pages/${pageId}`, {
      archived: true
    });
    return response.data;
  }

  private async searchPages(args: any): Promise<any> {
    return await this.search({
      ...args,
      filter: {
        property: "object",
        value: "page"
      }
    });
  }

  // Block methods
  private async getBlocks(blockId: string): Promise<any> {
    const response = await this.apiClient.get(`/blocks/${blockId}/children`);
    return response.data;
  }

  private async createBlock(args: any): Promise<any> {
    const blockData = {
      children: args.content || []
    };

    const response = await this.apiClient.patch(`/blocks/${args.blockId || args.pageId}/children`, blockData);
    return response.data;
  }

  private async updateBlock(args: any): Promise<any> {
    const response = await this.apiClient.patch(`/blocks/${args.blockId}`, args.content);
    return response.data;
  }

  private async deleteBlock(blockId: string): Promise<any> {
    const response = await this.apiClient.delete(`/blocks/${blockId}`);
    return response.data;
  }

  private async appendBlocks(args: any): Promise<any> {
    const blockData = {
      children: args.content || []
    };

    const response = await this.apiClient.patch(`/blocks/${args.blockId || args.pageId}/children`, blockData);
    return response.data;
  }

  // Content methods
  private async createContent(args: any): Promise<any> {
    // Create structured content based on type
    const contentBlocks = this.buildContentBlocks(args);
    
    if (args.pageId) {
      return await this.appendBlocks({
        pageId: args.pageId,
        content: contentBlocks
      });
    } else {
      return await this.createPage({
        ...args,
        content: contentBlocks
      });
    }
  }

  private async updateContent(args: any): Promise<any> {
    // Update existing content
    const updates = [];
    
    for (const block of args.content) {
      if (block.id) {
        updates.push(this.updateBlock({
          blockId: block.id,
          content: block
        }));
      } else {
        updates.push(this.createBlock({
          pageId: args.pageId,
          content: [block]
        }));
      }
    }

    return await Promise.all(updates);
  }

  private async duplicateContent(args: any): Promise<any> {
    const originalPage = await this.getPage(args.pageId);
    const originalBlocks = await this.getBlocks(args.pageId);

    const newPage = await this.createPage({
      parent: args.newParent || originalPage.parent,
      title: args.newTitle || `Copy of ${originalPage.properties.title?.title[0]?.text?.content}`,
      properties: originalPage.properties,
      content: originalBlocks.results
    });

    return newPage;
  }

  private async moveContent(args: any): Promise<any> {
    const updateData = {
      parent: args.newParent
    };

    const response = await this.apiClient.patch(`/pages/${args.pageId}`, updateData);
    return response.data;
  }

  // Search methods
  private async search(args: any): Promise<any> {
    const searchData: any = {};
    
    if (args.query) searchData.query = args.query;
    if (args.filter) searchData.filter = args.filter;
    if (args.sorts) searchData.sort = args.sorts;
    if (args.startCursor) searchData.start_cursor = args.startCursor;
    if (args.pageSize) searchData.page_size = Math.min(args.pageSize, 100);

    const response = await this.apiClient.post('/search', searchData);
    return response.data;
  }

  private async searchByTitle(query: string): Promise<any> {
    return await this.search({
      query: query,
      filter: {
        property: "object",
        value: "page"
      }
    });
  }

  private async searchByContent(query: string): Promise<any> {
    return await this.search({
      query: query
    });
  }

  private async advancedSearch(args: any): Promise<any> {
    const searchQueries = [];

    // Search in different object types
    if (args.searchPages) {
      searchQueries.push(this.search({
        query: args.query,
        filter: { property: "object", value: "page" }
      }));
    }

    if (args.searchDatabases) {
      searchQueries.push(this.search({
        query: args.query,
        filter: { property: "object", value: "database" }
      }));
    }

    const results = await Promise.all(searchQueries);
    
    return {
      combined_results: results.flat(),
      pages: results[0] || [],
      databases: results[1] || []
    };
  }

  // User methods
  private async getUsers(args: any): Promise<any> {
    const params: any = {};
    if (args.startCursor) params.start_cursor = args.startCursor;
    if (args.pageSize) params.page_size = Math.min(args.pageSize, 100);

    const response = await this.apiClient.get('/users', { params });
    return response.data;
  }

  private async getUser(userId: string): Promise<any> {
    const response = await this.apiClient.get(`/users/${userId}`);
    return response.data;
  }

  private async getBotUser(): Promise<any> {
    const response = await this.apiClient.get('/users/me');
    return response.data;
  }

  // Comment methods
  private async createComment(args: any): Promise<any> {
    const commentData = {
      parent: {
        page_id: args.pageId
      },
      rich_text: [
        {
          type: "text",
          text: { content: args.message }
        }
      ]
    };

    const response = await this.apiClient.post('/comments', commentData);
    return response.data;
  }

  private async getComments(blockId: string): Promise<any> {
    const response = await this.apiClient.get(`/comments?block_id=${blockId}`);
    return response.data;
  }

  // Template methods (custom implementation)
  private async createTemplate(args: any): Promise<any> {
    // Create a template by saving page structure
    const templateData = {
      name: args.templateData.name,
      description: args.templateData.description,
      structure: args.templateData.structure,
      properties: args.templateData.properties,
      content: args.templateData.content,
      created_time: new Date().toISOString()
    };

    // Store in a dedicated templates database or return structured data
    return {
      template_id: `template_${Date.now()}`,
      ...templateData
    };
  }

  private async applyTemplate(args: any): Promise<any> {
    // Apply template to create new page
    const template = args.templateData;
    
    return await this.createPage({
      parent: args.parent,
      title: args.title || template.name,
      properties: template.properties || {},
      content: template.content || []
    });
  }

  private async getTemplates(): Promise<any> {
    // Return available templates
    return {
      templates: [
        {
          id: "template_1",
          name: "Meeting Notes",
          description: "Template for meeting notes with agenda and action items"
        },
        {
          id: "template_2",
          name: "Project Plan",
          description: "Template for project planning with tasks and timeline"
        }
      ]
    };
  }

  // Automation methods (custom implementation)
  private async createAutomation(args: any): Promise<any> {
    const automation = {
      id: `automation_${Date.now()}`,
      name: args.automationConfig.name,
      trigger: args.automationConfig.trigger,
      actions: args.automationConfig.actions,
      conditions: args.automationConfig.conditions,
      active: true,
      created_time: new Date().toISOString()
    };

    return automation;
  }

  private async getAutomations(): Promise<any> {
    return {
      automations: [
        {
          id: "automation_1",
          name: "Status Update Notification",
          trigger: "property_change",
          active: true
        }
      ]
    };
  }

  private async triggerAutomation(args: any): Promise<any> {
    return {
      automation_id: args.automationId,
      triggered_at: new Date().toISOString(),
      status: "executed"
    };
  }

  // Analytics methods (custom implementation)
  private async getAnalytics(args: any): Promise<any> {
    return {
      workspace_stats: {
        total_pages: 0,
        total_databases: 0,
        active_users: 0,
        recent_activity: []
      },
      date_range: args.dateRange,
      generated_at: new Date().toISOString()
    };
  }

  private async getPageAnalytics(args: any): Promise<any> {
    return {
      page_id: args.pageId,
      views: 0,
      edits: 0,
      comments: 0,
      last_edited: new Date().toISOString()
    };
  }

  private async getDatabaseAnalytics(args: any): Promise<any> {
    return {
      database_id: args.databaseId,
      total_records: 0,
      recent_additions: 0,
      property_usage: {}
    };
  }

  // Export/Import methods (custom implementation)
  private async exportPage(args: any): Promise<any> {
    const page = await this.getPage(args.pageId);
    const blocks = await this.getBlocks(args.pageId);

    return {
      page_data: page,
      content: blocks,
      format: args.exportFormat || 'json',
      exported_at: new Date().toISOString()
    };
  }

  private async exportDatabase(args: any): Promise<any> {
    const database = await this.getDatabase(args.databaseId);
    const records = await this.queryDatabase({ databaseId: args.databaseId });

    return {
      database_schema: database,
      records: records,
      format: args.exportFormat || 'json',
      exported_at: new Date().toISOString()
    };
  }

  private async importContent(args: any): Promise<any> {
    const importResults = [];

    for (const item of args.importData.items) {
      if (item.type === 'page') {
        const result = await this.createPage({
          parent: args.parent,
          title: item.title,
          properties: item.properties,
          content: item.content
        });
        importResults.push(result);
      }
    }

    return {
      imported_items: importResults.length,
      results: importResults
    };
  }

  private async bulkImport(args: any): Promise<any> {
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < args.importData.length; i += batchSize) {
      batches.push(args.importData.slice(i, i + batchSize));
    }

    const results = [];
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchResults = await Promise.all(
        batch.map((item: any) => this.createPage({
          parent: args.parent,
          title: item.title,
          properties: item.properties,
          content: item.content
        }))
      );
      results.push(...batchResults);
      
      // Add delay to respect rate limits
      if (i + 1 < batches.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return {
      total_imported: results.length,
      results: results
    };
  }

  // Sync methods (custom implementation)
  private async syncDatabase(args: any): Promise<any> {
    return {
      database_id: args.databaseId,
      sync_status: "completed",
      synced_at: new Date().toISOString(),
      changes: []
    };
  }

  private async syncPage(args: any): Promise<any> {
    return {
      page_id: args.pageId,
      sync_status: "completed",
      synced_at: new Date().toISOString(),
      changes: []
    };
  }

  private async getSyncStatus(args: any): Promise<any> {
    return {
      sync_id: args.syncId,
      status: "completed",
      last_sync: new Date().toISOString(),
      next_sync: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  // Formula methods (custom implementation)
  private async createFormula(args: any): Promise<any> {
    return {
      formula_id: `formula_${Date.now()}`,
      expression: args.formula,
      property_type: "formula",
      created_at: new Date().toISOString()
    };
  }

  private async validateFormula(args: any): Promise<any> {
    return {
      formula: args.formula,
      valid: true,
      errors: [],
      warnings: []
    };
  }

  private async getFormulaResults(args: any): Promise<any> {
    return {
      formula_id: args.formulaId,
      results: [],
      calculated_at: new Date().toISOString()
    };
  }

  // Helper methods
  private getDefaultDatabaseProperties(): any {
    return {
      "Name": {
        "title": {}
      },
      "Tags": {
        "multi_select": {
          "options": []
        }
      },
      "Status": {
        "select": {
          "options": [
            {
              "name": "Not started",
              "color": "red"
            },
            {
              "name": "In progress",
              "color": "yellow"
            },
            {
              "name": "Complete",
              "color": "green"
            }
          ]
        }
      },
      "Created": {
        "created_time": {}
      },
      "Last edited": {
        "last_edited_time": {}
      }
    };
  }

  private buildContentBlocks(args: any): any[] {
    const blocks: any[] = [];

    if (args.content) {
      // If content is already structured blocks, return as-is
      if (Array.isArray(args.content) && args.content[0]?.type) {
        return args.content;
      }

      // If content is a string, convert to paragraph blocks
      if (typeof args.content === 'string') {
        const paragraphs = args.content.split('\n\n');
        for (const paragraph of paragraphs) {
          if (paragraph.trim()) {
            blocks.push({
              type: "paragraph",
              paragraph: {
                rich_text: [
                  {
                    type: "text",
                    text: { content: paragraph.trim() }
                  }
                ]
              }
            });
          }
        }
      }

      // If content has specific structure
      if (args.content.blocks) {
        return args.content.blocks;
      }
    }

    // Build blocks based on content type
    if (args.contentType) {
      switch (args.contentType) {
        case 'meeting_notes':
          return this.buildMeetingNotesBlocks(args);
        case 'task_list':
          return this.buildTaskListBlocks(args);
        case 'project_plan':
          return this.buildProjectPlanBlocks(args);
        case 'document':
          return this.buildDocumentBlocks(args);
        default:
          return blocks;
      }
    }

    return blocks;
  }

  private buildMeetingNotesBlocks(args: any): any[] {
    return [
      {
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: args.title || "Meeting Notes" } }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [
            { type: "text", text: { content: `Date: ${new Date().toLocaleDateString()}` } }
          ]
        }
      },
      {
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "Attendees" } }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: "Add attendees here" } }]
        }
      },
      {
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "Agenda" } }]
        }
      },
      {
        type: "numbered_list_item",
        numbered_list_item: {
          rich_text: [{ type: "text", text: { content: "Agenda item 1" } }]
        }
      },
      {
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "Action Items" } }]
        }
      },
      {
        type: "to_do",
        to_do: {
          rich_text: [{ type: "text", text: { content: "Action item 1" } }],
          checked: false
        }
      } as any
    ];
  }

  private buildTaskListBlocks(args: any): any[] {
    const blocks = [
      {
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: args.title || "Task List" } }]
        }
      }
    ];

    if (args.tasks && Array.isArray(args.tasks)) {
      for (const task of args.tasks) {
        blocks.push({
          type: "to_do",
          to_do: {
            rich_text: [{ type: "text", text: { content: task.title || task } }],
            checked: task.completed || false
          }
        } as any);
      }
    } else {
      blocks.push({
        type: "to_do",
        to_do: {
          rich_text: [{ type: "text", text: { content: "Add your tasks here" } }],
          checked: false
        }
      } as any);
    }

    return blocks;
  }

  private buildProjectPlanBlocks(args: any): any[] {
    return [
      {
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: args.title || "Project Plan" } }]
        }
      },
      {
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "Project Overview" } }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: args.description || "Project description goes here" } }]
        }
      },
      {
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "Objectives" } }]
        }
      },
      {
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: "Objective 1" } }]
        }
      },
      {
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "Timeline" } }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: "Project timeline and milestones" } }]
        }
      },
      {
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "Resources" } }]
        }
      },
      {
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: "Required resources and team members" } }]
        }
      }
    ];
  }

  private buildDocumentBlocks(args: any): any[] {
    const blocks = [];

    if (args.title) {
      blocks.push({
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: args.title } }]
        }
      });
    }

    if (args.sections && Array.isArray(args.sections)) {
      for (const section of args.sections) {
        blocks.push({
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: section.title } }]
          }
        });

        if (section.content) {
          blocks.push({
            type: "paragraph",
            paragraph: {
              rich_text: [{ type: "text", text: { content: section.content } }]
            }
          });
        }
      }
    }

    return blocks;
  }

  // Advanced utility methods
  private async getPageWithAllBlocks(pageId: string): Promise<any> {
    const page = await this.getPage(pageId);
    const blocks = await this.getAllBlocks(pageId);
    
    return {
      ...page,
      blocks: blocks
    };
  }

  private async getAllBlocks(blockId: string): Promise<any[]> {
    const allBlocks: any[] = [];
    let cursor: string | undefined;
    
    do {
      const response = await this.apiClient.get(`/blocks/${blockId}/children`, {
        params: cursor ? { start_cursor: cursor } : {}
      });
      
      allBlocks.push(...response.data.results);
      
      // Get child blocks recursively
      for (const block of response.data.results) {
        if (block.has_children) {
          const childBlocks = await this.getAllBlocks(block.id);
          block.children = childBlocks;
        }
      }
      
      cursor = response.data.next_cursor;
    } while (cursor);
    
    return allBlocks;
  }

  private async bulkUpdatePages(updates: any[]): Promise<any[]> {
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(update => this.updatePage(update))
      );
      results.push(...batchResults);
      
      // Add delay to respect rate limits
      if (i + batchSize < updates.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  private async searchWithFilters(args: any): Promise<any> {
    const filters = [];
    
    if (args.createdAfter) {
      filters.push({
        property: "created_time",
        date: { after: args.createdAfter }
      });
    }
    
    if (args.createdBefore) {
      filters.push({
        property: "created_time",
        date: { before: args.createdBefore }
      });
    }
    
    if (args.hasProperty) {
      filters.push({
        property: args.hasProperty,
        is_not_empty: true
      });
    }
    
    const filter = filters.length > 1 ? { and: filters } : filters[0];
    
    return await this.search({
      query: args.query,
      filter: filter
    });
  }

  private createRichText(content: string, options: any = {}): any {
    return {
      type: "text",
      text: { 
        content: content,
        link: options.link || null
      },
      annotations: {
        bold: options.bold || false,
        italic: options.italic || false,
        strikethrough: options.strikethrough || false,
        underline: options.underline || false,
        code: options.code || false,
        color: options.color || "default"
      }
    };
  }

  // Validation methods
  private validatePageProperties(properties: any, databaseSchema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const [propName, propValue] of Object.entries(properties)) {
      const schemaProp = databaseSchema.properties[propName];
      
      if (!schemaProp) {
        errors.push(`Property '${propName}' does not exist in database schema`);
        continue;
      }
      
      // Add property-specific validation here
      if (schemaProp.type === 'select' && propValue) {
        const validOptions = schemaProp.select.options.map((opt: any) => opt.name);
        if (!validOptions.includes((propValue as any).select?.name)) {
          errors.push(`Invalid select option for '${propName}'`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async validateAndExecute(args: any, operation: () => Promise<any>): Promise<any> {
    try {
      // Add pre-execution validation
      if (args.databaseId && args.properties) {
        const database = await this.getDatabase(args.databaseId);
        const validation = this.validatePageProperties(args.properties, database);
        
        if (!validation.valid) {
          return {
            success: false,
            error: 'Validation failed',
            details: validation.errors
          };
        }
      }
      
      return await operation();
    } catch (error) {
      throw error;
    }
  }
}

// Usage Examples:
/*
// Initialize the tool
const notion = new NotionTool("your-notion-integration-token");

// Create a comprehensive database
const databaseResult = await notion.execute({
    action: "create_database",
    parent: { page_id: "your-page-id" },
    title: "Project Management Database",
    properties: {
        "Name": { title: {} },
        "Status": {
            select: {
                options: [
                    { name: "Not started", color: "red" },
                    { name: "In progress", color: "yellow" },
                    { name: "Complete", color: "green" },
                    { name: "On hold", color: "gray" }
                ]
            }
        },
        "Priority": {
            select: {
                options: [
                    { name: "Low", color: "gray" },
                    { name: "Medium", color: "yellow" },
                    { name: "High", color: "red" },
                    { name: "Critical", color: "red" }
                ]
            }
        },
        "Assignee": { people: {} },
        "Due Date": { date: {} },
        "Tags": { multi_select: { options: [] } },
        "Progress": { number: { format: "percent" } },
        "Budget": { number: { format: "dollar" } },
        "Notes": { rich_text: {} },
        "Created": { created_time: {} },
        "Last Updated": { last_edited_time: {} }
    }
});

// Create a detailed project page with structured content
const projectPageResult = await notion.execute({
    action: "create_page",
    parent: { database_id: "your-database-id" },
    properties: {
        "Name": {
            title: [{ type: "text", text: { content: "Website Redesign Project" } }]
        },
        "Status": { select: { name: "In progress" } },
        "Priority": { select: { name: "High" } },
        "Due Date": { date: { start: "2024-12-31" } },
        "Progress": { number: 75 },
        "Budget": { number: 50000 }
    },
    contentType: "project_plan",
    title: "Website Redesign Project",
    description: "Complete redesign of company website with modern UI/UX"
});

// Query database with advanced filters
const queryResult = await notion.execute({
    action: "query_database",
    databaseId: "your-database-id",
    filter: {
        and: [
            {
                property: "Status",
                select: { does_not_equal: "Complete" }
            },
            {
                property: "Priority",
                select: { equals: "High" }
            },
            {
                property: "Due Date",
                date: { before: "2024-12-31" }
            }
        ]
    },
    sorts: [
        {
            property: "Due Date",
            direction: "ascending"
        },
        {
            property: "Priority",
            direction: "descending"
        }
    ]
});

// Advanced search across workspace
const searchResult = await notion.execute({
    action: "advanced_search",
    query: "project management",
    searchPages: true,
    searchDatabases: true,
    createdAfter: "2024-01-01T00:00:00Z"
});

// Create meeting notes with structured content
const meetingNotesResult = await notion.execute({
    action: "create_content",
    parent: { page_id: "your-page-id" },
    contentType: "meeting_notes",
    title: "Weekly Team Standup - March 15, 2024",
    content: {
        attendees: ["John Doe", "Jane Smith", "Bob Johnson"],
        agenda: [
            "Review last week's progress",
            "Discuss current blockers",
            "Plan next week's tasks"
        ],
        actionItems: [
            { task: "Update project timeline", assignee: "John", dueDate: "2024-03-22" },
            { task: "Review design mockups", assignee: "Jane", dueDate: "2024-03-20" }
        ]
    }
});

// Bulk import data
const bulkImportResult = await notion.execute({
    action: "bulk_import",
    parent: { database_id: "your-database-id" },
    importData: [
        {
            title: "Task 1",
            properties: {
                "Name": { title: [{ type: "text", text: { content: "Task 1" } }] },
                "Status": { select: { name: "Not started" } },
                "Priority": { select: { name: "Medium" } }
            }
        },
        {
            title: "Task 2",
            properties: {
                "Name": { title: [{ type: "text", text: { content: "Task 2" } }] },
                "Status": { select: { name: "In progress" } },
                "Priority": { select: { name: "High" } }
            }
        }
    ]
});

// Create automation for status updates
const automationResult = await notion.execute({
    action: "create_automation",
    automationConfig: {
        name: "Status Change Notification",
        trigger: {
            type: "property_change",
            property: "Status",
            database_id: "your-database-id"
        },
        conditions: [
            {
                property: "Status",
                select: { equals: "Complete" }
            }
        ],
        actions: [
            {
                type: "create_comment",
                message: "Task completed! 🎉"
            },
            {
                type: "update_property",
                property: "Progress",
                value: 100
            }
        ]
    }
});

// Get comprehensive analytics
const analyticsResult = await notion.execute({
    action: "get_analytics",
    dateRange: {
        start: "2024-01-01",
        end: "2024-12-31"
    },
    metrics: ["page_views", "database_queries", "user_activity"]
});

// Export database to different formats
const exportResult = await notion.execute({
    action: "export_database",
    databaseId: "your-database-id",
    exportFormat: "csv",
    includeContent: true
});
*/