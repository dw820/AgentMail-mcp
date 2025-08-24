import { AgentMailClient } from '../../src/client';
import {
  handleGetMessagesTool,
  handleGetMessageTool,
  handleSendMessageTool,
} from '../../src/tools/message';
import { AgentMailMessage } from '../../src/types';

describe('Message Tools', () => {
  let mockClient: jest.Mocked<AgentMailClient>;

  beforeEach(() => {
    mockClient = {
      listInboxes: jest.fn(),
      getInbox: jest.fn(),
      createInbox: jest.fn(),
      getMessages: jest.fn(),
      getMessage: jest.fn(),
      sendMessage: jest.fn(),
    } as unknown as jest.Mocked<AgentMailClient>;
  });

  describe('handleGetMessagesTool', () => {
    const mockMessages: AgentMailMessage[] = [
      {
        id: 'msg-1',
        inbox_id: 'inbox-1',
        from: { email: 'sender@example.com' },
        to: [{ email: 'recipient@example.com' }],
        subject: 'Test Message',
        text: 'Hello, world!',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ];

    it('should get messages successfully without pagination', async () => {
      mockClient.getMessages.mockResolvedValueOnce(mockMessages);

      const result = await handleGetMessagesTool(mockClient, { inbox_id: 'inbox-1' });

      expect(mockClient.getMessages).toHaveBeenCalledWith('inbox-1', undefined, undefined);
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockMessages, null, 2) }],
        isError: false,
      });
    });

    it('should get messages successfully with pagination', async () => {
      mockClient.getMessages.mockResolvedValueOnce(mockMessages);

      const result = await handleGetMessagesTool(mockClient, {
        inbox_id: 'inbox-1',
        limit: 10,
        offset: 5,
      });

      expect(mockClient.getMessages).toHaveBeenCalledWith('inbox-1', 10, 5);
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockMessages, null, 2) }],
        isError: false,
      });
    });

    it('should handle missing arguments', async () => {
      const result = await handleGetMessagesTool(mockClient, null);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: No arguments provided' }],
        isError: true,
      });
    });

    it('should handle invalid arguments', async () => {
      const result = await handleGetMessagesTool(mockClient, { invalid: 'arg' });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_get_messages' }],
        isError: true,
      });
    });

    it('should handle missing inbox_id', async () => {
      const result = await handleGetMessagesTool(mockClient, {});

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_get_messages' }],
        isError: true,
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('Inbox not found');
      mockClient.getMessages.mockRejectedValueOnce(error);

      const result = await handleGetMessagesTool(mockClient, { inbox_id: 'invalid-id' });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Inbox not found' }],
        isError: true,
      });
    });
  });

  describe('handleGetMessageTool', () => {
    const mockMessage: AgentMailMessage = {
      id: 'msg-1',
      inbox_id: 'inbox-1',
      from: { email: 'sender@example.com' },
      to: [{ email: 'recipient@example.com' }],
      subject: 'Test Message',
      text: 'Hello, world!',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    it('should get specific message successfully', async () => {
      mockClient.getMessage.mockResolvedValueOnce(mockMessage);

      const result = await handleGetMessageTool(mockClient, {
        inbox_id: 'inbox-1',
        message_id: 'msg-1',
      });

      expect(mockClient.getMessage).toHaveBeenCalledWith('inbox-1', 'msg-1');
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockMessage, null, 2) }],
        isError: false,
      });
    });

    it('should handle missing arguments', async () => {
      const result = await handleGetMessageTool(mockClient, null);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: No arguments provided' }],
        isError: true,
      });
    });

    it('should handle invalid arguments', async () => {
      const result = await handleGetMessageTool(mockClient, { inbox_id: 'inbox-1' });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_get_message' }],
        isError: true,
      });
    });

    it('should handle missing message_id', async () => {
      const result = await handleGetMessageTool(mockClient, { inbox_id: 'inbox-1' });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_get_message' }],
        isError: true,
      });
    });

    it('should handle non-string parameters', async () => {
      const result = await handleGetMessageTool(mockClient, {
        inbox_id: 123,
        message_id: 'msg-1',
      });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_get_message' }],
        isError: true,
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('Message not found');
      mockClient.getMessage.mockRejectedValueOnce(error);

      const result = await handleGetMessageTool(mockClient, {
        inbox_id: 'inbox-1',
        message_id: 'invalid-id',
      });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Message not found' }],
        isError: true,
      });
    });
  });

  describe('handleSendMessageTool', () => {
    const mockMessage: AgentMailMessage = {
      id: 'msg-sent',
      inbox_id: 'inbox-1',
      from: { email: 'sender@example.com' },
      to: [{ email: 'recipient@example.com' }],
      subject: 'Sent Message',
      text: 'Hello!',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    it('should send message successfully with minimal args', async () => {
      mockClient.sendMessage.mockResolvedValueOnce(mockMessage);

      const args = {
        inbox_id: 'inbox-1',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test message',
      };

      const result = await handleSendMessageTool(mockClient, args);

      expect(mockClient.sendMessage).toHaveBeenCalledWith(args);
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockMessage, null, 2) }],
        isError: false,
      });
    });

    it('should send message successfully with all options', async () => {
      mockClient.sendMessage.mockResolvedValueOnce(mockMessage);

      const args = {
        inbox_id: 'inbox-1',
        to: ['recipient1@example.com', 'recipient2@example.com'],
        subject: 'Test Subject',
        text: 'Text content',
        html: '<p>HTML content</p>',
        cc: 'cc@example.com',
        bcc: ['bcc1@example.com', 'bcc2@example.com'],
      };

      const result = await handleSendMessageTool(mockClient, args);

      expect(mockClient.sendMessage).toHaveBeenCalledWith(args);
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockMessage, null, 2) }],
        isError: false,
      });
    });

    it('should handle missing arguments', async () => {
      const result = await handleSendMessageTool(mockClient, null);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: No arguments provided' }],
        isError: true,
      });
    });

    it('should handle missing required fields', async () => {
      const result = await handleSendMessageTool(mockClient, {
        inbox_id: 'inbox-1',
        // missing 'to' and 'subject'
        text: 'Test message',
      });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_send_message' }],
        isError: true,
      });
    });

    it('should handle invalid to field type', async () => {
      const result = await handleSendMessageTool(mockClient, {
        inbox_id: 'inbox-1',
        to: 123, // invalid type
        subject: 'Test Subject',
      });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_send_message' }],
        isError: true,
      });
    });

    it('should handle missing inbox_id', async () => {
      const result = await handleSendMessageTool(mockClient, {
        to: 'recipient@example.com',
        subject: 'Test Subject',
      });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_send_message' }],
        isError: true,
      });
    });

    it('should handle missing subject', async () => {
      const result = await handleSendMessageTool(mockClient, {
        inbox_id: 'inbox-1',
        to: 'recipient@example.com',
      });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_send_message' }],
        isError: true,
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to send message');
      mockClient.sendMessage.mockRejectedValueOnce(error);

      const result = await handleSendMessageTool(mockClient, {
        inbox_id: 'inbox-1',
        to: 'recipient@example.com',
        subject: 'Test Subject',
      });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Failed to send message' }],
        isError: true,
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockClient.sendMessage.mockRejectedValueOnce('String error');

      const result = await handleSendMessageTool(mockClient, {
        inbox_id: 'inbox-1',
        to: 'recipient@example.com',
        subject: 'Test Subject',
      });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: String error' }],
        isError: true,
      });
    });
  });
});