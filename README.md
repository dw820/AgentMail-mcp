# AgentMail MCP Server

An MCP (Model Context Protocol) server for AgentMail integration, providing inbox and message management capabilities.

## Features

- **Inbox Management**: Create, list, and retrieve inbox details
- **Message Management**: Send, read, and list email messages with pagination support
- **Streamable HTTP Transport**: Production-ready HTTP transport (primary)
- **STDIO Transport**: Development-friendly STDIO transport
- **Type Safety**: Full TypeScript coverage with comprehensive error handling

## Available Tools

1. `agentmail_list_inboxes` - List all available inboxes
2. `agentmail_get_inbox` - Get specific inbox details by ID
3. `agentmail_create_inbox` - Create a new inbox
4. `agentmail_get_messages` - List messages from inbox (with pagination)
5. `agentmail_get_message` - Get specific message details
6. `agentmail_send_message` - Send email from an inbox

## Quick Start

### Installation

```bash
npm install
npm run build
```

### Configuration

Set the required environment variables:

```bash
export AGENTMAIL_API_KEY="your_agentmail_api_key"
# Optional: Override default API base URL
export AGENTMAIL_BASE_URL="https://api.agentmail.to"
```

### Usage

**HTTP Transport (Production):**
```bash
npm start
# or
node dist/index.js --port 8080
```

**STDIO Transport (Development):**
```bash
npm run start:stdio
# or
node dist/index.js --stdio
```

### Client Configuration

For HTTP transport, add to your MCP client config:

```json
{
  "mcpServers": {
    "agentmail": {
      "url": "http://localhost:8080/mcp"
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AGENTMAIL_API_KEY` | ✅ | - | Your AgentMail API key |
| `AGENTMAIL_BASE_URL` | ❌ | `https://api.agentmail.to` | AgentMail API base URL |
| `PORT` | ❌ | `8080` | HTTP server port |
| `NODE_ENV` | ❌ | - | Set to 'production' for production mode |

## Development

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and recompile
- `npm run dev` - Build and run with HTTP transport
- `npm run dev:stdio` - Build and run with STDIO transport

### Architecture

```
src/
├── index.ts           # Main entry point
├── cli.ts            # CLI argument parsing
├── config.ts         # Configuration management
├── server.ts         # Server instance creation
├── client.ts         # AgentMail API client
├── types.ts          # TypeScript interfaces
├── tools/            # MCP tool definitions
│   ├── index.ts      # Tool exports
│   ├── inbox.ts      # Inbox management tools
│   └── message.ts    # Message management tools
└── transport/        # Transport implementations
    ├── index.ts      # Transport exports
    ├── http.ts       # HTTP transport (primary)
    └── stdio.ts      # STDIO transport
```

## API Endpoints (HTTP Mode)

- `POST /mcp` - MCP session endpoint
- `GET /sse` - Server-Sent Events endpoint (backward compatibility)
- `GET /health` - Health check endpoint

## License

MIT
