import { FunctionDeclaration, Type } from "@google/genai";

export interface TrelloConfig {
  apiKey: string;
  token: string;
  baseUrl?: string;
}

export class TrelloTool {
  private config: TrelloConfig;
  private baseUrl: string;

  constructor(config: TrelloConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.trello.com/1';
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "trello_tool",
      description: "A comprehensive tool for Trello operations including boards, lists, cards, members, organizations, and more",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform with the Trello tool",
            enum: [
              // Board operations
              "create_board",
              "get_board",
              "update_board",
              "delete_board",
              "get_boards",
              "get_board_lists",
              "get_board_cards",
              "get_board_members",
              "add_member_to_board",
              "remove_member_from_board",
              
              // List operations
              "create_list",
              "get_list",
              "update_list",
              "archive_list",
              "get_list_cards",
              "move_list",
              
              // Card operations
              "create_card",
              "get_card",
              "update_card",
              "delete_card",
              "move_card",
              "copy_card",
              "archive_card",
              "add_attachment",
              "get_card_attachments",
              "add_comment",
              "get_card_comments",
              "add_checklist",
              "get_card_checklists",
              "add_label_to_card",
              "remove_label_from_card",
              "assign_member_to_card",
              "remove_member_from_card",
              "set_due_date",
              
              // Checklist operations
              "create_checklist",
              "get_checklist",
              "update_checklist",
              "delete_checklist",
              "add_checklist_item",
              "update_checklist_item",
              "delete_checklist_item",
              "check_checklist_item",
              "uncheck_checklist_item",
              
              // Label operations
              "create_label",
              "get_labels",
              "update_label",
              "delete_label",
              
              // Member operations
              "get_member",
              "get_member_boards",
              "get_member_cards",
              "get_member_organizations",
              
              // Organization operations
              "create_organization",
              "get_organization",
              "update_organization",
              "delete_organization",
              "get_organization_boards",
              "get_organization_members",
              "add_member_to_organization",
              "remove_member_from_organization",
              
              // Search operations
              "search",
              "search_boards",
              "search_cards",
              "search_members",
              
              // Webhook operations
              "create_webhook",
              "get_webhook",
              "update_webhook",
              "delete_webhook",
              
              // Utility operations
              "get_board_id_by_name",
              "get_list_id_by_name",
              "get_card_id_by_name",
              "get_member_id_by_username",
              "bulk_create_cards",
              "export_board_data"
            ]
          },
          
          // Board parameters
          boardId: {
            type: Type.STRING,
            description: "ID of the board"
          },
          boardName: {
            type: Type.STRING,
            description: "Name of the board"
          },
          boardDescription: {
            type: Type.STRING,
            description: "Description of the board"
          },
          isPrivate: {
            type: Type.BOOLEAN,
            description: "Whether the board should be private"
          },
          organizationId: {
            type: Type.STRING,
            description: "ID of the organization"
          },
          
          // List parameters
          listId: {
            type: Type.STRING,
            description: "ID of the list"
          },
          listName: {
            type: Type.STRING,
            description: "Name of the list"
          },
          position: {
            type: Type.STRING,
            description: "Position of the list/card (top, bottom, or number)"
          },
          
          // Card parameters
          cardId: {
            type: Type.STRING,
            description: "ID of the card"
          },
          cardName: {
            type: Type.STRING,
            description: "Name/title of the card"
          },
          cardDescription: {
            type: Type.STRING,
            description: "Description of the card"
          },
          dueDate: {
            type: Type.STRING,
            description: "Due date for the card (ISO 8601 format)"
          },
          targetListId: {
            type: Type.STRING,
            description: "Target list ID for moving cards"
          },
          targetBoardId: {
            type: Type.STRING,
            description: "Target board ID for moving cards"
          },
          
          // Member parameters
          memberId: {
            type: Type.STRING,
            description: "ID of the member"
          },
          username: {
            type: Type.STRING,
            description: "Username of the member"
          },
          email: {
            type: Type.STRING,
            description: "Email of the member"
          },
          
          // Label parameters
          labelId: {
            type: Type.STRING,
            description: "ID of the label"
          },
          labelName: {
            type: Type.STRING,
            description: "Name of the label"
          },
          labelColor: {
            type: Type.STRING,
            description: "Color of the label (red, orange, yellow, green, blue, purple, pink, lime, sky, grey)"
          },
          
