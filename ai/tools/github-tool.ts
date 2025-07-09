import { FunctionDeclaration, Type } from "@google/genai";
import { Octokit } from "@octokit/rest";

export class GithubTool {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "github_operations",
      description: "Comprehensive GitHub tool for repository management, file operations, commits, issues, pull requests, and more. Supports 20+ GitHub operations.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The GitHub operation to perform",
            enum: [
              // Repository operations
              "create_repo",
              "delete_repo",
              "get_repo",
              "list_repos",
              "update_repo",
              "fork_repo",
              "star_repo",
              "unstar_repo",
              
              // File operations
              "create_file",
              "update_file",
              "delete_file",
              "get_file",
              "list_files",
              "rename_file",
              
              // Commit operations
              "create_commit",
              "get_commit",
              "list_commits",
              "compare_commits",
              
              // Branch operations
              "create_branch",
              "delete_branch",
              "list_branches",
              "get_branch",
              "merge_branch",
              
              // Issue operations
              "create_issue",
              "update_issue",
              "close_issue",
              "list_issues",
              "get_issue",
              "add_issue_comment",
              
              // Pull Request operations
              "create_pull_request",
              "update_pull_request",
              "merge_pull_request",
              "close_pull_request",
              "list_pull_requests",
              "get_pull_request",
              
              // Release operations
              "create_release",
              "update_release",
              "delete_release",
              "list_releases",
              "get_release",
              
              // User/Organization operations
              "get_user",
              "list_user_repos",
              "get_organization",
              "list_org_repos",
              
              // Collaboration operations
              "add_collaborator",
              "remove_collaborator",
              "list_collaborators",
              
              // Webhook operations
              "create_webhook",
              "delete_webhook",
              "list_webhooks"
            ]
          },
          owner: {
            type: Type.STRING,
            description: "Repository owner (username or organization)"
          },
          repo: {
            type: Type.STRING,
            description: "Repository name"
          },
          path: {
            type: Type.STRING,
            description: "File path (for file operations)"
          },
          content: {
            type: Type.STRING,
            description: "File content or commit message"
          },
          message: {
            type: Type.STRING,
            description: "Commit message or description"
          },
          branch: {
            type: Type.STRING,
            description: "Branch name (default: main/master)"
          },
          title: {
            type: Type.STRING,
            description: "Title for issues, pull requests, or releases"
          },
          body: {
            type: Type.STRING,
            description: "Body content for issues, pull requests, or releases"
          },
          base: {
            type: Type.STRING,
            description: "Base branch for pull requests or comparisons"
          },
          head: {
            type: Type.STRING,
            description: "Head branch for pull requests or comparisons"
          },
          sha: {
            type: Type.STRING,
            description: "Commit SHA for specific operations"
          },
          tag: {
            type: Type.STRING,
            description: "Tag name for releases"
          },
          username: {
            type: Type.STRING,
            description: "Username for user operations or collaborator management"
          },
          permission: {
            type: Type.STRING,
            description: "Permission level for collaborators",
            enum: ["pull", "push", "admin", "maintain", "triage"]
          },
          private: {
            type: Type.BOOLEAN,
            description: "Whether repository should be private (default: false)"
          },
          description: {
            type: Type.STRING,
            description: "Repository or release description"
          },
          homepage: {
            type: Type.STRING,
            description: "Repository homepage URL"
          },
          hasIssues: {
            type: Type.BOOLEAN,
            description: "Enable issues for repository"
          },
          hasWiki: {
            type: Type.BOOLEAN,
            description: "Enable wiki for repository"
          },
          autoInit: {
            type: Type.BOOLEAN,
            description: "Initialize repository with README"
          },
          gitignoreTemplate: {
            type: Type.STRING,
            description: "Gitignore template to use"
          },
          licenseTemplate: {
            type: Type.STRING,
            description: "License template to use"
          },
          state: {
            type: Type.STRING,
            description: "State for issues/PRs",
            enum: ["open", "closed", "all"]
          },
          labels: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Labels for issues or pull requests"
          },
          assignees: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Assignees for issues or pull requests"
          },
          draft: {
            type: Type.BOOLEAN,
            description: "Create pull request as draft"
          },
          prerelease: {
            type: Type.BOOLEAN,
            description: "Mark release as prerelease"
          },
          generateReleaseNotes: {
            type: Type.BOOLEAN,
            description: "Auto-generate release notes"
          },
          webhookUrl: {
            type: Type.STRING,
            description: "Webhook URL for webhook operations"
          },
          webhookEvents: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Events to trigger webhook"
          },
          page: {
            type: Type.NUMBER,
            description: "Page number for paginated results (default: 1)"
          },
          perPage: {
            type: Type.NUMBER,
            description: "Items per page (default: 30, max: 100)"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`🐙 GitHub operation: ${args.action}`);
      
      switch (args.action) {
        // Repository operations
        case "create_repo":
          return await this.createRepository(args);
        case "delete_repo":
          return await this.deleteRepository(args);
        case "get_repo":
          return await this.getRepository(args);
        case "list_repos":
          return await this.listRepositories(args);
        case "update_repo":
          return await this.updateRepository(args);
        case "fork_repo":
          return await this.forkRepository(args);
        case "star_repo":
          return await this.starRepository(args);
        case "unstar_repo":
          return await this.unstarRepository(args);

        // File operations
        case "create_file":
          return await this.createFile(args);
        case "update_file":
          return await this.updateFile(args);
        case "delete_file":
          return await this.deleteFile(args);
        case "get_file":
          return await this.getFile(args);
        case "list_files":
          return await this.listFiles(args);
        case "rename_file":
          return await this.renameFile(args);

        // Commit operations
        case "create_commit":
          return await this.createCommit(args);
        case "get_commit":
          return await this.getCommit(args);
        case "list_commits":
          return await this.listCommits(args);
        case "compare_commits":
          return await this.compareCommits(args);

        // Branch operations
        case "create_branch":
          return await this.createBranch(args);
        case "delete_branch":
          return await this.deleteBranch(args);
        case "list_branches":
          return await this.listBranches(args);
        case "get_branch":
          return await this.getBranch(args);
        case "merge_branch":
          return await this.mergeBranch(args);

        // Issue operations
        case "create_issue":
          return await this.createIssue(args);
        case "update_issue":
          return await this.updateIssue(args);
        case "close_issue":
          return await this.closeIssue(args);
        case "list_issues":
          return await this.listIssues(args);
        case "get_issue":
          return await this.getIssue(args);
        case "add_issue_comment":
          return await this.addIssueComment(args);

        // Pull Request operations
        case "create_pull_request":
          return await this.createPullRequest(args);
        case "update_pull_request":
          return await this.updatePullRequest(args);
        case "merge_pull_request":
          return await this.mergePullRequest(args);
        case "close_pull_request":
          return await this.closePullRequest(args);
        case "list_pull_requests":
          return await this.listPullRequests(args);
        case "get_pull_request":
          return await this.getPullRequest(args);

        // Release operations
        case "create_release":
          return await this.createRelease(args);
        case "update_release":
          return await this.updateRelease(args);
        case "delete_release":
          return await this.deleteRelease(args);
        case "list_releases":
          return await this.listReleases(args);
        case "get_release":
          return await this.getRelease(args);

        // User/Organization operations
        case "get_user":
          return await this.getUser(args);
        case "list_user_repos":
          return await this.listUserRepositories(args);
        case "get_organization":
          return await this.getOrganization(args);
        case "list_org_repos":
          return await this.listOrganizationRepositories(args);

        // Collaboration operations
        case "add_collaborator":
          return await this.addCollaborator(args);
        case "remove_collaborator":
          return await this.removeCollaborator(args);
        case "list_collaborators":
          return await this.listCollaborators(args);

        // Webhook operations
        case "create_webhook":
          return await this.createWebhook(args);
        case "delete_webhook":
          return await this.deleteWebhook(args);
        case "list_webhooks":
          return await this.listWebhooks(args);

        default:
          throw new Error(`Unsupported action: ${args.action}`);
      }
    } catch (error: unknown) {
      console.error("❌ GitHub operation failed:", error);
      return {
        success: false,
        error: `GitHub operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action
      };
    }
  }

  // Repository operations
  private async createRepository(args: any) {
    const response = await this.octokit.repos.createForAuthenticatedUser({
      name: args.repo,
      description: args.description,
      homepage: args.homepage,
      private: args.private || false,
      has_issues: args.hasIssues !== false,
      has_wiki: args.hasWiki !== false,
      auto_init: args.autoInit || false,
      gitignore_template: args.gitignoreTemplate,
      license_template: args.licenseTemplate
    });

    return {
      success: true,
      action: "create_repo",
      repository: response.data,
      message: `Repository ${args.repo} created successfully`
    };
  }

  private async deleteRepository(args: any) {
    await this.octokit.repos.delete({
      owner: args.owner,
      repo: args.repo
    });

    return {
      success: true,
      action: "delete_repo",
      message: `Repository ${args.owner}/${args.repo} deleted successfully`
    };
  }

  private async getRepository(args: any) {
    const response = await this.octokit.repos.get({
      owner: args.owner,
      repo: args.repo
    });

    return {
      success: true,
      action: "get_repo",
      repository: response.data
    };
  }

  private async listRepositories(args: any) {
    const response = await this.octokit.repos.listForAuthenticatedUser({
      page: args.page || 1,
      per_page: Math.min(args.perPage || 30, 100),
      sort: 'updated',
      direction: 'desc'
    });

    return {
      success: true,
      action: "list_repos",
      repositories: response.data,
      count: response.data.length
    };
  }

  private async updateRepository(args: any) {
    const response = await this.octokit.repos.update({
      owner: args.owner,
      repo: args.repo,
      name: args.title || args.repo,
      description: args.description,
      homepage: args.homepage,
      private: args.private,
      has_issues: args.hasIssues,
      has_wiki: args.hasWiki
    });

    return {
      success: true,
      action: "update_repo",
      repository: response.data,
      message: `Repository ${args.owner}/${args.repo} updated successfully`
    };
  }

  private async forkRepository(args: any) {
    const response = await this.octokit.repos.createFork({
      owner: args.owner,
      repo: args.repo
    });

    return {
      success: true,
      action: "fork_repo",
      repository: response.data,
      message: `Repository ${args.owner}/${args.repo} forked successfully`
    };
  }

  private async starRepository(args: any) {
    await this.octokit.activity.starRepoForAuthenticatedUser({
      owner: args.owner,
      repo: args.repo
    });

    return {
      success: true,
      action: "star_repo",
      message: `Repository ${args.owner}/${args.repo} starred successfully`
    };
  }

  private async unstarRepository(args: any) {
    await this.octokit.activity.unstarRepoForAuthenticatedUser({
      owner: args.owner,
      repo: args.repo
    });

    return {
      success: true,
      action: "unstar_repo",
      message: `Repository ${args.owner}/${args.repo} unstarred successfully`
    };
  }

  // File operations
  private async createFile(args: any) {
    const response = await this.octokit.repos.createOrUpdateFileContents({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      message: args.message || `Create ${args.path}`,
      content: Buffer.from(args.content).toString('base64'),
      branch: args.branch
    });

    return {
      success: true,
      action: "create_file",
      file: response.data,
      message: `File ${args.path} created successfully`
    };
  }

  private async updateFile(args: any) {
    // Get current file to obtain SHA
    const currentFile = await this.octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      ref: args.branch
    });

    const response = await this.octokit.repos.createOrUpdateFileContents({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      message: args.message || `Update ${args.path}`,
      content: Buffer.from(args.content).toString('base64'),
      sha: (currentFile.data as any).sha,
      branch: args.branch
    });

    return {
      success: true,
      action: "update_file",
      file: response.data,
      message: `File ${args.path} updated successfully`
    };
  }

  private async deleteFile(args: any) {
    // Get current file to obtain SHA
    const currentFile = await this.octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      ref: args.branch
    });

    const response = await this.octokit.repos.deleteFile({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      message: args.message || `Delete ${args.path}`,
      sha: (currentFile.data as any).sha,
      branch: args.branch
    });

    return {
      success: true,
      action: "delete_file",
      commit: response.data,
      message: `File ${args.path} deleted successfully`
    };
  }

  private async getFile(args: any) {
    const response = await this.octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      ref: args.branch
    });

    const fileData = response.data as any;
    const content = fileData.encoding === 'base64' 
      ? Buffer.from(fileData.content, 'base64').toString('utf-8')
      : fileData.content;

    return {
      success: true,
      action: "get_file",
      file: {
        ...fileData,
        decodedContent: content
      }
    };
  }

  private async listFiles(args: any) {
    const response = await this.octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path: args.path || '',
      ref: args.branch
    });

    return {
      success: true,
      action: "list_files",
      files: response.data,
      count: Array.isArray(response.data) ? response.data.length : 1
    };
  }

  private async renameFile(args: any) {
    // GitHub doesn't have a direct rename API, so we simulate it
    // by creating a new file and deleting the old one
    const oldFile = await this.getFile({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      branch: args.branch
    });

    // Create new file
    await this.createFile({
      owner: args.owner,
      repo: args.repo,
      path: args.title, // new path
      content: oldFile.file.decodedContent,
      message: args.message || `Rename ${args.path} to ${args.title}`,
      branch: args.branch
    });

    // Delete old file
    await this.deleteFile({
      owner: args.owner,
      repo: args.repo,
      path: args.path,
      message: args.message || `Rename ${args.path} to ${args.title}`,
      branch: args.branch
    });

    return {
      success: true,
      action: "rename_file",
      message: `File renamed from ${args.path} to ${args.title}`
    };
  }

  // Commit operations
  private async createCommit(args: any) {
    // This is a simplified commit creation - in practice, you'd need to
    // create a tree with the changes first
    const response = await this.octokit.git.createCommit({
      owner: args.owner,
      repo: args.repo,
      message: args.message,
      tree: args.sha, // Tree SHA
      parents: args.base ? [args.base] : []
    });

    return {
      success: true,
      action: "create_commit",
      commit: response.data,
      message: "Commit created successfully"
    };
  }

  private async getCommit(args: any) {
    const response = await this.octokit.repos.getCommit({
      owner: args.owner,
      repo: args.repo,
      ref: args.sha
    });

    return {
      success: true,
      action: "get_commit",
      commit: response.data
    };
  }

  private async listCommits(args: any) {
    const response = await this.octokit.repos.listCommits({
      owner: args.owner,
      repo: args.repo,
      sha: args.branch,
      page: args.page || 1,
      per_page: Math.min(args.perPage || 30, 100)
    });

    return {
      success: true,
      action: "list_commits",
      commits: response.data,
      count: response.data.length
    };
  }

  private async compareCommits(args: any) {
    const response = await this.octokit.repos.compareCommits({
      owner: args.owner,
      repo: args.repo,
      base: args.base,
      head: args.head
    });

    return {
      success: true,
      action: "compare_commits",
      comparison: response.data
    };
  }

  // Branch operations
  private async createBranch(args: any) {
    // Get the SHA of the base branch
    const baseBranch = await this.octokit.git.getRef({
      owner: args.owner,
      repo: args.repo,
      ref: `heads/${args.base || 'main'}`
    });

    const response = await this.octokit.git.createRef({
      owner: args.owner,
      repo: args.repo,
      ref: `refs/heads/${args.branch}`,
      sha: baseBranch.data.object.sha
    });

    return {
      success: true,
      action: "create_branch",
      branch: response.data,
      message: `Branch ${args.branch} created successfully`
    };
  }

  private async deleteBranch(args: any) {
    await this.octokit.git.deleteRef({
      owner: args.owner,
      repo: args.repo,
      ref: `heads/${args.branch}`
    });

    return {
      success: true,
      action: "delete_branch",
      message: `Branch ${args.branch} deleted successfully`
    };
  }

  private async listBranches(args: any) {
    const response = await this.octokit.repos.listBranches({
      owner: args.owner,
      repo: args.repo,
      page: args.page || 1,
      per_page: Math.min(args.perPage || 30, 100)
    });

    return {
      success: true,
      action: "list_branches",
      branches: response.data,
      count: response.data.length
    };
  }

  private async getBranch(args: any) {
    const response = await this.octokit.repos.getBranch({
      owner: args.owner,
      repo: args.repo,
      branch: args.branch
    });

    return {
      success: true,
      action: "get_branch",
      branch: response.data
    };
  }

  private async mergeBranch(args: any) {
    const response = await this.octokit.repos.merge({
      owner: args.owner,
      repo: args.repo,
      base: args.base,
      head: args.head,
      commit_message: args.message
    });

    return {
      success: true,
      action: "merge_branch",
      merge: response.data,
      message: `Branch ${args.head} merged into ${args.base}`
    };
  }

  // Issue operations
  private async createIssue(args: any) {
    const response = await this.octokit.issues.create({
      owner: args.owner,
      repo: args.repo,
      title: args.title,
      body: args.body,
      labels: args.labels,
      assignees: args.assignees
    });

    return {
      success: true,
      action: "create_issue",
      issue: response.data,
      message: `Issue #${response.data.number} created successfully`
    };
  }

  private async updateIssue(args: any) {
    const response = await this.octokit.issues.update({
      owner: args.owner,
      repo: args.repo,
      issue_number: parseInt(args.sha), // Using sha as issue number
      title: args.title,
      body: args.body,
      state: args.state as any,
      labels: args.labels,
      assignees: args.assignees
    });

    return {
      success: true,
      action: "update_issue",
      issue: response.data,
      message: `Issue #${args.sha} updated successfully`
    };
  }

  private async closeIssue(args: any) {
    const response = await this.octokit.issues.update({
      owner: args.owner,
      repo: args.repo,
      issue_number: parseInt(args.sha),
      state: 'closed'
    });

    return {
      success: true,
      action: "close_issue",
      issue: response.data,
      message: `Issue #${args.sha} closed successfully`
    };
  }

  private async listIssues(args: any) {
    const response = await this.octokit.issues.listForRepo({
      owner: args.owner,
      repo: args.repo,
      state: args.state as any || 'open',
      page: args.page || 1,
      per_page: Math.min(args.perPage || 30, 100)
    });

    return {
      success: true,
      action: "list_issues",
      issues: response.data,
      count: response.data.length
    };
  }

  private async getIssue(args: any) {
    const response = await this.octokit.issues.get({
      owner: args.owner,
      repo: args.repo,
      issue_number: parseInt(args.sha)
    });

    return {
      success: true,
      action: "get_issue",
      issue: response.data
    };
  }

  private async addIssueComment(args: any) {
    const response = await this.octokit.issues.createComment({
      owner: args.owner,
      repo: args.repo,
      issue_number: parseInt(args.sha),
      body: args.body
    });

    return {
      success: true,
      action: "add_issue_comment",
      comment: response.data,
      message: `Comment added to issue #${args.sha}`
    };
  }

  // Pull Request operations
  private async createPullRequest(args: any) {
    const response = await this.octokit.pulls.create({
      owner: args.owner,
      repo: args.repo,
      title: args.title,
      body: args.body,
      head: args.head,
      base: args.base,
      draft: args.draft || false
    });

    return {
      success: true,
      action: "create_pull_request",
      pullRequest: response.data,
      message: `Pull request #${response.data.number} created successfully`
    };
  }

  private async updatePullRequest(args: any) {
    const response = await this.octokit.pulls.update({
      owner: args.owner,
      repo: args.repo,
      pull_number: parseInt(args.sha),
      title: args.title,
      body: args.body,
      state: args.state as any
    });

    return {
      success: true,
      action: "update_pull_request",
      pullRequest: response.data,
      message: `Pull request #${args.sha} updated successfully`
    };
  }

  private async mergePullRequest(args: any) {
    const response = await this.octokit.pulls.merge({
      owner: args.owner,
      repo: args.repo,
      pull_number: parseInt(args.sha),
      commit_title: args.title,
      commit_message: args.message
    });

    return {
      success: true,
      action: "merge_pull_request",
      merge: response.data,
      message: `Pull request #${args.sha} merged successfully`
    };
  }

  private async closePullRequest(args: any) {
    const response = await this.octokit.pulls.update({
      owner: args.owner,
      repo: args.repo,
      pull_number: parseInt(args.sha),
      state: 'closed'
    });

    return {
      success: true,
      action: "close_pull_request",
      pullRequest: response.data,
      message: `Pull request #${args.sha} closed successfully`
    };
  }

  private async listPullRequests(args: any) {
    const response = await this.octokit.pulls.list({
      owner: args.owner,
      repo: args.repo,
      state: args.state as any || 'open',
      page: args.page || 1,
      per_page: Math.min(args.perPage || 30, 100)
    });

    return {
      success: true,
      action: "list_pull_requests",
      pullRequests: response.data,
      count: response.data.length
    };
  }

  private async getPullRequest(args: any) {
    const response = await this.octokit.pulls.get({
      owner: args.owner,
      repo: args.repo,
      pull_number: parseInt(args.sha)
    });

    return {
      success: true,
      action: "get_pull_request",
      pullRequest: response.data
    };
  }

  // Release operations
  private async createRelease(args: any) {
    const response = await this.octokit.repos.createRelease({
      owner: args.owner,
      repo: args.repo,
      tag_name: args.tag,
      name: args.title,
      body: args.body,
      draft: args.draft || false,
      prerelease: args.prerelease || false,
      generate_release_notes: args.generateReleaseNotes || false
    });

    return {
      success: true,
      action: "create_release",
      release: response.data,
      message: `Release ${args.tag} created successfully`
    };
  }

  private async updateRelease(args: any) {
    const response = await this.octokit.repos.updateRelease({
      owner: args.owner,
      repo: args.repo,
      release_id: parseInt(args.sha),
      name: args.title,
      body: args.body,
      draft: args.draft,
      prerelease: args.prerelease
    });

    return {
      success: true,
      action: "update_release",
      release: response.data,
      message: `Release updated successfully`
    };
  }

  private async deleteRelease(args: any) {
    await this.octokit.repos.deleteRelease({
      owner: args.owner,
      repo: args.repo,
      release_id: parseInt(args.sha)
    });

    return {
      success: true,
      action: "delete_release",
      message: `Release deleted successfully`
    };
  }

  private async listReleases(args: any) {
    const response = await this.octokit.repos.listReleases({
      owner: args.owner,
      repo: args.repo,
      page: args.page || 1,
      per_page: Math.min(args.perPage || 30, 100)
    });

    return {
      success: true,
      action: "list_releases",
      releases: response.data,
      count: response.data.length
    };
  }

  private async getRelease(args: any) {
    const response = await this.octokit.repos.getRelease({
      owner: args.owner,
      repo: args.repo,
      release_id: parseInt(args.sha)
    });

    return {
      success: true,
      action: "get_release",
      release: response.data
    };
  }

  // User/Organization operations
  private async getUser(args: any) {
    const response = args.username 
      ? await this.octokit.users.getByUsername({ username: args.username })
      : await this.octokit.users.getAuthenticated();

    return {
      success: true,
      action: "get_user",
      user: response.data
    };
  }

  private async listUserRepositories(args: any) {
    const response = await this.octokit.repos.listForUser({
      username: args.username,
      page: args.page || 1,
      per_page: Math.min(args.perPage || 30, 100),
      sort: 'updated',
      direction: 'desc'
    });

    return {
      success: true,
      action: "list_user_repos",
      repositories: response.data,
      count: response.data.length
    };
  }

  private async getOrganization(args: any) {
    const response = await this.octokit.orgs.get({
      org: args.owner
    });

    return {
      success: true,
      action: "get_organization",
      organization: response.data
    };
  }

  private async listOrganizationRepositories(args: any) {
    const response = await this.octokit.repos.listForOrg({
      org: args.owner,
      page: args.page || 1,
      per_page: Math.min(args.perPage || 30, 100),
      sort: 'updated',
      direction: 'desc'
    });

    return {
      success: true,
      action: "list_org_repos",
      repositories: response.data,
      count: response.data.length
    };
  }

  // Collaboration operations
  private async addCollaborator(args: any) {
    await this.octokit.repos.addCollaborator({
      owner: args.owner,
      repo: args.repo,
      username: args.username,
      permission: args.permission || 'push'
    });

    return {
      success: true,
      action: "add_collaborator",
      message: `User ${args.username} added as collaborator with ${args.permission || 'push'} permission`
    };
  }

  private async removeCollaborator(args: any) {
    await this.octokit.repos.removeCollaborator({
      owner: args.owner,
      repo: args.repo,
      username: args.username
    });

    return {
      success: true,
      action: "remove_collaborator",
      message: `User ${args.username} removed as collaborator`
    };
  }

  private async listCollaborators(args: any) {
    const response = await this.octokit.repos.listCollaborators({
      owner: args.owner,
      repo: args.repo,
      page: args.page || 1,
      per_page: Math.min(args.perPage || 30, 100)
    });

    return {
      success: true,
      action: "list_collaborators",
      collaborators: response.data,
      count: response.data.length
    };
  }

  // Webhook operations
  private async createWebhook(args: any) {
    const response = await this.octokit.repos.createWebhook({
      owner: args.owner,
      repo: args.repo,
      config: {
        url: args.webhookUrl,
        content_type: 'json'
      },
      events: args.webhookEvents || ['push']
    });

    return {
      success: true,
      action: "create_webhook",
      webhook: response.data,
      message: `Webhook created successfully with ID ${response.data.id}`
    };
  }

  private async deleteWebhook(args: any) {
    await this.octokit.repos.deleteWebhook({
      owner: args.owner,
      repo: args.repo,
      hook_id: parseInt(args.sha)
    });

    return {
      success: true,
      action: "delete_webhook",
      message: `Webhook ${args.sha} deleted successfully`
    };
  }

  private async listWebhooks(args: any) {
    const response = await this.octokit.repos.listWebhooks({
      owner: args.owner,
      repo: args.repo,
      page: args.page || 1,
      per_page: Math.min(args.perPage || 30, 100)
    });

    return {
      success: true,
      action: "list_webhooks",
      webhooks: response.data,
      count: response.data.length
    };
  }
}

/* Usage example:
const githubTool = new GithubTool('your-github-token');

// Create a repository
const createRepoResult = await githubTool.execute({
  action: 'create_repo',
  repo: 'my-new-repo',
  description: 'A test repository',
  private: false,
  autoInit: true
});

// Create a file
const createFileResult = await githubTool.execute({
  action: 'create_file',
  owner: 'username',
  repo: 'my-new-repo',
  path: 'README.md',
  content: '# My New Repository\n\nThis is a test repository.',
  message: 'Initial commit'
});

// Create an issue
const createIssueResult = await githubTool.execute({
  action: 'create_issue',
  owner: 'username',
  repo: 'my-new-repo',
  title: 'Bug Report',
  body: 'Found a bug in the application',
  labels: ['bug', 'high-priority']
});

// Create a pull request
const createPRResult = await githubTool.execute({
  action: 'create_pull_request',
  owner: 'username',
  repo: 'my-new-repo',
  title: 'Fix critical bug',
  body: 'This PR fixes the critical bug reported in issue #1',
  head: 'feature-branch',
  base: 'main'
});
*/
