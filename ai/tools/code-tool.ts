import { FunctionDeclaration, Type } from "@google/genai";
import { spawn, exec, execSync, ChildProcess } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { promisify } from "util";

const execAsync = promisify(exec);

interface ExecutionConfig {
  timeout?: number;
  workingDirectory?: string;
  environment?: Record<string, string>;
  inputData?: string;
  killSignal?: NodeJS.Signals;
  maxBuffer?: number;
  shell?: boolean | string;
  detached?: boolean;
  silent?: boolean;
}

interface ProcessInfo {
  pid: number;
  command: string;
  startTime: Date;
  status: 'running' | 'completed' | 'failed' | 'killed';
  exitCode?: number;
}

export class CodeExecutionTool {
  private runningProcesses: Map<string, ChildProcess> = new Map();
  private processHistory: Map<string, ProcessInfo> = new Map();
  private sessionId: string = Date.now().toString();

  getDefinition(): FunctionDeclaration {
    return {
      name: "code_execution",
      description: "Advanced code execution tool - run files, execute commands, manage terminals, handle multiple languages and processes",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Action: 'run_file', 'execute_command', 'run_code', 'new_terminal', 'kill_process', 'list_processes', 'install_package', 'check_environment', 'compile', 'test', 'debug', 'interactive_shell', 'batch_execute'"
          },
          filePath: {
            type: Type.STRING,
            description: "Path to file to execute (for run_file action)"
          },
          command: {
            type: Type.STRING,
            description: "Command to execute or code to run"
          },
          language: {
            type: Type.STRING,
            description: "Programming language: 'python', 'javascript', 'typescript', 'bash', 'powershell', 'java', 'cpp', 'c', 'go', 'rust', 'ruby', 'php', 'r', 'julia', 'dart', 'kotlin', 'swift', 'scala'"
          },
          args: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Command line arguments"
          },
          config: {
            type: Type.OBJECT,
            properties: {
              timeout: { type: Type.NUMBER, description: "Execution timeout in milliseconds" },
              workingDirectory: { type: Type.STRING, description: "Working directory for execution" },
              environment: { type: Type.OBJECT, description: "Environment variables" },
              inputData: { type: Type.STRING, description: "Input data to send to process" },
              maxBuffer: { type: Type.NUMBER, description: "Maximum buffer size for output" },
              shell: { type: Type.BOOLEAN, description: "Run in shell" },
              detached: { type: Type.BOOLEAN, description: "Run detached process" },
              silent: { type: Type.BOOLEAN, description: "Suppress output" }
            }
          },
          processId: {
            type: Type.STRING,
            description: "Process ID for process management"
          },
          packageName: {
            type: Type.STRING,
            description: "Package name to install"
          },
          packageManager: {
            type: Type.STRING,
            description: "Package manager: 'npm', 'pip', 'cargo', 'go', 'gem', 'composer', 'maven', 'gradle'"
          },
          interactive: {
            type: Type.BOOLEAN,
            description: "Start interactive session"
          },
          buildConfig: {
            type: Type.OBJECT,
            properties: {
              optimization: { type: Type.STRING, description: "Optimization level" },
              debug: { type: Type.BOOLEAN, description: "Include debug symbols" },
              target: { type: Type.STRING, description: "Target platform" },
              output: { type: Type.STRING, description: "Output file/directory" }
            }
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const { action } = args;
      console.log(`🚀 Code execution: ${action}`);

      switch (action) {
        case "run_file":
          return await this.runFile(args);
        case "execute_command":
          return await this.executeCommand(args);
        case "run_code":
          return await this.runCode(args);
        case "new_terminal":
          return await this.newTerminal(args);
        case "kill_process":
          return await this.killProcess(args);
        case "list_processes":
          return await this.listProcesses();
        case "install_package":
          return await this.installPackage(args);
        case "check_environment":
          return await this.checkEnvironment(args);
        case "compile":
          return await this.compile(args);
        case "test":
          return await this.runTests(args);
        case "debug":
          return await this.debug(args);
        case "interactive_shell":
          return await this.interactiveShell(args);
        case "batch_execute":
          return await this.batchExecute(args);
        default:
          return { success: false, error: "Invalid action" };
      }
    } catch (error: unknown) {
      console.error("❌ Code execution failed:", error);
      return {
        success: false,
        error: `Execution failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async runFile(args: any): Promise<any> {
    const { filePath, args: cmdArgs = [], config = {} } = args;
    
    if (!await this.fileExists(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }

    const extension = path.extname(filePath).toLowerCase();
    const language = this.detectLanguageFromExtension(extension);
    
    if (!language) {
      return { success: false, error: `Unsupported file type: ${extension}` };
    }

    const command = this.buildCommand(language, filePath, cmdArgs);
    return await this.executeWithConfig(command, config, `run_${path.basename(filePath)}`);
  }

  private async runCode(args: any): Promise<any> {
    const { command: code, language, config = {} } = args;
    
    if (!code || !language) {
      return { success: false, error: "Code and language are required" };
    }

    // Create temporary file for code execution
    const tempDir = await this.createTempDirectory();
    const tempFile = await this.createTempFile(code, language, tempDir);
    
    try {
      const command = this.buildCommand(language, tempFile, []);
      const result = await this.executeWithConfig(command, config, `run_code_${language}`);
      
      // Cleanup
      await this.cleanup(tempDir);
      
      return result;
    } catch (error) {
      await this.cleanup(tempDir);
      throw error;
    }
  }

  private async executeCommand(args: any): Promise<any> {
    const { command, config = {} } = args;
    
    if (!command) {
      return { success: false, error: "Command is required" };
    }

    return await this.executeWithConfig(command, config, `cmd_${Date.now()}`);
  }

  private async executeWithConfig(command: string, config: ExecutionConfig, processId: string): Promise<any> {
    const {
      timeout = 30000,
      workingDirectory = process.cwd(),
      environment = {},
      inputData,
      maxBuffer = 1024 * 1024, // 1MB
      shell = true,
      detached = false,
      silent = false
    } = config;

    const env = { ...process.env, ...environment };
    const startTime = new Date();

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const child = spawn(shell ? (os.platform() === 'win32' ? 'cmd' : 'bash') : command.split(' ')[0], 
        shell ? (os.platform() === 'win32' ? ['/c', command] : ['-c', command]) : command.split(' ').slice(1), {
        cwd: workingDirectory,
        env,
        detached,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Store process info
      this.runningProcesses.set(processId, child);
      this.processHistory.set(processId, {
        pid: child.pid!,
        command,
        startTime,
        status: 'running'
      });

      // Handle timeout
      const timeoutHandle = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, timeout);

      // Handle input data
      if (inputData && child.stdin) {
        child.stdin.write(inputData);
        child.stdin.end();
      }

      // Collect output
      if (child.stdout) {
        child.stdout.on('data', (data) => {
          const chunk = data.toString();
          stdout += chunk;
          if (!silent) {
            console.log(`📤 [${processId}]:`, chunk.trim());
          }
          
          // Prevent buffer overflow
          if (stdout.length > maxBuffer) {
            stdout = stdout.slice(-maxBuffer);
          }
        });
      }

      if (child.stderr) {
        child.stderr.on('data', (data) => {
          const chunk = data.toString();
          stderr += chunk;
          if (!silent) {
            console.error(`📤 [${processId}] ERROR:`, chunk.trim());
          }
          
          if (stderr.length > maxBuffer) {
            stderr = stderr.slice(-maxBuffer);
          }
        });
      }

      child.on('close', (code, signal) => {
        clearTimeout(timeoutHandle);
        this.runningProcesses.delete(processId);
        
        const processInfo = this.processHistory.get(processId)!;
        processInfo.status = timedOut ? 'killed' : (code === 0 ? 'completed' : 'failed');
        processInfo.exitCode = code || undefined;

        const executionTime = Date.now() - startTime.getTime();

        resolve({
          success: !timedOut && code === 0,
          processId,
          exitCode: code,
          signal,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          executionTime,
          timedOut,
          pid: child.pid,
          command,
          workingDirectory,
          environment: Object.keys(environment)
        });
      });

      child.on('error', (error) => {
        clearTimeout(timeoutHandle);
        this.runningProcesses.delete(processId);
        
        const processInfo = this.processHistory.get(processId)!;
        processInfo.status = 'failed';

        resolve({
          success: false,
          error: error.message,
          processId,
          command,
          executionTime: Date.now() - startTime.getTime()
        });
      });
    });
  }

  private async newTerminal(args: any): Promise<any> {
    const { command = '', config = {} } = args;
    const platform = os.platform();
    
    let terminalCommand: string;
    
    switch (platform) {
      case 'win32':
        terminalCommand = command ? `start cmd /k "${command}"` : 'start cmd';
        break;
      case 'darwin':
        terminalCommand = command ? 
          `osascript -e 'tell application "Terminal" to do script "${command}"'` :
          `osascript -e 'tell application "Terminal" to do script ""'`;
        break;
      case 'linux':
        // Try different terminal emulators
        const terminals = ['gnome-terminal', 'konsole', 'xterm', 'terminator'];
        const availableTerminal = await this.findAvailableTerminal(terminals);
        if (!availableTerminal) {
          return { success: false, error: "No terminal emulator found" };
        }
        terminalCommand = command ? 
          `${availableTerminal} -e "bash -c '${command}; exec bash'"` :
          `${availableTerminal}`;
        break;
      default:
        return { success: false, error: `Unsupported platform: ${platform}` };
    }

    return await this.executeWithConfig(terminalCommand, config, `terminal_${Date.now()}`);
  }

  private async killProcess(args: any): Promise<any> {
    const { processId } = args;
    
    if (!processId) {
      return { success: false, error: "Process ID is required" };
    }

    const process = this.runningProcesses.get(processId);
    if (!process) {
      return { success: false, error: `Process not found: ${processId}` };
    }

    try {
      process.kill('SIGTERM');
      
      // Wait a bit, then force kill if still running
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGKILL');
        }
      }, 5000);

      this.runningProcesses.delete(processId);
      
      const processInfo = this.processHistory.get(processId);
      if (processInfo) {
        processInfo.status = 'killed';
      }

      return {
        success: true,
        message: `Process ${processId} (PID: ${process.pid}) killed`,
        processId,
        pid: process.pid
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to kill process: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async listProcesses(): Promise<any> {
    const running = Array.from(this.runningProcesses.entries()).map(([id, process]) => ({
      processId: id,
      pid: process.pid,
      status: 'running',
      killed: process.killed,
      ...this.processHistory.get(id)
    }));

    const history = Array.from(this.processHistory.entries())
      .filter(([id]) => !this.runningProcesses.has(id))
      .map(([id, info]) => ({ processId: id, ...info }));

    return {
      success: true,
      runningProcesses: running,
      processHistory: history,
      totalRunning: running.length,
      totalHistory: history.length
    };
  }

  private async installPackage(args: any): Promise<any> {
    const { packageName, packageManager = 'auto', config = {} } = args;
    
    if (!packageName) {
      return { success: false, error: "Package name is required" };
    }

    const manager = packageManager === 'auto' ? await this.detectPackageManager() : packageManager;
    const command = this.buildInstallCommand(manager, packageName);
    
    return await this.executeWithConfig(command, config, `install_${packageName}`);
  }

  private async checkEnvironment(args: any): Promise<any> {
    const { language } = args;
    const checks: any = {};

    try {
      // System info
      checks.system = {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        homeDir: os.homedir(),
        tmpDir: os.tmpdir()
      };

      // Language-specific checks
      if (!language || language === 'python') {
        checks.python = await this.checkPython();
      }
      if (!language || language === 'javascript' || language === 'typescript') {
        checks.node = await this.checkNode();
      }
      if (!language || language === 'java') {
        checks.java = await this.checkJava();
      }
      if (!language || language === 'go') {
        checks.go = await this.checkGo();
      }
      if (!language || language === 'rust') {
        checks.rust = await this.checkRust();
      }

      return {
        success: true,
        environment: checks,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: `Environment check failed: ${error instanceof Error ? error.message : String(error)}`,
        partialResults: checks
      };
    }
  }

  private async compile(args: any): Promise<any> {
    const { filePath, language, buildConfig = {}, config = {} } = args;
    
    if (!await this.fileExists(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }

    const command = this.buildCompileCommand(language, filePath, buildConfig);
    if (!command) {
      return { success: false, error: `Compilation not supported for: ${language}` };
    }

    return await this.executeWithConfig(command, config, `compile_${path.basename(filePath)}`);
  }

  private async runTests(args: any): Promise<any> {
    const { filePath, language, config = {} } = args;
    
    const command = this.buildTestCommand(language, filePath);
    if (!command) {
      return { success: false, error: `Testing not configured for: ${language}` };
    }

    return await this.executeWithConfig(command, config, `test_${Date.now()}`);
  }

  private async debug(args: any): Promise<any> {
    const { filePath, language, config = {} } = args;
    
    const command = this.buildDebugCommand(language, filePath);
    if (!command) {
      return { success: false, error: `Debugging not supported for: ${language}` };
    }

    return await this.executeWithConfig(command, config, `debug_${path.basename(filePath)}`);
  }

  private async interactiveShell(args: any): Promise<any> {
    const { language, config = {} } = args;
    
    const command = this.buildInteractiveCommand(language);
    if (!command) {
      return { success: false, error: `Interactive shell not supported for: ${language}` };
    }

    // Interactive shells should be detached
    config.detached = true;
    
    return await this.executeWithConfig(command, config, `interactive_${language}`);
  }

  private async batchExecute(args: any): Promise<any> {
    const { commands, config = {} } = args;
    
    if (!Array.isArray(commands)) {
      return { success: false, error: "Commands must be an array" };
    }

    const results = [];
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      const result = await this.executeWithConfig(cmd, config, `batch_${i}`);
      results.push({ command: cmd, result });
      
      // Stop on first failure unless configured otherwise
      if (!result.success && !config.continueOnError) {
        break;
      }
    }

    return {
      success: true,
      batchResults: results,
      totalCommands: commands.length,
      executedCommands: results.length
    };
  }

  // Helper methods
  private detectLanguageFromExtension(ext: string): string | null {
    const mapping: Record<string, string> = {
      '.py': 'python',
      '.js': 'javascript',
      '.ts': 'typescript',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.go': 'go',
      '.rs': 'rust',
      '.rb': 'ruby',
      '.php': 'php',
      '.r': 'r',
      '.jl': 'julia',
      '.dart': 'dart',
      '.kt': 'kotlin',
      '.swift': 'swift',
      '.scala': 'scala',
      '.sh': 'bash',
      '.ps1': 'powershell'
    };
    return mapping[ext] || null;
  }

  private buildCommand(language: string, filePath: string, args: string[]): string {
    const argString = args.join(' ');
    
    switch (language) {
      case 'python':
        return `python "${filePath}" ${argString}`.trim();
      case 'javascript':
        return `node "${filePath}" ${argString}`.trim();
      case 'typescript':
        return `npx ts-node "${filePath}" ${argString}`.trim();
      case 'java':
        return `java "${filePath}" ${argString}`.trim();
      case 'cpp':
        const cppExe = filePath.replace('.cpp', '.exe');
        return `g++ "${filePath}" -o "${cppExe}" && "${cppExe}" ${argString}`.trim();
      case 'c':
        const cExe = filePath.replace('.c', '.exe');
        return `gcc "${filePath}" -o "${cExe}" && "${cExe}" ${argString}`.trim();
      case 'go':
        return `go run "${filePath}" ${argString}`.trim();
      case 'rust':
        return `rustc "${filePath}" && "${filePath.replace('.rs', '.exe')}" ${argString}`.trim();
      case 'ruby':
        return `ruby "${filePath}" ${argString}`.trim();
      case 'php':
        return `php "${filePath}" ${argString}`.trim();
      case 'r':
        return `Rscript "${filePath}" ${argString}`.trim();
      case 'julia':
        return `julia "${filePath}" ${argString}`.trim();
      case 'dart':
        return `dart "${filePath}" ${argString}`.trim();
      case 'kotlin':
        return `kotlinc "${filePath}" -include-runtime -d "${filePath.replace('.kt', '.jar')}" && java -jar "${filePath.replace('.kt', '.jar')}" ${argString}`.trim();
      case 'bash':
        return `bash "${filePath}" ${argString}`.trim();
      case 'powershell':
        return `powershell -ExecutionPolicy Bypass -File "${filePath}" ${argString}`.trim();
      default:
        return `"${filePath}" ${argString}`.trim();
    }
  }

  private buildCompileCommand(language: string, filePath: string, config: any): string | null {
    const { optimization = 'O2', debug = false, target, output } = config;
    const debugFlag = debug ? '-g' : '';
    const optFlag = `-${optimization}`;
    const outputPath = output || filePath.replace(path.extname(filePath), '');

    switch (language) {
      case 'cpp':
        return `g++ ${debugFlag} ${optFlag} "${filePath}" -o "${outputPath}"`;
      case 'c':
        return `gcc ${debugFlag} ${optFlag} "${filePath}" -o "${outputPath}"`;
      case 'rust':
        return `rustc ${debug ? '' : '--release'} "${filePath}" -o "${outputPath}"`;
      case 'go':
        return `go build -o "${outputPath}" "${filePath}"`;
      case 'java':
        return `javac "${filePath}"`;
      case 'typescript':
        return `npx tsc "${filePath}" ${output ? `--outDir "${output}"` : ''}`;
      default:
        return null;
    }
  }

  private buildInstallCommand(manager: string, packageName: string): string {
    switch (manager) {
      case 'npm':
        return `npm install ${packageName}`;
      case 'pip':
        return `pip install ${packageName}`;
      case 'cargo':
        return `cargo install ${packageName}`;
      case 'go':
        return `go install ${packageName}`;
      case 'gem':
        return `gem install ${packageName}`;
      case 'composer':
        return `composer require ${packageName}`;
      default:
        return `${manager} install ${packageName}`;
    }
  }

  private buildTestCommand(language: string, filePath?: string): string | null {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return 'npm test';
      case 'python':
        return filePath ? `python -m pytest "${filePath}"` : 'python -m pytest';
      case 'java':
        return 'mvn test';
      case 'go':
        return 'go test';
      case 'rust':
        return 'cargo test';
      case 'ruby':
        return 'rake test';
      default:
        return null;
    }
  }

  private buildDebugCommand(language: string, filePath: string): string | null {
    switch (language) {
      case 'python':
        return `python -m pdb "${filePath}"`;
      case 'javascript':
        return `node --inspect-brk "${filePath}"`;
      case 'cpp':
      case 'c':
        return `gdb "${filePath.replace(path.extname(filePath), '')}"`;
      case 'go':
        return `dlv debug "${filePath}"`;
      case 'rust':
        return `rust-gdb "${filePath.replace('.rs', '')}"`;
      default:
        return null;
    }
  }

  private buildInteractiveCommand(language: string): string | null {
    switch (language) {
      case 'python':
        return 'python';
      case 'javascript':
        return 'node';
      case 'ruby':
        return 'irb';
      case 'php':
        return 'php -a';
      case 'r':
        return 'R';
      case 'julia':
        return 'julia';
      case 'scala':
        return 'scala';
      default:
        return null;
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async createTempDirectory(): Promise<string> {
    const tempDir = path.join(os.tmpdir(), `code_exec_${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    return tempDir;
  }

  private async createTempFile(code: string, language: string, tempDir: string): Promise<string> {
    const extensions: Record<string, string> = {
      python: '.py',
      javascript: '.js',
      typescript: '.ts',
      java: '.java',
      cpp: '.cpp',
      c: '.c',
      go: '.go',
      rust: '.rs',
      ruby: '.rb',
      php: '.php',
      r: '.r',
      julia: '.jl',
      dart: '.dart',
      kotlin: '.kt',
      bash: '.sh',
      powershell: '.ps1'
    };

    const ext = extensions[language] || '.txt';
    const tempFile = path.join(tempDir, `temp_code${ext}`);
    await fs.writeFile(tempFile, code, 'utf8');
    return tempFile;
  }

  private async cleanup(tempDir: string): Promise<void> {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to cleanup temp directory: ${tempDir}`, error);
    }
  }

  private async findAvailableTerminal(terminals: string[]): Promise<string | null> {
    for (const terminal of terminals) {
      try {
        await execAsync(`which ${terminal}`);
        return terminal;
      } catch {
        continue;
      }
    }
    return null;
  }

  private async detectPackageManager(): Promise<string> {
    const managers = [
      { cmd: 'npm --version', name: 'npm' },
      { cmd: 'pip --version', name: 'pip' },
      { cmd: 'cargo --version', name: 'cargo' },
      { cmd: 'go version', name: 'go' }
    ];

    for (const manager of managers) {
      try {
        await execAsync(manager.cmd);
        return manager.name;
      } catch {
        continue;
      }
    }
    return 'npm'; // Default fallback
  }

  private async checkPython(): Promise<any> {
    try {
      const { stdout } = await execAsync('python --version');
      const pipResult = await execAsync('pip --version').catch(() => ({ stdout: 'Not available' }));
      return {
        available: true,
        version: stdout.trim(),
        pip: pipResult.stdout.trim()
      };
    } catch {
      return { available: false };
    }
  }

  private async checkNode(): Promise<any> {
    try {
      const nodeResult = await execAsync('node --version');
      const npmResult = await execAsync('npm --version');
      return {
        available: true,
        nodeVersion: nodeResult.stdout.trim(),
        npmVersion: npmResult.stdout.trim()
      };
    } catch {
      return { available: false };
    }
  }

  private async checkJava(): Promise<any> {
    try {
      const { stdout } = await execAsync('java -version 2>&1');
      return {
        available: true,
        version: stdout.split('\n')[0]
      };
    } catch {
      return { available: false };
    }
  }

  private async checkGo(): Promise<any> {
    try {
      const { stdout } = await execAsync('go version');
      return {
        available: true,
        version: stdout.trim()
      };
    } catch {
      return { available: false };
    }
  }

  private async checkRust(): Promise<any> {
    try {
      const rustResult = await execAsync('rustc --version');
      const cargoResult = await execAsync('cargo --version').catch(() => ({ stdout: 'Not available' }));
      return {
        available: true,
        rustVersion: rustResult.stdout.trim(),
        cargoVersion: cargoResult.stdout.trim()
      };
    } catch {
      return { available: false };
    }
  }
}
