import { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { AgentMailClient } from '../client.js';
import { SendMessageArgs, GetMessagesArgs, GetMessageArgs } from '../types.js';

export const getMessagesToolDefinition: Tool = {
  name: "agentmail_get_messages",
  description: "Get messages from a specific inbox with optional pagination",
  inputSchema: {
    type: "object",
    properties: {
      inbox_id: {
        type: "string",
        description: "The ID of the inbox to get messages from"
      },
      limit: {
        type: "number",
        description: "Maximum number of messages to retrieve (optional)"
      },
      offset: {
        type: "number", 
        description: "Number of messages to skip for pagination (optional)"
      }
    },
    required: ["inbox_id"],
  },
};

export const getMessageToolDefinition: Tool = {
  name: "agentmail_get_message",
  description: "Get a specific message by ID from an inbox",
  inputSchema: {
    type: "object",
    properties: {
      inbox_id: {
        type: "string",
        description: "The ID of the inbox containing the message"
      },
      message_id: {
        type: "string",
        description: "The ID of the message to retrieve"
      }
    },
    required: ["inbox_id", "message_id"],
  },
};

export const sendMessageToolDefinition: Tool = {
  name: "agentmail_send_message",
  description: "Send an email message from a specific inbox",
  inputSchema: {
    type: "object",
    properties: {
      inbox_id: {
        type: "string",
        description: "The ID of the inbox to send from"
      },
      to: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ],
        description: "Recipient email address(es)"
      },
      subject: {
        type: "string",
        description: "Email subject line"
      },
      text: {
        type: "string",
        description: "Plain text email content (optional)"
      },
      html: {
        type: "string",
        description: "HTML email content (optional)"
      },
      cc: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ],
        description: "CC recipient email address(es) (optional)"
      },
      bcc: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } }
        ],
        description: "BCC recipient email address(es) (optional)"
      }
    },
    required: ["inbox_id", "to", "subject"],
  },
};

function isGetMessagesArgs(args: unknown): args is GetMessagesArgs {
  return (
    typeof args === "object" &&
    args !== null &&
    "inbox_id" in args &&
    typeof (args as { inbox_id: unknown }).inbox_id === "string"
  );
}

function isGetMessageArgs(args: unknown): args is GetMessageArgs {
  return (
    typeof args === "object" &&
    args !== null &&
    "inbox_id" in args &&
    "message_id" in args &&
    typeof (args as { inbox_id: unknown }).inbox_id === "string" &&
    typeof (args as { message_id: unknown }).message_id === "string"
  );
}

function isSendMessageArgs(args: unknown): args is SendMessageArgs {
  return (
    typeof args === "object" &&
    args !== null &&
    "inbox_id" in args &&
    "to" in args &&
    "subject" in args &&
    typeof (args as { inbox_id: unknown }).inbox_id === "string" &&
    typeof (args as { subject: unknown }).subject === "string" &&
    (typeof (args as { to: unknown }).to === "string" || 
     Array.isArray((args as { to: unknown }).to))
  );
}

export async function handleGetMessagesTool(
  client: AgentMailClient,
  args: unknown
): Promise<CallToolResult> {
  try {
    if (!args) {
      throw new Error("No arguments provided");
    }

    if (!isGetMessagesArgs(args)) {
      throw new Error("Invalid arguments for agentmail_get_messages");
    }

    const messages = await client.getMessages(args.inbox_id, args.limit, args.offset);

    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(messages, null, 2)
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

export async function handleGetMessageTool(
  client: AgentMailClient,
  args: unknown
): Promise<CallToolResult> {
  try {
    if (!args) {
      throw new Error("No arguments provided");
    }

    if (!isGetMessageArgs(args)) {
      throw new Error("Invalid arguments for agentmail_get_message");
    }

    const message = await client.getMessage(args.inbox_id, args.message_id);

    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(message, null, 2)
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

export async function handleSendMessageTool(
  client: AgentMailClient,
  args: unknown
): Promise<CallToolResult> {
  try {
    if (!args) {
      throw new Error("No arguments provided");
    }

    if (!isSendMessageArgs(args)) {
      throw new Error("Invalid arguments for agentmail_send_message");
    }

    const message = await client.sendMessage(args);

    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(message, null, 2)
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