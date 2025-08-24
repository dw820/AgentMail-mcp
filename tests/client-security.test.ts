import { AgentMailClient } from '../src/client';

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

describe('AgentMailClient Security Tests', () => {
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

  describe('Input Validation', () => {
    it('should reject empty inbox ID in getInbox', async () => {
      await expect(client.getInbox('')).rejects.toThrow('Invalid inbox ID: must be a non-empty string');
      await expect(client.getInbox('   ')).rejects.toThrow('Invalid inbox ID: must be a non-empty string');
    });

    it('should reject non-string inbox ID in getInbox', async () => {
      await expect(client.getInbox(null as any)).rejects.toThrow('Invalid inbox ID: must be a non-empty string');
      await expect(client.getInbox(undefined as any)).rejects.toThrow('Invalid inbox ID: must be a non-empty string');
      await expect(client.getInbox(123 as any)).rejects.toThrow('Invalid inbox ID: must be a non-empty string');
    });

    it('should validate pagination parameters in getMessages', async () => {
      await expect(client.getMessages('inbox-1', -1)).rejects.toThrow('Invalid limit: must be a non-negative integer');
      await expect(client.getMessages('inbox-1', 1.5)).rejects.toThrow('Invalid limit: must be a non-negative integer');
      await expect(client.getMessages('inbox-1', 10, -5)).rejects.toThrow('Invalid offset: must be a non-negative integer');
    });

    it('should validate email format in sendMessage', async () => {
      await expect(client.sendMessage({
        inbox_id: 'inbox-1',
        to: 'invalid-email',
        subject: 'Test'
      })).rejects.toThrow('Invalid email format in "to" field');

      await expect(client.sendMessage({
        inbox_id: 'inbox-1',
        to: ['valid@email.com', 'invalid-email'],
        subject: 'Test'
      })).rejects.toThrow('Invalid email format in "to" field');
    });

    it('should validate required fields in sendMessage', async () => {
      await expect(client.sendMessage({
        inbox_id: '',
        to: 'test@example.com',
        subject: 'Test'
      })).rejects.toThrow('Invalid inbox ID: must be a non-empty string');

      await expect(client.sendMessage({
        inbox_id: 'inbox-1',
        to: 'test@example.com',
        subject: ''
      })).rejects.toThrow('Invalid subject: must be a non-empty string');

      await expect(client.sendMessage({
        inbox_id: 'inbox-1',
        to: null as any,
        subject: 'Test'
      })).rejects.toThrow('Recipients (to) field is required');
    });
  });

  describe('URL Encoding', () => {
    it('should handle inbox IDs with special characters (SDK handles encoding)', async () => {
      const specialInboxId = 'inbox with spaces & symbols!@#';

      mockSDKInstance.inboxes.get.mockResolvedValueOnce({
        inbox_id: specialInboxId,
        display_name: 'Test Inbox',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      });

      await client.getInbox(specialInboxId);

      expect(mockSDKInstance.inboxes.get).toHaveBeenCalledWith(specialInboxId);
    });

    it('should handle message IDs with special characters (SDK handles encoding)', async () => {
      const specialInboxId = 'inbox-1';
      const specialMessageId = 'message with spaces & symbols!';

      mockSDKInstance.inboxes.messages.get.mockResolvedValueOnce({
        message_id: specialMessageId,
        inbox_id: specialInboxId,
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      });

      await client.getMessage(specialInboxId, specialMessageId);

      expect(mockSDKInstance.inboxes.messages.get).toHaveBeenCalledWith(specialInboxId, specialMessageId);
    });
  });

  describe('Request Timeout', () => {
    it('should rely on SDK timeout mechanisms', async () => {
      // The AgentMail SDK handles its own timeout mechanisms
      mockSDKInstance.inboxes.list.mockResolvedValueOnce({ inboxes: [] });

      await client.listInboxes();

      expect(mockSDKInstance.inboxes.list).toHaveBeenCalled();
      // SDK is responsible for timeout handling
    });
  });

  describe('Error Information Sanitization', () => {
    it('should propagate SDK errors (SDK handles sanitization)', async () => {
      const sdkError = new Error('AgentMail SDK error');
      mockSDKInstance.inboxes.list.mockRejectedValueOnce(sdkError);

      await expect(client.listInboxes()).rejects.toThrow('AgentMail SDK error');
    });

    it('should handle validation errors from SDK', async () => {
      const validationError = new Error('Validation failed');
      mockSDKInstance.inboxes.messages.send.mockRejectedValueOnce(validationError);

      await expect(client.sendMessage({
        inbox_id: 'inbox-1',
        to: 'test@example.com',
        subject: 'Test'
      })).rejects.toThrow('Validation failed');
    });
  });

  describe('Email Validation', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
      '123@456.com'
    ];

    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user@domain',
      'user space@domain.com',
      'user@domain space.com',
      '',
      '   ',
      'user@@domain.com'
    ];

    validEmails.forEach(email => {
      it(`should accept valid email: ${email}`, async () => {
        mockSDKInstance.inboxes.messages.send.mockResolvedValueOnce({
          message_id: 'msg-1',
          thread_id: 'thread-1'
        });

        await expect(client.sendMessage({
          inbox_id: 'inbox-1',
          to: email,
          subject: 'Test'
        })).resolves.toBeDefined();
      });
    });

    invalidEmails.forEach(email => {
      it(`should reject invalid email: "${email}"`, async () => {
        const expectedError = (email === '' || email === '   ') 
          ? 'Recipients (to) field is required'
          : 'Invalid email format in "to" field';
        
        await expect(client.sendMessage({
          inbox_id: 'inbox-1',
          to: email,
          subject: 'Test'
        })).rejects.toThrow(expectedError);
      });
    });
  });
});