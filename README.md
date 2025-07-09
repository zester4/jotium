# Gemini Raiden: Jotium AI Agent Platform

## Overview

**Gemini Raiden** is a full-stack, extensible AI agent platform built around the Jotium agent. Jotium leverages Google Gemini models and a rich suite of advanced tools to provide a highly capable, multi-modal, and context-aware assistant for real-world productivity, automation, and research.

- **AI Model:** Google Gemini (via `@google/genai`)
- **Agent:** Jotium (modular, tool-augmented, memory-enabled)
- **Tooling:** 15+ production-grade tools for web, code, file, API, scheduling, social, and more
- **Memory:** Persistent, context-limited, with conversation history and tool results
- **Streaming:** Real-time, robust Server-Sent Events (SSE) for chat and tool output
- **Security:** Environment-based secrets, no secrets in repo

---

## Features

- **Natural Language Chat**: Conversational interface with streaming responses and agent thoughts
- **Tool-Augmented Reasoning**: Jotium can autonomously invoke tools for web search, file ops, code execution, scheduling, and more
- **Memory**: Retains recent context, tool results, and user history for continuity
- **Multi-Modal**: Supports text, code, files, images, and structured data
- **Extensible**: Add new tools by implementing the simple Tool interface
- **Production-Ready**: Robust error handling, input validation, and security best practices

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables (see .env.example)
#    Never commit your .env file!
cp .env.example .env.local
# Fill in your API keys for Gemini, Tavily, Slack, GitHub, etc.

# 3. Run database migrations (if using Drizzle ORM)
pnpm db:generate
pnpm db:migrate

# 4. Start the development server
pnpm dev

# App runs at http://localhost:3000
```

---

## Architecture

### Jotium Agent (`ai/jotium.ts`)

- **Core:** `AIAgent` class wraps Google Gemini, manages memory, and orchestrates tool calls.
- **Tool Integration:** Tools are registered in a map and exposed to Gemini as function declarations.
- **Memory:** Recent messages and tool results are persisted to disk (configurable).
- **Streaming:** All responses (including tool output and agent thoughts) are streamed to the client via SSE.
- **System Prompt:** Jotium is instructed to act as a human-like, proactive, tool-empowered agent.

### Tool System (`ai/tools/`)

Each tool implements a simple interface:
- `getDefinition()`: Returns a function declaration for Gemini (OpenAI-style function calling)
- `execute(args)`: Runs the tool logic and returns a result

#### Major Tools

- **WebSearchTool**: Real-time web search via Tavily (news, research, current data)
- **FileManagerTool**: Local file operations (read, write, list, delete, copy, move, compress, search, etc.)
- **GithubTool**: Full GitHub API (repos, files, issues, PRs, releases, webhooks, etc.)
- **SlackTool**: Slack messaging, channel management, user ops, file uploads, and more
- **ClickUpTool**: Project management, tasks, lists, spaces, comments, time tracking, and more
- **ApiTool**: Universal HTTP client (REST, GraphQL, file upload, auth, retries, etc.)
- **DateTimeTool**: Date/time formatting, parsing, timezone conversion, calculations
- **DuffelFlightTool**: Flight search, booking, payment, order status, cancellation (Duffel API)
- **CalComTool**: Scheduling, bookings, events, availability, teams (Cal.com API)
- **AyrshareSocialTool**: Social media posting, scheduling, analytics, comments, messaging, ads
- **WebScrapeTool**: Advanced web scraping, crawling, and search-based extraction (FireCrawl)
- **CodeExecutionTool**: Run code, files, commands, manage processes, install packages, debug, test
- **ImageGenerationTool**: Generate and edit images using Gemini's image generation
- **CreateDocumentTool**: Create documents for writing/content creation, with streaming support
- **UpdateDocumentTool**: Update existing documents with new content or edits
- **GetWeatherTool**: Fetch current weather for any location (Open-Meteo API)
- **RequestSuggestionsTool**: Request AI-powered suggestions for document edits

---

## Tool Example: Web Search

```js
const result = await agent.tools.get('web_search').execute({
  query: "latest AI research",
  maxResults: 10,
  searchDepth: "advanced"
});
console.log(result.answer, result.results);
```

## Tool Example: File Management

```js
const result = await agent.tools.get('file_manager').execute({
  action: "read",
  filePath: "/path/to/file.txt"
});
console.log(result.content);
```

---

## Adding a New Tool

1. Create a new file in `ai/tools/` implementing the `Tool` interface:
   - `getDefinition()`: Describe the tool and its parameters
   - `execute(args)`: Implement the logic
2. Register your tool in `ai/jotium.ts` in `initializeTools()`
3. (Optional) Add environment variables for API keys/secrets

---

## Security

- **Never commit `.env` files** or secrets to the repo.
- All API keys and tokens are loaded from environment variables.
- Sensitive operations (file, code, API) are protected by authentication and input validation.

---

## Contributing

- Fork and clone the repo
- Add new tools or improve existing ones
- Write tests for new features
- Open a PR with a clear description

---

## License

MIT

---

## Credits

- Built with [Google Gemini](https://ai.google.dev/)
- Web search powered by [Tavily](https://tavily.com/)
- Web scraping by [FireCrawl](https://firecrawl.dev/)
- Scheduling by [Cal.com](https://cal.com/)
- Social media by [Ayrshare](https://ayrshare.com/)
- Project management by [ClickUp](https://clickup.com/)
- Flights by [Duffel](https://duffel.com/)
- And many more...

---

## Contact

For support, feature requests, or questions, open an issue or contact the maintainer.
