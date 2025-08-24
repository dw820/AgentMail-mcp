import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { AgentMailClient } from '../client.js';
import { CreateInboxArgs, GetInboxArgs } from '../types.js';

export const listInboxesToolDefinition: Tool = {
  name: "agentmail_list_inboxes",
  description: "List all available inboxes in the AgentMail account",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

export const getInboxToolDefinition: Tool = {
  name: "agentmail_get_inbox",
  description: "Get details of a specific inbox by ID",
  inputSchema: {
    type: "object",
    properties: {
      inbox_id: {
        type: "string",
        description: "The ID of the inbox to retrieve"
      }
    },
    required: ["inbox_id"],
  },
};

export const createInboxToolDefinition: Tool = {
  name: "agentmail_create_inbox",
  description: "Create a new inbox with the specified name",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The name for the new inbox"
      }
    },
    required: ["name"],
  },
};

function isCreateInboxArgs(args: unknown): args is CreateInboxArgs {
  return (
    typeof args === "object" &&
    args !== null &&
    "name" in args &&
    typeof (args as { name: unknown }).name === "string"
  );
}

function isGetInboxArgs(args: unknown): args is GetInboxArgs {
  return (
    typeof args === "object" &&
    args !== null &&
    "inbox_id" in args &&
    typeof (args as { inbox_id: unknown }).inbox_id === "string"
  );
}

export async function handleListInboxesTool(
  client: AgentMailClient,
  _args: unknown
): Promise<CallToolResult> {
  try {
    const inboxes = await client.listInboxes();
    
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(inboxes, null, 2)
      }],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleGetInboxTool(
  client: AgentMailClient,
  args: unknown
): Promise<CallToolResult> {
  try {
    if (!args) {
      throw new Error("No arguments provided");
    }

    if (!isGetInboxArgs(args)) {
      throw new Error("Invalid arguments for agentmail_get_inbox");
    }

    const inbox = await client.getInbox(args.inbox_id);

    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(inbox, null, 2)
      }],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleCreateInboxTool(
  client: AgentMailClient,
  args: unknown
): Promise<CallToolResult> {
  try {
    if (!args) {
      throw new Error("No arguments provided");
    }

    if (!isCreateInboxArgs(args)) {
      throw new Error("Invalid arguments for agentmail_create_inbox");
    }

    const inbox = await client.createInbox(args);

    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(inbox, null, 2)
      }],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}