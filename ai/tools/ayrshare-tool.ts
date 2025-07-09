import { FunctionDeclaration, Type } from "@google/genai";
import axios, { AxiosInstance } from 'axios';

interface Tool {
  getDefinition(): FunctionDeclaration;
  execute(args: any): Promise<any>;
}

export class AyrshareSocialTool implements Tool {
  private apiClient: AxiosInstance;
  private baseUrl = 'https://app.ayrshare.com/api';

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
      name: "social_media",
      description: "A tool for managing social media posts and interactions across multiple platforms",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: ["post", "schedule_post", "get_analytics", "get_comments", "reply_comment", "send_message", "create_ad"]
          },
          post: {
            type: Type.STRING,
            description: "Content of the post"
          },
          platforms: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Social media platforms to target"
          },
          mediaUrls: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "URLs of media to include in the post"
          },
          scheduleDate: {
            type: Type.STRING,
            description: "Date and time to schedule the post (ISO 8601 format)"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const startTime = Date.now();
      console.log(`🚀 Executing Ayrshare action: ${args.action}`);

      let result: any;

      switch (args.action) {
        // Posting actions
        case 'post':
          result = await this.createPost(args);
          break;
        case 'schedule_post':
          result = await this.schedulePost(args);
          break;
        case 'get_post':
          result = await this.getPost(args.postId);
          break;
        case 'delete_post':
          result = await this.deletePost(args.postId);
          break;
        case 'update_post':
          result = await this.updatePost(args);
          break;

        // Analytics actions
        case 'get_analytics':
          result = await this.getAnalytics(args);
          break;
        case 'get_profile_analytics':
          result = await this.getProfileAnalytics(args);
          break;
        case 'get_post_analytics':
          result = await this.getPostAnalytics(args.postId, args);
          break;

        // Comment actions
        case 'get_comments':
          result = await this.getComments(args.postId);
          break;
        case 'reply_comment':
          result = await this.replyToComment(args);
          break;
        case 'delete_comment':
          result = await this.deleteComment(args.commentId);
          break;

        // Messaging actions
        case 'send_message':
          result = await this.sendMessage(args);
          break;
        case 'get_messages':
          result = await this.getMessages(args.conversationId);
          break;
        case 'get_conversations':
          result = await this.getConversations(args.platforms);
          break;

        // Ads actions
        case 'create_ad':
          result = await this.createAd(args.adCampaign);
          break;
        case 'get_ads':
          result = await this.getAds();
          break;
        case 'update_ad':
          result = await this.updateAd(args);
          break;
        case 'delete_ad':
          result = await this.deleteAd(args.postId);
          break;

        // Profile actions
        case 'get_profiles':
          result = await this.getProfiles();
          break;
        case 'unlink_profile':
          result = await this.unlinkProfile(args.profileId);
          break;
        case 'get_history':
          result = await this.getHistory(args);
          break;

        // Auto-schedule actions
        case 'set_auto_schedule':
          result = await this.setAutoSchedule(args.scheduleConfig);
          break;
        case 'get_auto_schedules':
          result = await this.getAutoSchedules();
          break;
        case 'delete_auto_schedule':
          result = await this.deleteAutoSchedule(args.scheduleConfig?.title);
          break;

        // Utility actions
        case 'generate_hashtags':
          result = await this.generateHashtags(args.post, args.generateCount);
          break;
        case 'shorten_url':
          result = await this.shortenUrl(args.url);
          break;
        case 'upload_media':
          result = await this.uploadMedia(args.url, args.filename);
          break;

        // User management actions
        case 'get_user_info':
          result = await this.getUserInfo();
          break;
        case 'create_user':
          result = await this.createUser(args.userConfig);
          break;
        case 'delete_user':
          result = await this.deleteUser(args.userId);
          break;

        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`,
            availableActions: [
              'post', 'schedule_post', 'get_post', 'delete_post', 'update_post',
              'get_analytics', 'get_profile_analytics', 'get_post_analytics',
              'get_comments', 'reply_comment', 'delete_comment',
              'send_message', 'get_messages', 'get_conversations',
              'create_ad', 'get_ads', 'update_ad', 'delete_ad',
              'get_profiles', 'unlink_profile', 'get_history',
              'set_auto_schedule', 'get_auto_schedules', 'delete_auto_schedule',
              'generate_hashtags', 'shorten_url', 'upload_media',
              'get_user_info', 'create_user', 'delete_user'
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
      console.error("❌ Ayrshare operation failed:", error);
      return {
        success: false,
        error: `Ayrshare operation failed: ${error.response?.data?.message || error.message}`,
        action: args.action,
        statusCode: error.response?.status,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Posting methods
  private async createPost(args: any): Promise<any> {
    const postData: any = {
      post: args.post,
      platforms: args.platforms || ['facebook', 'twitter', 'linkedin']
    };

    if (args.mediaUrls) postData.mediaUrls = args.mediaUrls;
    if (args.videoUrls) postData.videoUrls = args.videoUrls;
    if (args.shortenLinks) postData.shortenLinks = args.shortenLinks;

    // Platform-specific options
    if (args.instagramOptions) postData.instagramOptions = args.instagramOptions;
    if (args.tiktokOptions) postData.tiktokOptions = args.tiktokOptions;
    if (args.facebookOptions) postData.facebookOptions = args.facebookOptions;
    if (args.linkedinOptions) postData.linkedinOptions = args.linkedinOptions;

    const response = await this.apiClient.post('/post', postData);
    return response.data;
  }

  private async schedulePost(args: any): Promise<any> {
    const postData: any = {
      post: args.post,
      platforms: args.platforms || ['facebook', 'twitter', 'linkedin'],
      scheduleDate: args.scheduleDate
    };

    if (args.timeZone) postData.timeZone = args.timeZone;
    if (args.autoSchedule) postData.autoSchedule = args.autoSchedule;
    if (args.mediaUrls) postData.mediaUrls = args.mediaUrls;
    if (args.videoUrls) postData.videoUrls = args.videoUrls;

    const response = await this.apiClient.post('/post', postData);
    return response.data;
  }

  private async getPost(postId: string): Promise<any> {
    const response = await this.apiClient.get(`/post/${postId}`);
    return response.data;
  }

  private async deletePost(postId: string): Promise<any> {
    const response = await this.apiClient.delete(`/delete/${postId}`);
    return response.data;
  }

  private async updatePost(args: any): Promise<any> {
    const response = await this.apiClient.put(`/post/${args.postId}`, {
      post: args.post,
      platforms: args.platforms,
      scheduleDate: args.scheduleDate
    });
    return response.data;
  }

  // Analytics methods
  private async getAnalytics(args: any): Promise<any> {
    const params: any = {};
    if (args.startDate) params.startDate = args.startDate;
    if (args.endDate) params.endDate = args.endDate;
    if (args.platforms) params.platforms = args.platforms.join(',');

    const response = await this.apiClient.get('/analytics/post', { params });
    return response.data;
  }

  private async getProfileAnalytics(args: any): Promise<any> {
    const params: any = {};
    if (args.platforms) params.platforms = args.platforms.join(',');
    if (args.startDate) params.startDate = args.startDate;
    if (args.endDate) params.endDate = args.endDate;

    const response = await this.apiClient.get('/analytics/social', { params });
    return response.data;
  }

  private async getPostAnalytics(postId: string, args: any): Promise<any> {
    const response = await this.apiClient.get(`/analytics/post/${postId}`);
    return response.data;
  }

  // Comment methods
  private async getComments(postId: string): Promise<any> {
    const response = await this.apiClient.get(`/comments/${postId}`);
    return response.data;
  }

  private async replyToComment(args: any): Promise<any> {
    const response = await this.apiClient.post('/comments/reply', {
      commentId: args.commentId,
      message: args.message
    });
    return response.data;
  }

  private async deleteComment(commentId: string): Promise<any> {
    const response = await this.apiClient.delete(`/comments/${commentId}`);
    return response.data;
  }

  // Messaging methods
  private async sendMessage(args: any): Promise<any> {
    const response = await this.apiClient.post('/message', {
      message: args.message,
      userId: args.userId,
      platforms: args.platforms
    });
    return response.data;
  }

  private async getMessages(conversationId: string): Promise<any> {
    const response = await this.apiClient.get(`/messages/${conversationId}`);
    return response.data;
  }

  private async getConversations(platforms: string[]): Promise<any> {
    const params = platforms ? { platforms: platforms.join(',') } : {};
    const response = await this.apiClient.get('/conversations', { params });
    return response.data;
  }

  // Ads methods
  private async createAd(adCampaign: any): Promise<any> {
    const response = await this.apiClient.post('/ads', adCampaign);
    return response.data;
  }

  private async getAds(): Promise<any> {
    const response = await this.apiClient.get('/ads');
    return response.data;
  }

  private async updateAd(args: any): Promise<any> {
    const response = await this.apiClient.put(`/ads/${args.postId}`, args.adCampaign);
    return response.data;
  }

  private async deleteAd(adId: string): Promise<any> {
    const response = await this.apiClient.delete(`/ads/${adId}`);
    return response.data;
  }

  // Profile methods
  private async getProfiles(): Promise<any> {
    const response = await this.apiClient.get('/profiles');
    return response.data;
  }

  private async unlinkProfile(profileId: string): Promise<any> {
    const response = await this.apiClient.delete(`/profiles/${profileId}`);
    return response.data;
  }

  private async getHistory(args: any): Promise<any> {
    const params: any = {};
    if (args.startDate) params.startDate = args.startDate;
    if (args.endDate) params.endDate = args.endDate;
    if (args.platforms) params.platforms = args.platforms.join(',');

    const response = await this.apiClient.get('/history', { params });
    return response.data;
  }

  // Auto-schedule methods
  private async setAutoSchedule(scheduleConfig: any): Promise<any> {
    const response = await this.apiClient.post('/auto-schedule', scheduleConfig);
    return response.data;
  }

  private async getAutoSchedules(): Promise<any> {
    const response = await this.apiClient.get('/auto-schedule');
    return response.data;
  }

  private async deleteAutoSchedule(title: string): Promise<any> {
    const response = await this.apiClient.delete(`/auto-schedule/${title}`);
    return response.data;
  }

  // Utility methods
  private async generateHashtags(post: string, count: number = 5): Promise<any> {
    const response = await this.apiClient.post('/generate-hashtags', {
      post: post,
      number: Math.min(count, 30)
    });
    return response.data;
  }

  private async shortenUrl(url: string): Promise<any> {
    const response = await this.apiClient.post('/shorten', { url });
    return response.data;
  }

  private async uploadMedia(url: string, filename?: string): Promise<any> {
    const response = await this.apiClient.post('/upload', {
      url: url,
      fileName: filename
    });
    return response.data;
  }

  // User management methods
  private async getUserInfo(): Promise<any> {
    const response = await this.apiClient.get('/user');
    return response.data;
  }

  private async createUser(userConfig: any): Promise<any> {
    const response = await this.apiClient.post('/user', userConfig);
    return response.data;
  }

  private async deleteUser(userId: string): Promise<any> {
    const response = await this.apiClient.delete(`/user/${userId}`);
    return response.data;
  }
}

// Usage Examples:
/*
// Initialize the tool
const ayrshare = new AyrshareSocialTool("your-ayrshare-api-key");

// Post to multiple platforms
const postResult = await ayrshare.execute({
    action: "post",
    post: "Check out this amazing content! 🚀 #socialmedia #content",
    platforms: ["facebook", "twitter", "linkedin", "instagram"],
    mediaUrls: ["https://example.com/image.jpg"],
    shortenLinks: true,
    instagramOptions: {
        altText: "Amazing content image",
        locationId: "123456789"
    }
});

// Schedule a post with auto-scheduling
const scheduleResult = await ayrshare.execute({
    action: "schedule_post",
    post: "Scheduled post content",
    platforms: ["twitter", "linkedin"],
    autoSchedule: "optimal_times",
    timeZone: "America/New_York"
});

// Get comprehensive analytics
const analyticsResult = await ayrshare.execute({
    action: "get_analytics",
    platforms: ["facebook", "instagram", "twitter"],
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z",
    metrics: ["views", "likes", "shares", "comments", "engagement"]
});

// Create TikTok post with specific options
const tiktokResult = await ayrshare.execute({
    action: "post",
    post: "TikTok viral content! #viral #tiktok",
    platforms: ["tiktok"],
    videoUrls: ["https://example.com/video.mp4"],
    tiktokOptions: {
        privacy: "public",
        duetEnabled: true,
        commentEnabled: true,
        stitchEnabled: false
    }
});

// Manage comments
const commentsResult = await ayrshare.execute({
    action: "get_comments",
    postId: "post_12345"
});

// Reply to comment
const replyResult = await ayrshare.execute({
    action: "reply_comment",
    commentId: "comment_67890",
    message: "Thank you for your comment!"
});

// Generate hashtags
const hashtagsResult = await ayrshare.execute({
    action: "generate_hashtags",
    post: "This is my amazing travel blog post about Paris",
    generateCount: 10
});

// Create Facebook ad
const adResult = await ayrshare.execute({
    action: "create_ad",
    adCampaign: {
        objective: "reach",
        budget: 100,
        audience: {
            age_min: 18,
            age_max: 65,
            interests: ["travel", "photography"]
        },
        creative: {
            title: "Amazing Travel Deals",
            body: "Discover the world with our exclusive offers",
            image_url: "https://example.com/ad-image.jpg"
        }
    }
});

// Set up auto-scheduling
const autoScheduleResult = await ayrshare.execute({
    action: "set_auto_schedule",
    scheduleConfig: {
        title: "daily_posts",
        timezone: "America/New_York",
        schedule: [
            { day: "monday", times: ["09:00", "15:00"] },
            { day: "tuesday", times: ["10:00", "16:00"] }
        ],
        platforms: ["facebook", "twitter", "linkedin"]
    }
});
*/