          // Checklist parameters
          checklistId: {
            type: Type.STRING,
            description: "ID of the checklist"
          },
          checklistName: {
            type: Type.STRING,
            description: "Name of the checklist"
          },
          checklistItemId: {
            type: Type.STRING,
            description: "ID of the checklist item"
          },
          checklistItemName: {
            type: Type.STRING,
            description: "Name of the checklist item"
          },
          isChecked: {
            type: Type.BOOLEAN,
            description: "Whether the checklist item is checked"
          },
          
          // Attachment parameters
          attachmentUrl: {
            type: Type.STRING,
            description: "URL of the attachment"
          },
          attachmentName: {
            type: Type.STRING,
            description: "Name of the attachment"
          },
          
          // Comment parameters
          commentText: {
            type: Type.STRING,
            description: "Text content of the comment"
          },
          
          // Search parameters
          query: {
            type: Type.STRING,
            description: "Search query"
          },
          
          // Webhook parameters
          webhookId: {
            type: Type.STRING,
            description: "ID of the webhook"
          },
          callbackUrl: {
            type: Type.STRING,
            description: "Callback URL for the webhook"
          },
          
          // Bulk operations
          cardsData: {
            type: Type.ARRAY,
            description: "Array of card objects for bulk operations",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                listId: { type: Type.STRING },
                dueDate: { type: Type.STRING },
                labels: { type: Type.ARRAY, items: { type: Type.STRING } },
                members: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          
          // Additional options
          fields: {
            type: Type.STRING,
            description: "Comma-separated list of fields to return"
          },
          limit: {
            type: Type.NUMBER,
            description: "Limit for pagination"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      switch (args.action) {
        // Board operations
        case "create_board":
          return this.createBoard(args.boardName, args.boardDescription, args.isPrivate, args.organizationId);
        case "get_board":
          return this.getBoard(args.boardId, args.fields);
        case "update_board":
          return this.updateBoard(args.boardId, args.boardName, args.boardDescription);
        case "delete_board":
          return this.deleteBoard(args.boardId);
        case "get_boards":
          return this.getBoards(args.memberId, args.organizationId);
        case "get_board_lists":
          return this.getBoardLists(args.boardId);
        case "get_board_cards":
          return this.getBoardCards(args.boardId);
        case "get_board_members":
          return this.getBoardMembers(args.boardId);
        case "add_member_to_board":
          return this.addMemberToBoard(args.boardId, args.email || args.memberId);
        case "remove_member_from_board":
          return this.removeMemberFromBoard(args.boardId, args.memberId);
          
        // List operations
        case "create_list":
          return this.createList(args.boardId, args.listName, args.position);
        case "get_list":
          return this.getList(args.listId, args.fields);
        case "update_list":
          return this.updateList(args.listId, args.listName, args.position);
        case "archive_list":
          return this.archiveList(args.listId);
        case "get_list_cards":
          return this.getListCards(args.listId);
        case "move_list":
          return this.moveList(args.listId, args.targetBoardId, args.position);
          
        // Card operations
        case "create_card":
          return this.createCard(args.listId, args.cardName, args.cardDescription, args.dueDate);
        case "get_card":
          return this.getCard(args.cardId, args.fields);
        case "update_card":
          return this.updateCard(args.cardId, args.cardName, args.cardDescription, args.dueDate);
        case "delete_card":
          return this.deleteCard(args.cardId);
        case "move_card":
          return this.moveCard(args.cardId, args.targetListId, args.position);
        case "copy_card":
          return this.copyCard(args.cardId, args.targetListId);
        case "archive_card":
          return this.archiveCard(args.cardId);
        case "add_attachment":
          return this.addAttachment(args.cardId, args.attachmentUrl, args.attachmentName);
        case "get_card_attachments":
          return this.getCardAttachments(args.cardId);
        case "add_comment":
          return this.addComment(args.cardId, args.commentText);
        case "get_card_comments":
          return this.getCardComments(args.cardId);
        case "add_checklist":
          return this.addChecklist(args.cardId, args.checklistName);
        case "get_card_checklists":
          return this.getCardChecklists(args.cardId);
        case "add_label_to_card":
          return this.addLabelToCard(args.cardId, args.labelId);
        case "remove_label_from_card":
          return this.removeLabelFromCard(args.cardId, args.labelId);
        case "assign_member_to_card":
          return this.assignMemberToCard(args.cardId, args.memberId);
        case "remove_member_from_card":
          return this.removeMemberFromCard(args.cardId, args.memberId);
        case "set_due_date":
          return this.setDueDate(args.cardId, args.dueDate);
          
        // Checklist operations
        case "create_checklist":
          return this.createChecklist(args.cardId, args.checklistName);
        case "get_checklist":
          return this.getChecklist(args.checklistId);
        case "update_checklist":
          return this.updateChecklist(args.checklistId, args.checklistName);
        case "delete_checklist":
          return this.deleteChecklist(args.checklistId);
        case "add_checklist_item":
          return this.addChecklistItem(args.checklistId, args.checklistItemName);
        case "update_checklist_item":
          return this.updateChecklistItem(args.checklistId, args.checklistItemId, args.checklistItemName);
        case "delete_checklist_item":
          return this.deleteChecklistItem(args.checklistId, args.checklistItemId);
        case "check_checklist_item":
          return this.checkChecklistItem(args.checklistId, args.checklistItemId);
        case "uncheck_checklist_item":
          return this.uncheckChecklistItem(args.checklistId, args.checklistItemId);
          
        // Label operations
        case "create_label":
          return this.createLabel(args.boardId, args.labelName, args.labelColor);
        case "get_labels":
          return this.getLabels(args.boardId);
        case "update_label":
          return this.updateLabel(args.labelId, args.labelName, args.labelColor);
        case "delete_label":
          return this.deleteLabel(args.labelId);
          
        // Member operations
        case "get_member":
          return this.getMember(args.memberId || args.username);
        case "get_member_boards":
          return this.getMemberBoards(args.memberId);
        case "get_member_cards":
          return this.getMemberCards(args.memberId);
        case "get_member_organizations":
          return this.getMemberOrganizations(args.memberId);
          
        // Organization operations
        case "create_organization":
          return this.createOrganization(args.organizationName, args.organizationDescription);
        case "get_organization":
          return this.getOrganization(args.organizationId);
        case "update_organization":
          return this.updateOrganization(args.organizationId, args.organizationName, args.organizationDescription);
        case "delete_organization":
          return this.deleteOrganization(args.organizationId);
        case "get_organization_boards":
          return this.getOrganizationBoards(args.organizationId);
        case "get_organization_members":
          return this.getOrganizationMembers(args.organizationId);
        case "add_member_to_organization":
          return this.addMemberToOrganization(args.organizationId, args.email);
        case "remove_member_from_organization":
          return this.removeMemberFromOrganization(args.organizationId, args.memberId);
          
        // Search operations
        case "search":
          return this.search(args.query, args.limit);
        case "search_boards":
          return this.searchBoards(args.query, args.limit);
        case "search_cards":
          return this.searchCards(args.query, args.limit);
        case "search_members":
          return this.searchMembers(args.query, args.limit);
          
        // Webhook operations
        case "create_webhook":
          return this.createWebhook(args.cardId || args.boardId, args.callbackUrl);
        case "get_webhook":
          return this.getWebhook(args.webhookId);
        case "update_webhook":
          return this.updateWebhook(args.webhookId, args.callbackUrl);
        case "delete_webhook":
          return this.deleteWebhook(args.webhookId);
          
        // Utility operations
        case "get_board_id_by_name":
          return this.getBoardIdByName(args.boardName);
        case "get_list_id_by_name":
          return this.getListIdByName(args.boardId, args.listName);
        case "get_card_id_by_name":
          return this.getCardIdByName(args.boardId, args.cardName);
        case "get_member_id_by_username":
          return this.getMemberIdByUsername(args.username);
        case "bulk_create_cards":
          return this.bulkCreateCards(args.cardsData);
        case "export_board_data":
          return this.exportBoardData(args.boardId);
          
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

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const params = new URLSearchParams({
      key: this.config.apiKey,
      token: this.config.token
    });

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (method === 'GET') {
      const finalUrl = `${url}?${params.toString()}`;
      const response = await fetch(finalUrl, config);
      return response.json();
    } else {
      if (body) {
        config.body = JSON.stringify({ ...body, key: this.config.apiKey, token: this.config.token });
      } else {
        config.body = params.toString();
        config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      }
      const response = await fetch(url, config);
      return response.json();
    }
  }

  // Board operations
  private async createBoard(name: string, description?: string, isPrivate?: boolean, organizationId?: string): Promise<any> {
    const body: any = { name };
    if (description) body.desc = description;
    if (isPrivate !== undefined) body.prefs_permissionLevel = isPrivate ? 'private' : 'public';
    if (organizationId) body.idOrganization = organizationId;

    const result = await this.makeRequest('/boards', 'POST', body);
    return {
      success: true,
      action: "create_board",
      data: result
    };
  }

  private async getBoard(id: string, fields?: string): Promise<any> {
    let endpoint = `/boards/${id}`;
    if (fields) endpoint += `?fields=${fields}`;
    
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_board",
      data: result
    };
  }

  private async updateBoard(id: string, name?: string, description?: string): Promise<any> {
    const body: any = {};
    if (name) body.name = name;
    if (description) body.desc = description;

    const result = await this.makeRequest(`/boards/${id}`, 'PUT', body);
    return {
      success: true,
      action: "update_board",
      data: result
    };
  }

  private async deleteBoard(id: string): Promise<any> {
    const result = await this.makeRequest(`/boards/${id}`, 'DELETE');
    return {
      success: true,
      action: "delete_board",
      data: result
    };
  }

  private async getBoards(memberId?: string, organizationId?: string): Promise<any> {
    let endpoint = '/members/me/boards';
    if (memberId) endpoint = `/members/${memberId}/boards`;
    if (organizationId) endpoint = `/organizations/${organizationId}/boards`;

    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_boards",
      data: result
    };
  }

