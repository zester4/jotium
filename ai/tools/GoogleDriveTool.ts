//ai/tools/GoogleDriveTool.ts
import { FunctionDeclaration, Type } from "@google/genai";
import { getDecryptedOAuthAccessToken } from "@/db/queries";

export class GoogleDriveTool {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "google_drive_operations",
      description: "Interact with Google Drive to upload files, download files, list files, create folders, search files, and manage permissions. Requires Google OAuth connection.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: ["upload_file", "download_file", "list_files", "get_file_info", "delete_file", "create_folder", "search_files", "share_file", "copy_file", "move_file"]
          },
          // File operations
          fileId: {
            type: Type.STRING,
            description: "File ID (required for download_file, get_file_info, delete_file, share_file, copy_file, move_file)"
          },
          fileName: {
            type: Type.STRING,
            description: "Name of the file (required for upload_file, copy_file)"
          },
          fileContent: {
            type: Type.STRING,
            description: "Base64 encoded file content (required for upload_file)"
          },
          mimeType: {
            type: Type.STRING,
            description: "MIME type of the file (required for upload_file)"
          },
          parentFolderId: {
            type: Type.STRING,
            description: "Parent folder ID where to upload/move file (optional, defaults to root)"
          },
          // Folder operations
          folderName: {
            type: Type.STRING,
            description: "Name of the folder (required for create_folder)"
          },
          // List/search parameters
          query: {
            type: Type.STRING,
            description: "Search query using Google Drive search syntax (for search_files)"
          },
          maxResults: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (default: 10, max: 1000)"
          },
          orderBy: {
            type: Type.STRING,
            description: "Sort order for file listing",
            enum: ["createdTime", "folder", "modifiedByMeTime", "modifiedTime", "name", "quotaBytesUsed", "recency", "sharedWithMeTime", "starred", "viewedByMeTime"]
          },
          // Sharing parameters
          shareWithEmail: {
            type: Type.STRING,
            description: "Email address to share file with (required for share_file)"
          },
          shareRole: {
            type: Type.STRING,
            description: "Role for sharing",
            enum: ["owner", "organizer", "fileOrganizer", "writer", "commenter", "reader"]
          },
          shareType: {
            type: Type.STRING,
            description: "Type of sharing",
            enum: ["user", "group", "domain", "anyone"]
          },
          // Copy parameters
          newFileName: {
            type: Type.STRING,
            description: "New file name for copied file (optional for copy_file)"
          },
          // Move parameters
          newParentFolderId: {
            type: Type.STRING,
            description: "New parent folder ID for moving file (required for move_file)"
          },
          // List filters
          includeItemsFromAllDrives: {
            type: Type.BOOLEAN,
            description: "Include items from all drives (default: false)"
          },
          spaces: {
            type: Type.STRING,
            description: "Spaces to search",
            enum: ["drive", "appDataFolder", "photos"]
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
        service: "gmail" // Using gmail service for Google OAuth
      });

      if (!accessToken) {
        return {
          success: false,
          error: "Google OAuth connection not found. Please connect your Google account first."
        };
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      switch (args.action) {
        case "upload_file":
          return await this.uploadFile(args, headers);
        case "download_file":
          return await this.downloadFile(args, headers);
        case "list_files":
          return await this.listFiles(args, headers);
        case "get_file_info":
          return await this.getFileInfo(args, headers);
        case "delete_file":
          return await this.deleteFile(args, headers);
        case "create_folder":
          return await this.createFolder(args, headers);
        case "search_files":
          return await this.searchFiles(args, headers);
        case "share_file":
          return await this.shareFile(args, headers);
        case "copy_file":
          return await this.copyFile(args, headers);
        case "move_file":
          return await this.moveFile(args, headers);
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }
    } catch (error: unknown) {
      console.error("❌ Google Drive operation failed:", error);
      return {
        success: false,
        error: `Google Drive operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async uploadFile(args: any, headers: any): Promise<any> {
    if (!args.fileName) {
      return { success: false, error: "File name is required" };
    }
    if (!args.fileContent) {
      return { success: false, error: "File content is required" };
    }
    if (!args.mimeType) {
      return { success: false, error: "MIME type is required" };
    }

    // Create file metadata
    const metadata = {
      name: args.fileName,
      parents: args.parentFolderId ? [args.parentFolderId] : undefined
    };

    // Use multipart upload for files with content
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    let body = delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) + delimiter +
      `Content-Type: ${args.mimeType}\r\n` +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      args.fileContent +
      close_delim;

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': headers.Authorization,
        'Content-Type': `multipart/related; boundary="${boundary}"`
      },
      body: body
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to upload file: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      file: this.formatFileInfo(result)
    };
  }

  private async downloadFile(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }

    // First get file info to check if it's a Google Workspace document
    const fileInfo = await this.getFileInfo(args, headers);
    if (!fileInfo.success) {
      return fileInfo;
    }

    const file = fileInfo.file;
    let downloadUrl = `https://www.googleapis.com/drive/v3/files/${args.fileId}?alt=media`;

    // Handle Google Workspace files (export instead of download)
    if (file.mimeType?.startsWith('application/vnd.google-apps.')) {
      const exportMimeType = this.getExportMimeType(file.mimeType);
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${args.fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
    }

    const response = await fetch(downloadUrl, { headers });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to download file: ${error}` };
    }

    const content = await response.arrayBuffer();
    const base64Content = Buffer.from(content).toString('base64');

    return {
      success: true,
      file: {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        content: base64Content
      }
    };
  }

  private async listFiles(args: any, headers: any): Promise<any> {
    const params = new URLSearchParams();
    params.append('fields', 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents, owners, shared, webViewLink, webContentLink)');
    
    if (args.maxResults) params.append('pageSize', String(Math.min(args.maxResults, 1000)));
    if (args.orderBy) params.append('orderBy', args.orderBy);
    if (args.includeItemsFromAllDrives) params.append('includeItemsFromAllDrives', 'true');
    if (args.spaces) params.append('spaces', args.spaces);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list files: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      files: result.files?.map((file: any) => this.formatFileInfo(file)) || [],
      nextPageToken: result.nextPageToken
    };
  }

  private async getFileInfo(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}?fields=*`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get file info: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      file: this.formatFileInfo(result)
    };
  }

  private async deleteFile(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to delete file: ${error}` };
    }

    return {
      success: true,
      message: "File deleted successfully"
    };
  }

  private async createFolder(args: any, headers: any): Promise<any> {
    if (!args.folderName) {
      return { success: false, error: "Folder name is required" };
    }

    const metadata = {
      name: args.folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: args.parentFolderId ? [args.parentFolderId] : undefined
    };

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers,
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create folder: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      folder: this.formatFileInfo(result)
    };
  }

  private async searchFiles(args: any, headers: any): Promise<any> {
    if (!args.query) {
      return { success: false, error: "Search query is required" };
    }

    const params = new URLSearchParams();
    params.append('q', args.query);
    params.append('fields', 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents, owners, shared, webViewLink, webContentLink)');
    
    if (args.maxResults) params.append('pageSize', String(Math.min(args.maxResults, 1000)));
    if (args.orderBy) params.append('orderBy', args.orderBy);
    if (args.includeItemsFromAllDrives) params.append('includeItemsFromAllDrives', 'true');
    if (args.spaces) params.append('spaces', args.spaces);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to search files: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      files: result.files?.map((file: any) => this.formatFileInfo(file)) || [],
      nextPageToken: result.nextPageToken,
      query: args.query
    };
  }

  private async shareFile(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }
    if (!args.shareWithEmail) {
      return { success: false, error: "Email address is required for sharing" };
    }

    const permission = {
      role: args.shareRole || 'reader',
      type: args.shareType || 'user',
      emailAddress: args.shareWithEmail
    };

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}/permissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(permission)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to share file: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      permission: result,
      message: `File shared successfully with ${args.shareWithEmail}`
    };
  }

  private async copyFile(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }

    const metadata = {
      name: args.newFileName || args.fileName || 'Copy of file',
      parents: args.parentFolderId ? [args.parentFolderId] : undefined
    };

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}/copy`, {
      method: 'POST',
      headers,
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to copy file: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      file: this.formatFileInfo(result)
    };
  }

  private async moveFile(args: any, headers: any): Promise<any> {
    if (!args.fileId) {
      return { success: false, error: "File ID is required" };
    }
    if (!args.newParentFolderId) {
      return { success: false, error: "New parent folder ID is required" };
    }

    // First get current parents
    const fileInfo = await this.getFileInfo(args, headers);
    if (!fileInfo.success) {
      return fileInfo;
    }

    const currentParents = fileInfo.file.parents?.join(',') || '';

    const params = new URLSearchParams();
    params.append('addParents', args.newParentFolderId);
    if (currentParents) params.append('removeParents', currentParents);

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${args.fileId}?${params}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({}) // Empty body for move operation
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to move file: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      file: this.formatFileInfo(result),
      message: "File moved successfully"
    };
  }

  private formatFileInfo(file: any): any {
    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size ? parseInt(file.size) : null,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      parents: file.parents,
      owners: file.owners?.map((owner: any) => ({
        displayName: owner.displayName,
        emailAddress: owner.emailAddress
      })),
      shared: file.shared || false,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
      thumbnailLink: file.thumbnailLink,
      iconLink: file.iconLink
    };
  }

  private getExportMimeType(googleMimeType: string): string {
    const exportMap: { [key: string]: string } = {
      'application/vnd.google-apps.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.google-apps.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.google-apps.drawing': 'image/png',
      'application/vnd.google-apps.script': 'application/vnd.google-apps.script+json'
    };

    return exportMap[googleMimeType] || 'application/pdf';
  }
}