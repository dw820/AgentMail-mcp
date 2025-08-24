import { AgentMailClient } from '../src/client';
import { AgentMailInbox, AgentMailMessage } from '../src/types';

// Mock AgentMail SDK
jest.mock('agentmail', () => ({
  AgentMailClient: jest.fn()
}));

const { AgentMailClient: MockSDKClient } = require('agentmail');

// Create mock SDK instance
const createMockSDKInstance = () => ({
  inboxes: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    messages: {
      list: jest.fn(),
      get: jest.fn(),
      send: jest.fn()
    }
  }
});

describe('AgentMailClient', () => {
  let client: AgentMailClient;
  let mockSDKInstance: any;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    mockSDKInstance = createMockSDKInstance();
    MockSDKClient.mockReturnValue(mockSDKInstance);
    client = new AgentMailClient(mockApiKey);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with API key', () => {
      expect(client).toBeInstanceOf(AgentMailClient);
    });

    it('should validate API key is provided', () => {
      expect(() => new AgentMailClient('')).toThrow('Invalid API key: must be a non-empty string');
      expect(() => new AgentMailClient('   ')).toThrow('Invalid API key: must be a non-empty string');
      expect(() => new AgentMailClient(null as any)).toThrow('Invalid API key: must be a non-empty string');
    });
  });

  describe('listInboxes', () => {
    const mockInboxes: AgentMailInbox[] = [
      {
        id: 'inbox-1',
        name: 'Test Inbox',
        address: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ];

    it('should fetch and return list of inboxes', async () => {
      const mockSDKResponse = {
        inboxes: [
          {
            inbox_id: 'inbox-1',
            display_name: 'Test Inbox',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          }
        ]
      };

      mockSDKInstance.inboxes.list.mockResolvedValueOnce(mockSDKResponse);

      const result = await client.listInboxes();

      expect(mockSDKInstance.inboxes.list).toHaveBeenCalledWith();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'inbox-1',
        name: 'Test Inbox',
        address: 'Test Inbox',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      });
    });

    it('should throw error on API failure', async () => {
      const error = new Error('API Error');
      mockSDKInstance.inboxes.list.mockRejectedValueOnce(error);

      await expect(client.listInboxes()).rejects.toThrow('API Error');
    });
  });

  describe('getInbox', () => {
    const mockInbox: AgentMailInbox = {
      id: 'inbox-1',
      name: 'Test Inbox',
      address: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    it('should fetch and return specific inbox', async () => {
      const mockSDKResponse = {
        inbox_id: 'inbox-1',
        display_name: 'Test Inbox',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockSDKInstance.inboxes.get.mockResolvedValueOnce(mockSDKResponse);

      const result = await client.getInbox('inbox-1');

      expect(mockSDKInstance.inboxes.get).toHaveBeenCalledWith('inbox-1');
      expect(result).toEqual({
        id: 'inbox-1',
        name: 'Test Inbox',
        address: 'Test Inbox',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      });
    });
  });

  describe('createInbox', () => {
    const mockInbox: AgentMailInbox = {
      id: 'inbox-new',
      name: 'New Inbox',
      address: 'new@example.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    it('should create and return new inbox', async () => {
      const mockSDKResponse = {
        inbox_id: 'inbox-new',
        display_name: 'New Inbox',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockSDKInstance.inboxes.create.mockResolvedValueOnce(mockSDKResponse);

      const result = await client.createInbox({ display_name: 'New Inbox' });

      expect(mockSDKInstance.inboxes.create).toHaveBeenCalledWith({
        username: undefined,
        domain: undefined,
        display_name: 'New Inbox',
        client_id: undefined
      });
      expect(result).toEqual({
        id: 'inbox-new',
        name: 'New Inbox',
        address: 'New Inbox',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      });
    });
  });

  describe('getMessages', () => {
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

    it('should fetch messages with default parameters', async () => {
      const mockSDKResponse = {
        messages: [
          {
            message_id: 'msg-1',
            inbox_id: 'inbox-1',
            from: 'sender@example.com',
            to: 'recipient@example.com',
            subject: 'Test Message',
            timestamp: '2023-01-01T00:00:00Z',
          }
        ]
      };

      mockSDKInstance.inboxes.messages.list.mockResolvedValueOnce(mockSDKResponse);

      const result = await client.getMessages('inbox-1');

      expect(mockSDKInstance.inboxes.messages.list).toHaveBeenCalledWith('inbox-1', {});
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('msg-1');
      expect(result[0].subject).toBe('Test Message');
    });

    it('should fetch messages with pagination parameters', async () => {
      const mockSDKResponse = {
        messages: [
          {
            message_id: 'msg-1',
            inbox_id: 'inbox-1',
            from: 'sender@example.com',
            to: 'recipient@example.com',
            subject: 'Test Message',
            timestamp: '2023-01-01T00:00:00Z',
          }
        ]
      };

      mockSDKInstance.inboxes.messages.list.mockResolvedValueOnce(mockSDKResponse);

      const result = await client.getMessages('inbox-1', 10, 5);

      expect(mockSDKInstance.inboxes.messages.list).toHaveBeenCalledWith('inbox-1', {
        limit: 10,
        offset: 5
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getMessage', () => {
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

    it('should fetch specific message', async () => {
      const mockSDKResponse = {
        message_id: 'msg-1',
        inbox_id: 'inbox-1',
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Message',
        text: 'Hello, world!',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockSDKInstance.inboxes.messages.get.mockResolvedValueOnce(mockSDKResponse);

      const result = await client.getMessage('inbox-1', 'msg-1');

      expect(mockSDKInstance.inboxes.messages.get).toHaveBeenCalledWith('inbox-1', 'msg-1');
      expect(result.id).toBe('msg-1');
      expect(result.subject).toBe('Test Message');
      expect(result.text).toBe('Hello, world!');
    });
  });

  describe('sendMessage', () => {
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

    it('should send message with single recipient', async () => {
      const mockSDKResponse = {
        message_id: 'msg-sent',
        thread_id: 'thread-1'
      };

      mockSDKInstance.inboxes.messages.send.mockResolvedValueOnce(mockSDKResponse);

      const result = await client.sendMessage({
        inbox_id: 'inbox-1',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test message body',
      });

      expect(mockSDKInstance.inboxes.messages.send).toHaveBeenCalledWith('inbox-1', {
        to: ['recipient@example.com'],
        subject: 'Test Subject',
        text: 'Test message body',
        cc: undefined,
        bcc: undefined,
      });
      expect(result.id).toBe('msg-sent');
      expect(result.subject).toBe('Test Subject');
    });

    it('should send message with multiple recipients', async () => {
      const mockSDKResponse = {
        message_id: 'msg-sent',
        thread_id: 'thread-1'
      };

      mockSDKInstance.inboxes.messages.send.mockResolvedValueOnce(mockSDKResponse);

      const result = await client.sendMessage({
        inbox_id: 'inbox-1',
        to: ['recipient1@example.com', 'recipient2@example.com'],
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>',
        cc: 'cc@example.com',
        bcc: ['bcc1@example.com', 'bcc2@example.com'],
      });

      expect(mockSDKInstance.inboxes.messages.send).toHaveBeenCalledWith('inbox-1', {
        to: ['recipient1@example.com', 'recipient2@example.com'],
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>',
        cc: ['cc@example.com'],
        bcc: ['bcc1@example.com', 'bcc2@example.com'],
      });
      expect(result.id).toBe('msg-sent');
    });
  });

  describe('error handling', () => {
    it('should handle SDK errors', async () => {
      const error = new Error('SDK error');
      mockSDKInstance.inboxes.list.mockRejectedValueOnce(error);

      await expect(client.listInboxes()).rejects.toThrow('SDK error');
    });

    it('should handle API errors from SDK', async () => {
      const apiError = new Error('AgentMail API Error');
      mockSDKInstance.inboxes.get.mockRejectedValueOnce(apiError);

      await expect(client.getInbox('invalid-id')).rejects.toThrow('AgentMail API Error');
    });
  });
});