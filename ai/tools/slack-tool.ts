import { FunctionDeclaration, Type } from "@google/genai";
import { WebClient } from "@slack/web-api";
import { RTMClient } from "@slack/rtm-api";

export interface SlackToolConfig {
  botToken: string;
  userToken?: string;
  signingSecret?: string;
  appToken?: string;
  socketMode?: boolean;
  rateLimitTier?: 'standard' | 'plus' | 'enterprise';
  retryConfig?: {
    retries: number;
    factor: number;
  };
}

export interface SlackMessage {
  text: string;
  channel: string;
  attachments?: any[];
  blocks?: any[];
  threadTs?: string;
  asUser?: boolean;
  iconEmoji?: string;
  iconUrl?: string;
  username?: string;
  unfurlLinks?: boolean;
  unfurlMedia?: boolean;
  parse?: 'full' | 'none';
  linkNames?: boolean;
  replyBroadcast?: boolean;
  mrkdwn?: boolean;
}

export class SlackTool {
  private webClient: WebClient;
  private rtmClient?: RTMClient;
  private config: SlackToolConfig;
  private rateLimitInfo: Map<string, { remaining: number; resetTime: number }> = new Map();

  constructor(config: SlackToolConfig) {
    this.config = config;
    this.webClient = new WebClient(config.botToken, {
      retryConfig: config.retryConfig || { retries: 3, factor: 2 }
    });

    if (config.socketMode && config.appToken) {
      this.rtmClient = new RTMClient(config.appToken);
    }
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "slack_action",
      description: "Perform comprehensive Slack operations including messaging, channel management, user interactions, file handling, and workspace administration. Supports real-time messaging, advanced formatting, and enterprise features.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The Slack action to perform",
            enum: [
              // Messaging actions
              "send_message", "update_message", "delete_message", "send_dm", "send_ephemeral",
              "add_reaction", "remove_reaction", "pin_message", "unpin_message", "share_message",
              "schedule_message", "cancel_scheduled_message", "get_permalink",
              
              // Channel management
              "create_channel", "archive_channel", "unarchive_channel", "rename_channel",
              "set_channel_topic", "set_channel_purpose", "invite_to_channel", "kick_from_channel",
              "leave_channel", "join_channel", "list_channels", "get_channel_info",
              "set_channel_retention", "get_channel_history",
              
              // User management
              "get_user_info", "list_users", "set_user_status", "get_user_presence",
              "set_user_presence", "get_user_profile", "update_user_profile",
              "deactivate_user", "invite_user", "get_user_stats",
              
              // File operations
              "upload_file", "delete_file", "share_file", "get_file_info",
              "list_files", "add_file_comment", "get_file_comments",
              
              // Workspace management
              "get_team_info", "get_billable_info", "get_access_logs",
              "set_team_profile", "get_emoji_list", "get_workspace_stats",
              
              // Search and discovery
              "search_messages", "search_files", "search_users", "search_channels",
              
              // Integrations and apps
              "list_apps", "get_app_info", "install_app", "uninstall_app",
              "create_webhook", "test_webhook", "list_webhooks",
              
              // Analytics and reporting
              "get_analytics", "get_channel_analytics", "get_user_analytics",
              "export_data", "get_audit_logs",
              
              // Real-time features
              "start_rtm", "stop_rtm", "send_typing_indicator",
              
              // Workflow and automation
              "create_workflow", "trigger_workflow", "list_workflows",
              "create_reminder", "list_reminders", "delete_reminder"
            ]
          },
          
          // Message parameters
          channel: {
            type: Type.STRING,
            description: "Channel ID or name (for messaging actions)"
          },
          text: {
            type: Type.STRING,
            description: "Message text content"
          },
          user: {
            type: Type.STRING,
            description: "User ID or username"
          },
          timestamp: {
            type: Type.STRING,
            description: "Message timestamp (for updating/deleting messages)"
          },
          threadTs: {
            type: Type.STRING,
            description: "Thread timestamp for threaded messages"
          },
          
          // Advanced message formatting
          blocks: {
            type: Type.ARRAY,
            description: "Slack Block Kit elements for rich message formatting",
            items: { type: Type.OBJECT }
          },
          attachments: {
            type: Type.ARRAY,
            description: "Message attachments (legacy format)",
            items: { type: Type.OBJECT }
          },
          
          // Message options
          asUser: {
            type: Type.BOOLEAN,
            description: "Send message as the authenticated user"
          },
          iconEmoji: {
            type: Type.STRING,
            description: "Emoji to use as the bot's avatar"
          },
          iconUrl: {
            type: Type.STRING,
            description: "URL of image to use as the bot's avatar"
          },
          username: {
            type: Type.STRING,
            description: "Username for the bot"
          },
          unfurlLinks: {
            type: Type.BOOLEAN,
            description: "Enable link unfurling"
          },
          unfurlMedia: {
            type: Type.BOOLEAN,
            description: "Enable media unfurling"
          },
          replyBroadcast: {
            type: Type.BOOLEAN,
            description: "Broadcast thread reply to channel"
          },
          
