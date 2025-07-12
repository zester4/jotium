import { FunctionDeclaration, Type } from "@google/genai";
import axios, { AxiosInstance } from 'axios';

interface Tool {
  getDefinition(): FunctionDeclaration;
  execute(args: any): Promise<any>;
}

export class AirtableTool implements Tool {
  private apiClient: AxiosInstance;
  private baseUrl = 'https://api.airtable.com/v0';

  constructor(apiKey: string) {
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "airtable",
      description: "A tool for managing Airtable bases, tables, and records with comprehensive CRUD operations",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: [
              "create_record", "get_record", "update_record", "delete_record", "list_records",
              "batch_create", "batch_update", "batch_delete",
              "get_base_schema", "get_table_schema", "list_tables",
              "create_table", "update_table", "delete_table",
              "create_field", "update_field", "delete_field",
              "search_records", "filter_records", "sort_records",
              "get_attachment", "upload_attachment",
              "create_view", "get_view", "update_view", "delete_view",
              "sync_table", "get_webhooks", "create_webhook", "delete_webhook"
            ]
          },
          baseId: {
            type: Type.STRING,
            description: "The Airtable base ID (required for most operations)"
          },
          tableId: {
            type: Type.STRING,
            description: "The table ID or name"
          },
          recordId: {
            type: Type.STRING,
            description: "The record ID for single record operations"
          },
          fields: {
            type: Type.OBJECT,
            description: "Field values for record operations"
          },
          records: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "Array of records for batch operations"
          },
          filterByFormula: {
            type: Type.STRING,
            description: "Airtable formula to filter records"
          },
          sort: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "Array of sort objects with field and direction"
          },
          view: {
            type: Type.STRING,
            description: "View ID or name to use"
          },
          maxRecords: {
            type: Type.NUMBER,
            description: "Maximum number of records to return (default: 100)"
          },
          offset: {
            type: Type.STRING,
            description: "Pagination offset token"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const startTime = Date.now();
      console.log(`🚀 Executing Airtable action: ${args.action}`);

      let result: any;

      switch (args.action) {
        // Record operations
        case 'create_record':
          result = await this.createRecord(args);
          break;
        case 'get_record':
          result = await this.getRecord(args);
          break;
        case 'update_record':
          result = await this.updateRecord(args);
          break;
        case 'delete_record':
          result = await this.deleteRecord(args);
          break;
        case 'list_records':
          result = await this.listRecords(args);
          break;

        // Batch operations
        case 'batch_create':
          result = await this.batchCreateRecords(args);
          break;
        case 'batch_update':
          result = await this.batchUpdateRecords(args);
          break;
        case 'batch_delete':
          result = await this.batchDeleteRecords(args);
          break;

        // Schema operations
        case 'get_base_schema':
          result = await this.getBaseSchema(args.baseId);
          break;
        case 'get_table_schema':
          result = await this.getTableSchema(args.baseId, args.tableId);
          break;
        case 'list_tables':
          result = await this.listTables(args.baseId);
          break;

        // Table management
        case 'create_table':
          result = await this.createTable(args);
          break;
        case 'update_table':
          result = await this.updateTable(args);
          break;
        case 'delete_table':
          result = await this.deleteTable(args);
          break;

        // Field management
        case 'create_field':
          result = await this.createField(args);
          break;
        case 'update_field':
          result = await this.updateField(args);
          break;
        case 'delete_field':
          result = await this.deleteField(args);
          break;

        // Search and filter operations
        case 'search_records':
          result = await this.searchRecords(args);
          break;
        case 'filter_records':
          result = await this.filterRecords(args);
          break;
        case 'sort_records':
          result = await this.sortRecords(args);
          break;

        // Attachment operations
        case 'get_attachment':
          result = await this.getAttachment(args);
          break;
        case 'upload_attachment':
          result = await this.uploadAttachment(args);
          break;

        // View operations
        case 'create_view':
          result = await this.createView(args);
          break;
        case 'get_view':
          result = await this.getView(args);
          break;
        case 'update_view':
          result = await this.updateView(args);
          break;
        case 'delete_view':
          result = await this.deleteView(args);
          break;

        // Sync operations
        case 'sync_table':
          result = await this.syncTable(args);
          break;

        // Webhook operations
        case 'get_webhooks':
          result = await this.getWebhooks(args.baseId);
          break;
        case 'create_webhook':
          result = await this.createWebhook(args);
          break;
        case 'delete_webhook':
          result = await this.deleteWebhook(args);
          break;

        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`,
            availableActions: [
              'create_record', 'get_record', 'update_record', 'delete_record', 'list_records',
              'batch_create', 'batch_update', 'batch_delete',
              'get_base_schema', 'get_table_schema', 'list_tables',
              'create_table', 'update_table', 'delete_table',
              'create_field', 'update_field', 'delete_field',
              'search_records', 'filter_records', 'sort_records',
              'get_attachment', 'upload_attachment',
              'create_view', 'get_view', 'update_view', 'delete_view',
              'sync_table', 'get_webhooks', 'create_webhook', 'delete_webhook'
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
      console.error("❌ Airtable operation failed:", error);
      return {
        success: false,
        error: `Airtable operation failed: ${error.response?.data?.error?.message || error.message}`,
        action: args.action,
        statusCode: error.response?.status,
        timestamp: new Date().toISOString(),
        details: error.response?.data?.error
      };
    }
  }

  // Record operations
  private async createRecord(args: any): Promise<any> {
    const { baseId, tableId, fields } = args;
    
    if (!baseId || !tableId || !fields) {
      throw new Error('baseId, tableId, and fields are required for creating a record');
    }

    const response = await this.apiClient.post(`/${baseId}/${tableId}`, {
      fields: fields,
      typecast: args.typecast || false
    });
    return response.data;
  }

  private async getRecord(args: any): Promise<any> {
    const { baseId, tableId, recordId } = args;
    
    if (!baseId || !tableId || !recordId) {
      throw new Error('baseId, tableId, and recordId are required for getting a record');
    }

    const response = await this.apiClient.get(`/${baseId}/${tableId}/${recordId}`);
    return response.data;
  }

  private async updateRecord(args: any): Promise<any> {
    const { baseId, tableId, recordId, fields } = args;
    
    if (!baseId || !tableId || !recordId || !fields) {
      throw new Error('baseId, tableId, recordId, and fields are required for updating a record');
    }

    const response = await this.apiClient.patch(`/${baseId}/${tableId}/${recordId}`, {
      fields: fields,
      typecast: args.typecast || false
    });
    return response.data;
  }

  private async deleteRecord(args: any): Promise<any> {
    const { baseId, tableId, recordId } = args;
    
    if (!baseId || !tableId || !recordId) {
      throw new Error('baseId, tableId, and recordId are required for deleting a record');
    }

    const response = await this.apiClient.delete(`/${baseId}/${tableId}/${recordId}`);
    return response.data;
  }

  private async listRecords(args: any): Promise<any> {
    const { baseId, tableId } = args;
    
    if (!baseId || !tableId) {
      throw new Error('baseId and tableId are required for listing records');
    }

    const params: any = {};
    if (args.fields) params.fields = args.fields;
    if (args.filterByFormula) params.filterByFormula = args.filterByFormula;
    if (args.maxRecords) params.maxRecords = Math.min(args.maxRecords, 100);
    if (args.pageSize) params.pageSize = Math.min(args.pageSize, 100);
    if (args.sort) params.sort = args.sort;
    if (args.view) params.view = args.view;
    if (args.offset) params.offset = args.offset;
    if (args.cellFormat) params.cellFormat = args.cellFormat;
    if (args.timeZone) params.timeZone = args.timeZone;
    if (args.userLocale) params.userLocale = args.userLocale;

    const response = await this.apiClient.get(`/${baseId}/${tableId}`, { params });
    return response.data;
  }

  // Batch operations
  private async batchCreateRecords(args: any): Promise<any> {
    const { baseId, tableId, records } = args;
    
    if (!baseId || !tableId || !records) {
      throw new Error('baseId, tableId, and records are required for batch creating records');
    }

    // Airtable allows max 10 records per batch
    const batches = [];
    for (let i = 0; i < records.length; i += 10) {
      batches.push(records.slice(i, i + 10));
    }

    const results = [];
    for (const batch of batches) {
      const response = await this.apiClient.post(`/${baseId}/${tableId}`, {
        records: batch.map((record: any) => ({ fields: record })),
        typecast: args.typecast || false
      });
      results.push(...response.data.records);
    }

    return { records: results };
  }

  private async batchUpdateRecords(args: any): Promise<any> {
    const { baseId, tableId, records } = args;
    
    if (!baseId || !tableId || !records) {
      throw new Error('baseId, tableId, and records are required for batch updating records');
    }

    const batches = [];
    for (let i = 0; i < records.length; i += 10) {
      batches.push(records.slice(i, i + 10));
    }

    const results = [];
    for (const batch of batches) {
      const response = await this.apiClient.patch(`/${baseId}/${tableId}`, {
        records: batch,
        typecast: args.typecast || false
      });
      results.push(...response.data.records);
    }

    return { records: results };
  }

  private async batchDeleteRecords(args: any): Promise<any> {
    const { baseId, tableId, recordIds } = args;
    
    if (!baseId || !tableId || !recordIds) {
      throw new Error('baseId, tableId, and recordIds are required for batch deleting records');
    }

    const batches = [];
    for (let i = 0; i < recordIds.length; i += 10) {
      batches.push(recordIds.slice(i, i + 10));
    }

    const results = [];
    for (const batch of batches) {
      const params = { records: batch };
      const response = await this.apiClient.delete(`/${baseId}/${tableId}`, { params });
      results.push(...response.data.records);
    }

    return { records: results };
  }

  // Schema operations
  private async getBaseSchema(baseId: string): Promise<any> {
    if (!baseId) {
      throw new Error('baseId is required for getting base schema');
    }

    const response = await this.apiClient.get(`/meta/bases/${baseId}/tables`);
    return response.data;
  }

  private async getTableSchema(baseId: string, tableId: string): Promise<any> {
    if (!baseId || !tableId) {
      throw new Error('baseId and tableId are required for getting table schema');
    }

    const response = await this.apiClient.get(`/meta/bases/${baseId}/tables/${tableId}`);
    return response.data;
  }

  private async listTables(baseId: string): Promise<any> {
    if (!baseId) {
      throw new Error('baseId is required for listing tables');
    }

    const response = await this.apiClient.get(`/meta/bases/${baseId}/tables`);
    return response.data;
  }

  // Table management (Meta API)
  private async createTable(args: any): Promise<any> {
    const { baseId, name, fields } = args;
    
    if (!baseId || !name || !fields) {
      throw new Error('baseId, name, and fields are required for creating a table');
    }

    const response = await this.apiClient.post(`/meta/bases/${baseId}/tables`, {
      name: name,
      fields: fields,
      description: args.description
    });
    return response.data;
  }

  private async updateTable(args: any): Promise<any> {
    const { baseId, tableId, name, description } = args;
    
    if (!baseId || !tableId) {
      throw new Error('baseId and tableId are required for updating a table');
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    const response = await this.apiClient.patch(`/meta/bases/${baseId}/tables/${tableId}`, updateData);
    return response.data;
  }

  private async deleteTable(args: any): Promise<any> {
    const { baseId, tableId } = args;
    
    if (!baseId || !tableId) {
      throw new Error('baseId and tableId are required for deleting a table');
    }

    const response = await this.apiClient.delete(`/meta/bases/${baseId}/tables/${tableId}`);
    return response.data;
  }

  // Field management
  private async createField(args: any): Promise<any> {
    const { baseId, tableId, name, type } = args;
    
    if (!baseId || !tableId || !name || !type) {
      throw new Error('baseId, tableId, name, and type are required for creating a field');
    }

    const fieldData: any = {
      name: name,
      type: type
    };

    if (args.options) fieldData.options = args.options;
    if (args.description) fieldData.description = args.description;

    const response = await this.apiClient.post(`/meta/bases/${baseId}/tables/${tableId}/fields`, fieldData);
    return response.data;
  }

  private async updateField(args: any): Promise<any> {
    const { baseId, tableId, fieldId, name, description } = args;
    
    if (!baseId || !tableId || !fieldId) {
      throw new Error('baseId, tableId, and fieldId are required for updating a field');
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (args.options) updateData.options = args.options;

    const response = await this.apiClient.patch(`/meta/bases/${baseId}/tables/${tableId}/fields/${fieldId}`, updateData);
    return response.data;
  }

  private async deleteField(args: any): Promise<any> {
    const { baseId, tableId, fieldId } = args;
    
    if (!baseId || !tableId || !fieldId) {
      throw new Error('baseId, tableId, and fieldId are required for deleting a field');
    }

    const response = await this.apiClient.delete(`/meta/bases/${baseId}/tables/${tableId}/fields/${fieldId}`);
    return response.data;
  }

  // Search and filter operations
  private async searchRecords(args: any): Promise<any> {
    const { baseId, tableId, searchTerm } = args;
    
    if (!baseId || !tableId || !searchTerm) {
      throw new Error('baseId, tableId, and searchTerm are required for searching records');
    }

    // Use SEARCH function in filterByFormula
    const formula = `SEARCH("${searchTerm}", CONCATENATE(${args.fields?.map((f: string) => `{${f}}`).join(', ') || 'RECORD_ID()'}))`;
    
    return await this.listRecords({
      ...args,
      filterByFormula: formula
    });
  }

  private async filterRecords(args: any): Promise<any> {
    return await this.listRecords(args);
  }

  private async sortRecords(args: any): Promise<any> {
    return await this.listRecords(args);
  }

  // Attachment operations
  private async getAttachment(args: any): Promise<any> {
    const { url } = args;
    
    if (!url) {
      throw new Error('url is required for getting an attachment');
    }

    const response = await axios.get(url);
    return response.data;
  }

  private async uploadAttachment(args: any): Promise<any> {
    // Note: Airtable doesn't have a direct upload API
    // Attachments are typically uploaded through the web interface
    // This is a placeholder for potential future functionality
    throw new Error('Direct attachment upload is not supported by Airtable API. Use the web interface to upload attachments.');
  }

  // View operations
  private async createView(args: any): Promise<any> {
    const { baseId, tableId, name, type } = args;
    
    if (!baseId || !tableId || !name || !type) {
      throw new Error('baseId, tableId, name, and type are required for creating a view');
    }

    const viewData: any = {
      name: name,
      type: type
    };

    if (args.visibleFieldIds) viewData.visibleFieldIds = args.visibleFieldIds;
    if (args.filterByFormula) viewData.filterByFormula = args.filterByFormula;
    if (args.sort) viewData.sort = args.sort;

    const response = await this.apiClient.post(`/meta/bases/${baseId}/tables/${tableId}/views`, viewData);
    return response.data;
  }

  private async getView(args: any): Promise<any> {
    const { baseId, tableId, viewId } = args;
    
    if (!baseId || !tableId || !viewId) {
      throw new Error('baseId, tableId, and viewId are required for getting a view');
    }

    const response = await this.apiClient.get(`/meta/bases/${baseId}/tables/${tableId}/views/${viewId}`);
    return response.data;
  }

  private async updateView(args: any): Promise<any> {
    const { baseId, tableId, viewId } = args;
    
    if (!baseId || !tableId || !viewId) {
      throw new Error('baseId, tableId, and viewId are required for updating a view');
    }

    const updateData: any = {};
    if (args.name) updateData.name = args.name;
    if (args.visibleFieldIds) updateData.visibleFieldIds = args.visibleFieldIds;
    if (args.filterByFormula) updateData.filterByFormula = args.filterByFormula;
    if (args.sort) updateData.sort = args.sort;

    const response = await this.apiClient.patch(`/meta/bases/${baseId}/tables/${tableId}/views/${viewId}`, updateData);
    return response.data;
  }

  private async deleteView(args: any): Promise<any> {
    const { baseId, tableId, viewId } = args;
    
    if (!baseId || !tableId || !viewId) {
      throw new Error('baseId, tableId, and viewId are required for deleting a view');
    }

    const response = await this.apiClient.delete(`/meta/bases/${baseId}/tables/${tableId}/views/${viewId}`);
    return response.data;
  }

  // Sync operations
  private async syncTable(args: any): Promise<any> {
    const { baseId, tableId } = args;
    
    if (!baseId || !tableId) {
      throw new Error('baseId and tableId are required for syncing a table');
    }

    // This would trigger a sync operation if the table is synced
    const response = await this.apiClient.post(`/${baseId}/${tableId}/sync`);
    return response.data;
  }

  // Webhook operations
  private async getWebhooks(baseId: string): Promise<any> {
    if (!baseId) {
      throw new Error('baseId is required for getting webhooks');
    }

    const response = await this.apiClient.get(`/bases/${baseId}/webhooks`);
    return response.data;
  }

  private async createWebhook(args: any): Promise<any> {
    const { baseId, notificationUrl, specification } = args;
    
    if (!baseId || !notificationUrl || !specification) {
      throw new Error('baseId, notificationUrl, and specification are required for creating a webhook');
    }

    const response = await this.apiClient.post(`/bases/${baseId}/webhooks`, {
      notificationUrl: notificationUrl,
      specification: specification
    });
    return response.data;
  }

  private async deleteWebhook(args: any): Promise<any> {
    const { baseId, webhookId } = args;
    
    if (!baseId || !webhookId) {
      throw new Error('baseId and webhookId are required for deleting a webhook');
    }

    const response = await this.apiClient.delete(`/bases/${baseId}/webhooks/${webhookId}`);
    return response.data;
  }
}

// Usage Examples:
/*
// Initialize the tool
const airtable = new AirtableTool("your-airtable-api-key");

// Create a single record
const createResult = await airtable.execute({
    action: "create_record",
    baseId: "appXXXXXXXXXXXXXX",
    tableId: "tblXXXXXXXXXXXXXX",
    fields: {
        "Name": "John Doe",
        "Email": "john.doe@example.com",
        "Status": "Active",
        "Created": new Date().toISOString()
    }
});

// List records with filtering and sorting
const listResult = await airtable.execute({
    action: "list_records",
    baseId: "appXXXXXXXXXXXXXX",
    tableId: "tblXXXXXXXXXXXXXX",
    filterByFormula: "AND({Status} = 'Active', {Created} > '2024-01-01')",
    sort: [
        { field: "Created", direction: "desc" },
        { field: "Name", direction: "asc" }
    ],
    maxRecords: 50,
    fields: ["Name", "Email", "Status", "Created"]
});

// Batch create multiple records
const batchCreateResult = await airtable.execute({
    action: "batch_create",
    baseId: "appXXXXXXXXXXXXXX",
    tableId: "tblXXXXXXXXXXXXXX",
    records: [
        { "Name": "Alice Smith", "Email": "alice@example.com", "Status": "Active" },
        { "Name": "Bob Johnson", "Email": "bob@example.com", "Status": "Pending" },
        { "Name": "Carol Brown", "Email": "carol@example.com", "Status": "Active" }
    ]
});

// Update a record
const updateResult = await airtable.execute({
    action: "update_record",
    baseId: "appXXXXXXXXXXXXXX",
    tableId: "tblXXXXXXXXXXXXXX",
    recordId: "recXXXXXXXXXXXXXX",
    fields: {
        "Status": "Inactive",
        "Updated": new Date().toISOString()
    }
});

// Get base schema
const schemaResult = await airtable.execute({
    action: "get_base_schema",
    baseId: "appXXXXXXXXXXXXXX"
});

// Search records
const searchResult = await airtable.execute({
    action: "search_records",
    baseId: "appXXXXXXXXXXXXXX",
    tableId: "tblXXXXXXXXXXXXXX",
    searchTerm: "john",
    fields: ["Name", "Email"]
});

// Create a new table
const tableResult = await airtable.execute({
    action: "create_table",
    baseId: "appXXXXXXXXXXXXXX",
    name: "New Table",
    description: "A new table for testing",
    fields: [
        {
            name: "Name",
            type: "singleLineText"
        },
        {
            name: "Email",
            type: "email"
        },
        {
            name: "Status",
            type: "singleSelect",
            options: {
                choices: [
                    { name: "Active", color: "greenBright" },
                    { name: "Pending", color: "yellowBright" },
                    { name: "Inactive", color: "redBright" }
                ]
            }
        }
    ]
});

// Create a webhook
const webhookResult = await airtable.execute({
    action: "create_webhook",
    baseId: "appXXXXXXXXXXXXXX",
    notificationUrl: "https://your-webhook-url.com/endpoint",
    specification: {
        options: {
            filters: {
                dataTypes: ["tableData"],
                recordChangeScope: "tblXXXXXXXXXXXXXX"
            }
        }
    }
});
*/