  private async getBoardLists(boardId: string): Promise<any> {
    const result = await this.makeRequest(`/boards/${boardId}/lists`);
    return {
      success: true,
      action: "get_board_lists",
      data: result
    };
  }

  private async getBoardCards(boardId: string): Promise<any> {
    const result = await this.makeRequest(`/boards/${boardId}/cards`);
    return {
      success: true,
      action: "get_board_cards",
      data: result
    };
  }

  private async getBoardMembers(boardId: string): Promise<any> {
    const result = await this.makeRequest(`/boards/${boardId}/members`);
    return {
      success: true,
      action: "get_board_members",
      data: result
    };
  }

  private async addMemberToBoard(boardId: string, emailOrId: string): Promise<any> {
    const body = emailOrId.includes('@') ? { email: emailOrId } : { idMember: emailOrId };
    const result = await this.makeRequest(`/boards/${boardId}/members`, 'PUT', body);
    return {
      success: true,
      action: "add_member_to_board",
      data: result
    };
  }

  private async removeMemberFromBoard(boardId: string, memberId: string): Promise<any> {
    const result = await this.makeRequest(`/boards/${boardId}/members/${memberId}`, 'DELETE');
    return {
      success: true,
      action: "remove_member_from_board",
      data: result
    };
  }

  // List operations
  private async createList(boardId: string, name: string, position?: string): Promise<any> {
    const body: any = { name, idBoard: boardId };
    if (position) body.pos = position;

    const result = await this.makeRequest('/lists', 'POST', body);
    return {
      success: true,
      action: "create_list",
      data: result
    };
  }