          // Scheduling
          postAt: {
            type: Type.NUMBER,
            description: "Unix timestamp for scheduled messages"
          },
          
          // Channel management
          channelName: {
            type: Type.STRING,
            description: "Name for new channel"
          },
          isPrivate: {
            type: Type.BOOLEAN,
            description: "Create private channel"
          },
          topic: {
            type: Type.STRING,
            description: "Channel topic"
          },
          purpose: {
            type: Type.STRING,
            description: "Channel purpose"
          },
          
          // File operations
          file: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING, description: "Base64 encoded file content" },
              filename: { type: Type.STRING, description: "Filename" },
              filetype: { type: Type.STRING, description: "File type" },
              title: { type: Type.STRING, description: "File title" },
              initialComment: { type: Type.STRING, description: "Initial comment" }
            }
          },
          fileId: {
            type: Type.STRING,
            description: "File ID for file operations"
          },
          
          // Search parameters
          query: {
            type: Type.STRING,
            description: "Search query"
          },
          sort: {
            type: Type.STRING,
            description: "Sort order for search results",
            enum: ["score", "timestamp"]
          },
          sortDir: {
            type: Type.STRING,
            description: "Sort direction",
            enum: ["asc", "desc"]
          },
          count: {
            type: Type.NUMBER,
            description: "Number of results to return"
          },
          page: {
            type: Type.NUMBER,
            description: "Page number for pagination"
          },
          
          // User profile updates
          profile: {
            type: Type.OBJECT,
            description: "User profile fields to update"
          },
          
          // Status and presence
          status: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "Status text" },
              emoji: { type: Type.STRING, description: "Status emoji" },
              expiration: { type: Type.NUMBER, description: "Status expiration timestamp" }
            }
          },
          presence: {
            type: Type.STRING,
            description: "User presence",
            enum: ["auto", "away"]
          },
          
          // Reaction management
          name: {
            type: Type.STRING,
            description: "Reaction emoji name (without colons)"
          },
          
          // Analytics and reporting
          dateFrom: {
            type: Type.STRING,
            description: "Start date for analytics (YYYY-MM-DD)"
          },
          dateTo: {
            type: Type.STRING,
            description: "End date for analytics (YYYY-MM-DD)"
          },
          
          // Webhook configuration
          webhook: {
            type: Type.OBJECT,
            properties: {
              url: { type: Type.STRING, description: "Webhook URL" },
              channel: { type: Type.STRING, description: "Target channel" },
              username: { type: Type.STRING, description: "Webhook username" },
              iconEmoji: { type: Type.STRING, description: "Webhook icon emoji" },
              iconUrl: { type: Type.STRING, description: "Webhook icon URL" }
            }
          },
          
          // Advanced options
          includeLocale: {
            type: Type.BOOLEAN,
            description: "Include locale information in responses"
          },
          cursor: {
            type: Type.STRING,
            description: "Pagination cursor"
          },
          limit: {
            type: Type.NUMBER,
            description: "Maximum number of items to return"
          },
          oldest: {
            type: Type.STRING,
            description: "Oldest timestamp for history queries"
          },
          latest: {
            type: Type.STRING,
            description: "Latest timestamp for history queries"
          },
          inclusive: {
            type: Type.BOOLEAN,
            description: "Include messages with oldest and latest timestamps"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`🔔 Slack Action: ${args.action}`);
      
      // Check rate limits
      await this.checkRateLimit(args.action);
      
      const result = await this.executeAction(args);
      
      // Update rate limit info
      this.updateRateLimit(args.action, result);
      
      return {
        success: true,
        action: args.action,
        data: result,
        timestamp: new Date().toISOString(),
        rateLimitInfo: this.getRateLimitInfo(args.action)
      };
      
    } catch (error: any) {
      console.error(`❌ Slack action failed:`, error.message);
      
      return {
        success: false,
        action: args.action,
        error: {
          message: error.message,
          code: error.code,
          data: error.data
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  private async executeAction(args: any): Promise<any> {
    switch (args.action) {
      // Messaging actions
      case "send_message":
        return await this.sendMessage(args);
      case "update_message":
        return await this.updateMessage(args);
      case "delete_message":
        return await this.deleteMessage(args);
      case "send_dm":
        return await this.sendDirectMessage(args);
      case "send_ephemeral":
        return await this.sendEphemeralMessage(args);
      case "schedule_message":
        return await this.scheduleMessage(args);
      case "get_permalink":
        return await this.getPermalink(args);
        
      // Reactions
      case "add_reaction":
        return await this.addReaction(args);
      case "remove_reaction":
        return await this.removeReaction(args);
        
      // Channel management
      case "create_channel":
        return await this.createChannel(args);
      case "list_channels":
        return await this.listChannels(args);
      case "get_channel_info":
        return await this.getChannelInfo(args);
      case "invite_to_channel":
        return await this.inviteToChannel(args);
      case "set_channel_topic":
        return await this.setChannelTopic(args);
      case "get_channel_history":
        return await this.getChannelHistory(args);
        
      // User management
      case "get_user_info":
        return await this.getUserInfo(args);
      case "list_users":
        return await this.listUsers(args);
      case "set_user_status":
        return await this.setUserStatus(args);
      case "get_user_presence":
        return await this.getUserPresence(args);
        
      // File operations
      case "upload_file":
        return await this.uploadFile(args);
      case "list_files":
        return await this.listFiles(args);
      case "get_file_info":
        return await this.getFileInfo(args);
        
      // Search
      case "search_messages":
        return await this.searchMessages(args);
      case "search_files":
        return await this.searchFiles(args);
        
      // Team/Workspace
      case "get_team_info":
        return await this.getTeamInfo();
      case "get_emoji_list":
        return await this.getEmojiList();
        
      // Analytics
      case "get_analytics":
        return await this.getAnalytics(args);
        
      default:
        throw new Error(`Unsupported action: ${args.action}`);
    }
  }

  // Messaging methods
  private async sendMessage(args: any): Promise<any> {
    const messageOptions: any = {
      channel: args.channel,
      text: args.text,
      blocks: args.blocks,
      attachments: args.attachments,
      thread_ts: args.threadTs,
      as_user: args.asUser,
      icon_emoji: args.iconEmoji,
      icon_url: args.iconUrl,
      username: args.username,
      unfurl_links: args.unfurlLinks,
      unfurl_media: args.unfurlMedia,
      reply_broadcast: args.replyBroadcast
    };

    return await this.webClient.chat.postMessage(messageOptions);
  }

  private async updateMessage(args: any): Promise<any> {
    return await this.webClient.chat.update({
      channel: args.channel,
      ts: args.timestamp,
      text: args.text,
      blocks: args.blocks,
      attachments: args.attachments
    });
  }

  private async deleteMessage(args: any): Promise<any> {
    return await this.webClient.chat.delete({
      channel: args.channel,
      ts: args.timestamp
    });
  }

  private async sendDirectMessage(args: any): Promise<any> {
    // Open DM channel first
    const dmChannel = await this.webClient.conversations.open({
      users: args.user
    });

    return await this.sendMessage({
      ...args,
      channel: dmChannel.channel?.id
    });
  }

  private async sendEphemeralMessage(args: any): Promise<any> {
    return await this.webClient.chat.postEphemeral({
      channel: args.channel,
      user: args.user,
      text: args.text,
      blocks: args.blocks,
      attachments: args.attachments
    });
  }

  private async scheduleMessage(args: any): Promise<any> {
    return await this.webClient.chat.scheduleMessage({
      channel: args.channel,
      text: args.text,
      post_at: args.postAt,
      blocks: args.blocks,
      attachments: args.attachments
    });
  }

  private async getPermalink(args: any): Promise<any> {
    return await this.webClient.chat.getPermalink({
      channel: args.channel,
      message_ts: args.timestamp
    });
  }

  // Reaction methods
  private async addReaction(args: any): Promise<any> {
    return await this.webClient.reactions.add({
      channel: args.channel,
      timestamp: args.timestamp,
      name: args.name
    });
  }

  private async removeReaction(args: any): Promise<any> {
    return await this.webClient.reactions.remove({
      channel: args.channel,
      timestamp: args.timestamp,
      name: args.name
    });
  }

  // Channel management methods
  private async createChannel(args: any): Promise<any> {
    return await this.webClient.conversations.create({
      name: args.channelName,
      is_private: args.isPrivate || false
    });
  }

  private async listChannels(args: any): Promise<any> {
    return await this.webClient.conversations.list({
      exclude_archived: true,
      limit: args.limit || 100,
      cursor: args.cursor
    });
  }

  private async getChannelInfo(args: any): Promise<any> {
    return await this.webClient.conversations.info({
      channel: args.channel,
      include_locale: args.includeLocale
    });
  }

  private async inviteToChannel(args: any): Promise<any> {
    return await this.webClient.conversations.invite({
      channel: args.channel,
      users: args.user
    });
  }

  private async setChannelTopic(args: any): Promise<any> {
    return await this.webClient.conversations.setTopic({
      channel: args.channel,
      topic: args.topic
    });
  }

  private async getChannelHistory(args: any): Promise<any> {
    return await this.webClient.conversations.history({
      channel: args.channel,
      oldest: args.oldest,
      latest: args.latest,
      limit: args.limit || 100,
      inclusive: args.inclusive
    });
  }

  // User management methods
  private async getUserInfo(args: any): Promise<any> {
    return await this.webClient.users.info({
      user: args.user,
      include_locale: args.includeLocale
    });
  }

  private async listUsers(args: any): Promise<any> {
    return await this.webClient.users.list({
      cursor: args.cursor,
      limit: args.limit || 100,
      include_locale: args.includeLocale
    });
  }

  private async setUserStatus(args: any): Promise<any> {
    return await this.webClient.users.profile.set({
      profile: {
        status_text: args.status?.text,
        status_emoji: args.status?.emoji,
        status_expiration: args.status?.expiration
      }
    });
  }

  private async getUserPresence(args: any): Promise<any> {
    return await this.webClient.users.getPresence({
      user: args.user
    });
  }

  // File operations
  private async uploadFile(args: any): Promise<any> {
    const fileBuffer = Buffer.from(args.file.content, 'base64');
    
    return await this.webClient.files.upload({
      channels: args.channel,
      file: fileBuffer,
      filename: args.file.filename,
      filetype: args.file.filetype,
      title: args.file.title,
      initial_comment: args.file.initialComment
    });
  }

  private async listFiles(args: any): Promise<any> {
    return await this.webClient.files.list({
      user: args.user,
      channel: args.channel,
      count: args.count || 100,
      page: args.page || 1
    });
  }

  private async getFileInfo(args: any): Promise<any> {
    return await this.webClient.files.info({
      file: args.fileId
    });
  }

  // Search methods
  private async searchMessages(args: any): Promise<any> {
    return await this.webClient.search.messages({
      query: args.query,
      sort: args.sort,
      sort_dir: args.sortDir,
      count: args.count || 20,
      page: args.page || 1
    });
  }

  private async searchFiles(args: any): Promise<any> {
    return await this.webClient.search.files({
      query: args.query,
      sort: args.sort,
      sort_dir: args.sortDir,
      count: args.count || 20,
      page: args.page || 1
    });
  }

  // Team/Workspace methods
  private async getTeamInfo(): Promise<any> {
    return await this.webClient.team.info();
  }

  private async getEmojiList(): Promise<any> {
    return await this.webClient.emoji.list();
  }

  // Analytics (mock implementation - would need specific APIs)
  private async getAnalytics(args: any): Promise<any> {
    // This would integrate with Slack Analytics API when available
    return {
      message: "Analytics data would be fetched from Slack Analytics API",
      dateRange: {
        from: args.dateFrom,
        to: args.dateTo
      }
    };
  }

  // Rate limiting
  private async checkRateLimit(action: string): Promise<void> {
    const rateInfo = this.rateLimitInfo.get(action);
    if (rateInfo && rateInfo.remaining <= 0 && Date.now() < rateInfo.resetTime) {
      const waitTime = rateInfo.resetTime - Date.now();
      console.log(`⏳ Rate limit hit for ${action}, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  private updateRateLimit(action: string, result: any): void {
    // Update based on response headers if available
    if (result?.response_metadata?.messages_remaining) {
      this.rateLimitInfo.set(action, {
        remaining: result.response_metadata.messages_remaining,
        resetTime: Date.now() + 60000 // 1 minute default
      });
    }
  }

  private getRateLimitInfo(action: string): any {
    return this.rateLimitInfo.get(action) || { remaining: 'unknown', resetTime: 'unknown' };
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      await this.webClient.auth.test();
      return true;
    } catch {
      return false;
    }
  }

  async getBotInfo(): Promise<any> {
    return await this.webClient.auth.test();
  }

  // Convenience methods for common patterns
  async sendRichMessage(channel: string, title: string, text: string, color: string = 'good'): Promise<any> {
    return await this.execute({
      action: 'send_message',
      channel,
      attachments: [{
        title,
        text,
        color,
        footer: 'Sent via Advanced Slack Tool',
        ts: Math.floor(Date.now() / 1000)
      }]
    });
  }

  async sendBlockMessage(channel: string, blocks: any[]): Promise<any> {
    return await this.execute({
      action: 'send_message',
      channel,
      blocks
    });
  }

  async createAnnouncement(channel: string, title: string, message: string): Promise<any> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `📢 Posted on ${new Date().toLocaleDateString()}`
          }
        ]
      }
    ];

    return await this.sendBlockMessage(channel, blocks);
  }
}

// Factory function
export function createSlackTool(config: SlackToolConfig): SlackTool {
  return new SlackTool(config);
}
