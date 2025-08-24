import { createServer, IncomingMessage, ServerResponse } from "http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { randomUUID } from "crypto";
import { createStandaloneServer } from "../server.js";
import { Config } from "../config.js";

// Session management with cleanup and size limits
const MAX_SESSIONS = 1000;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const sessions = new Map<
  string,
  { 
    transport: StreamableHTTPServerTransport; 
    server: any; 
    lastActivity: number;
  }
>();

// Cleanup old sessions periodically
setInterval(() => {
  const now = Date.now();
  const expiredSessions: string[] = [];
  
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      expiredSessions.push(sessionId);
    }
  }
  
  expiredSessions.forEach(sessionId => {
    console.log(`Cleaning up expired session: ${sessionId}`);
    sessions.delete(sessionId);
  });
}, 5 * 60 * 1000); // Check every 5 minutes

// Simple rate limiting
const rateLimits = new Map<string, { requests: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const clientRate = rateLimits.get(clientIP);

  if (!clientRate || now > clientRate.resetTime) {
    rateLimits.set(clientIP, { requests: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (clientRate.requests >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  clientRate.requests++;
  return false;
}

export function startHttpTransport(config: Config): void {
  const httpServer = createServer();

  httpServer.on("request", async (req, res) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Validate and sanitize host header to prevent injection
    const host = req.headers.host;
    const validHost = host && /^[a-zA-Z0-9.-]+:\d+$|^[a-zA-Z0-9.-]+$/.test(host) 
      ? host 
      : `localhost:${config.port}`;

    let url: URL;
    try {
      url = new URL(req.url!, `http://${validHost}`);
    } catch (error) {
      res.statusCode = 400;
      res.end("Invalid URL");
      return;
    }

    // Rate limiting check (simple implementation)
    const clientIP = req.socket.remoteAddress || 'unknown';
    if (!isRateLimited(clientIP)) {
      switch (url.pathname) {
        case "/mcp":
          await handleMcpRequest(req, res, config);
          break;
        case "/sse":
          await handleSSERequest(req, res, config);
          break;
        case "/health":
          handleHealthCheck(res);
          break;
        default:
          handleNotFound(res);
      }
    } else {
      res.statusCode = 429;
      res.end("Too Many Requests");
    }
  });

  const host = config.isProduction ? "0.0.0.0" : "localhost";

  httpServer.listen(config.port, host, () => {
    logServerStart(config);
  });
}

async function handleMcpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  config: Config
): Promise<void> {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (sessionId) {
    const session = sessions.get(sessionId);
    if (!session) {
      res.statusCode = 404;
      res.end("Session not found");
      return;
    }
    
    // Update last activity time
    session.lastActivity = Date.now();
    return await session.transport.handleRequest(req, res);
  }

  if (req.method === "POST") {
    // Check session limit before creating new session
    if (sessions.size >= MAX_SESSIONS) {
      res.statusCode = 503;
      res.end("Server at capacity - too many active sessions");
      return;
    }
    await createNewSession(req, res, config);
    return;
  }

  res.statusCode = 400;
  res.end("Invalid request");
}

async function handleSSERequest(
  req: IncomingMessage,
  res: ServerResponse,
  config: Config
): Promise<void> {
  const serverInstance = createStandaloneServer(config.apiKey);
  const transport = new SSEServerTransport("/sse", res);

  try {
    await serverInstance.connect(transport);
    console.log("SSE connection established");
  } catch (error) {
    console.error("SSE connection error:", error);
    res.statusCode = 500;
    res.end("SSE connection failed");
  }
}

async function createNewSession(
  req: IncomingMessage,
  res: ServerResponse,
  config: Config
): Promise<void> {
  const serverInstance = createStandaloneServer(config.apiKey);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId) => {
      sessions.set(sessionId, { 
        transport, 
        server: serverInstance, 
        lastActivity: Date.now() 
      });
      // Log session ID in a more secure way (only first 8 characters)
      console.log(`New AgentMail session created: ${sessionId.substring(0, 8)}...`);
    },
  });

  transport.onclose = () => {
    if (transport.sessionId) {
      sessions.delete(transport.sessionId);
      console.log(`AgentMail session closed: ${transport.sessionId.substring(0, 8)}...`);
    }
  };

  try {
    await serverInstance.connect(transport);
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error("Streamable HTTP connection error:", error);
    res.statusCode = 500;
    res.end("Internal server error");
  }
}

function handleHealthCheck(res: ServerResponse): void {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "agentmail-mcp",
      version: "0.2.0",
    })
  );
}

function handleNotFound(res: ServerResponse): void {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
}

function logServerStart(config: Config): void {
  const displayUrl = config.isProduction
    ? `Port ${config.port}`
    : `http://localhost:${config.port}`;

  console.log(`AgentMail MCP Server listening on ${displayUrl}`);

  if (!config.isProduction) {
    console.log("Put this in your client config:");
    console.log(
      JSON.stringify(
        {
          mcpServers: {
            "agentmail": {
              url: `http://localhost:${config.port}/mcp`,
            },
          },
        },
        null,
        2
      )
    );
    console.log(
      "For backward compatibility, you can also use the /sse endpoint."
    );
  }
}