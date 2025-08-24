import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { AgentMailClient } from './client.js';
import {
  listInboxesToolDefinition,
  getInboxToolDefinition,
  createInboxToolDefinition,
  getMessagesToolDefinition,
  getMessageToolDefinition,
  sendMessageToolDefinition,
  handleListInboxesTool,
  handleGetInboxTool,
  handleCreateInboxTool,
  handleGetMessagesTool,
  handleGetMessageTool,
  handleSendMessageTool,
} from './tools/index.js';

export function createStandaloneServer(apiKey: string): Server {
  const serverInstance = new Server(
    {
      name: "org/agentmail",
      version: "0.2.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const agentMailClient = new AgentMailClient(apiKey);

  serverInstance.setNotificationHandler(InitializedNotificationSchema, async () => {
    console.log('AgentMail MCP client initialized');
  });

  serverInstance.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      listInboxesToolDefinition,
      getInboxToolDefinition,
      createInboxToolDefinition,
      getMessagesToolDefinition,
      getMessageToolDefinition,
      sendMessageToolDefinition,
    ],
  }));

  serverInstance.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "agentmail_list_inboxes":
        return await handleListInboxesTool(agentMailClient, args);
      case "agentmail_get_inbox":
        return await handleGetInboxTool(agentMailClient, args);
      case "agentmail_create_inbox":
        return await handleCreateInboxTool(agentMailClient, args);
      case "agentmail_get_messages":
        return await handleGetMessagesTool(agentMailClient, args);
      case "agentmail_get_message":
        return await handleGetMessageTool(agentMailClient, args);
      case "agentmail_send_message":
        return await handleSendMessageTool(agentMailClient, args);
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  });

  return serverInstance;
}

export class AgentMailServer {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getServer(): Server {
    return createStandaloneServer(this.apiKey);
  }
}