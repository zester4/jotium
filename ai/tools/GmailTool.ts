//ai/tools/GmailTool.ts
import { FunctionDeclaration, Type } from "@google/genai";
import { getDecryptedOAuthAccessToken } from "@/db/queries";

export class GmailTool {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "gmail_operations",
      description: "Interact with Gmail to send emails, read emails, search messages, and manage labels. Requires Gmail OAuth connection.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: ["send_email", "list_messages", "get_message", "search_messages", "create_label", "list_labels"]
          },
          // Send email parameters
          to: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Email recipients (required for send_email)"
          },
          cc: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "CC recipients (optional for send_email)"
          },
          bcc: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "BCC recipients (optional for send_email)"
          },
          subject: {
            type: Type.STRING,
            description: "Email subject (required for send_email)"
          },
          body: {
            type: Type.STRING,
            description: "Email body content (required for send_email)"
          },
          isHtml: {
            type: Type.BOOLEAN,
            description: "Whether the email body is HTML (default: false)"
          },
          // List/search parameters
          query: {
            type: Type.STRING,
            description: "Search query for messages (Gmail search syntax)"
          },
          maxResults: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (default: 10, max: 100)"
          },
          labelIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Label IDs to filter messages"
          },
          // Message ID for get_message
          messageId: {
            type: Type.STRING,
            description: "Message ID to retrieve (required for get_message)"
          },
          // Label creation
          labelName: {
            type: Type.STRING,
            description: "Name of the label to create (required for create_label)"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const accessToken = await getDecryptedOAuthAccessToken({ 
        userId: this.userId, 
        service: "gmail" 
      });

      if (!accessToken) {
        return {
          success: false,
          error: "Gmail OAuth connection not found. Please connect your Gmail account first."
        };
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      switch (args.action) {
        case "send_email":
          return await this.sendEmail(args, headers);
        case "list_messages":
          return await this.listMessages(args, headers);
        case "get_message":
          return await this.getMessage(args, headers);
        case "search_messages":
          return await this.searchMessages(args, headers);
        case "create_label":
          return await this.createLabel(args, headers);
        case "list_labels":
          return await this.listLabels(headers);
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }
    } catch (error: unknown) {
      console.error("❌ Gmail operation failed:", error);
      return {
        success: false,
        error: `Gmail operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async sendEmail(args: any, headers: any): Promise<any> {
    if (!args.to || !Array.isArray(args.to) || args.to.length === 0) {
      return { success: false, error: "Recipients (to) are required for sending email" };
    }
    if (!args.subject) {
      return { success: false, error: "Subject is required for sending email" };
    }
    if (!args.body) {
      return { success: false, error: "Body is required for sending email" };
    }

    // Create email content
    const email = this.createEmailMessage({
      to: args.to,
      cc: args.cc || [],
      bcc: args.bcc || [],
      subject: args.subject,
      body: args.body,
      isHtml: args.isHtml || false
    });

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        raw: Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to send email: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.id,
      threadId: result.threadId,
      labelIds: result.labelIds
    };
  }

  private async listMessages(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    if (args.maxResults) params.append('maxResults', String(Math.min(args.maxResults, 100)));
    if (args.labelIds && Array.isArray(args.labelIds)) {
      args.labelIds.forEach((labelId: string) => params.append('labelIds', labelId));
    }
    if (args.query) params.append('q', args.query);

    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list messages: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      messages: result.messages || [],
      nextPageToken: result.nextPageToken,
      resultSizeEstimate: result.resultSizeEstimate
    };
  }

  private async getMessage(args: any, headers: any): Promise<any> {
    if (!args.messageId) {
      return { success: false, error: "Message ID is required" };
    }

    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${args.messageId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get message: ${error}` };
    }

    const message = await response.json();
    
    // Parse message for easier consumption
    const parsed = this.parseMessage(message);
    
    return {
      success: true,
      message: parsed
    };
  }

  private async searchMessages(args: any, headers: any): Promise<any> {
    if (!args.query) {
      return { success: false, error: "Query is required for search" };
    }

    return await this.listMessages(args, headers);
  }

  private async createLabel(args: any, headers: any): Promise<any> {
    if (!args.labelName) {
      return { success: false, error: "Label name is required" };
    }

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: args.labelName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create label: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      label: result
    };
  }

  private async listLabels(headers: any): Promise<any> {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list labels: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      labels: result.labels || []
    };
  }

  private createEmailMessage(emailData: any): string {
    const { to, cc, bcc, subject, body, isHtml } = emailData;
    
    let email = '';
    email += `To: ${to.join(', ')}\r\n`;
    if (cc && cc.length > 0) email += `Cc: ${cc.join(', ')}\r\n`;
    if (bcc && bcc.length > 0) email += `Bcc: ${bcc.join(', ')}\r\n`;
    email += `Subject: ${subject}\r\n`;
    email += `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset=utf-8\r\n`;
    email += `MIME-Version: 1.0\r\n\r\n`;
    email += body;
    
    return email;
  }

  private parseMessage(message: any): any {
    const headers = message.payload?.headers || [];
    const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value;

    let body = '';
    if (message.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload?.parts) {
      // Handle multipart messages
      const textPart = message.payload.parts.find((part: any) => part.mimeType === 'text/plain');
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    }

    return {
      id: message.id,
      threadId: message.threadId,
      labelIds: message.labelIds,
      snippet: message.snippet,
      historyId: message.historyId,
      internalDate: message.internalDate,
      from: getHeader('From'),
      to: getHeader('To'),
      cc: getHeader('Cc'),
      bcc: getHeader('Bcc'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      body,
      sizeEstimate: message.sizeEstimate
    };
  }
}