# Jotium Agent

[![npm version](https://img.shields.io/npm/v/jotium-agent?style=flat-square)](https://www.npmjs.com/package/jotium-agent)
[![npm downloads](https://img.shields.io/npm/dm/jotium-agent?style=flat-square)](https://www.npmjs.com/package/jotium-agent)

---

## About

**Jotium Agent** is a modern, extensible AI agent platform that brings the power of Google Gemini and 15+ production-grade tools to your workflow. Designed for developers, teams, and organizations, Jotium makes it easy to automate tasks, integrate with popular APIs, and build context-aware, multi-modal assistants for productivity, research, and automation.

---

## Why Use Jotium?

- **All-in-one AI agent:** Combines chat, code, web, scheduling, file, and more in a single platform.
- **Production-ready:** Robust, secure, and built for real-world use.
- **Extensible:** Add your own tools or connect to any API with minimal effort.
- **Multi-modal:** Supports text, code, files, images, and structured data.
- **Open and developer-friendly:** Easy to set up, customize, and contribute to.

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables (see .env.example)
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

## Features

- **Notifications System:**
  - Users receive notifications for important events (e.g., billing, account, and system updates).
  - Notifications are fetched securely from `/api/notifications` and displayed in the UI.
  - Unread notifications are highlighted and include timestamps.
- **Authentication:**
  - Secure login and registration using NextAuth.js.
  - Session management and protected API routes.
- **Billing & Pricing:**
  - Stripe integration for subscriptions and payments.
  - Webhooks for real-time updates and notifications.
- **Modern UI:**
  - Built with Tailwind CSS and Radix UI components.
  - Responsive, accessible, and dark mode support.
- **Extensible Tooling:**
  - Easily add or customize tools in `ai/tools/`.
  - Examples: web search, file management, GitHub, Slack, ClickUp, and more.
- **Database:**
  - Uses Drizzle ORM for migrations and queries.
  - PostgreSQL recommended for production.

---

## Architecture


### Jotium Agent ([`ai/jotium.ts`](./ai/jotium.ts))

- **Core:** `AIAgent` class wraps Google Gemini, manages memory, and orchestrates tool calls.
- **Tool Integration:** Tools are registered in a map and exposed to Gemini as function declarations.
- **Memory:** Recent messages and tool results are persisted to disk (configurable).
- **Streaming:** All responses (including tool output and agent thoughts) are streamed to the client via SSE.
- **System Prompt:** Jotium is instructed to act as a human-like, proactive, tool-empowered agent.


### Tool System ([`ai/tools/`](./ai/tools/))

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


---

## Adding a New Tool

1. Create a new file in `ai/tools/` implementing the `Tool` interface:
   - `getDefinition()`: Describe the tool and its parameters
   - `execute(args)`: Implement the logic
2. Register your tool in `ai/jotium.ts` in `initializeTools()`
3. (Optional) Add environment variables for API keys/secrets

---


---

## Security

- **Never commit `.env` files** or secrets to the repo.
- All API keys and tokens are loaded from environment variables.
- Sensitive operations (file, code, API) are protected by authentication and input validation.

---


---

## Contributing

- Fork and clone the repo
- Add new tools or improve existing ones
- Write tests for new features
- Open a PR with a clear description

---


---

## License

This project is licensed under the [MIT License](./LICENSE).

---

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


---

## Contact

For support, feature requests, or questions, open an issue or contact the maintainer.

---

## Project Structure

```
app/                # Next.js app directory (routes, pages, API)
ai/                 # AI agent core and tools
components/         # UI components (custom, flights, ui)
db/                 # Database schema, queries, migrations
lib/                # Utilities and helpers
public/             # Static assets (fonts, images, logos)
```
