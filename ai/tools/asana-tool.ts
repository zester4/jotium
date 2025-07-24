import { FunctionDeclaration, Type } from "@google/genai";

export class AsanaTool {
  private baseUrl = "https://app.asana.com/api/1.0";
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "asana_tool",
      description: "A comprehensive tool for Asana project management operations including tasks, projects, users, teams, and workspace management",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform with the Asana tool",
            enum: [
              // Task operations
              "get_task",
              "create_task",
              "update_task",
              "delete_task",
              "get_tasks_for_project",
              "search_tasks",
              "add_task_to_project",
              "remove_task_from_project",
              "get_task_stories",
              "add_task_comment",
              
              // Project operations
              "get_project",
              "create_project",
              "update_project",
              "delete_project",
              "get_projects",
              "get_project_sections",
              "create_project_section",
              "duplicate_project",
              "get_project_templates",
              "create_project_from_template",
              "get_workspace_by_name",
              "get_team_by_name",
              
              // User operations
              "get_user",
              "get_users",
              "get_user_tasks",
              "get_current_user",
              
              // Team operations
              "get_team",
              "get_teams",
              "get_team_users",
              "add_user_to_team",
              "remove_user_from_team",
              
              // Workspace operations
              "get_workspace",
              "get_workspaces",
              "get_workspace_users",
              "get_workspace_projects",
              
              // Attachment operations
              "get_attachment",
              "create_attachment",
              "delete_attachment",
              
              // Tag operations
              "get_tag",
              "create_tag",
              "get_tags",
              "add_tag_to_task",
              "remove_tag_from_task",
              
              // Webhook operations
              "create_webhook",
              "get_webhook",
              "update_webhook",
              "delete_webhook",
              "get_webhooks",
              
              // Portfolio operations
              "get_portfolio",
              "create_portfolio",
              "get_portfolios",
              "add_project_to_portfolio",
              "remove_project_from_portfolio"
            ]
          },
          
          // Common parameters
          gid: {
            type: Type.STRING,
            description: "The globally unique identifier for the Asana object"
          },
          
          // Task parameters
          taskData: {
            type: Type.OBJECT,
            description: "Task data for creating or updating tasks",
            properties: {
              name: { type: Type.STRING },
              notes: { type: Type.STRING },
              assignee: { type: Type.STRING },
              due_date: { type: Type.STRING },
              due_time: { type: Type.STRING },
              completed: { type: Type.BOOLEAN },
              priority: { type: Type.STRING },
              projects: { type: Type.ARRAY, items: { type: Type.STRING } },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              parent: { type: Type.STRING },
              followers: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          
          // Project parameters
          projectData: {
            type: Type.OBJECT,
            description: "Project data for creating or updating projects",
            properties: {
              name: { type: Type.STRING },
              notes: { type: Type.STRING },
              color: { type: Type.STRING },
              layout: { type: Type.STRING },
              privacy_setting: { type: Type.STRING },
              team: { type: Type.STRING },
              workspace: { type: Type.STRING },
              owner: { type: Type.STRING },
              due_date: { type: Type.STRING },
              start_date: { type: Type.STRING }
            }
          },
          name: {
            type: Type.STRING,
            description: "Name of the object to create or search for"
          },
          template_gid: {
            type: Type.STRING,
            description: "GID of the project template to use"
          },
          
          // Search parameters
          searchParams: {
            type: Type.OBJECT,
            description: "Search parameters for finding tasks or projects",
            properties: {
              text: { type: Type.STRING },
              assignee: { type: Type.STRING },
              projects: { type: Type.ARRAY, items: { type: Type.STRING } },
              completed: { type: Type.BOOLEAN },
              due_date_before: { type: Type.STRING },
              due_date_after: { type: Type.STRING },
              created_before: { type: Type.STRING },
              created_after: { type: Type.STRING },
              modified_before: { type: Type.STRING },
              modified_after: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              followers: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          
          // Webhook parameters
          webhookData: {
            type: Type.OBJECT,
            description: "Webhook configuration data",
            properties: {
              resource: { type: Type.STRING },
              target: { type: Type.STRING },
              filters: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          
          // General parameters
          workspace: {
            type: Type.STRING,
            description: "Workspace GID for operations that require workspace context"
          },
          
          project: {
            type: Type.STRING,
            description: "Project GID for operations that require project context"
          },
          
          user: {
            type: Type.STRING,
            description: "User GID for operations that require user context"
          },
          
          team: {
            type: Type.STRING,
            description: "Team GID for operations that require team context"
          },
          
          comment: {
            type: Type.STRING,
            description: "Comment text for adding comments to tasks"
          },
          
          fields: {
            type: Type.ARRAY,
            description: "Array of field names to include in the response",
            items: { type: Type.STRING }
          },
          
          limit: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (default: 50)"
          },
          
          offset: {
            type: Type.STRING,
            description: "Offset for pagination"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      switch (args.action) {
        // Task operations
        case "get_task":
          return this.getTask(args.gid, args.fields);
        case "create_task":
          return this.createTask(args.taskData);
        case "update_task":
          return this.updateTask(args.gid, args.taskData);
        case "delete_task":
          return this.deleteTask(args.gid);
        case "get_tasks_for_project":
          return this.getTasksForProject(args.project, args.fields, args.limit, args.offset);
        case "search_tasks":
          return this.searchTasks(args.workspace, args.searchParams);
        case "add_task_to_project":
          return this.addTaskToProject(args.gid, args.project);
        case "remove_task_from_project":
          return this.removeTaskFromProject(args.gid, args.project);
        case "get_task_stories":
          return this.getTaskStories(args.gid);
        case "add_task_comment":
          return this.addTaskComment(args.gid, args.comment);
          
        // Project operations
        case "get_project":
          return this.getProject(args.gid, args.fields);
        case "create_project":
          return this.createProject(args.name, args.workspace, args.team, args.projectData);
        case "update_project":
          return this.updateProject(args.gid, args.projectData);
        case "delete_project":
          return this.deleteProject(args.gid);
        case "get_projects":
          return this.getProjects(args.workspace, args.team, args.fields, args.limit, args.offset);
        case "get_project_sections":
          return this.getProjectSections(args.project);
        case "create_project_section":
          return this.createProjectSection(args.project, args.name);
        case "duplicate_project":
          return this.duplicateProject(args.gid, args.name);
        case "get_project_templates":
          return this.getProjectTemplates(args.workspace, args.team);
        case "create_project_from_template":
          return this.createProjectFromTemplate(args.template_gid, args.name, args.team);
        case "get_workspace_by_name":
          return this.getWorkspaceByName(args.name);
        case "get_team_by_name":
          return this.getTeamByName(args.workspace, args.name);
          
        // User operations
        case "get_user":
          return this.getUser(args.gid, args.fields);
        case "get_users":
          return this.getUsers(args.workspace, args.team, args.fields, args.limit, args.offset);
        case "get_user_tasks":
          return this.getUserTasks(args.user, args.workspace, args.fields, args.limit, args.offset);
        case "get_current_user":
          return this.getCurrentUser(args.fields);
          
        // Team operations
        case "get_team":
          return this.getTeam(args.gid, args.fields);
        case "get_teams":
          return this.getTeams(args.workspace, args.fields, args.limit, args.offset);
        case "get_team_users":
          return this.getTeamUsers(args.team, args.fields, args.limit, args.offset);
        case "add_user_to_team":
          return this.addUserToTeam(args.team, args.user);
        case "remove_user_from_team":
          return this.removeUserFromTeam(args.team, args.user);
          
        // Workspace operations
        case "get_workspace":
          return this.getWorkspace(args.gid, args.fields);
        case "get_workspaces":
          return this.getWorkspaces(args.fields, args.limit, args.offset);
        case "get_workspace_users":
          return this.getWorkspaceUsers(args.workspace, args.fields, args.limit, args.offset);
        case "get_workspace_projects":
          return this.getWorkspaceProjects(args.workspace, args.fields, args.limit, args.offset);
          
        // Webhook operations
        case "create_webhook":
          return this.createWebhook(args.webhookData);
        case "get_webhook":
          return this.getWebhook(args.gid);
        case "update_webhook":
          return this.updateWebhook(args.gid, args.webhookData);
        case "delete_webhook":
          return this.deleteWebhook(args.gid);
        case "get_webhooks":
          return this.getWebhooks(args.workspace, args.limit, args.offset);
          
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
        'Accept': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify({ data });
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Task operations
  private async getTask(gid: string, fields?: string[]): Promise<any> {
    const fieldsParam = fields ? `?opt_fields=${fields.join(',')}` : '';
    const result = await this.makeRequest(`/tasks/${gid}${fieldsParam}`);
    return {
      success: true,
      action: "get_task",
      data: result.data
    };
  }

  private async createTask(taskData: any): Promise<any> {
    const result = await this.makeRequest('/tasks', 'POST', taskData);
    return {
      success: true,
      action: "create_task",
      data: result.data
    };
  }

  private async updateTask(gid: string, taskData: any): Promise<any> {
    const result = await this.makeRequest(`/tasks/${gid}`, 'PUT', taskData);
    return {
      success: true,
      action: "update_task",
      data: result.data
    };
  }

  private async deleteTask(gid: string): Promise<any> {
    await this.makeRequest(`/tasks/${gid}`, 'DELETE');
    return {
      success: true,
      action: "delete_task",
      data: { gid, deleted: true }
    };
  }

  private async getTasksForProject(projectGid: string, fields?: string[], limit?: number, offset?: string): Promise<any> {
    let endpoint = `/projects/${projectGid}/tasks`;
    const params = new URLSearchParams();
    
    if (fields) params.append('opt_fields', fields.join(','));
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_tasks_for_project",
      data: result.data,
      next_page: result.next_page
    };
  }

  private async searchTasks(workspaceGid: string, searchParams: any): Promise<any> {
    const params = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(`${key}.any`, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    const result = await this.makeRequest(`/workspaces/${workspaceGid}/tasks/search?${params.toString()}`);
    return {
      success: true,
      action: "search_tasks",
      data: result.data
    };
  }

  private async addTaskToProject(taskGid: string, projectGid: string): Promise<any> {
    const result = await this.makeRequest(`/tasks/${taskGid}/addProject`, 'POST', { project: projectGid });
    return {
      success: true,
      action: "add_task_to_project",
      data: result.data
    };
  }

  private async removeTaskFromProject(taskGid: string, projectGid: string): Promise<any> {
    const result = await this.makeRequest(`/tasks/${taskGid}/removeProject`, 'POST', { project: projectGid });
    return {
      success: true,
      action: "remove_task_from_project",
      data: result.data
    };
  }

  private async getTaskStories(taskGid: string): Promise<any> {
    const result = await this.makeRequest(`/tasks/${taskGid}/stories`);
    return {
      success: true,
      action: "get_task_stories",
      data: result.data
    };
  }

  private async addTaskComment(taskGid: string, comment: string): Promise<any> {
    const result = await this.makeRequest(`/tasks/${taskGid}/stories`, 'POST', { 
      text: comment,
      type: 'comment'
    });
    return {
      success: true,
      action: "add_task_comment",
      data: result.data
    };
  }

  // Project operations
  private async getProject(gid: string, fields?: string[]): Promise<any> {
    const fieldsParam = fields ? `?opt_fields=${fields.join(',')}` : '';
    const result = await this.makeRequest(`/projects/${gid}${fieldsParam}`);
    return {
      success: true,
      action: "get_project",
      data: result.data
    };
  }

  private async createProject(name: string, workspace: string, team: string, projectData: any = {}): Promise<any> {
    const data = {
      ...projectData,
      name,
      workspace,
      team
    };
    const result = await this.makeRequest('/projects', 'POST', data);
    return {
      success: true,
      action: "create_project",
      data: result.data
    };
  }

  private async updateProject(gid: string, projectData: any): Promise<any> {
    const result = await this.makeRequest(`/projects/${gid}`, 'PUT', projectData);
    return {
      success: true,
      action: "update_project",
      data: result.data
    };
  }

  private async deleteProject(gid: string): Promise<any> {
    await this.makeRequest(`/projects/${gid}`, 'DELETE');
    return {
      success: true,
      action: "delete_project",
      data: { gid, deleted: true }
    };
  }

  private async getProjects(workspaceGid?: string, teamGid?: string, archived?: boolean, fields?: string[], limit?: number, offset?: string): Promise<any> {
    let endpoint = '/projects';
    const params = new URLSearchParams();
    
    if (workspaceGid) params.append('workspace', workspaceGid);
    if (teamGid) params.append('team', teamGid);
    if (archived !== undefined) params.append('archived', String(archived));
    if (fields) params.append('opt_fields', fields.join(','));
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_projects",
      data: result.data,
      next_page: result.next_page
    };
  }

  private async getProjectSections(projectGid: string): Promise<any> {
    const result = await this.makeRequest(`/projects/${projectGid}/sections`);
    return {
      success: true,
      action: "get_project_sections",
      data: result.data
    };
  }

  private async createProjectSection(projectGid: string, name: string): Promise<any> {
    const result = await this.makeRequest(`/projects/${projectGid}/sections`, 'POST', { name });
    return {
      success: true,
      action: "create_project_section",
      data: result.data
    };
  }

  private async duplicateProject(gid: string, name: string): Promise<any> {
    const result = await this.makeRequest(`/projects/${gid}/duplicate`, 'POST', { name });
    return {
      success: true,
      action: "duplicate_project",
      data: result.data
    };
  }

  private async getProjectTemplates(workspaceGid: string, teamGid?: string): Promise<any> {
    let endpoint = `/project_templates`;
    const params = new URLSearchParams();
    if (workspaceGid) params.append('workspace', workspaceGid);
    if (teamGid) params.append('team', teamGid);
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_project_templates",
      data: result.data
    };
  }

  private async createProjectFromTemplate(templateGid: string, name: string, teamGid: string): Promise<any> {
    const data = {
      name,
      team: teamGid,
      public: false
    };
    const result = await this.makeRequest(`/project_templates/${templateGid}/instantiateProject`, 'POST', data);
    return {
      success: true,
      action: "create_project_from_template",
      data: result.data
    };
  }

  private async getWorkspaceByName(name: string): Promise<any> {
    const workspaces = await this.getWorkspaces();
    const workspace = workspaces.data.find((ws: any) => ws.name.toLowerCase() === name.toLowerCase());
    if (!workspace) {
      throw new Error(`Workspace with name "${name}" not found.`);
    }
    return {
      success: true,
      action: "get_workspace_by_name",
      gid: workspace.gid,
      name: workspace.name
    };
  }

  private async getTeamByName(workspaceGid: string, name: string): Promise<any> {
    const teams = await this.getTeams(workspaceGid);
    const team = teams.data.find((t: any) => t.name.toLowerCase() === name.toLowerCase());
    if (!team) {
      throw new Error(`Team with name "${name}" not found in workspace ${workspaceGid}.`);
    }
    return {
      success: true,
      action: "get_team_by_name",
      gid: team.gid,
      name: team.name
    };
  }

  // User operations
  private async getUser(gid: string, fields?: string[]): Promise<any> {
    const fieldsParam = fields ? `?opt_fields=${fields.join(',')}` : '';
    const result = await this.makeRequest(`/users/${gid}${fieldsParam}`);
    return {
      success: true,
      action: "get_user",
      data: result.data
    };
  }

  private async getUsers(workspaceGid?: string, teamGid?: string, fields?: string[], limit?: number, offset?: string): Promise<any> {
    let endpoint = '/users';
    const params = new URLSearchParams();
    
    if (workspaceGid) params.append('workspace', workspaceGid);
    if (teamGid) params.append('team', teamGid);
    if (fields) params.append('opt_fields', fields.join(','));
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_users",
      data: result.data,
      next_page: result.next_page
    };
  }

  private async getUserTasks(userGid: string, workspaceGid: string, fields?: string[], limit?: number, offset?: string): Promise<any> {
    let endpoint = `/users/${userGid}/user_task_list`;
    const params = new URLSearchParams();
    
    params.append('workspace', workspaceGid);
    if (fields) params.append('opt_fields', fields.join(','));
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset);
    
    endpoint += `?${params.toString()}`;
    
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_user_tasks",
      data: result.data,
      next_page: result.next_page
    };
  }

  private async getCurrentUser(fields?: string[]): Promise<any> {
    const fieldsParam = fields ? `?opt_fields=${fields.join(',')}` : '';
    const result = await this.makeRequest(`/users/me${fieldsParam}`);
    return {
      success: true,
      action: "get_current_user",
      data: result.data
    };
  }

  // Team operations
  private async getTeam(gid: string, fields?: string[]): Promise<any> {
    const fieldsParam = fields ? `?opt_fields=${fields.join(',')}` : '';
    const result = await this.makeRequest(`/teams/${gid}${fieldsParam}`);
    return {
      success: true,
      action: "get_team",
      data: result.data
    };
  }

  private async getTeams(workspaceGid: string, fields?: string[], limit?: number, offset?: string): Promise<any> {
    let endpoint = `/workspaces/${workspaceGid}/teams`;
    const params = new URLSearchParams();
    
    if (fields) params.append('opt_fields', fields.join(','));
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_teams",
      data: result.data,
      next_page: result.next_page
    };
  }

  private async getTeamUsers(teamGid: string, fields?: string[], limit?: number, offset?: string): Promise<any> {
    let endpoint = `/teams/${teamGid}/users`;
    const params = new URLSearchParams();
    
    if (fields) params.append('opt_fields', fields.join(','));
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_team_users",
      data: result.data,
      next_page: result.next_page
    };
  }

  private async addUserToTeam(teamGid: string, userGid: string): Promise<any> {
    const result = await this.makeRequest(`/teams/${teamGid}/addUser`, 'POST', { user: userGid });
    return {
      success: true,
      action: "add_user_to_team",
      data: result.data
    };
  }

  private async removeUserFromTeam(teamGid: string, userGid: string): Promise<any> {
    const result = await this.makeRequest(`/teams/${teamGid}/removeUser`, 'POST', { user: userGid });
    return {
      success: true,
      action: "remove_user_from_team",
      data: result.data
    };
  }

  // Workspace operations
  private async getWorkspace(gid: string, fields?: string[]): Promise<any> {
    const fieldsParam = fields ? `?opt_fields=${fields.join(',')}` : '';
    const result = await this.makeRequest(`/workspaces/${gid}${fieldsParam}`);
    return {
      success: true,
      action: "get_workspace",
      data: result.data
    };
  }

  private async getWorkspaces(fields?: string[], limit?: number, offset?: string): Promise<any> {
    let endpoint = '/workspaces';
    const params = new URLSearchParams();
    
    if (fields) params.append('opt_fields', fields.join(','));
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_workspaces",
      data: result.data,
      next_page: result.next_page
    };
  }

  private async getWorkspaceUsers(workspaceGid: string, fields?: string[], limit?: number, offset?: string): Promise<any> {
    let endpoint = `/workspaces/${workspaceGid}/users`;
    const params = new URLSearchParams();
    
    if (fields) params.append('opt_fields', fields.join(','));
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_workspace_users",
      data: result.data,
      next_page: result.next_page
    };
  }

  private async getWorkspaceProjects(workspaceGid: string, fields?: string[], limit?: number, offset?: string): Promise<any> {
    let endpoint = `/workspaces/${workspaceGid}/projects`;
    const params = new URLSearchParams();
    
    if (fields) params.append('opt_fields', fields.join(','));
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_workspace_projects",
      data: result.data,
      next_page: result.next_page
    };
  }

  // Webhook operations
  private async createWebhook(webhookData: any): Promise<any> {
    const result = await this.makeRequest('/webhooks', 'POST', webhookData);
    return {
      success: true,
      action: "create_webhook",
      data: result.data
    };
  }

  private async getWebhook(gid: string): Promise<any> {
    const result = await this.makeRequest(`/webhooks/${gid}`);
    return {
      success: true,
      action: "get_webhook",
      data: result.data
    };
  }

  private async updateWebhook(gid: string, webhookData: any): Promise<any> {
    const result = await this.makeRequest(`/webhooks/${gid}`, 'PUT', webhookData);
    return {
      success: true,
      action: "update_webhook",
      data: result.data
    };
  }

  private async deleteWebhook(gid: string): Promise<any> {
    await this.makeRequest(`/webhooks/${gid}`, 'DELETE');
    return {
      success: true,
      action: "delete_webhook",
      data: { gid, deleted: true }
    };
  }

  private async getWebhooks(workspaceGid: string, limit?: number, offset?: string): Promise<any> {
    let endpoint = `/webhooks`;
    const params = new URLSearchParams();
    
    params.append('workspace', workspaceGid);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset);
    
    endpoint += `?${params.toString()}`;
    
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_webhooks",
      data: result.data,
      next_page: result.next_page
    };
  }

  // Utility methods
  public async validateConnection(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
  }
}

// Usage example:
// const asanaTool = new AsanaTool('your-access-token');
// const result = await asanaTool.execute({
//   action: 'create_task',
//   taskData: {
//     name: 'New Task',
//     notes: 'Task description',
//     projects: ['project-gid']
//   }
// });
