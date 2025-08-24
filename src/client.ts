import { AgentMailClient as SDKAgentMailClient, AgentMail } from 'agentmail';
import { 
  AgentMailInbox, 
  AgentMailMessage, 
  CreateInboxArgs, 
  SendMessageArgs 
} from './types.js';

export class AgentMailClient {
  private client: SDKAgentMailClient;

  constructor(apiKey: string) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      throw new Error('Invalid API key: must be a non-empty string');
    }
    this.client = new SDKAgentMailClient({ apiKey: apiKey.trim() });
  }


  async listInboxes(): Promise<AgentMailInbox[]> {
    const response = await this.client.inboxes.list();
    return response.inboxes.map(inbox => ({
      id: inbox.inbox_id,
      name: inbox.display_name,
      address: inbox.display_name, // SDK doesn't have direct address field
      created_at: inbox.created_at,
      updated_at: inbox.updated_at
    }));
  }

  async getInbox(inboxId: string): Promise<AgentMailInbox> {
    if (!inboxId || typeof inboxId !== 'string' || inboxId.trim() === '') {
      throw new Error('Invalid inbox ID: must be a non-empty string');
    }
    const response = await this.client.inboxes.get(inboxId);
    return {
      id: response.inbox_id,
      name: response.display_name,
      address: response.display_name, // SDK doesn't have direct address field
      created_at: response.created_at,
      updated_at: response.updated_at
    };
  }

  async createInbox(args: CreateInboxArgs): Promise<AgentMailInbox> {
    const response = await this.client.inboxes.create({
      username: args.username,
      domain: args.domain,
      display_name: args.display_name,
      client_id: args.client_id
    });
    return {
      id: response.inbox_id,
      name: response.display_name,
      address: response.display_name, // SDK doesn't have direct address field
      created_at: response.created_at,
      updated_at: response.updated_at
    };
  }

  async getMessages(inboxId: string, limit?: number, offset?: number): Promise<AgentMailMessage[]> {
    if (!inboxId || typeof inboxId !== 'string' || inboxId.trim() === '') {
      throw new Error('Invalid inbox ID: must be a non-empty string');
    }
    if (limit !== undefined && (limit < 0 || !Number.isInteger(limit))) {
      throw new Error('Invalid limit: must be a non-negative integer');
    }
    if (offset !== undefined && (offset < 0 || !Number.isInteger(offset))) {
      throw new Error('Invalid offset: must be a non-negative integer');
    }

    const queryParams: any = {};
    if (limit !== undefined) queryParams.limit = limit;
    if (offset !== undefined) queryParams.offset = offset;

    const response = await this.client.inboxes.messages.list(inboxId, queryParams);
    return response.messages.map(message => ({
      id: message.message_id,
      inbox_id: message.inbox_id,
      from: { email: Array.isArray(message.from) ? message.from[0] : message.from },
      to: Array.isArray(message.to) ? message.to.map(addr => ({ email: addr })) : [{ email: message.to }],
      cc: message.cc ? (Array.isArray(message.cc) ? message.cc.map(addr => ({ email: addr })) : [{ email: message.cc }]) : undefined,
      bcc: message.bcc ? (Array.isArray(message.bcc) ? message.bcc.map(addr => ({ email: addr })) : [{ email: message.bcc }]) : undefined,
      subject: message.subject || '',
      text: undefined, // MessageItem doesn't include text content
      html: undefined, // MessageItem doesn't include html content
      created_at: message.timestamp,
      updated_at: message.timestamp,
      attachments: message.attachments?.map(att => ({
        id: att.attachment_id || '',
        filename: att.filename || '',
        size: att.size || 0,
        content_type: att.content_type || ''
      }))
    }));
  }

  async getMessage(inboxId: string, messageId: string): Promise<AgentMailMessage> {
    if (!inboxId || typeof inboxId !== 'string' || inboxId.trim() === '') {
      throw new Error('Invalid inbox ID: must be a non-empty string');
    }
    if (!messageId || typeof messageId !== 'string' || messageId.trim() === '') {
      throw new Error('Invalid message ID: must be a non-empty string');
    }

    const response = await this.client.inboxes.messages.get(inboxId, messageId);
    return {
      id: response.message_id,
      inbox_id: response.inbox_id,
      from: { email: Array.isArray(response.from) ? response.from[0] : response.from },
      to: Array.isArray(response.to) ? response.to.map(addr => ({ email: addr })) : [{ email: response.to }],
      cc: response.cc ? (Array.isArray(response.cc) ? response.cc.map(addr => ({ email: addr })) : [{ email: response.cc }]) : undefined,
      bcc: response.bcc ? (Array.isArray(response.bcc) ? response.bcc.map(addr => ({ email: addr })) : [{ email: response.bcc }]) : undefined,
      subject: response.subject || '',
      text: response.text,
      html: response.html,
      created_at: response.created_at,
      updated_at: response.updated_at,
      attachments: response.attachments?.map(att => ({
        id: att.attachment_id || '',
        filename: att.filename || '',
        size: att.size || 0,
        content_type: att.content_type || ''
      }))
    };
  }

  async sendMessage(args: SendMessageArgs): Promise<AgentMailMessage> {
    const { inbox_id, ...messageData } = args;
    
    if (!inbox_id || typeof inbox_id !== 'string' || inbox_id.trim() === '') {
      throw new Error('Invalid inbox ID: must be a non-empty string');
    }
    if (!messageData.subject || typeof messageData.subject !== 'string' || messageData.subject.trim() === '') {
      throw new Error('Invalid subject: must be a non-empty string');
    }
    if (!messageData.to || (typeof messageData.to === 'string' && messageData.to.trim() === '')) {
      throw new Error('Recipients (to) field is required');
    }

    // Validate email format (basic validation)
    const validateEmail = (email: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    };

    const toEmails = Array.isArray(messageData.to) ? messageData.to : [messageData.to];
    
    // Check for empty/whitespace strings in array
    if (toEmails.some(email => !email || typeof email !== 'string' || email.trim() === '')) {
      throw new Error('Recipients (to) field is required');
    }
    
    if (!toEmails.every(email => validateEmail(email))) {
      throw new Error('Invalid email format in "to" field');
    }

    // Convert string arrays to proper format
    const formattedData = {
      ...messageData,
      to: toEmails,
      cc: messageData.cc ? (Array.isArray(messageData.cc) ? messageData.cc : [messageData.cc]) : undefined,
      bcc: messageData.bcc ? (Array.isArray(messageData.bcc) ? messageData.bcc : [messageData.bcc]) : undefined,
    };

    const response = await this.client.inboxes.messages.send(inbox_id, formattedData);
    return {
      id: response.message_id,
      inbox_id: inbox_id,
      from: { email: '' }, // Send response doesn't include from
      to: toEmails.map(email => ({ email })),
      cc: formattedData.cc?.map(email => ({ email })),
      bcc: formattedData.bcc?.map(email => ({ email })),
      subject: messageData.subject,
      text: messageData.text,
      html: messageData.html,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}