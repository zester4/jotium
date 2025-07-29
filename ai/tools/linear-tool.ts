import { FunctionDeclaration, Type } from "@google/genai";

export class LinearManagementTool {
  private apiKey: string;
  private baseUrl: string = "https://api.linear.app/graphql";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "linear_management",
      description: "Comprehensive Linear project management tool for CRUD operations on issues, projects, teams, cycles, users, comments, attachments, and more. Supports advanced querying, filtering, and batch operations.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          operation: {
            type: Type.STRING,
            description: "The operation to perform",
            enum: [
              // Issue Operations
              "create_issue", "update_issue", "delete_issue", "get_issue", "list_issues", "search_issues",
              "assign_issue", "unassign_issue", "archive_issue", "unarchive_issue", "move_issue",
              "duplicate_issue", "link_issues", "unlink_issues", "bulk_update_issues",
              
              // Project Operations
              "create_project", "update_project", "delete_project", "get_project", "list_projects",
              "archive_project", "unarchive_project", "add_project_member", "remove_project_member",
              "get_project_issues", "create_project_milestone", "update_project_milestone",
              
              // Team Operations
              "create_team", "update_team", "delete_team", "get_team", "list_teams",
              "add_team_member", "remove_team_member", "update_team_member_role",
              "get_team_issues", "get_team_projects", "create_team_template",
              
              // Cycle Operations
              "create_cycle", "update_cycle", "delete_cycle", "get_cycle", "list_cycles",
              "add_issue_to_cycle", "remove_issue_from_cycle", "complete_cycle",
              "get_cycle_analytics", "archive_cycle",
              
              // User Operations
              "get_user", "list_users", "get_current_user", "update_user_settings",
              "get_user_issues", "get_user_assigned_issues", "get_user_created_issues",
              
              // Comment Operations
              "create_comment", "update_comment", "delete_comment", "get_comment", "list_comments",
              "react_to_comment", "unreact_to_comment",
              
              // Attachment Operations
              "create_attachment", "delete_attachment", "get_attachment", "list_attachments",
              "upload_file_attachment",
              
              // Label Operations
              "create_label", "update_label", "delete_label", "get_label", "list_labels",
              "add_label_to_issue", "remove_label_from_issue",
              
              // Workflow State Operations
              "create_workflow_state", "update_workflow_state", "delete_workflow_state",
              "get_workflow_state", "list_workflow_states", "move_issue_to_state",
              
              // Organization Operations
              "get_organization", "update_organization", "get_organization_settings",
              "list_organization_members", "invite_organization_member",
              
              // Analytics & Reporting
              "get_issue_analytics", "get_team_analytics", "get_project_analytics",
              "get_cycle_analytics", "generate_report", "export_data",
              
              // Integration Operations
              "create_webhook", "update_webhook", "delete_webhook", "list_webhooks",
              "test_webhook", "get_integration_settings",
              
              // Advanced Operations
              "batch_operations", "import_data", "sync_external_data",
              "custom_graphql_query", "custom_graphql_mutation"
            ]
          },
          // Common parameters
          id: {
            type: Type.STRING,
            description: "ID of the entity (issue, project, team, etc.)"
          },
          ids: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of IDs for batch operations"
          },
          
          // Issue-specific parameters
          title: {
            type: Type.STRING,
            description: "Issue title"
          },
          description: {
            type: Type.STRING,
            description: "Issue description (supports markdown)"
          },
          priority: {
            type: Type.NUMBER,
            description: "Issue priority (0=No priority, 1=Urgent, 2=High, 3=Medium, 4=Low)"
          },
          assigneeId: {
            type: Type.STRING,
            description: "ID of the user to assign the issue to"
          },
          teamId: {
            type: Type.STRING,
            description: "ID of the team"
          },
          projectId: {
            type: Type.STRING,
            description: "ID of the project"
          },
          cycleId: {
            type: Type.STRING,
            description: "ID of the cycle"
          },
          stateId: {
            type: Type.STRING,
            description: "ID of the workflow state"
          },
          labelIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of label IDs to apply to the issue"
          },
          estimate: {
            type: Type.NUMBER,
            description: "Story points estimate for the issue"
          },
          dueDate: {
            type: Type.STRING,
            description: "Due date in ISO format (YYYY-MM-DD)"
          },
          parentId: {
            type: Type.STRING,
            description: "ID of the parent issue (for sub-issues)"
          },
          
          // Project-specific parameters
          name: {
            type: Type.STRING,
            description: "Name of the project/team/cycle"
          },
          key: {
            type: Type.STRING,
            description: "Unique key identifier"
          },
          icon: {
            type: Type.STRING,
            description: "Icon emoji for the project/team"
          },
          color: {
            type: Type.STRING,
            description: "Hex color code"
          },
          leadId: {
            type: Type.STRING,
            description: "ID of the project/team lead"
          },
          targetDate: {
            type: Type.STRING,
            description: "Target completion date in ISO format"
          },
          
          // Cycle-specific parameters
          startsAt: {
            type: Type.STRING,
            description: "Cycle start date in ISO format"
          },
          endsAt: {
            type: Type.STRING,
            description: "Cycle end date in ISO format"
          },
          
          // Comment-specific parameters
          body: {
            type: Type.STRING,
            description: "Comment body (supports markdown)"
          },
          issueId: {
            type: Type.STRING,
            description: "ID of the issue to comment on"
          },
          
          // Filtering and querying parameters
          filter: {
            type: Type.OBJECT,
            properties: {
              assignee: { type: Type.STRING },
              team: { type: Type.STRING },
              project: { type: Type.STRING },
              cycle: { type: Type.STRING },
              state: { type: Type.STRING },
              priority: { type: Type.NUMBER },
              labels: { type: Type.ARRAY, items: { type: Type.STRING } },
              createdAt: { type: Type.OBJECT },
              updatedAt: { type: Type.OBJECT },
              completedAt: { type: Type.OBJECT },
              estimate: { type: Type.OBJECT },
              search: { type: Type.STRING }
            },
            description: "Filter criteria for queries"
          },
          orderBy: {
            type: Type.STRING,
            description: "Field to order results by",
            enum: ["createdAt", "updatedAt", "priority", "title", "estimate", "dueDate"]
          },
          orderDirection: {
            type: Type.STRING,
            description: "Order direction",
            enum: ["ASC", "DESC"]
          },
          first: {
            type: Type.NUMBER,
            description: "Number of results to return (pagination)"
          },
          after: {
            type: Type.STRING,
            description: "Cursor for pagination"
          },
          
          // Attachment parameters
          url: {
            type: Type.STRING,
            description: "URL for the attachment"
          },
          subtitle: {
            type: Type.STRING,
            description: "Subtitle for the attachment"
          },
          
          // Label parameters
          labelName: {
            type: Type.STRING,
            description: "Label name"
          },
          
          // Workflow state parameters
          stateName: {
            type: Type.STRING,
            description: "Workflow state name"
          },
          stateType: {
            type: Type.STRING,
            description: "Type of workflow state",
            enum: ["backlog", "unstarted", "started", "completed", "canceled"]
          },
          
          // User parameters
          email: {
            type: Type.STRING,
            description: "User email address"
          },
          displayName: {
            type: Type.STRING,
            description: "User display name"
          },
          
          // Webhook parameters
          webhookUrl: {
            type: Type.STRING,
            description: "Webhook URL endpoint"
          },
          events: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of events to subscribe to"
          },
          
          // Analytics parameters
          startDate: {
            type: Type.STRING,
            description: "Start date for analytics in ISO format"
          },
          endDate: {
            type: Type.STRING,
            description: "End date for analytics in ISO format"
          },
          metrics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Metrics to include in analytics"
          },
          
          // Batch operation parameters
          operations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                operation: { type: Type.STRING },
                data: { type: Type.OBJECT }
              }
            },
            description: "Array of operations for batch processing"
          },
          
          // Custom GraphQL parameters
          query: {
            type: Type.STRING,
            description: "Custom GraphQL query string"
          },
          mutation: {
            type: Type.STRING,
            description: "Custom GraphQL mutation string"
          },
          variables: {
            type: Type.OBJECT,
            description: "Variables for custom GraphQL operations"
          },
          
          // Export parameters
          format: {
            type: Type.STRING,
            description: "Export format",
            enum: ["json", "csv", "markdown", "pdf"]
          },
          includeComments: {
            type: Type.BOOLEAN,
            description: "Include comments in export"
          },
          includeAttachments: {
            type: Type.BOOLEAN,
            description: "Include attachments in export"
          }
        },
        required: ["operation"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`🔧 Linear operation: ${args.operation}`);
      
      switch (args.operation) {
        // Issue Operations
        case "create_issue":
          return await this.createIssue(args);
        case "update_issue":
          return await this.updateIssue(args);
        case "delete_issue":
          return await this.deleteIssue(args);
        case "get_issue":
          return await this.getIssue(args);
        case "list_issues":
          return await this.listIssues(args);
        case "search_issues":
          return await this.searchIssues(args);
        case "assign_issue":
          return await this.assignIssue(args);
        case "unassign_issue":
          return await this.unassignIssue(args);
        case "archive_issue":
          return await this.archiveIssue(args);
        case "unarchive_issue":
          return await this.unarchiveIssue(args);
        case "move_issue":
          return await this.moveIssue(args);
        case "duplicate_issue":
          return await this.duplicateIssue(args);
        case "link_issues":
          return await this.linkIssues(args);
        case "unlink_issues":
          return await this.unlinkIssues(args);
        case "bulk_update_issues":
          return await this.bulkUpdateIssues(args);

        // Project Operations
        case "create_project":
          return await this.createProject(args);
        case "update_project":
          return await this.updateProject(args);
        case "delete_project":
          return await this.deleteProject(args);
        case "get_project":
          return await this.getProject(args);
        case "list_projects":
          return await this.listProjects(args);
        case "archive_project":
          return await this.archiveProject(args);
        case "unarchive_project":
          return await this.unarchiveProject(args);
        case "add_project_member":
          return await this.addProjectMember(args);
        case "remove_project_member":
          return await this.removeProjectMember(args);
        case "get_project_issues":
          return await this.getProjectIssues(args);
        case "create_project_milestone":
          return await this.createProjectMilestone(args);
        case "update_project_milestone":
          return await this.updateProjectMilestone(args);

        // Team Operations
        case "create_team":
          return await this.createTeam(args);
        case "update_team":
          return await this.updateTeam(args);
        case "delete_team":
          return await this.deleteTeam(args);
        case "get_team":
          return await this.getTeam(args);
        case "list_teams":
          return await this.listTeams(args);
        case "add_team_member":
          return await this.addTeamMember(args);
        case "remove_team_member":
          return await this.removeTeamMember(args);
        case "update_team_member_role":
          return await this.updateTeamMemberRole(args);
        case "get_team_issues":
          return await this.getTeamIssues(args);
        case "get_team_projects":
          return await this.getTeamProjects(args);
        case "create_team_template":
          return await this.createTeamTemplate(args);

        // Cycle Operations
        case "create_cycle":
          return await this.createCycle(args);
        case "update_cycle":
          return await this.updateCycle(args);
        case "delete_cycle":
          return await this.deleteCycle(args);
        case "get_cycle":
          return await this.getCycle(args);
        case "list_cycles":
          return await this.listCycles(args);
        case "add_issue_to_cycle":
          return await this.addIssueToCycle(args);
        case "remove_issue_from_cycle":
          return await this.removeIssueFromCycle(args);
        case "complete_cycle":
          return await this.completeCycle(args);
        case "archive_cycle":
          return await this.archiveCycle(args);

        // User Operations
        case "get_user":
          return await this.getUser(args);
        case "list_users":
          return await this.listUsers(args);
        case "get_current_user":
          return await this.getCurrentUser(args);
        case "update_user_settings":
          return await this.updateUserSettings(args);
        case "get_user_issues":
          return await this.getUserIssues(args);
        case "get_user_assigned_issues":
          return await this.getUserAssignedIssues(args);
        case "get_user_created_issues":
          return await this.getUserCreatedIssues(args);

        // Comment Operations
        case "create_comment":
          return await this.createComment(args);
        case "update_comment":
          return await this.updateComment(args);
        case "delete_comment":
          return await this.deleteComment(args);
        case "get_comment":
          return await this.getComment(args);
        case "list_comments":
          return await this.listComments(args);
        case "react_to_comment":
          return await this.reactToComment(args);
        case "unreact_to_comment":
          return await this.unreactToComment(args);

        // Attachment Operations
        case "create_attachment":
          return await this.createAttachment(args);
        case "delete_attachment":
          return await this.deleteAttachment(args);
        case "get_attachment":
          return await this.getAttachment(args);
        case "list_attachments":
          return await this.listAttachments(args);
        case "upload_file_attachment":
          return await this.uploadFileAttachment(args);

        // Label Operations
        case "create_label":
          return await this.createLabel(args);
        case "update_label":
          return await this.updateLabel(args);
        case "delete_label":
          return await this.deleteLabel(args);
        case "get_label":
          return await this.getLabel(args);
        case "list_labels":
          return await this.listLabels(args);
        case "add_label_to_issue":
          return await this.addLabelToIssue(args);
        case "remove_label_from_issue":
          return await this.removeLabelFromIssue(args);

        // Workflow State Operations
        case "create_workflow_state":
          return await this.createWorkflowState(args);
        case "update_workflow_state":
          return await this.updateWorkflowState(args);
        case "delete_workflow_state":
          return await this.deleteWorkflowState(args);
        case "get_workflow_state":
          return await this.getWorkflowState(args);
        case "list_workflow_states":
          return await this.listWorkflowStates(args);
        case "move_issue_to_state":
          return await this.moveIssueToState(args);

        // Organization Operations
        case "get_organization":
          return await this.getOrganization(args);
        case "update_organization":
          return await this.updateOrganization(args);
        case "get_organization_settings":
          return await this.getOrganizationSettings(args);
        case "list_organization_members":
          return await this.listOrganizationMembers(args);
        case "invite_organization_member":
          return await this.inviteOrganizationMember(args);

        // Analytics & Reporting
        case "get_issue_analytics":
          return await this.getIssueAnalytics(args);
        case "get_team_analytics":
          return await this.getTeamAnalytics(args);
        case "get_project_analytics":
          return await this.getProjectAnalytics(args);
        case "get_cycle_analytics":
          return await this.getCycleAnalytics(args);
        case "generate_report":
          return await this.generateReport(args);
        case "export_data":
          return await this.exportData(args);

        // Integration Operations
        case "create_webhook":
          return await this.createWebhook(args);
        case "update_webhook":
          return await this.updateWebhook(args);
        case "delete_webhook":
          return await this.deleteWebhook(args);
        case "list_webhooks":
          return await this.listWebhooks(args);
        case "test_webhook":
          return await this.testWebhook(args);
        case "get_integration_settings":
          return await this.getIntegrationSettings(args);

        // Advanced Operations
        case "batch_operations":
          return await this.batchOperations(args);
        case "import_data":
          return await this.importData(args);
        case "sync_external_data":
          return await this.syncExternalData(args);
        case "custom_graphql_query":
          return await this.customGraphQLQuery(args);
        case "custom_graphql_mutation":
          return await this.customGraphQLMutation(args);

        default:
          throw new Error(`Unsupported operation: ${args.operation}`);
      }
    } catch (error: unknown) {
      console.error(`❌ Linear operation failed:`, error);
      return {
        success: false,
        error: `Linear operation failed: ${error instanceof Error ? error.message : String(error)}`,
        operation: args.operation
      };
    }
  }

  private async makeGraphQLRequest(query: string, variables: any = {}): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL Error: ${result.errors.map((e: any) => e.message).join(', ')}`);
    }
    
    return result.data;
  }

  // Issue Operations
  private async createIssue(args: any): Promise<any> {
    const mutation = `
      mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            description
            priority
            state { id name }
            assignee { id displayName }
            team { id name }
            project { id name }
            cycle { id name }
            labels { nodes { id name } }
            createdAt
            updatedAt
          }
        }
      }
    `;

    const input: any = {
      title: args.title,
      teamId: args.teamId
    };

    if (args.description) input.description = args.description;
    if (args.priority !== undefined) input.priority = args.priority;
    if (args.assigneeId) input.assigneeId = args.assigneeId;
    if (args.projectId) input.projectId = args.projectId;
    if (args.cycleId) input.cycleId = args.cycleId;
    if (args.stateId) input.stateId = args.stateId;
    if (args.labelIds) input.labelIds = args.labelIds;
    if (args.estimate) input.estimate = args.estimate;
    if (args.dueDate) input.dueDate = args.dueDate;
    if (args.parentId) input.parentId = args.parentId;

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "create_issue",
      data: data.issueCreate
    };
  }

  private async updateIssue(args: any): Promise<any> {
    const mutation = `
      mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
            identifier
            title
            description
            priority
            state { id name }
            assignee { id displayName }
            updatedAt
          }
        }
      }
    `;

    const input: any = {};
    if (args.title) input.title = args.title;
    if (args.description !== undefined) input.description = args.description;
    if (args.priority !== undefined) input.priority = args.priority;
    if (args.assigneeId !== undefined) input.assigneeId = args.assigneeId;
    if (args.stateId) input.stateId = args.stateId;
    if (args.labelIds) input.labelIds = args.labelIds;
    if (args.estimate !== undefined) input.estimate = args.estimate;
    if (args.dueDate !== undefined) input.dueDate = args.dueDate;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id, input });
    return {
      success: true,
      operation: "update_issue",
      data: data.issueUpdate
    };
  }

  private async getIssue(args: any): Promise<any> {
    const query = `
      query Issue($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          description
          priority
          estimate
          dueDate
          state { id name type }
          assignee { id displayName email }
          creator { id displayName }
          team { id name key }
          project { id name }
          cycle { id name }
          labels { nodes { id name color } }
          comments { nodes { id body user { displayName } createdAt } }
          attachments { nodes { id title url } }
          createdAt
          updatedAt
          completedAt
          archivedAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { id: args.id });
    return {
      success: true,
      operation: "get_issue",
      data: data.issue
    };
  }

  private async listIssues(args: any): Promise<any> {
    const query = `
      query Issues($filter: IssueFilter, $orderBy: PaginationOrderBy, $first: Int, $after: String) {
        issues(filter: $filter, orderBy: $orderBy, first: $first, after: $after) {
          nodes {
            id
            identifier
            title
            priority
            state { id name }
            assignee { id displayName }
            team { id name }
            project { id name }
            labels { nodes { id name } }
            createdAt
            updatedAt
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const variables: any = {};
    if (args.filter) variables.filter = args.filter;
    if (args.orderBy) variables.orderBy = { field: args.orderBy, direction: args.orderDirection || "ASC" };
    if (args.first) variables.first = args.first;
    if (args.after) variables.after = args.after;

    const data = await this.makeGraphQLRequest(query, variables);
    return {
      success: true,
      operation: "list_issues",
      data: data.issues
    };
  }

  private async searchIssues(args: any): Promise<any> {
    const query = `
      query SearchIssues($query: String!, $first: Int) {
        searchIssues(query: $query, first: $first) {
          nodes {
            id
            identifier
            title
            priority
            state { id name }
            assignee { id displayName }
            team { id name }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { 
      query: args.filter?.search || args.title, 
      first: args.first || 50 
    });
    return {
      success: true,
      operation: "search_issues",
      data: data.searchIssues
    };
  }

  private async assignIssue(args: any): Promise<any> {
    return await this.updateIssue({ id: args.id, assigneeId: args.assigneeId });
  }

  private async bulkUpdateIssues(args: any): Promise<any> {
    const results = [];
    for (const id of args.ids) {
      try {
        const result = await this.updateIssue({ ...args, id });
        results.push({ id, ...result });
      } catch (error) {
        results.push({ id, success: false, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return {
      success: true,
      operation: "bulk_update_issues",
      data: results
    };
  }

  // Project Operations
  private async createProject(args: any): Promise<any> {
    const mutation = `
      mutation ProjectCreate($input: ProjectCreateInput!) {
        projectCreate(input: $input) {
          success
          project {
            id
            name
            description
            icon
            color
            state
            lead { id displayName }
            targetDate
            createdAt
          }
        }
      }
    `;

    const input: any = {
      name: args.name,
      teamIds: args.teamId ? [args.teamId] : []
    };

    if (args.description) input.description = args.description;
    if (args.icon) input.icon = args.icon;
    if (args.color) input.color = args.color;
    if (args.leadId) input.leadId = args.leadId;
    if (args.targetDate) input.targetDate = args.targetDate;

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "create_project",
      data: data.projectCreate
    };
  }

  private async getProject(args: any): Promise<any> {
    const query = `
      query Project($id: String!) {
        project(id: $id) {
          id
          name
          description
          icon
          color
          state
          progress
          lead { id displayName }
          members { nodes { id displayName } }
          teams { nodes { id name } }
          issues { nodes { id identifier title state { name } } }
          targetDate
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { id: args.id });
    return {
      success: true,
      operation: "get_project",
      data: data.project
    };
  }

  private async listProjects(args: any): Promise<any> {
    const query = `
      query Projects($filter: ProjectFilter, $first: Int, $after: String) {
        projects(filter: $filter, first: $first, after: $after) {
          nodes {
            id
            name
            description
            state
            progress
            lead { id displayName }
            targetDate
            createdAt
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const variables: any = {};
    if (args.filter) variables.filter = args.filter;
    if (args.first) variables.first = args.first;
    if (args.after) variables.after = args.after;

    const data = await this.makeGraphQLRequest(query, variables);
    return {
      success: true,
      operation: "list_projects",
      data: data.projects
    };
  }

  private async updateProject(args: any): Promise<any> {
    const mutation = `
      mutation ProjectUpdate($id: String!, $input: ProjectUpdateInput!) {
        projectUpdate(id: $id, input: $input) {
          success
          project {
            id
            name
            description
            state
            updatedAt
          }
        }
      }
    `;

    const input: any = {};
    if (args.name) input.name = args.name;
    if (args.description !== undefined) input.description = args.description;
    if (args.state) input.state = args.state;
    if (args.leadId !== undefined) input.leadId = args.leadId;
    if (args.targetDate !== undefined) input.targetDate = args.targetDate;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id, input });
    return {
      success: true,
      operation: "update_project",
      data: data.projectUpdate
    };
  }

  private async getProjectIssues(args: any): Promise<any> {
    const query = `
      query ProjectIssues($id: String!, $first: Int, $after: String) {
        project(id: $id) {
          issues(first: $first, after: $after) {
            nodes {
              id
              identifier
              title
              priority
              state { id name }
              assignee { id displayName }
              createdAt
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { 
      id: args.id, 
      first: args.first || 50,
      after: args.after
    });
    return {
      success: true,
      operation: "get_project_issues",
      data: data.project?.issues
    };
  }

  // Team Operations
  private async createTeam(args: any): Promise<any> {
    const mutation = `
      mutation TeamCreate($input: TeamCreateInput!) {
        teamCreate(input: $input) {
          success
          team {
            id
            name
            key
            description
            icon
            color
            createdAt
          }
        }
      }
    `;

    const input: any = {
      name: args.name,
      key: args.key
    };

    if (args.description) input.description = args.description;
    if (args.icon) input.icon = args.icon;
    if (args.color) input.color = args.color;

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "create_team",
      data: data.teamCreate
    };
  }

  private async getTeam(args: any): Promise<any> {
    const query = `
      query Team($id: String!) {
        team(id: $id) {
          id
          name
          key
          description
          icon
          color
          members { nodes { id displayName email } }
          issues { nodes { id identifier title state { name } } }
          projects { nodes { id name } }
          cycles { nodes { id name } }
          labels { nodes { id name color } }
          states { nodes { id name type } }
          createdAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { id: args.id });
    return {
      success: true,
      operation: "get_team",
      data: data.team
    };
  }

  private async listTeams(args: any): Promise<any> {
    const query = `
      query Teams($filter: TeamFilter, $first: Int, $after: String) {
        teams(filter: $filter, first: $first, after: $after) {
          nodes {
            id
            name
            key
            description
            icon
            color
            createdAt
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const variables: any = {};
    if (args.filter) variables.filter = args.filter;
    if (args.first) variables.first = args.first;
    if (args.after) variables.after = args.after;

    const data = await this.makeGraphQLRequest(query, variables);
    return {
      success: true,
      operation: "list_teams",
      data: data.teams
    };
  }

  private async updateTeam(args: any): Promise<any> {
    const mutation = `
      mutation TeamUpdate($id: String!, $input: TeamUpdateInput!) {
        teamUpdate(id: $id, input: $input) {
          success
          team {
            id
            name
            key
            description
            icon
            color
            updatedAt
          }
        }
      }
    `;

    const input: any = {};
    if (args.name) input.name = args.name;
    if (args.key) input.key = args.key;
    if (args.description !== undefined) input.description = args.description;
    if (args.icon) input.icon = args.icon;
    if (args.color) input.color = args.color;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id, input });
    return {
      success: true,
      operation: "update_team",
      data: data.teamUpdate
    };
  }

  private async addTeamMember(args: any): Promise<any> {
    const mutation = `
      mutation TeamMembershipCreate($input: TeamMembershipCreateInput!) {
        teamMembershipCreate(input: $input) {
          success
          teamMembership {
            id
            user { id displayName }
            team { id name }
          }
        }
      }
    `;

    const input = {
      teamId: args.teamId,
      userId: args.userId
    };

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "add_team_member",
      data: data.teamMembershipCreate
    };
  }

  // Cycle Operations
  private async createCycle(args: any): Promise<any> {
    const mutation = `
      mutation CycleCreate($input: CycleCreateInput!) {
        cycleCreate(input: $input) {
          success
          cycle {
            id
            name
            description
            startsAt
            endsAt
            team { id name }
            createdAt
          }
        }
      }
    `;

    const input: any = {
      name: args.name,
      teamId: args.teamId,
      startsAt: args.startsAt,
      endsAt: args.endsAt
    };

    if (args.description) input.description = args.description;

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "create_cycle",
      data: data.cycleCreate
    };
  }

  private async updateCycle(args: any): Promise<any> {
    const mutation = `
      mutation CycleUpdate($id: String!, $input: CycleUpdateInput!) {
        cycleUpdate(id: $id, input: $input) {
          success
          cycle {
            id
            name
            description
            startsAt
            endsAt
            updatedAt
          }
        }
      }
    `;

    const input: any = {};
    if (args.name) input.name = args.name;
    if (args.description !== undefined) input.description = args.description;
    if (args.startsAt) input.startsAt = args.startsAt;
    if (args.endsAt) input.endsAt = args.endsAt;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id, input });
    return {
      success: true,
      operation: "update_cycle",
      data: data.cycleUpdate
    };
  }

  private async getCycle(args: any): Promise<any> {
    const query = `
      query Cycle($id: String!) {
        cycle(id: $id) {
          id
          name
          description
          startsAt
          endsAt
          progress
          team { id name }
          issues { nodes { id identifier title state { name } assignee { displayName } } }
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { id: args.id });
    return {
      success: true,
      operation: "get_cycle",
      data: data.cycle
    };
  }

  private async listCycles(args: any): Promise<any> {
    const query = `
      query Cycles($filter: CycleFilter, $first: Int, $after: String) {
        cycles(filter: $filter, first: $first, after: $after) {
          nodes {
            id
            name
            description
            startsAt
            endsAt
            progress
            team { id name }
            createdAt
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const variables: any = {};
    if (args.filter) variables.filter = args.filter;
    if (args.first) variables.first = args.first;
    if (args.after) variables.after = args.after;

    const data = await this.makeGraphQLRequest(query, variables);
    return {
      success: true,
      operation: "list_cycles",
      data: data.cycles
    };
  }

  private async getCycleAnalytics(args: any): Promise<any> {
    const query = `
      query CycleAnalytics($id: String!) {
        cycle(id: $id) {
          id
          name
          progress
          completedIssueCount
          inProgressIssueCount
          backlogIssueCount
          completedEstimate
          totalEstimate
          issues {
            nodes {
              id
              state { type }
              estimate
              completedAt
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { id: args.id });
    
    // Calculate additional analytics
    const cycle = data.cycle;
    const issues = cycle.issues.nodes;
    
    const analytics = {
      id: cycle.id,
      name: cycle.name,
      progress: cycle.progress,
      completedIssueCount: cycle.completedIssueCount,
      inProgressIssueCount: cycle.inProgressIssueCount,
      backlogIssueCount: cycle.backlogIssueCount,
      completedEstimate: cycle.completedEstimate,
      totalEstimate: cycle.totalEstimate,
      velocity: cycle.completedEstimate || 0,
      burndownData: this.calculateBurndown(issues),
      completionRate: cycle.totalEstimate ? (cycle.completedEstimate / cycle.totalEstimate) * 100 : 0
    };

    return {
      success: true,
      operation: "get_cycle_analytics",
      data: analytics
    };
  }

  // User Operations
  private async getUser(args: any): Promise<any> {
    const query = `
      query User($id: String!) {
        user(id: $id) {
          id
          displayName
          name
          email
          avatarUrl
          isMe
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { id: args.id });
    return {
      success: true,
      operation: "get_user",
      data: data.user
    };
  }

  private async listUsers(args: any): Promise<any> {
    const query = `
      query Users($filter: UserFilter, $first: Int, $after: String) {
        users(filter: $filter, first: $first, after: $after) {
          nodes {
            id
            displayName
            name
            email
            avatarUrl
            active
            createdAt
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const variables: any = {};
    if (args.filter) variables.filter = args.filter;
    if (args.first) variables.first = args.first;
    if (args.after) variables.after = args.after;

    const data = await this.makeGraphQLRequest(query, variables);
    return {
      success: true,
      operation: "list_users",
      data: data.users
    };
  }

  private async getCurrentUser(args: any): Promise<any> {
    const query = `
      query Viewer {
        viewer {
          id
          displayName
          name
          email
          avatarUrl
          organization { id name }
          teamMemberships { nodes { team { id name } } }
          createdAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query);
    return {
      success: true,
      operation: "get_current_user",
      data: data.viewer
    };
  }

  private async getUserIssues(args: any): Promise<any> {
    const query = `
      query UserIssues($userId: String!, $filter: IssueFilter, $first: Int) {
        issues(filter: $filter, first: $first) {
          nodes {
            id
            identifier
            title
            priority
            state { id name }
            team { id name }
            assignee { id displayName }
            createdAt
            updatedAt
          }
        }
      }
    `;

    const filter = { ...args.filter, assignee: { id: { eq: args.userId } } };
    const data = await this.makeGraphQLRequest(query, { 
      userId: args.userId,
      filter,
      first: args.first || 50
    });

    return {
      success: true,
      operation: "get_user_issues",
      data: data.issues
    };
  }

  // Comment Operations
  private async createComment(args: any): Promise<any> {
    const mutation = `
      mutation CommentCreate($input: CommentCreateInput!) {
        commentCreate(input: $input) {
          success
          comment {
            id
            body
            user { id displayName }
            issue { id identifier }
            createdAt
          }
        }
      }
    `;

    const input = {
      body: args.body,
      issueId: args.issueId
    };

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "create_comment",
      data: data.commentCreate
    };
  }

  private async updateComment(args: any): Promise<any> {
    const mutation = `
      mutation CommentUpdate($id: String!, $input: CommentUpdateInput!) {
        commentUpdate(id: $id, input: $input) {
          success
          comment {
            id
            body
            updatedAt
          }
        }
      }
    `;

    const input = { body: args.body };
    const data = await this.makeGraphQLRequest(mutation, { id: args.id, input });
    return {
      success: true,
      operation: "update_comment",
      data: data.commentUpdate
    };
  }

  private async listComments(args: any): Promise<any> {
    const query = `
      query IssueComments($issueId: String!, $first: Int, $after: String) {
        issue(id: $issueId) {
          comments(first: $first, after: $after) {
            nodes {
              id
              body
              user { id displayName avatarUrl }
              createdAt
              updatedAt
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { 
      issueId: args.issueId,
      first: args.first || 50,
      after: args.after
    });

    return {
      success: true,
      operation: "list_comments",
      data: data.issue?.comments
    };
  }

  // Attachment Operations
  private async createAttachment(args: any): Promise<any> {
    const mutation = `
      mutation AttachmentCreate($input: AttachmentCreateInput!) {
        attachmentCreate(input: $input) {
          success
          attachment {
            id
            title
            url
            subtitle
            createdAt
          }
        }
      }
    `;

    const input: any = {
      title: args.title,
      url: args.url,
      issueId: args.issueId
    };

    if (args.subtitle) input.subtitle = args.subtitle;

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "create_attachment",
      data: data.attachmentCreate
    };
  }

  private async listAttachments(args: any): Promise<any> {
    const query = `
      query IssueAttachments($issueId: String!, $first: Int) {
        issue(id: $issueId) {
          attachments(first: $first) {
            nodes {
              id
              title
              url
              subtitle
              createdAt
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { 
      issueId: args.issueId,
      first: args.first || 50
    });

    return {
      success: true,
      operation: "list_attachments",
      data: data.issue?.attachments
    };
  }

  // Label Operations
  private async createLabel(args: any): Promise<any> {
    const mutation = `
      mutation IssueLabelCreate($input: IssueLabelCreateInput!) {
        issueLabelCreate(input: $input) {
          success
          issueLabel {
            id
            name
            description
            color
            team { id name }
            createdAt
          }
        }
      }
    `;

    const input: any = {
      name: args.labelName || args.name,
      teamId: args.teamId
    };

    if (args.description) input.description = args.description;
    if (args.color) input.color = args.color;

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "create_label",
      data: data.issueLabelCreate
    };
  }

  private async listLabels(args: any): Promise<any> {
    const query = `
      query IssueLabels($filter: IssueLabelFilter, $first: Int) {
        issueLabels(filter: $filter, first: $first) {
          nodes {
            id
            name
            description
            color
            team { id name }
            createdAt
          }
        }
      }
    `;

    const variables: any = {};
    if (args.filter) variables.filter = args.filter;
    if (args.teamId) variables.filter = { ...variables.filter, team: { id: { eq: args.teamId } } };
    variables.first = args.first || 50;

    const data = await this.makeGraphQLRequest(query, variables);
    return {
      success: true,
      operation: "list_labels",
      data: data.issueLabels
    };
  }

  private async addLabelToIssue(args: any): Promise<any> {
    // Get current issue labels first
    const issueQuery = `
      query Issue($id: String!) {
        issue(id: $id) {
          labels { nodes { id } }
        }
      }
    `;

    const issueData = await this.makeGraphQLRequest(issueQuery, { id: args.issueId });
    const currentLabelIds = issueData.issue.labels.nodes.map((label: any) => label.id);
    
    // Add new label to existing labels
    const newLabelIds = [...currentLabelIds, args.labelId];

    return await this.updateIssue({ id: args.issueId, labelIds: newLabelIds });
  }

  // Workflow State Operations
  private async createWorkflowState(args: any): Promise<any> {
    const mutation = `
      mutation WorkflowStateCreate($input: WorkflowStateCreateInput!) {
        workflowStateCreate(input: $input) {
          success
          workflowState {
            id
            name
            description
            type
            color
            team { id name }
            createdAt
          }
        }
      }
    `;

    const input: any = {
      name: args.stateName || args.name,
      type: args.stateType,
      teamId: args.teamId
    };

    if (args.description) input.description = args.description;
    if (args.color) input.color = args.color;

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "create_workflow_state",
      data: data.workflowStateCreate
    };
  }

  private async listWorkflowStates(args: any): Promise<any> {
    const query = `
      query WorkflowStates($filter: WorkflowStateFilter, $first: Int) {
        workflowStates(filter: $filter, first: $first) {
          nodes {
            id
            name
            description
            type
            color
            position
            team { id name }
            createdAt
          }
        }
      }
    `;

    const variables: any = {};
    if (args.filter) variables.filter = args.filter;
    if (args.teamId) variables.filter = { ...variables.filter, team: { id: { eq: args.teamId } } };
    variables.first = args.first || 50;

    const data = await this.makeGraphQLRequest(query, variables);
    return {
      success: true,
      operation: "list_workflow_states",
      data: data.workflowStates
    };
  }

  // Organization Operations
  private async getOrganization(args: any): Promise<any> {
    const query = `
      query Organization {
        organization {
          id
          name
          logoUrl
          urlKey
          userCount
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query);
    return {
      success: true,
      operation: "get_organization",
      data: data.organization
    };
  }

  private async listOrganizationMembers(args: any): Promise<any> {
    const query = `
      query OrganizationMembers($first: Int, $after: String) {
        users(first: $first, after: $after) {
          nodes {
            id
            displayName
            name
            email
            avatarUrl
            active
            admin
            createdAt
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const variables: any = {};
    variables.first = args.first || 50;
    if (args.after) variables.after = args.after;

    const data = await this.makeGraphQLRequest(query, variables);
    return {
      success: true,
      operation: "list_organization_members",
      data: data.users
    };
  }

  // Analytics & Reporting
  private async getIssueAnalytics(args: any): Promise<any> {
    const startDate = args.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = args.endDate || new Date().toISOString();

    const query = `
      query IssueAnalytics($filter: IssueFilter) {
        issues(filter: $filter, first: 1000) {
          nodes {
            id
            priority
            estimate
            state { type }
            team { id name }
            assignee { id }
            createdAt
            updatedAt
            completedAt
          }
        }
      }
    `;

    const filter = {
      ...args.filter,
      createdAt: { gte: startDate, lte: endDate }
    };

    const data = await this.makeGraphQLRequest(query, { filter });
    const issues = data.issues.nodes;

    // Calculate analytics
    const analytics = {
      totalIssues: issues.length,
      completedIssues: issues.filter((i: any) => i.state.type === 'completed').length,
      inProgressIssues: issues.filter((i: any) => i.state.type === 'started').length,
      backlogIssues: issues.filter((i: any) => i.state.type === 'backlog').length,
      totalEstimate: issues.reduce((sum: number, i: any) => sum + (i.estimate || 0), 0),
      completedEstimate: issues
        .filter((i: any) => i.state.type === 'completed')
        .reduce((sum: number, i: any) => sum + (i.estimate || 0), 0),
      averageCompletionTime: this.calculateAverageCompletionTime(issues),
      priorityBreakdown: this.calculatePriorityBreakdown(issues),
      teamBreakdown: this.calculateTeamBreakdown(issues),
      period: { startDate, endDate }
    };

    return {
      success: true,
      operation: "get_issue_analytics",
      data: analytics
    };
  }

  private async getTeamAnalytics(args: any): Promise<any> {
    const query = `
      query TeamAnalytics($teamId: String!) {
        team(id: $teamId) {
          id
          name
          issues(first: 1000) {
            nodes {
              id
              priority
              estimate
              state { type }
              createdAt
              completedAt
            }
          }
          members { nodes { id displayName } }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { teamId: args.teamId });
    const team = data.team;
    const issues = team.issues.nodes;

    const analytics = {
      teamId: team.id,
      teamName: team.name,
      memberCount: team.members.nodes.length,
      totalIssues: issues.length,
      completedIssues: issues.filter((i: any) => i.state.type === 'completed').length,
      velocity: issues
        .filter((i: any) => i.state.type === 'completed')
        .reduce((sum: number, i: any) => sum + (i.estimate || 0), 0),
      averageIssuesPerMember: issues.length / team.members.nodes.length,
      completionRate: issues.length > 0 ? 
        (issues.filter((i: any) => i.state.type === 'completed').length / issues.length) * 100 : 0
    };

    return {
      success: true,
      operation: "get_team_analytics",
      data: analytics
    };
  }

  private async generateReport(args: any): Promise<any> {
    const reportData: any = {
      generatedAt: new Date().toISOString(),
      period: {
        startDate: args.startDate,
        endDate: args.endDate
      }
    };

    // Get requested metrics
    if (args.metrics?.includes('issues')) {
      reportData.issueAnalytics = await this.getIssueAnalytics(args);
    }

    if (args.metrics?.includes('teams') && args.teamId) {
      reportData.teamAnalytics = await this.getTeamAnalytics({ teamId: args.teamId });
    }

    if (args.metrics?.includes('projects') && args.projectId) {
      reportData.projectData = await this.getProject({ id: args.projectId });
    }

    return {
      success: true,
      operation: "generate_report",
      data: reportData
    };
  }

  private async exportData(args: any): Promise<any> {
    const exportData: any = {};

    // Export issues
    const issuesResult = await this.listIssues({
      filter: args.filter,
      first: 1000
    });
    exportData.issues = issuesResult.data.nodes;

    // Include comments if requested
    if (args.includeComments) {
      for (const issue of exportData.issues) {
        const commentsResult = await this.listComments({ issueId: issue.id });
        issue.comments = commentsResult.data?.nodes || [];
      }
    }

    // Include attachments if requested
    if (args.includeAttachments) {
      for (const issue of exportData.issues) {
        const attachmentsResult = await this.listAttachments({ issueId: issue.id });
        issue.attachments = attachmentsResult.data?.nodes || [];
      }
    }

    // Format data based on requested format
    let formattedData;
    switch (args.format) {
      case 'csv':
        formattedData = this.formatAsCSV(exportData.issues);
        break;
      case 'markdown':
        formattedData = this.formatAsMarkdown(exportData.issues);
        break;
      default:
        formattedData = exportData;
    }

    return {
      success: true,
      operation: "export_data",
      data: formattedData,
      format: args.format || 'json',
      exportedAt: new Date().toISOString()
    };
  }

  // Integration Operations
  private async createWebhook(args: any): Promise<any> {
    const mutation = `
      mutation WebhookCreate($input: WebhookCreateInput!) {
        webhookCreate(input: $input) {
          success
          webhook {
            id
            url
            label
            enabled
            createdAt
          }
        }
      }
    `;

    const input: any = {
      url: args.webhookUrl,
      teamId: args.teamId
    };

    if (args.label) input.label = args.label;

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "create_webhook",
      data: data.webhookCreate
    };
  }

  private async listWebhooks(args: any): Promise<any> {
    const query = `
      query Webhooks($first: Int) {
        webhooks(first: $first) {
          nodes {
            id
            url
            label
            enabled
            team { id name }
            createdAt
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { first: args.first || 50 });
    return {
      success: true,
      operation: "list_webhooks",
      data: data.webhooks
    };
  }

  // Advanced Operations
  private async batchOperations(args: any): Promise<any> {
    const results = [];
    
    for (const operation of args.operations) {
      try {
        const result = await this.execute({
          ...operation.data,
          operation: operation.operation
        });
        results.push({
          operation: operation.operation,
          ...result
        });
      } catch (error) {
        results.push({
          operation: operation.operation,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return {
      success: true,
      operation: "batch_operations",
      data: results,
      processedCount: results.length
    };
  }

  private async customGraphQLQuery(args: any): Promise<any> {
    const data = await this.makeGraphQLRequest(args.query, args.variables || {});
    return {
      success: true,
      operation: "custom_graphql_query",
      data
    };
  }

  private async customGraphQLMutation(args: any): Promise<any> {
    const data = await this.makeGraphQLRequest(args.mutation, args.variables || {});
    return {
      success: true,
      operation: "custom_graphql_mutation",
      data
    };
  }

  // Helper methods
  private calculateBurndown(issues: any[]): any[] {
    // Simplified burndown calculation
    const burndownData = [];
    const totalEstimate = issues.reduce((sum, issue) => sum + (issue.estimate || 0), 0);
    let remainingWork = totalEstimate;

    const completedIssues = issues
      .filter(issue => issue.completedAt)
      .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

    for (const issue of completedIssues) {
      remainingWork -= issue.estimate || 0;
      burndownData.push({
        date: issue.completedAt,
        remainingWork,
        completedWork: totalEstimate - remainingWork
      });
    }

    return burndownData;
  }

  private calculateAverageCompletionTime(issues: any[]): number {
    const completedIssues = issues.filter(issue => issue.completedAt && issue.createdAt);
    if (completedIssues.length === 0) return 0;

    const totalTime = completedIssues.reduce((sum, issue) => {
      const created = new Date(issue.createdAt).getTime();
      const completed = new Date(issue.completedAt).getTime();
      return sum + (completed - created);
    }, 0);

    return Math.round(totalTime / completedIssues.length / (1000 * 60 * 60 * 24)); // Convert to days
  }

  private calculatePriorityBreakdown(issues: any[]): any {
    const breakdown = { urgent: 0, high: 0, medium: 0, low: 0, none: 0 };
    
    issues.forEach(issue => {
      switch (issue.priority) {
        case 1: breakdown.urgent++; break;
        case 2: breakdown.high++; break;
        case 3: breakdown.medium++; break;
        case 4: breakdown.low++; break;
        default: breakdown.none++; break;
      }
    });

    return breakdown;
  }

  private calculateTeamBreakdown(issues: any[]): any {
    const breakdown: any = {};
    
    issues.forEach(issue => {
      const teamName = issue.team?.name || 'No Team';
      breakdown[teamName] = (breakdown[teamName] || 0) + 1;
    });

    return breakdown;
  }

  private formatAsCSV(issues: any[]): string {
    if (issues.length === 0) return '';

    const headers = ['ID', 'Identifier', 'Title', 'Priority', 'State', 'Assignee', 'Team', 'Created', 'Updated'];
    const rows = issues.map(issue => [
      issue.id,
      issue.identifier,
      `"${issue.title?.replace(/"/g, '""') || ''}"`,
      issue.priority || '',
      issue.state?.name || '',
      issue.assignee?.displayName || '',
      issue.team?.name || '',
      issue.createdAt,
      issue.updatedAt
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private formatAsMarkdown(issues: any[]): string {
    if (issues.length === 0) return '# No Issues Found\n';

    let markdown = '# Issues Export\n\n';
    
    issues.forEach(issue => {
      markdown += `## ${issue.identifier}: ${issue.title}\n\n`;
      markdown += `- **Priority**: ${this.getPriorityName(issue.priority)}\n`;
      markdown += `- **State**: ${issue.state?.name || 'Unknown'}\n`;
      markdown += `- **Assignee**: ${issue.assignee?.displayName || 'Unassigned'}\n`;
      markdown += `- **Team**: ${issue.team?.name || 'No Team'}\n`;
      markdown += `- **Created**: ${new Date(issue.createdAt).toLocaleDateString()}\n`;
      
      if (issue.description) {
        markdown += `\n${issue.description}\n`;
      }
      
      markdown += '\n---\n\n';
    });

    return markdown;
  }

  private getPriorityName(priority: number): string {
    switch (priority) {
      case 1: return 'Urgent';
      case 2: return 'High';
      case 3: return 'Medium';
      case 4: return 'Low';
      default: return 'No Priority';
    }
  }

  private async deleteIssue(args: any): Promise<any> {
    const mutation = `
      mutation IssueArchive($id: String!) {
        issueArchive(id: $id) {
          success
          issue {
            id
            archivedAt
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id });
    return {
      success: true,
      operation: "delete_issue",
      data: data.issueArchive
    };
  }

  // Additional Issue Operations
  private async archiveIssue(args: any): Promise<any> {
    return await this.deleteIssue(args);
  }

  private async unarchiveIssue(args: any): Promise<any> {
    const mutation = `
      mutation IssueUnarchive($id: String!) {
        issueUnarchive(id: $id) {
          success
          issue {
            id
            archivedAt
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id });
    return {
      success: true,
      operation: "unarchive_issue",
      data: data.issueUnarchive
    };
  }

  private async moveIssue(args: any): Promise<any> {
    const input: any = {};
    
    if (args.teamId) input.teamId = args.teamId;
    if (args.projectId !== undefined) input.projectId = args.projectId;
    if (args.cycleId !== undefined) input.cycleId = args.cycleId;
    if (args.stateId) input.stateId = args.stateId;

    return await this.updateIssue({ id: args.id, ...input });
  }

  private async duplicateIssue(args: any): Promise<any> {
    // First get the original issue
    const original = await this.getIssue({ id: args.id });
    
    if (!original.success) {
      throw new Error('Could not fetch original issue');
    }

    const originalIssue = original.data;
    
    // Create duplicate with modified title
    const duplicateData = {
      title: `${originalIssue.title} (Copy)`,
      description: originalIssue.description,
      priority: originalIssue.priority,
      teamId: originalIssue.team?.id,
      projectId: originalIssue.project?.id,
      labelIds: originalIssue.labels?.nodes.map((label: any) => label.id),
      estimate: originalIssue.estimate
    };

    return await this.createIssue(duplicateData);
  }

  private async linkIssues(args: any): Promise<any> {
    const mutation = `
      mutation IssueRelationCreate($input: IssueRelationCreateInput!) {
        issueRelationCreate(input: $input) {
          success
          issueRelation {
            id
            issue { id identifier }
            relatedIssue { id identifier }
            type
          }
        }
      }
    `;

    const input = {
      issueId: args.issueId,
      relatedIssueId: args.relatedIssueId,
      type: args.relationType || 'related'
    };

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "link_issues",
      data: data.issueRelationCreate
    };
  }

  private async unassignIssue(args: any): Promise<any> {
    return await this.updateIssue({ id: args.id, assigneeId: null });
  }

  // Additional Project Operations
  private async deleteProject(args: any): Promise<any> {
    const mutation = `
      mutation ProjectArchive($id: String!) {
        projectArchive(id: $id) {
          success
          project {
            id
            archivedAt
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id });
    return {
      success: true,
      operation: "delete_project",
      data: data.projectArchive
    };
  }

  private async archiveProject(args: any): Promise<any> {
    return await this.deleteProject(args);
  }

  private async unarchiveProject(args: any): Promise<any> {
    const mutation = `
      mutation ProjectUnarchive($id: String!) {
        projectUnarchive(id: $id) {
          success
          project {
            id
            archivedAt
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id });
    return {
      success: true,
      operation: "unarchive_project",
      data: data.projectUnarchive
    };
  }

  private async addProjectMember(args: any): Promise<any> {
    const mutation = `
      mutation ProjectUpdate($id: String!, $input: ProjectUpdateInput!) {
        projectUpdate(id: $id, input: $input) {
          success
          project {
            id
            members { nodes { id displayName } }
          }
        }
      }
    `;

    // Get current project members first
    const project = await this.getProject({ id: args.projectId });
    const currentMembers = project.data?.members?.nodes || [];
    const memberIds = [...currentMembers.map((m: any) => m.id), args.userId];

    const input = { memberIds };
    const data = await this.makeGraphQLRequest(mutation, { id: args.projectId, input });
    
    return {
      success: true,
      operation: "add_project_member",
      data: data.projectUpdate
    };
  }

  private async removeProjectMember(args: any): Promise<any> {
    const mutation = `
      mutation ProjectUpdate($id: String!, $input: ProjectUpdateInput!) {
        projectUpdate(id: $id, input: $input) {
          success
          project {
            id
            members { nodes { id displayName } }
          }
        }
      }
    `;

    // Get current project members first
    const project = await this.getProject({ id: args.projectId });
    const currentMembers = project.data?.members?.nodes || [];
    const memberIds = currentMembers
      .filter((m: any) => m.id !== args.userId)
      .map((m: any) => m.id);

    const input = { memberIds };
    const data = await this.makeGraphQLRequest(mutation, { id: args.projectId, input });
    
    return {
      success: true,
      operation: "remove_project_member",
      data: data.projectUpdate
    };
  }

  private async createProjectMilestone(args: any): Promise<any> {
    const mutation = `
      mutation ProjectMilestoneCreate($input: ProjectMilestoneCreateInput!) {
        projectMilestoneCreate(input: $input) {
          success
          projectMilestone {
            id
            name
            description
            targetDate
            project { id name }
            createdAt
          }
        }
      }
    `;

    const input: any = {
      name: args.name,
      projectId: args.projectId
    };

    if (args.description) input.description = args.description;
    if (args.targetDate) input.targetDate = args.targetDate;

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "create_project_milestone",
      data: data.projectMilestoneCreate
    };
  }

  private async updateProjectMilestone(args: any): Promise<any> {
    const mutation = `
      mutation ProjectMilestoneUpdate($id: String!, $input: ProjectMilestoneUpdateInput!) {
        projectMilestoneUpdate(id: $id, input: $input) {
          success
          projectMilestone {
            id
            name
            description
            targetDate
            updatedAt
          }
        }
      }
    `;

    const input: any = {};
    if (args.name) input.name = args.name;
    if (args.description !== undefined) input.description = args.description;
    if (args.targetDate !== undefined) input.targetDate = args.targetDate;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id, input });
    return {
      success: true,
      operation: "update_project_milestone",
      data: data.projectMilestoneUpdate
    };
  }

  // Additional Team Operations
  private async deleteTeam(args: any): Promise<any> {
    const mutation = `
      mutation TeamDelete($id: String!) {
        teamDelete(id: $id) {
          success
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id });
    return {
      success: true,
      operation: "delete_team",
      data: data.teamDelete
    };
  }

  private async removeTeamMember(args: any): Promise<any> {
    const mutation = `
      mutation TeamMembershipDelete($id: String!) {
        teamMembershipDelete(id: $id) {
          success
        }
      }
    `;

    // First find the membership ID
    const team = await this.getTeam({ id: args.teamId });
    const member = team.data?.members?.nodes.find((m: any) => m.id === args.userId);
    
    if (!member) {
      throw new Error('User is not a member of this team');
    }

    const data = await this.makeGraphQLRequest(mutation, { id: member.membershipId });
    return {
      success: true,
      operation: "remove_team_member",
      data: data.teamMembershipDelete
    };
  }

  private async updateTeamMemberRole(args: any): Promise<any> {
    const mutation = `
      mutation TeamMembershipUpdate($id: String!, $input: TeamMembershipUpdateInput!) {
        teamMembershipUpdate(id: $id, input: $input) {
          success
          teamMembership {
            id
            user { id displayName }
            team { id name }
          }
        }
      }
    `;

    const input = { admin: args.admin || false };
    const data = await this.makeGraphQLRequest(mutation, { id: args.membershipId, input });
    
    return {
      success: true,
      operation: "update_team_member_role",
      data: data.teamMembershipUpdate
    };
  }

  private async getTeamIssues(args: any): Promise<any> {
    const query = `
      query TeamIssues($teamId: String!, $filter: IssueFilter, $first: Int, $after: String) {
        team(id: $teamId) {
          issues(filter: $filter, first: $first, after: $after) {
            nodes {
              id
              identifier
              title
              priority
              state { id name }
              assignee { id displayName }
              createdAt
              updatedAt
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    const variables: any = { teamId: args.teamId };
    if (args.filter) variables.filter = args.filter;
    if (args.first) variables.first = args.first;
    if (args.after) variables.after = args.after;

    const data = await this.makeGraphQLRequest(query, variables);
    return {
      success: true,
      operation: "get_team_issues",
      data: data.team?.issues
    };
  }

  private async getTeamProjects(args: any): Promise<any> {
    const query = `
      query TeamProjects($teamId: String!, $first: Int) {
        team(id: $teamId) {
          projects(first: $first) {
            nodes {
              id
              name
              description
              state
              progress
              lead { id displayName }
              targetDate
              createdAt
            }
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { 
      teamId: args.teamId,
      first: args.first || 50
    });

    return {
      success: true,
      operation: "get_team_projects",
      data: data.team?.projects
    };
  }

  private async createTeamTemplate(args: any): Promise<any> {
    const mutation = `
      mutation TemplateCreate($input: TemplateCreateInput!) {
        templateCreate(input: $input) {
          success
          template {
            id
            name
            description
            team { id name }
            createdAt
          }
        }
      }
    `;

    const input: any = {
      name: args.name,
      teamId: args.teamId,
      templateData: args.templateData || {}
    };

    if (args.description) input.description = args.description;

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "create_team_template",
      data: data.templateCreate
    };
  }

  // Additional Cycle Operations
  private async deleteCycle(args: any): Promise<any> {
    const mutation = `
      mutation CycleArchive($id: String!) {
        cycleArchive(id: $id) {
          success
          cycle {
            id
            archivedAt
          }
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id });
    return {
      success: true,
      operation: "delete_cycle",
      data: data.cycleArchive
    };
  }

  private async addIssueToCycle(args: any): Promise<any> {
    return await this.updateIssue({ id: args.issueId, cycleId: args.cycleId });
  }

  private async removeIssueFromCycle(args: any): Promise<any> {
    return await this.updateIssue({ id: args.issueId, cycleId: null });
  }

  private async completeCycle(args: any): Promise<any> {
    const mutation = `
      mutation CycleUpdate($id: String!, $input: CycleUpdateInput!) {
        cycleUpdate(id: $id, input: $input) {
          success
          cycle {
            id
            completedAt
            updatedAt
          }
        }
      }
    `;

    const input = { completedAt: new Date().toISOString() };
    const data = await this.makeGraphQLRequest(mutation, { id: args.id, input });
    
    return {
      success: true,
      operation: "complete_cycle",
      data: data.cycleUpdate
    };
  }

  private async archiveCycle(args: any): Promise<any> {
    return await this.deleteCycle(args);
  }

  // Additional User Operations
  private async updateUserSettings(args: any): Promise<any> {
    const mutation = `
      mutation UserSettingsUpdate($input: UserSettingsUpdateInput!) {
        userSettingsUpdate(input: $input) {
          success
          userSettings {
            id
            notificationPreferences
            updatedAt
          }
        }
      }
    `;

    const input: any = {};
    if (args.notificationPreferences) input.notificationPreferences = args.notificationPreferences;

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "update_user_settings",
      data: data.userSettingsUpdate
    };
  }

  private async getUserAssignedIssues(args: any): Promise<any> {
    const filter = { assignee: { id: { eq: args.userId } } };
    return await this.listIssues({ filter, first: args.first || 50 });
  }

  private async getUserCreatedIssues(args: any): Promise<any> {
    const filter = { creator: { id: { eq: args.userId } } };
    return await this.listIssues({ filter, first: args.first || 50 });
  }

  // Additional Comment Operations
  private async deleteComment(args: any): Promise<any> {
    const mutation = `
      mutation CommentDelete($id: String!) {
        commentDelete(id: $id) {
          success
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id });
    return {
      success: true,
      operation: "delete_comment",
      data: data.commentDelete
    };
  }

  private async getComment(args: any): Promise<any> {
    const query = `
      query Comment($id: String!) {
        comment(id: $id) {
          id
          body
          user { id displayName avatarUrl }
          issue { id identifier }
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { id: args.id });
    return {
      success: true,
      operation: "get_comment",
      data: data.comment
    };
  }

  private async reactToComment(args: any): Promise<any> {
    const mutation = `
      mutation ReactionCreate($input: ReactionCreateInput!) {
        reactionCreate(input: $input) {
          success
          reaction {
            id
            emoji
            user { displayName }
          }
        }
      }
    `;

    const input = {
      commentId: args.commentId,
      emoji: args.emoji || '👍'
    };

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "react_to_comment",
      data: data.reactionCreate
    };
  }

  private async unreactToComment(args: any): Promise<any> {
    const mutation = `
      mutation ReactionDelete($id: String!) {
        reactionDelete(id: $id) {
          success
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.reactionId });
    return {
      success: true,
      operation: "unreact_to_comment",
      data: data.reactionDelete
    };
  }

  // Additional Attachment Operations
  private async deleteAttachment(args: any): Promise<any> {
    const mutation = `
      mutation AttachmentDelete($id: String!) {
        attachmentDelete(id: $id) {
          success
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id });
    return {
      success: true,
      operation: "delete_attachment",
      data: data.attachmentDelete
    };
  }

  private async getAttachment(args: any): Promise<any> {
    const query = `
      query Attachment($id: String!) {
        attachment(id: $id) {
          id
          title
          url
          subtitle
          metadata
          issue { id identifier }
          createdAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { id: args.id });
    return {
      success: true,
      operation: "get_attachment",
      data: data.attachment
    };
  }

  private async uploadFileAttachment(args: any): Promise<any> {
    const mutation = `
      mutation FileUpload($input: FileUploadInput!) {
        fileUpload(input: $input) {
          success
          uploadFile {
            id
            filename
            url
            size
          }
        }
      }
    `;

    const input = {
      filename: args.filename,
      contentType: args.contentType,
      size: args.size
    };

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "upload_file_attachment",
      data: data.fileUpload
    };
  }

  // Additional Label Operations
  private async updateLabel(args: any): Promise<any> {
    const mutation = `
      mutation IssueLabelUpdate($id: String!, $input: IssueLabelUpdateInput!) {
        issueLabelUpdate(id: $id, input: $input) {
          success
          issueLabel {
            id
            name
            description
            color
            updatedAt
          }
        }
      }
    `;

    const input: any = {};
    if (args.name || args.labelName) input.name = args.name || args.labelName;
    if (args.description !== undefined) input.description = args.description;
    if (args.color) input.color = args.color;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id, input });
    return {
      success: true,
      operation: "update_label",
      data: data.issueLabelUpdate
    };
  }

  private async deleteLabel(args: any): Promise<any> {
    const mutation = `
      mutation IssueLabelDelete($id: String!) {
        issueLabelDelete(id: $id) {
          success
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id });
    return {
      success: true,
      operation: "delete_label",
      data: data.issueLabelDelete
    };
  }

  private async getLabel(args: any): Promise<any> {
    const query = `
      query IssueLabel($id: String!) {
        issueLabel(id: $id) {
          id
          name
          description
          color
          team { id name }
          issues { nodes { id identifier title } }
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { id: args.id });
    return {
      success: true,
      operation: "get_label",
      data: data.issueLabel
    };
  }

  private async removeLabelFromIssue(args: any): Promise<any> {
    // Get current issue labels first
    const issueQuery = `
      query Issue($id: String!) {
        issue(id: $id) {
          labels { nodes { id } }
        }
      }
    `;

    const issueData = await this.makeGraphQLRequest(issueQuery, { id: args.issueId });
    const currentLabelIds = issueData.issue.labels.nodes.map((label: any) => label.id);
    
    // Remove label from existing labels
    const newLabelIds = currentLabelIds.filter((id: string) => id !== args.labelId);

    return await this.updateIssue({ id: args.issueId, labelIds: newLabelIds });
  }

  // Additional Workflow State Operations
  private async updateWorkflowState(args: any): Promise<any> {
    const mutation = `
      mutation WorkflowStateUpdate($id: String!, $input: WorkflowStateUpdateInput!) {
        workflowStateUpdate(id: $id, input: $input) {
          success
          workflowState {
            id
            name
            description
            type
            color
            updatedAt
          }
        }
      }
    `;

    const input: any = {};
    if (args.name || args.stateName) input.name = args.name || args.stateName;
    if (args.description !== undefined) input.description = args.description;
    if (args.color) input.color = args.color;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id, input });
    return {
      success: true,
      operation: "update_workflow_state",
      data: data.workflowStateUpdate
    };
  }

  private async deleteWorkflowState(args: any): Promise<any> {
    const mutation = `
      mutation WorkflowStateDelete($id: String!) {
        workflowStateDelete(id: $id) {
          success
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id });
    return {
      success: true,
      operation: "delete_workflow_state",
      data: data.workflowStateDelete
    };
  }

  private async getWorkflowState(args: any): Promise<any> {
    const query = `
      query WorkflowState($id: String!) {
        workflowState(id: $id) {
          id
          name
          description
          type
          color
          position
          team { id name }
          issues { nodes { id identifier title } }
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { id: args.id });
    return {
      success: true,
      operation: "get_workflow_state",
      data: data.workflowState
    };
  }

  private async moveIssueToState(args: any): Promise<any> {
    return await this.updateIssue({ id: args.issueId, stateId: args.stateId });
  }

  // Additional Organization Operations
  private async updateOrganization(args: any): Promise<any> {
    const mutation = `
      mutation OrganizationUpdate($input: OrganizationUpdateInput!) {
        organizationUpdate(input: $input) {
          success
          organization {
            id
            name
            logoUrl
            urlKey
            updatedAt
          }
        }
      }
    `;

    const input: any = {};
    if (args.name) input.name = args.name;
    if (args.logoUrl) input.logoUrl = args.logoUrl;
    if (args.urlKey) input.urlKey = args.urlKey;

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "update_organization",
      data: data.organizationUpdate
    };
  }

  private async getOrganizationSettings(args: any): Promise<any> {
    const query = `
      query Organization {
        organization {
          id
          name
          logoUrl
          urlKey
          userCount
          allowedAuthServices
          gitHubConnectInstalled
          gitLabConnectInstalled
          googleSheetsEnabled
          roadmapEnabled
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query);
    return {
      success: true,
      operation: "get_organization_settings",
      data: data.organization
    };
  }

  private async inviteOrganizationMember(args: any): Promise<any> {
    const mutation = `
      mutation OrganizationInviteCreate($input: OrganizationInviteCreateInput!) {
        organizationInviteCreate(input: $input) {
          success
          organizationInvite {
            id
            email
            createdAt
          }
        }
      }
    `;

    const input = {
      email: args.email,
      teamIds: args.teamIds || []
    };

    const data = await this.makeGraphQLRequest(mutation, { input });
    return {
      success: true,
      operation: "invite_organization_member",
      data: data.organizationInviteCreate
    };
  }

  // Additional Analytics Operations
  private async getProjectAnalytics(args: any): Promise<any> {
    const query = `
      query ProjectAnalytics($projectId: String!) {
        project(id: $projectId) {
          id
          name
          progress
          state
          issues { 
            nodes { 
              id 
              state { type } 
              estimate 
              createdAt 
              completedAt 
            } 
          }
          members { nodes { id } }
          createdAt
          targetDate
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { projectId: args.projectId });
    const project = data.project;
    const issues = project.issues.nodes;

    const analytics = {
      projectId: project.id,
      projectName: project.name,
      progress: project.progress,
      state: project.state,
      totalIssues: issues.length,
      completedIssues: issues.filter((i: any) => i.state.type === 'completed').length,
      inProgressIssues: issues.filter((i: any) => i.state.type === 'started').length,
      backlogIssues: issues.filter((i: any) => i.state.type === 'backlog').length,
      totalEstimate: issues.reduce((sum: number, i: any) => sum + (i.estimate || 0), 0),
      completedEstimate: issues
        .filter((i: any) => i.state.type === 'completed')
        .reduce((sum: number, i: any) => sum + (i.estimate || 0), 0),
      memberCount: project.members.nodes.length,
      daysToTarget: project.targetDate ? 
        Math.ceil((new Date(project.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null,
      completionRate: issues.length > 0 ? 
        (issues.filter((i: any) => i.state.type === 'completed').length / issues.length) * 100 : 0
    };

    return {
      success: true,
      operation: "get_project_analytics",
      data: analytics
    };
  }

  // Additional Integration Operations
  private async updateWebhook(args: any): Promise<any> {
    const mutation = `
      mutation WebhookUpdate($id: String!, $input: WebhookUpdateInput!) {
        webhookUpdate(id: $id, input: $input) {
          success
          webhook {
            id
            url
            label
            enabled
            updatedAt
          }
        }
      }
    `;

    const input: any = {};
    if (args.url || args.webhookUrl) input.url = args.url || args.webhookUrl;
    if (args.label) input.label = args.label;
    if (args.enabled !== undefined) input.enabled = args.enabled;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id, input });
    return {
      success: true,
      operation: "update_webhook",
      data: data.webhookUpdate
    };
  }

  private async deleteWebhook(args: any): Promise<any> {
    const mutation = `
      mutation WebhookDelete($id: String!) {
        webhookDelete(id: $id) {
          success
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id });
    return {
      success: true,
      operation: "delete_webhook",
      data: data.webhookDelete
    };
  }

  private async testWebhook(args: any): Promise<any> {
    const mutation = `
      mutation WebhookTest($id: String!) {
        webhookTest(id: $id) {
          success
          message
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.id });
    return {
      success: true,
      operation: "test_webhook",
      data: data.webhookTest
    };
  }

  private async getIntegrationSettings(args: any): Promise<any> {
    const query = `
      query IntegrationSettings($integration: String!) {
        integrationSettings(name: $integration) {
          settings
        }
      }
    `;

    const data = await this.makeGraphQLRequest(query, { integration: args.integration });
    return {
      success: true,
      operation: "get_integration_settings",
      data: data.integrationSettings
    };
  }

  private async importData(args: any): Promise<any> {
    const { teamId, data, format } = args;

    if (!teamId || !data) {
      throw new Error("teamId and data are required for import");
    }

    let issuesToCreate: any[] = [];

    if (format === 'csv') {
      // Basic CSV parsing
      const rows = data.split('\n');
      const headers = rows[0].split(',');
      issuesToCreate = rows.slice(1).map((row: string) => {
        const values = row.split(',');
        const issue: any = {};
        headers.forEach((header: string, i: number) => {
          issue[header.trim()] = values[i].trim();
        });
        return issue;
      });
    } else {
      // Default to JSON
      issuesToCreate = Array.isArray(data) ? data : [data];
    }

    const results = [];
    for (const issue of issuesToCreate) {
      try {
        const result = await this.createIssue({ ...issue, teamId });
        results.push({ success: true, data: result.data });
      } catch (error) {
        results.push({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return {
      success: true,
      operation: "import_data",
      data: {
        total: results.length,
        successCount: results.filter(r => r.success).length,
        errorCount: results.filter(r => !r.success).length,
        results
      }
    };
  }

  private async syncExternalData(args: any): Promise<any> {
    const { source, data, mapping } = args;

    if (!source || !data || !mapping) {
      throw new Error("source, data, and mapping are required for sync");
    }

    const results = [];
    for (const externalItem of data) {
      try {
        const linearId = externalItem[mapping.externalId];
        const issue = await this.getIssue({ id: linearId });

        if (issue.success) {
          const updatePayload: any = { id: linearId };
          for (const key in mapping.fields) {
            updatePayload[key] = externalItem[mapping.fields[key]];
          }
          const result = await this.updateIssue(updatePayload);
          results.push({ success: true, operation: 'update', data: result.data });
        } else {
          // Optionally create if not found
          const createPayload: any = {};
          for (const key in mapping.fields) {
            createPayload[key] = externalItem[mapping.fields[key]];
          }
          const result = await this.createIssue({ ...createPayload, teamId: args.teamId });
          results.push({ success: true, operation: 'create', data: result.data });
        }
      } catch (error) {
        results.push({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return {
      success: true,
      operation: "sync_external_data",
      data: {
        source,
        total: results.length,
        successCount: results.filter(r => r.success).length,
        errorCount: results.filter(r => !r.success).length,
        results
      }
    };
  }

  private async unlinkIssues(args: any): Promise<any> {
    const mutation = `
      mutation IssueRelationDelete($id: String!) {
        issueRelationDelete(id: $id) {
          success
        }
      }
    `;

    const data = await this.makeGraphQLRequest(mutation, { id: args.relationId });
    return {
      success: true,
      operation: "unlink_issues",
      data: data.issueRelationDelete
    };
  }
}
