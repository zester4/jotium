import { FunctionDeclaration, Type } from "@google/genai";
import axios, { AxiosInstance } from 'axios';

export interface ClickUpConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority?: string;
  assignees?: string[];
  due_date?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  space_id?: string;
  folder_id?: string;
  list_id?: string;
}

export interface Space {
  id: string;
  name: string;
  color?: string;
  private: boolean;
  statuses: Status[];
}

export interface Status {
  id: string;
  status: string;
  color: string;
  type: string;
  orderindex: number;
}

export class ClickUpTool {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: ClickUpConfig) {
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.clickup.com/api/v2',
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "clickup_tool",
      description: "Comprehensive ClickUp project management tool for creating, managing, and organizing tasks, projects, and team workflows. Supports advanced features like custom fields, time tracking, and team collaboration.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: [
              "create_task",
              "update_task",
              "delete_task",
              "get_task",
              "list_tasks",
              "create_list",
              "get_lists",
              "create_space",
              "get_spaces",
              "get_team",
              "get_members",
              "add_comment",
              "get_comments",
              "create_checklist",
              "track_time",
              "get_time_entries",
              "set_custom_field",
              "get_custom_fields",
              "create_goal",
              "get_goals",
              "upload_attachment",
              "get_webhooks",
              "create_webhook",
              "get_task_templates",
              "bulk_update_tasks",
              "get_workspaces",
              "create_folder",
              "get_folders",
              "get_folderless_lists",
              "get_space_id_by_name",
              "get_folder_id_by_name",
              "get_list_id_by_name"
            ]
          },
          // Task Management Parameters
          task_id: {
            type: Type.STRING,
            description: "Task ID for task-specific operations"
          },
          parent_task_id: {
            type: Type.STRING,
            description: "Parent task ID for creating a sub-task"
          },
          task_name: {
            type: Type.STRING,
            description: "Name/title of the task"
          },
          task_description: {
            type: Type.STRING,
            description: "Detailed description of the task"
          },
          assignees: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of user IDs to assign the task to"
          },
          status: {
            type: Type.STRING,
            description: "Task status (e.g., 'to do', 'in progress', 'done')"
          },
          priority: {
            type: Type.STRING,
            description: "Task priority level",
            enum: ["urgent", "high", "normal", "low"]
          },
          due_date: {
            type: Type.STRING,
            description: "Due date in Unix timestamp (milliseconds) or ISO format"
          },
          start_date: {
            type: Type.STRING,
            description: "Start date in Unix timestamp (milliseconds) or ISO format"
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of tags to add to the task"
          },
          
          // List and Space Parameters
          list_id: {
            type: Type.STRING,
            description: "List ID where the task/operation should be performed"
          },
          space_id: {
            type: Type.STRING,
            description: "Space ID for space-specific operations"
          },
          folder_id: {
            type: Type.STRING,
            description: "Folder ID for folder-specific operations (required if creating a list in a folder)"
          },
          list_name: {
            type: Type.STRING,
            description: "Name of the list to create"
          },
          space_name: {
            type: Type.STRING,
            description: "Name of the space to create"
          },
          folder_name: {
            type: Type.STRING,
            description: "Name of the folder to create"
          },
          
          // Filtering and Query Parameters
          page: {
            type: Type.NUMBER,
            description: "Page number for pagination (default: 0)"
          },
          limit: {
            type: Type.NUMBER,
            description: "Number of results to return (default: 50, max: 100)"
          },
          order_by: {
            type: Type.STRING,
            description: "Field to order results by",
            enum: ["id", "created", "updated", "due_date"]
          },
          reverse: {
            type: Type.BOOLEAN,
            description: "Reverse the order of results"
          },
          subtasks: {
            type: Type.BOOLEAN,
            description: "Include subtasks in results"
          },
          include_closed: {
            type: Type.BOOLEAN,
            description: "Include closed/completed tasks"
          },
          
          // Custom Fields
          custom_fields: {
            type: Type.OBJECT,
            description: "Object containing custom field values {field_id: value}"
          },
          custom_field_id: {
            type: Type.STRING,
            description: "Custom field ID for custom field operations"
          },
          custom_field_value: {
            type: Type.STRING,
            description: "Value to set for the custom field"
          },
          
          // Comments
          comment_text: {
            type: Type.STRING,
            description: "Comment text to add"
          },
          comment_assignee: {
            type: Type.STRING,
            description: "User ID to assign the comment to"
          },
          notify_all: {
            type: Type.BOOLEAN,
            description: "Notify all task assignees about the comment"
          },
          
          // Time Tracking
          duration: {
            type: Type.NUMBER,
            description: "Duration in milliseconds for time tracking"
          },
          time_description: {
            type: Type.STRING,
            description: "Description for the time entry"
          },
          start_time: {
            type: Type.STRING,
            description: "Start time for time tracking (Unix timestamp)"
          },
          end_time: {
            type: Type.STRING,
            description: "End time for time tracking (Unix timestamp)"
          },
          
          // Checklist
          checklist_name: {
            type: Type.STRING,
            description: "Name of the checklist to create"
          },
          checklist_items: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of checklist item names"
          },
          
          // Goals
          goal_name: {
            type: Type.STRING,
            description: "Name of the goal to create"
          },
          goal_description: {
            type: Type.STRING,
            description: "Description of the goal"
          },
          goal_due_date: {
            type: Type.STRING,
            description: "Due date for the goal"
          },
          goal_color: {
            type: Type.STRING,
            description: "Color for the goal (hex code)"
          },
          
          // Webhook Parameters
          webhook_endpoint: {
            type: Type.STRING,
            description: "Endpoint URL for webhook"
          },
          webhook_events: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of events to trigger webhook"
          },
          
          // Bulk Operations
          task_ids: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of task IDs for bulk operations"
          },
          bulk_updates: {
            type: Type.OBJECT,
            description: "Object containing updates to apply to multiple tasks"
          },
          
          // Search and Filter
          search_query: {
            type: Type.STRING,
            description: "Search query to filter results"
          },
          date_created_gt: {
            type: Type.STRING,
            description: "Filter tasks created after this date"
          },
          date_created_lt: {
            type: Type.STRING,
            description: "Filter tasks created before this date"
          },
          date_updated_gt: {
            type: Type.STRING,
            description: "Filter tasks updated after this date"
          },
          date_updated_lt: {
            type: Type.STRING,
            description: "Filter tasks updated before this date"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`🎯 ClickUp Action: ${args.action}`);
      
      switch (args.action) {
        case "create_task":
          return await this.createTask(args);
        case "update_task":
          return await this.updateTask(args);
        case "delete_task":
          return await this.deleteTask(args);
        case "get_task":
          return await this.getTask(args);
        case "list_tasks":
          return await this.listTasks(args);
        case "create_list":
          return await this.createList(args);
        case "get_lists":
          return await this.getLists(args);
        case "create_space":
          return await this.createSpace(args);
        case "get_spaces":
          return await this.getSpaces(args);
        case "get_team":
          return await this.getTeam(args);
        case "get_members":
          return await this.getMembers(args);
        case "add_comment":
          return await this.addComment(args);
        case "get_comments":
          return await this.getComments(args);
        case "create_checklist":
          return await this.createChecklist(args);
        case "track_time":
          return await this.trackTime(args);
        case "get_time_entries":
          return await this.getTimeEntries(args);
        case "set_custom_field":
          return await this.setCustomField(args);
        case "get_custom_fields":
          return await this.getCustomFields(args);
        case "create_goal":
          return await this.createGoal(args);
        case "get_goals":
          return await this.getGoals(args);
        case "create_webhook":
          return await this.createWebhook(args);
        case "get_webhooks":
          return await this.getWebhooks(args);
        case "bulk_update_tasks":
          return await this.bulkUpdateTasks(args);
        case "get_workspaces":
          return await this.getWorkspaces(args);
        case "create_folder":
          return await this.createFolder(args);
        case "get_folders":
          return await this.getFolders(args);
        case "get_folderless_lists":
          return await this.getFolderlessLists(args);
        case "get_space_id_by_name":
          return await this.getSpaceIdByName(args);
        case "get_folder_id_by_name":
          return await this.getFolderIdByName(args);
        case "get_list_id_by_name":
          return await this.getListIdByName(args);
        default:
          throw new Error(`Unknown action: ${args.action}`);
      }
    } catch (error: any) {
      console.error(`❌ ClickUp operation failed:`, error.response?.data || error.message);
      return {
        success: false,
        error: `ClickUp operation failed: ${error.response?.data?.err || error.message}`,
        action: args.action,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async createTask(args: any): Promise<any> {
    const taskData: any = {
      name: args.task_name,
      description: args.task_description,
      assignees: args.assignees || [],
      tags: args.tags || [],
      status: args.status,
      priority: args.priority ? this.getPriorityValue(args.priority) : undefined,
      due_date: args.due_date ? new Date(args.due_date).getTime() : undefined,
      start_date: args.start_date ? new Date(args.start_date).getTime() : undefined,
      custom_fields: args.custom_fields || [],
      parent: args.parent_task_id || undefined
    };

    // Remove undefined values
    Object.keys(taskData).forEach(key => {
      if (taskData[key] === undefined) delete taskData[key];
    });

    const response = await this.client.post(`/list/${args.list_id}/task`, taskData);
    
    return {
      success: true,
      action: "create_task",
      data: response.data,
      task_id: response.data.id,
      message: `Task "${args.task_name}" created successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async updateTask(args: any): Promise<any> {
    const updateData: any = {};
    
    if (args.task_name) updateData.name = args.task_name;
    if (args.task_description) updateData.description = args.task_description;
    if (args.assignees) updateData.assignees = { add: args.assignees };
    if (args.status) updateData.status = args.status;
    if (args.priority) updateData.priority = this.getPriorityValue(args.priority);
    if (args.due_date) updateData.due_date = new Date(args.due_date).getTime();
    if (args.start_date) updateData.start_date = new Date(args.start_date).getTime();
    if (args.tags) updateData.tags = { add: args.tags };

    const response = await this.client.put(`/task/${args.task_id}`, updateData);
    
    return {
      success: true,
      action: "update_task",
      data: response.data,
      message: `Task ${args.task_id} updated successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async deleteTask(args: any): Promise<any> {
    await this.client.delete(`/task/${args.task_id}`);
    
    return {
      success: true,
      action: "delete_task",
      task_id: args.task_id,
      message: `Task ${args.task_id} deleted successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async getTask(args: any): Promise<any> {
    const params: any = {};
    if (args.custom_task_ids) params.custom_task_ids = args.custom_task_ids;
    if (args.team_id) params.team_id = args.team_id;
    if (args.include_subtasks) params.include_subtasks = args.include_subtasks;

    const response = await this.client.get(`/task/${args.task_id}`, { params });
    
    return {
      success: true,
      action: "get_task",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async listTasks(args: any): Promise<any> {
    const params: any = {
      page: args.page || 0,
      limit: Math.min(args.limit || 50, 100),
      order_by: args.order_by || "created",
      reverse: args.reverse || false,
      subtasks: args.subtasks || false,
      include_closed: args.include_closed || false
    };

    if (args.assignees) params.assignees = args.assignees;
    if (args.tags) params.tags = args.tags;
    if (args.statuses) params.statuses = args.statuses;
    if (args.date_created_gt) params.date_created_gt = new Date(args.date_created_gt).getTime();
    if (args.date_created_lt) params.date_created_lt = new Date(args.date_created_lt).getTime();
    if (args.date_updated_gt) params.date_updated_gt = new Date(args.date_updated_gt).getTime();
    if (args.date_updated_lt) params.date_updated_lt = new Date(args.date_updated_lt).getTime();

    const response = await this.client.get(`/list/${args.list_id}/task`, { params });
    
    return {
      success: true,
      action: "list_tasks",
      data: response.data,
      count: response.data.tasks?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async createList(args: any): Promise<any> {
    if (!args.folder_id && !args.space_id) {
      throw new Error("Either folder_id or space_id must be provided to create a list.");
    }
    const listData = {
      name: args.list_name,
      content: args.task_description || "",
      due_date: args.due_date ? new Date(args.due_date).getTime() : undefined,
      priority: args.priority ? this.getPriorityValue(args.priority) : undefined,
      assignee: args.assignees?.[0] || undefined,
      status: args.status || undefined
    };
    let response;
    if (args.folder_id) {
      response = await this.client.post(`/folder/${args.folder_id}/list`, listData);
    } else if (args.space_id) {
      response = await this.client.post(`/space/${args.space_id}/list`, listData);
    } else {
      throw new Error("Failed to determine endpoint for list creation.");
    }
    if (!response) {
      throw new Error("Failed to create list: No response from ClickUp API.");
    }
    return {
      success: true,
      action: "create_list",
      data: response.data,
      list_id: response.data.id,
      message: `List "${args.list_name}" created successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async getLists(args: any): Promise<any> {
    const response = await this.client.get(`/folder/${args.folder_id}/list`);
    
    return {
      success: true,
      action: "get_lists",
      data: response.data,
      count: response.data.lists?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async createSpace(args: any): Promise<any> {
    const spaceData = {
      name: args.space_name,
      multiple_assignees: true,
      features: {
        due_dates: { enabled: true, start_date: false, remap_due_dates: true, remap_closed_due_date: false },
        time_tracking: { enabled: true },
        tags: { enabled: true },
        time_estimates: { enabled: true },
        checklists: { enabled: true },
        custom_fields: { enabled: true },
        remap_dependencies: { enabled: true },
        dependency_warning: { enabled: true },
        portfolios: { enabled: true }
      }
    };

    const response = await this.client.post(`/team/${args.team_id}/space`, spaceData);
    
    return {
      success: true,
      action: "create_space",
      data: response.data,
      space_id: response.data.id,
      message: `Space "${args.space_name}" created successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async getSpaces(args: any): Promise<any> {
    const response = await this.client.get(`/team/${args.team_id}/space`);
    
    return {
      success: true,
      action: "get_spaces",
      data: response.data,
      count: response.data.spaces?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async getTeam(args: any): Promise<any> {
    const response = await this.client.get(`/team`);
    
    return {
      success: true,
      action: "get_team",
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  private async getMembers(args: any): Promise<any> {
    const response = await this.client.get(`/team/${args.team_id}/member`);
    
    return {
      success: true,
      action: "get_members",
      data: response.data,
      count: response.data.members?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async addComment(args: any): Promise<any> {
    const commentData: any = {
      comment_text: args.comment_text,
      assignee: args.comment_assignee,
      notify_all: args.notify_all || false
    };

    const response = await this.client.post(`/task/${args.task_id}/comment`, commentData);
    
    return {
      success: true,
      action: "add_comment",
      data: response.data,
      comment_id: response.data.id,
      message: "Comment added successfully",
      timestamp: new Date().toISOString()
    };
  }

  private async getComments(args: any): Promise<any> {
    const response = await this.client.get(`/task/${args.task_id}/comment`);
    
    return {
      success: true,
      action: "get_comments",
      data: response.data,
      count: response.data.comments?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async createChecklist(args: any): Promise<any> {
    const checklistData = {
      name: args.checklist_name
    };

    const response = await this.client.post(`/task/${args.task_id}/checklist`, checklistData);
    
    // Add checklist items if provided
    if (args.checklist_items && args.checklist_items.length > 0) {
      const checklistId = response.data.checklist.id;
      const itemPromises = args.checklist_items.map((item: string) =>
        this.client.post(`/checklist/${checklistId}/checklist_item`, { name: item })
      );
      await Promise.all(itemPromises);
    }
    
    return {
      success: true,
      action: "create_checklist",
      data: response.data,
      checklist_id: response.data.checklist.id,
      message: `Checklist "${args.checklist_name}" created successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async trackTime(args: any): Promise<any> {
    const timeData: any = {
      description: args.time_description || "",
      tags: args.tags || [],
      start: args.start_time ? parseInt(args.start_time) : undefined,
      end: args.end_time ? parseInt(args.end_time) : undefined,
      duration: args.duration || undefined
    };

    const response = await this.client.post(`/task/${args.task_id}/time`, timeData);
    
    return {
      success: true,
      action: "track_time",
      data: response.data,
      time_entry_id: response.data.id,
      message: "Time tracked successfully",
      timestamp: new Date().toISOString()
    };
  }

  private async getTimeEntries(args: any): Promise<any> {
    const params: any = {};
    if (args.start_time) params.start_date = args.start_time;
    if (args.end_time) params.end_date = args.end_time;

    const response = await this.client.get(`/task/${args.task_id}/time`, { params });
    
    return {
      success: true,
      action: "get_time_entries",
      data: response.data,
      count: response.data.data?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async setCustomField(args: any): Promise<any> {
    const fieldData = {
      value: args.custom_field_value
    };

    const response = await this.client.post(
      `/task/${args.task_id}/field/${args.custom_field_id}`,
      fieldData
    );
    
    return {
      success: true,
      action: "set_custom_field",
      data: response.data,
      message: "Custom field updated successfully",
      timestamp: new Date().toISOString()
    };
  }

  private async getCustomFields(args: any): Promise<any> {
    const response = await this.client.get(`/list/${args.list_id}/field`);
    
    return {
      success: true,
      action: "get_custom_fields",
      data: response.data,
      count: response.data.fields?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async createGoal(args: any): Promise<any> {
    const goalData = {
      name: args.goal_name,
      description: args.goal_description || "",
      due_date: args.goal_due_date ? new Date(args.goal_due_date).getTime() : undefined,
      color: args.goal_color || "#32a852"
    };

    const response = await this.client.post(`/team/${args.team_id}/goal`, goalData);
    
    return {
      success: true,
      action: "create_goal",
      data: response.data,
      goal_id: response.data.goal.id,
      message: `Goal "${args.goal_name}" created successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async getGoals(args: any): Promise<any> {
    const response = await this.client.get(`/team/${args.team_id}/goal`);
    
    return {
      success: true,
      action: "get_goals",
      data: response.data,
      count: response.data.goals?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async createWebhook(args: any): Promise<any> {
    const webhookData = {
      endpoint: args.webhook_endpoint,
      events: args.webhook_events || ["*"]
    };

    const response = await this.client.post(`/team/${args.team_id}/webhook`, webhookData);
    
    return {
      success: true,
      action: "create_webhook",
      data: response.data,
      webhook_id: response.data.id,
      message: "Webhook created successfully",
      timestamp: new Date().toISOString()
    };
  }

  private async getWebhooks(args: any): Promise<any> {
    const response = await this.client.get(`/team/${args.team_id}/webhook`);
    
    return {
      success: true,
      action: "get_webhooks",
      data: response.data,
      count: response.data.webhooks?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async bulkUpdateTasks(args: any): Promise<any> {
    const promises = args.task_ids.map((taskId: string) =>
      this.client.put(`/task/${taskId}`, args.bulk_updates)
    );

    const responses = await Promise.all(promises);
    
    return {
      success: true,
      action: "bulk_update_tasks",
      data: responses.map(r => r.data),
      updated_count: responses.length,
      message: `${responses.length} tasks updated successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async getWorkspaces(args: any): Promise<any> {
    const response = await this.client.get(`/team`);
    
    return {
      success: true,
      action: "get_workspaces",
      data: response.data,
      count: response.data.teams?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private getPriorityValue(priority: string): number {
    const priorityMap: Record<string, number> = {
      urgent: 1,
      high: 2,
      normal: 3,
      low: 4
    };
    return priorityMap[priority.toLowerCase()] || 3;
  }

  // Utility method to format dates
  private formatDate(date: string | number): number {
    if (typeof date === 'string') {
      return new Date(date).getTime();
    }
    return date;
  }

  // Utility method to validate required parameters
  private validateRequired(args: any, required: string[]): void {
    for (const field of required) {
      if (!args[field]) {
        throw new Error(`Missing required parameter: ${field}`);
      }
    }
  }

  private async createFolder(args: any): Promise<any> {
    this.validateRequired(args, ["space_id", "folder_name"]);
    const folderData = {
      name: args.folder_name
    };
    const response = await this.client.post(`/space/${args.space_id}/folder`, folderData);
    return {
      success: true,
      action: "create_folder",
      data: response.data,
      folder_id: response.data.id,
      message: `Folder "${args.folder_name}" created successfully`,
      timestamp: new Date().toISOString()
    };
  }

  private async getFolders(args: any): Promise<any> {
    this.validateRequired(args, ["space_id"]);
    const response = await this.client.get(`/space/${args.space_id}/folder`);
    return {
      success: true,
      action: "get_folders",
      data: response.data,
      count: response.data.folders?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async getFolderlessLists(args: any): Promise<any> {
    this.validateRequired(args, ["space_id"]);
    const response = await this.client.get(`/space/${args.space_id}/list`);
    return {
      success: true,
      action: "get_folderless_lists",
      data: response.data,
      count: response.data.lists?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  private async getSpaceIdByName(args: any): Promise<any> {
    this.validateRequired(args, ["team_id", "space_name"]);
    const spacesResponse = await this.getSpaces(args);
    const space = spacesResponse.data.spaces.find((s: any) => s.name.toLowerCase() === args.space_name.toLowerCase());
    if (!space) {
      throw new Error(`Space with name "${args.space_name}" not found.`);
    }
    return {
      success: true,
      action: "get_space_id_by_name",
      space_id: space.id,
      space_name: space.name,
      timestamp: new Date().toISOString()
    };
  }

  private async getFolderIdByName(args: any): Promise<any> {
    this.validateRequired(args, ["space_id", "folder_name"]);
    const foldersResponse = await this.getFolders(args);
    const folder = foldersResponse.data.folders.find((f: any) => f.name.toLowerCase() === args.folder_name.toLowerCase());
    if (!folder) {
      throw new Error(`Folder with name "${args.folder_name}" not found in space ${args.space_id}.`);
    }
    return {
      success: true,
      action: "get_folder_id_by_name",
      folder_id: folder.id,
      folder_name: folder.name,
      timestamp: new Date().toISOString()
    };
  }

  private async getListIdByName(args: any): Promise<any> {
    this.validateRequired(args, ["folder_id", "list_name"]);
    const listsResponse = await this.getLists(args);
    const list = listsResponse.data.lists.find((l: any) => l.name.toLowerCase() === args.list_name.toLowerCase());
    if (!list) {
      throw new Error(`List with name "${args.list_name}" not found in folder ${args.folder_id}.`);
    }
    return {
      success: true,
      action: "get_list_id_by_name",
      list_id: list.id,
      list_name: list.name,
      timestamp: new Date().toISOString()
    };
  }
}