  private async getList(id: string, fields?: string): Promise<any> {
    let endpoint = `/lists/${id}`;
    if (fields) endpoint += `?fields=${fields}`;
    
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_list",
      data: result
    };
  }

  private async updateList(id: string, name?: string, position?: string): Promise<any> {
    const body: any = {};
    if (name) body.name = name;
    if (position) body.pos = position;

    const result = await this.makeRequest(`/lists/${id}`, 'PUT', body);
    return {
      success: true,
      action: "update_list",
      data: result
    };
  }

  private async archiveList(id: string): Promise<any> {
    const result = await this.makeRequest(`/lists/${id}/closed`, 'PUT', { value: true });
    return {
      success: true,
      action: "archive_list",
      data: result
    };
  }

  private async getListCards(listId: string): Promise<any> {
    const result = await this.makeRequest(`/lists/${listId}/cards`);
    return {
      success: true,
      action: "get_list_cards",
      data: result
    };
  }

  private async moveList(listId: string, targetBoardId: string, position?: string): Promise<any> {
    const body: any = { idBoard: targetBoardId };
    if (position) body.pos = position;

    const result = await this.makeRequest(`/lists/${listId}`, 'PUT', body);
    return {
      success: true,
      action: "move_list",
      data: result
    };
  }

  // Card operations
  private async createCard(listId: string, name: string, description?: string, dueDate?: string): Promise<any> {
    const body: any = { name, idList: listId };
    if (description) body.desc = description;
    if (dueDate) body.due = dueDate;

    const result = await this.makeRequest('/cards', 'POST', body);
    return {
      success: true,
      action: "create_card",
      data: result
    };
  }

  private async getCard(id: string, fields?: string): Promise<any> {
    let endpoint = `/cards/${id}`;
    if (fields) endpoint += `?fields=${fields}`;
    
    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "get_card",
      data: result
    };
  }

  private async updateCard(id: string, name?: string, description?: string, dueDate?: string): Promise<any> {
    const body: any = {};
    if (name) body.name = name;
    if (description) body.desc = description;
    if (dueDate) body.due = dueDate;

    const result = await this.makeRequest(`/cards/${id}`, 'PUT', body);
    return {
      success: true,
      action: "update_card",
      data: result
    };
  }

  private async deleteCard(id: string): Promise<any> {
    const result = await this.makeRequest(`/cards/${id}`, 'DELETE');
    return {
      success: true,
      action: "delete_card",
      data: result
    };
  }

  private async moveCard(cardId: string, targetListId: string, position?: string): Promise<any> {
    const body: any = { idList: targetListId };
    if (position) body.pos = position;

    const result = await this.makeRequest(`/cards/${cardId}`, 'PUT', body);
    return {
      success: true,
      action: "move_card",
      data: result
    };
  }

  private async copyCard(cardId: string, targetListId: string): Promise<any> {
    const result = await this.makeRequest(`/cards/${cardId}`, 'POST', { idList: targetListId });
    return {
      success: true,
      action: "copy_card",
      data: result
    };
  }

  private async archiveCard(id: string): Promise<any> {
    const result = await this.makeRequest(`/cards/${id}`, 'PUT', { closed: true });
    return {
      success: true,
      action: "archive_card",
      data: result
    };
  }

  private async addAttachment(cardId: string, url: string, name?: string): Promise<any> {
    const body: any = { url };
    if (name) body.name = name;

    const result = await this.makeRequest(`/cards/${cardId}/attachments`, 'POST', body);
    return {
      success: true,
      action: "add_attachment",
      data: result
    };
  }

  private async getCardAttachments(cardId: string): Promise<any> {
    const result = await this.makeRequest(`/cards/${cardId}/attachments`);
    return {
      success: true,
      action: "get_card_attachments",
      data: result
    };
  }

  private async addComment(cardId: string, text: string): Promise<any> {
    const result = await this.makeRequest(`/cards/${cardId}/actions/comments`, 'POST', { text });
    return {
      success: true,
      action: "add_comment",
      data: result
    };
  }

  private async getCardComments(cardId: string): Promise<any> {
    const result = await this.makeRequest(`/cards/${cardId}/actions?filter=commentCard`);
    return {
      success: true,
      action: "get_card_comments",
      data: result
    };
  }

  private async addChecklist(cardId: string, name: string): Promise<any> {
    const result = await this.makeRequest(`/cards/${cardId}/checklists`, 'POST', { name });
    return {
      success: true,
      action: "add_checklist",
      data: result
    };
  }

  private async getCardChecklists(cardId: string): Promise<any> {
    const result = await this.makeRequest(`/cards/${cardId}/checklists`);
    return {
      success: true,
      action: "get_card_checklists",
      data: result
    };
  }

  private async addLabelToCard(cardId: string, labelId: string): Promise<any> {
    const result = await this.makeRequest(`/cards/${cardId}/idLabels`, 'POST', { value: labelId });
    return {
      success: true,
      action: "add_label_to_card",
      data: result
    };
  }

  private async removeLabelFromCard(cardId: string, labelId: string): Promise<any> {
    const result = await this.makeRequest(`/cards/${cardId}/idLabels/${labelId}`, 'DELETE');
    return {
      success: true,
      action: "remove_label_from_card",
      data: result
    };
  }

  private async assignMemberToCard(cardId: string, memberId: string): Promise<any> {
    const result = await this.makeRequest(`/cards/${cardId}/idMembers`, 'POST', { value: memberId });
    return {
      success: true,
      action: "assign_member_to_card",
      data: result
    };
  }

  private async removeMemberFromCard(cardId: string, memberId: string): Promise<any> {
    const result = await this.makeRequest(`/cards/${cardId}/idMembers/${memberId}`, 'DELETE');
    return {
      success: true,
      action: "remove_member_from_card",
      data: result
    };
  }

  private async setDueDate(cardId: string, dueDate: string): Promise<any> {
    const result = await this.makeRequest(`/cards/${cardId}`, 'PUT', { due: dueDate });
    return {
      success: true,
      action: "set_due_date",
      data: result
    };
  }

  // Checklist operations
  private async createChecklist(cardId: string, name: string): Promise<any> {
    const result = await this.makeRequest('/checklists', 'POST', { idCard: cardId, name });
    return {
      success: true,
      action: "create_checklist",
      data: result
    };
  }

  private async getChecklist(id: string): Promise<any> {
    const result = await this.makeRequest(`/checklists/${id}`);
    return {
      success: true,
      action: "get_checklist",
      data: result
    };
  }

  private async updateChecklist(id: string, name: string): Promise<any> {
    const result = await this.makeRequest(`/checklists/${id}`, 'PUT', { name });
    return {
      success: true,
      action: "update_checklist",
      data: result
    };
  }

  private async deleteChecklist(id: string): Promise<any> {
    const result = await this.makeRequest(`/checklists/${id}`, 'DELETE');
    return {
      success: true,
      action: "delete_checklist",
      data: result
    };
  }

  private async addChecklistItem(checklistId: string, name: string): Promise<any> {
    const result = await this.makeRequest(`/checklists/${checklistId}/checkItems`, 'POST', { name });
    return {
      success: true,
      action: "add_checklist_item",
      data: result
    };
  }

  private async updateChecklistItem(checklistId: string, itemId: string, name: string): Promise<any> {
    const result = await this.makeRequest(`/checklists/${checklistId}/checkItems/${itemId}`, 'PUT', { name });
    return {
      success: true,
      action: "update_checklist_item",
      data: result
    };
  }

  private async deleteChecklistItem(checklistId: string, itemId: string): Promise<any> {
    const result = await this.makeRequest(`/checklists/${checklistId}/checkItems/${itemId}`, 'DELETE');
    return {
      success: true,
      action: "delete_checklist_item",
      data: result
    };
  }

  private async checkChecklistItem(checklistId: string, itemId: string): Promise<any> {
    const result = await this.makeRequest(`/checklists/${checklistId}/checkItems/${itemId}`, 'PUT', { state: 'complete' });
    return {
      success: true,
      action: "check_checklist_item",
      data: result
    };
  }

  private async uncheckChecklistItem(checklistId: string, itemId: string): Promise<any> {
    const result = await this.makeRequest(`/checklists/${checklistId}/checkItems/${itemId}`, 'PUT', { state: 'incomplete' });
    return {
      success: true,
      action: "uncheck_checklist_item",
      data: result
    };
  }

  // Label operations
  private async createLabel(boardId: string, name: string, color: string): Promise<any> {
    const result = await this.makeRequest('/labels', 'POST', { name, color, idBoard: boardId });
    return {
      success: true,
      action: "create_label",
      data: result
    };
  }

  private async getLabels(boardId: string): Promise<any> {
    const result = await this.makeRequest(`/boards/${boardId}/labels`);
    return {
      success: true,
      action: "get_labels",
      data: result
    };
  }

  private async updateLabel(id: string, name?: string, color?: string): Promise<any> {
    const body: any = {};
    if (name) body.name = name;
    if (color) body.color = color;

    const result = await this.makeRequest(`/labels/${id}`, 'PUT', body);
    return {
      success: true,
      action: "update_label",
      data: result
    };
  }

  private async deleteLabel(id: string): Promise<any> {
    const result = await this.makeRequest(`/labels/${id}`, 'DELETE');
    return {
      success: true,
      action: "delete_label",
      data: result
    };
  }

  // Member operations
  private async getMember(idOrUsername: string): Promise<any> {
    const result = await this.makeRequest(`/members/${idOrUsername}`);
    return {
      success: true,
      action: "get_member",
      data: result
    };
  }

  private async getMemberBoards(memberId: string): Promise<any> {
    const result = await this.makeRequest(`/members/${memberId}/boards`);
    return {
      success: true,
      action: "get_member_boards",
      data: result
    };
  }

  private async getMemberCards(memberId: string): Promise<any> {
    const result = await this.makeRequest(`/members/${memberId}/cards`);
    return {
      success: true,
      action: "get_member_cards",
      data: result
    };
  }

  private async getMemberOrganizations(memberId: string): Promise<any> {
    const result = await this.makeRequest(`/members/${memberId}/organizations`);
    return {
      success: true,
      action: "get_member_organizations",
      data: result
    };
  }

  // Organization operations
  private async createOrganization(name: string, description?: string): Promise<any> {
    const body: any = { displayName: name };
    if (description) body.desc = description;

    const result = await this.makeRequest('/organizations', 'POST', body);
    return {
      success: true,
      action: "create_organization",
      data: result
    };
  }

  private async getOrganization(id: string): Promise<any> {
    const result = await this.makeRequest(`/organizations/${id}`);
    return {
      success: true,
      action: "get_organization",
      data: result
    };
  }

  private async updateOrganization(id: string, name?: string, description?: string): Promise<any> {
    const body: any = {};
    if (name) body.displayName = name;
    if (description) body.desc = description;

    const result = await this.makeRequest(`/organizations/${id}`, 'PUT', body);
    return {
      success: true,
      action: "update_organization",
      data: result
    };
  }

  private async deleteOrganization(id: string): Promise<any> {
    const result = await this.makeRequest(`/organizations/${id}`, 'DELETE');
    return {
      success: true,
      action: "delete_organization",
      data: result
    };
  }

  private async getOrganizationBoards(organizationId: string): Promise<any> {
    const result = await this.makeRequest(`/organizations/${organizationId}/boards`);
    return {
      success: true,
      action: "get_organization_boards",
      data: result
    };
  }

  private async getOrganizationMembers(organizationId: string): Promise<any> {
    const result = await this.makeRequest(`/organizations/${organizationId}/members`);
    return {
      success: true,
      action: "get_organization_members",
      data: result
    };
  }

  private async addMemberToOrganization(organizationId: string, email: string): Promise<any> {
    const result = await this.makeRequest(`/organizations/${organizationId}/members`, 'PUT', { email });
    return {
      success: true,
      action: "add_member_to_organization",
      data: result
    };
  }

  private async removeMemberFromOrganization(organizationId: string, memberId: string): Promise<any> {
    const result = await this.makeRequest(`/organizations/${organizationId}/members/${memberId}`, 'DELETE');
    return {
      success: true,
      action: "remove_member_from_organization",
      data: result
    };
  }

  // Search operations
  private async search(query: string, limit?: number): Promise<any> {
    let endpoint = `/search?query=${encodeURIComponent(query)}`;
    if (limit) endpoint += `&cards_limit=${limit}&boards_limit=${limit}&organizations_limit=${limit}&members_limit=${limit}`;

    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "search",
      data: result
    };
  }

  private async searchBoards(query: string, limit?: number): Promise<any> {
    let endpoint = `/search?query=${encodeURIComponent(query)}&modelTypes=boards`;
    if (limit) endpoint += `&boards_limit=${limit}`;

    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "search_boards",
      data: result.boards || []
    };
  }

  private async searchCards(query: string, limit?: number): Promise<any> {
    let endpoint = `/search?query=${encodeURIComponent(query)}&modelTypes=cards`;
    if (limit) endpoint += `&cards_limit=${limit}`;

    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "search_cards",
      data: result.cards || []
    };
  }

  private async searchMembers(query: string, limit?: number): Promise<any> {
    let endpoint = `/search?query=${encodeURIComponent(query)}&modelTypes=members`;
    if (limit) endpoint += `&members_limit=${limit}`;

    const result = await this.makeRequest(endpoint);
    return {
      success: true,
      action: "search_members",
      data: result.members || []
    };
  }

  // Webhook operations
  private async createWebhook(modelId: string, callbackUrl: string): Promise<any> {
    const result = await this.makeRequest('/webhooks', 'POST', { idModel: modelId, callbackURL: callbackUrl });
    return {
      success: true,
      action: "create_webhook",
      data: result
    };
  }

  private async getWebhook(id: string): Promise<any> {
    const result = await this.makeRequest(`/webhooks/${id}`);
    return {
      success: true,
      action: "get_webhook",
      data: result
    };
  }

  private async updateWebhook(id: string, callbackUrl: string): Promise<any> {
    const result = await this.makeRequest(`/webhooks/${id}`, 'PUT', { callbackURL: callbackUrl });
    return {
      success: true,
      action: "update_webhook",
      data: result
    };
  }

  private async deleteWebhook(id: string): Promise<any> {
    const result = await this.makeRequest(`/webhooks/${id}`, 'DELETE');
    return {
      success: true,
      action: "delete_webhook",
      data: result
    };
  }

  // Utility operations
  private async getBoardIdByName(boardName: string): Promise<any> {
    const boards = await this.makeRequest('/members/me/boards');
    const board = boards.find((b: any) => b.name.toLowerCase() === boardName.toLowerCase());
    return {
      success: true,
      action: "get_board_id_by_name",
      data: {
        boardId: board?.id || null,
        boardName: boardName,
        found: !!board
      }
    };
  }

  private async getListIdByName(boardId: string, listName: string): Promise<any> {
    const lists = await this.makeRequest(`/boards/${boardId}/lists`);
    const list = lists.find((l: any) => l.name.toLowerCase() === listName.toLowerCase());
    return {
      success: true,
      action: "get_list_id_by_name",
      data: {
        listId: list?.id || null,
        listName: listName,
        found: !!list
      }
    };
  }

  private async getCardIdByName(boardId: string, cardName: string): Promise<any> {
    const cards = await this.makeRequest(`/boards/${boardId}/cards`);
    const card = cards.find((c: any) => c.name.toLowerCase() === cardName.toLowerCase());
    return {
      success: true,
      action: "get_card_id_by_name",
      data: {
        cardId: card?.id || null,
        cardName: cardName,
        found: !!card
      }
    };
  }

  private async getMemberIdByUsername(username: string): Promise<any> {
    const member = await this.makeRequest(`/members/${username}`);
    return {
      success: true,
      action: "get_member_id_by_username",
      data: {
        memberId: member?.id || null,
        username: username,
        found: !!member
      }
    };
  }

  private async bulkCreateCards(cardsData: any[]): Promise<any> {
    const results = [];
    for (const cardData of cardsData) {
      try {
        const card = await this.createCard(
          cardData.listId,
          cardData.name,
          cardData.description,
          cardData.dueDate
        );
        
        // Add labels if specified
        if (cardData.labels) {
          for (const labelId of cardData.labels) {
            await this.addLabelToCard(card.data.id, labelId);
          }
        }
        
        // Add members if specified
        if (cardData.members) {
          for (const memberId of cardData.members) {
            await this.assignMemberToCard(card.data.id, memberId);
          }
        }
        
        results.push(card);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : String(error),
          cardData
        });
      }
    }
    
    return {
      success: true,
      action: "bulk_create_cards",
      data: {
        results,
        total: cardsData.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };
  }

  private async exportBoardData(boardId: string): Promise<any> {
    const [board, lists, cards, members, labels] = await Promise.all([
      this.makeRequest(`/boards/${boardId}`),
      this.makeRequest(`/boards/${boardId}/lists`),
      this.makeRequest(`/boards/${boardId}/cards`),
      this.makeRequest(`/boards/${boardId}/members`),
      this.makeRequest(`/boards/${boardId}/labels`)
    ]);

    // Get detailed card information including checklists and attachments
    const detailedCards = await Promise.all(
      cards.map(async (card: any) => {
        const [checklists, attachments, comments] = await Promise.all([
          this.makeRequest(`/cards/${card.id}/checklists`),
          this.makeRequest(`/cards/${card.id}/attachments`),
          this.makeRequest(`/cards/${card.id}/actions?filter=commentCard`)
        ]);
        
        return {
          ...card,
          checklists,
          attachments,
          comments
        };
      })
    );

    return {
      success: true,
      action: "export_board_data",
      data: {
        board,
        lists,
        cards: detailedCards,
        members,
        labels,
        exportDate: new Date().toISOString(),
        summary: {
          totalLists: lists.length,
          totalCards: cards.length,
          totalMembers: members.length,
          totalLabels: labels.length
        }
      }
    };
  }
}