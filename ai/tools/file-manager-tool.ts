import { FunctionDeclaration, Type } from "@google/genai";
import * as fs from "fs/promises";
import * as path from "path";
import { createReadStream, createWriteStream, FSWatcher } from "fs";
import { pipeline } from "stream/promises";

export class FileManagerTool {
  private bookmarks: Map<string, string> = new Map();
  private fileWatchers: Map<string, FSWatcher> = new Map();
  private compressionFormats = ['.zip', '.tar', '.gz', '.bz2', '.7z', '.rar'];
  private currentWorkingDirectory: string = process.cwd();

  getDefinition(): FunctionDeclaration {
    return {
      name: "file_manager",
      description: "Comprehensive local file management - read, write, list, delete, copy, move files and directories on the local machine.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Action to perform: 'read', 'write', 'append', 'list', 'delete', 'copy', 'move', 'create_dir', 'stats', 'search', 'backup', 'change_directory', 'cd', 'get_working_directory', 'pwd', 'compress', 'extract', 'watch', 'unwatch', 'bookmark', 'goto_bookmark', 'list_bookmarks', 'compare', 'find_duplicates', 'calculate_size', 'permissions', 'create_symlink', 'read_symlink', 'bulk_rename', 'file_hash', 'recent_files', 'disk_usage', 'file_type', 'merge_files', 'split_file', 'batch_operation'"
          },
          filePath: {
            type: Type.STRING,
            description: "Path to the file or directory"
          },
          content: {
            type: Type.STRING,
            description: "Content to write or append (for 'write' and 'append' actions)"
          },
          destinationPath: {
            type: Type.STRING,
            description: "Destination path (for 'copy' and 'move' actions)"
          },
          recursive: {
            type: Type.BOOLEAN,
            description: "Whether to perform action recursively (for directory operations)"
          },
          pattern: {
            type: Type.STRING,
            description: "Search pattern or file extension filter (for 'search' and 'list' actions)"
          },
          encoding: {
            type: Type.STRING,
            description: "File encoding (default: 'utf-8')"
          },
          changeDirectory: {
            type: Type.STRING,
            description: "Directory to navigate to (for cd/change_directory action)"
          },
          bookmarkName: {
            type: Type.STRING,
            description: "Name for bookmark"
          },
          compressionType: {
            type: Type.STRING,
            description: "Compression type: 'zip', 'tar', 'gzip', '7z'"
          },
          watchOptions: {
            type: Type.OBJECT,
            properties: {
              persistent: { type: Type.BOOLEAN },
              recursive: { type: Type.BOOLEAN },
              encoding: { type: Type.STRING }
            }
          },
          hashAlgorithm: {
            type: Type.STRING,
            description: "Hash algorithm: 'md5', 'sha1', 'sha256', 'sha512'"
          },
          permissions: {
            type: Type.STRING,
            description: "File permissions (octal format like '755' or symbolic like 'rwxr-xr-x')"
          },
          linkTarget: {
            type: Type.STRING,
            description: "Target path for symlink creation"
          },
          renamePattern: {
            type: Type.STRING,
            description: "Rename pattern with placeholders like '{name}_{index}'"
          },
          chunkSize: {
            type: Type.NUMBER,
            description: "Size of each chunk for file splitting (in bytes)"
          },
          operations: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "Array of operations for batch processing"
          }
        },
        required: ["action", "filePath"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      if (!args || typeof args !== 'object') {
        return { success: false, error: 'No arguments provided to file manager tool.' };
      }
      const { action, filePath, content, destinationPath, recursive, pattern, encoding = 'utf-8', changeDirectory, bookmarkName, compressionType, watchOptions, hashAlgorithm, permissions, linkTarget, renamePattern, chunkSize, operations } = args;
      
      console.log(`📁 File operation: ${action} - ${filePath}`);

      switch (action) {
        case "read":
          return await this.readFile(filePath, encoding);
          
        case "write":
          return await this.writeFile(filePath, content, encoding);
          
        case "append":
          return await this.appendFile(filePath, content, encoding);
          
        case "list":
          return await this.listDirectory(filePath, pattern, recursive);
          
        case "delete":
          return await this.deleteFile(filePath, recursive);
          
        case "copy":
          return await this.copyFile(filePath, destinationPath, recursive);
          
        case "move":
          return await this.moveFile(filePath, destinationPath);
          
        case "create_dir":
          return await this.createDirectory(filePath, recursive);
          
        case "stats":
          return await this.getFileStats(filePath);
          
        case "search":
          return await this.searchFiles(filePath, pattern);
          
        case "backup":
          return await this.backupFile(filePath);
          
        case "change_directory":
        case "cd":
          return await this.changeDirectory(args);
          
        case "get_working_directory":
        case "pwd":
          return await this.getCurrentDirectory();
          
        case "compress":
          return await this.compressFiles(args);
          
        case "extract":
          return await this.extractArchive(args);
          
        case "watch":
          return await this.watchFile(args);
          
        case "unwatch":
          return await this.unwatchFile(args);
          
        case "bookmark":
          return await this.addBookmark(args);
          
        case "goto_bookmark":
          return await this.gotoBookmark(args);
          
        case "list_bookmarks":
          return await this.listBookmarks();
          
        case "compare":
          return await this.compareFiles(args);
          
        case "find_duplicates":
          return await this.findDuplicates(args);
          
        case "calculate_size":
          return await this.calculateDirectorySize(args);
          
        case "permissions":
          return await this.managePermissions(args);
          
        case "create_symlink":
          return await this.createSymlink(args);
          
        case "read_symlink":
          return await this.readSymlink(args);
          
        case "bulk_rename":
          return await this.bulkRename(args);
          
        case "file_hash":
          return await this.calculateFileHash(args);
          
        case "recent_files":
          return await this.getRecentFiles(args);
          
        case "disk_usage":
          return await this.getDiskUsage(args);
          
        case "file_type":
          return await this.getFileType(args);
          
        case "merge_files":
          return await this.mergeFiles(args);
          
        case "split_file":
          return await this.splitFile(args);
          
        case "batch_operation":
          return await this.batchOperation(args);
          
        default:
          return { success: false, error: "Invalid file operation" };
      }
    } catch (error: unknown) {
      console.error("❌ File operation failed:", error);
      return {
        success: false,
        error: `File operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async readFile(filePath: string, encoding: string): Promise<any> {
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      return { success: false, error: "Cannot read directory as file" };
    }
    
    const content = await fs.readFile(filePath, encoding as BufferEncoding);
    return {
      success: true,
      content,
      filePath,
      size: stats.size,
      lastModified: stats.mtime.toISOString()
    };
  }

  private async writeFile(filePath: string, content: string, encoding: string): Promise<any> {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(filePath, content, encoding as BufferEncoding);
    const stats = await fs.stat(filePath);
    
    return {
      success: true,
      message: `File written successfully to ${filePath}`,
      filePath,
      size: stats.size,
      created: stats.birthtime.toISOString()
    };
  }

  private async appendFile(filePath: string, content: string, encoding: string): Promise<any> {
    await fs.appendFile(filePath, content, encoding as BufferEncoding);
    const stats = await fs.stat(filePath);
    
    return {
      success: true,
      message: `Content appended to ${filePath}`,
      filePath,
      size: stats.size,
      lastModified: stats.mtime.toISOString()
    };
  }

  private async listDirectory(dirPath: string, pattern?: string, recursive?: boolean): Promise<any> {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const fileList: any[] = [];

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      const stats = await fs.stat(fullPath);
      
      // Apply pattern filter if provided
      if (pattern && !item.name.includes(pattern) && !item.name.match(new RegExp(pattern))) {
        continue;
      }

      const fileInfo = {
        name: item.name,
        path: fullPath,
        type: item.isDirectory() ? "directory" : "file",
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        permissions: stats.mode.toString(8)
      };

      fileList.push(fileInfo);

      // Recursively list subdirectories if requested
      if (recursive && item.isDirectory()) {
        try {
          const subResult = await this.listDirectory(fullPath, pattern, recursive);
          if (subResult.success) {
            fileList.push(...subResult.files);
          }
        } catch (error) {
          // Skip directories we can't access
        }
      }
    }

    return {
      success: true,
      directory: dirPath,
      files: fileList,
      totalItems: fileList.length
    };
  }

  private async deleteFile(filePath: string, recursive?: boolean): Promise<any> {
    const stats = await fs.stat(filePath);
    
    if (stats.isDirectory()) {
      if (recursive) {
        await fs.rm(filePath, { recursive: true, force: true });
        return { success: true, message: `Directory and contents deleted: ${filePath}` };
      } else {
        await fs.rmdir(filePath);
        return { success: true, message: `Directory deleted: ${filePath}` };
      }
    } else {
      await fs.unlink(filePath);
      return { success: true, message: `File deleted: ${filePath}` };
    }
  }

  private async copyFile(sourcePath: string, destinationPath: string, recursive?: boolean): Promise<any> {
    const sourceStats = await fs.stat(sourcePath);
    
    if (sourceStats.isDirectory()) {
      if (!recursive) {
        return { success: false, error: "Use recursive flag to copy directories" };
      }
      
      await fs.mkdir(destinationPath, { recursive: true });
      const items = await fs.readdir(sourcePath);
      
      for (const item of items) {
        const srcPath = path.join(sourcePath, item);
        const destPath = path.join(destinationPath, item);
        await this.copyFile(srcPath, destPath, recursive);
      }
      
      return { success: true, message: `Directory copied from ${sourcePath} to ${destinationPath}` };
    } else {
      // Create destination directory if it doesn't exist
      const destDir = path.dirname(destinationPath);
      await fs.mkdir(destDir, { recursive: true });
      
      await pipeline(
        createReadStream(sourcePath),
        createWriteStream(destinationPath)
      );
      
      return { success: true, message: `File copied from ${sourcePath} to ${destinationPath}` };
    }
  }

  private async moveFile(sourcePath: string, destinationPath: string): Promise<any> {
    // Create destination directory if it doesn't exist
    const destDir = path.dirname(destinationPath);
    await fs.mkdir(destDir, { recursive: true });
    
    await fs.rename(sourcePath, destinationPath);
    return { success: true, message: `File moved from ${sourcePath} to ${destinationPath}` };
  }

  private async createDirectory(dirPath: string, recursive?: boolean): Promise<any> {
    await fs.mkdir(dirPath, { recursive });
    return { success: true, message: `Directory created: ${dirPath}` };
  }

  private async getFileStats(filePath: string): Promise<any> {
    const stats = await fs.stat(filePath);
    
    return {
      success: true,
      filePath,
      stats: {
        size: stats.size,
        type: stats.isDirectory() ? "directory" : "file",
        created: stats.birthtime.toISOString(),
        lastModified: stats.mtime.toISOString(),
        lastAccessed: stats.atime.toISOString(),
        permissions: stats.mode.toString(8),
        isReadable: !!(stats.mode & 0o444),
        isWritable: !!(stats.mode & 0o222),
        isExecutable: !!(stats.mode & 0o111)
      }
    };
  }

  private async searchFiles(dirPath: string, pattern: string): Promise<any> {
    const results: any[] = [];
    
    const searchRecursive = async (currentPath: string) => {
      try {
        const items = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(currentPath, item.name);
          
          // Check if file/directory name matches pattern
          if (item.name.includes(pattern) || item.name.match(new RegExp(pattern, 'i'))) {
            const stats = await fs.stat(fullPath);
            results.push({
              name: item.name,
              path: fullPath,
              type: item.isDirectory() ? "directory" : "file",
              size: stats.size,
              lastModified: stats.mtime.toISOString()
            });
          }
          
          // Recursively search subdirectories
          if (item.isDirectory()) {
            await searchRecursive(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't access
      }
    };
    
    await searchRecursive(dirPath);
    
    return {
      success: true,
      searchPath: dirPath,
      pattern,
      results,
      totalFound: results.length
    };
  }

  private async backupFile(filePath: string): Promise<any> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;
    
    const result = await this.copyFile(filePath, backupPath);
    
    if (result.success) {
      return {
        success: true,
        message: `Backup created: ${backupPath}`,
        originalPath: filePath,
        backupPath
      };
    }
    
    return result;
  }

  private async changeDirectory(args: any): Promise<any> {
    if (!args || typeof args !== 'object') {
      return { success: false, error: 'No arguments provided to changeDirectory.' };
    }
    const { changeDirectory: newDir, filePath } = args;
    const targetDir = newDir || filePath;
    
    if (!targetDir) {
      return { success: false, error: "Directory path is required (provide 'changeDirectory' or 'filePath')" };
    }

    try {
      const resolvedPath = path.resolve(this.currentWorkingDirectory, targetDir);
      const stats = await fs.stat(resolvedPath);
      
      if (!stats.isDirectory()) {
        return { success: false, error: "Path is not a directory" };
      }

      const previousDir = this.currentWorkingDirectory;
      this.currentWorkingDirectory = resolvedPath;
      
      return {
        success: true,
        message: `Changed directory to ${resolvedPath}`,
        previousDirectory: previousDir,
        currentDirectory: this.currentWorkingDirectory,
        absolutePath: resolvedPath
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to change directory: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async getCurrentDirectory(): Promise<any> {
    return {
      success: true,
      currentDirectory: this.currentWorkingDirectory,
      absolutePath: path.resolve(this.currentWorkingDirectory),
      homeDirectory: require('os').homedir(),
      tempDirectory: require('os').tmpdir()
    };
  }

  private async compressFiles(args: any): Promise<any> {
    // Implementation of compressFiles method
  }

  private async extractArchive(args: any): Promise<any> {
    // Implementation of extractArchive method
  }

  private async watchFile(args: any): Promise<any> {
    // Implementation of watchFile method
  }

  private async unwatchFile(args: any): Promise<any> {
    // Implementation of unwatchFile method
  }

  private async addBookmark(args: any): Promise<any> {
    const { bookmarkName, filePath } = args;
    
    if (!bookmarkName || !filePath) {
      return { success: false, error: "Bookmark name and path are required" };
    }

    const resolvedPath = path.resolve(this.currentWorkingDirectory, filePath);
    this.bookmarks.set(bookmarkName, resolvedPath);
    
    return {
      success: true,
      message: `Bookmark '${bookmarkName}' created for ${resolvedPath}`,
      bookmarkName,
      path: resolvedPath
    };
  }

  private async gotoBookmark(args: any): Promise<any> {
    const { bookmarkName } = args;
    
    const bookmarkPath = this.bookmarks.get(bookmarkName);
    if (!bookmarkPath) {
      return { success: false, error: `Bookmark '${bookmarkName}' not found` };
    }

    return await this.changeDirectory({ filePath: bookmarkPath });
  }

  private async listBookmarks(): Promise<any> {
    // Implementation of listBookmarks method
  }

  private async compareFiles(args: any): Promise<any> {
    // Implementation of compareFiles method
  }

  private async findDuplicates(args: any): Promise<any> {
    // Implementation of findDuplicates method
  }

  private async calculateDirectorySize(args: any): Promise<any> {
    // Implementation of calculateDirectorySize method
  }

  private async managePermissions(args: any): Promise<any> {
    // Implementation of managePermissions method
  }

  private async createSymlink(args: any): Promise<any> {
    // Implementation of createSymlink method
  }

  private async readSymlink(args: any): Promise<any> {
    // Implementation of readSymlink method
  }

  private async bulkRename(args: any): Promise<any> {
    // Implementation of bulkRename method
  }

  private async calculateFileHash(args: any): Promise<any> {
    // Implementation of calculateFileHash method
  }

  private async getRecentFiles(args: any): Promise<any> {
    // Implementation of getRecentFiles method
  }

  private async getDiskUsage(args: any): Promise<any> {
    // Implementation of getDiskUsage method
  }

  private async getFileType(args: any): Promise<any> {
    // Implementation of getFileType method
  }

  private async mergeFiles(args: any): Promise<any> {
    // Implementation of mergeFiles method
  }

  private async splitFile(args: any): Promise<any> {
    // Implementation of splitFile method
  }

  private async batchOperation(args: any): Promise<any> {
    // Implementation of batchOperation method
  }
}
