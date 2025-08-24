/**
 * AgentMail Inbox structure
 */
export interface AgentMailInbox {
  id: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
}

/**
 * AgentMail Message structure
 */
export interface AgentMailMessage {
  id: string;
  inbox_id: string;
  from: {
    email: string;
    name?: string;
  };
  to: Array<{
    email: string;
    name?: string;
  }>;
  cc?: Array<{
    email: string;
    name?: string;
  }>;
  bcc?: Array<{
    email: string;
    name?: string;
  }>;
  subject: string;
  text?: string;
  html?: string;
  created_at: string;
  updated_at: string;
  attachments?: Array<{
    id: string;
    filename: string;
    size: number;
    content_type: string;
  }>;
}

/**
 * Arguments for create inbox tool
 */
export interface CreateInboxArgs {
  username?: string;
  domain?: string;
  display_name?: string;
  client_id?: string;
}

/**
 * Arguments for get inbox tool
 */
export interface GetInboxArgs {
  inbox_id: string;
}

/**
 * Arguments for send message tool
 */
export interface SendMessageArgs {
  inbox_id: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

/**
 * Arguments for get messages tool
 */
export interface GetMessagesArgs {
  inbox_id: string;
  limit?: number;
  offset?: number;
}

/**
 * Arguments for get message tool
 */
export interface GetMessageArgs {
  inbox_id: string;
  message_id: string;
}

