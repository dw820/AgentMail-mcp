import { AgentMailClient } from '../../src/client';
import {
  handleListInboxesTool,
  handleGetInboxTool,
  handleCreateInboxTool,
} from '../../src/tools/inbox';
import { AgentMailInbox } from '../../src/types';

describe('Inbox Tools', () => {
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

  describe('handleListInboxesTool', () => {
    const mockInboxes: AgentMailInbox[] = [
      {
        id: 'inbox-1',
        name: 'Test Inbox',
        address: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ];

    it('should return list of inboxes successfully', async () => {
      mockClient.listInboxes.mockResolvedValueOnce(mockInboxes);

      const result = await handleListInboxesTool(mockClient, {});

      expect(mockClient.listInboxes).toHaveBeenCalledWith();
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockInboxes, null, 2) }],
        isError: false,
      });
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('API Error');
      mockClient.listInboxes.mockRejectedValueOnce(error);

      const result = await handleListInboxesTool(mockClient, {});

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: API Error' }],
        isError: true,
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockClient.listInboxes.mockRejectedValueOnce('String error');

      const result = await handleListInboxesTool(mockClient, {});

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: String error' }],
        isError: true,
      });
    });
  });

  describe('handleGetInboxTool', () => {
    const mockInbox: AgentMailInbox = {
      id: 'inbox-1',
      name: 'Test Inbox',
      address: 'test@example.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    it('should return specific inbox successfully', async () => {
      mockClient.getInbox.mockResolvedValueOnce(mockInbox);

      const result = await handleGetInboxTool(mockClient, { inbox_id: 'inbox-1' });

      expect(mockClient.getInbox).toHaveBeenCalledWith('inbox-1');
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockInbox, null, 2) }],
        isError: false,
      });
    });

    it('should handle missing arguments', async () => {
      const result = await handleGetInboxTool(mockClient, null);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: No arguments provided' }],
        isError: true,
      });
    });

    it('should handle invalid arguments', async () => {
      const result = await handleGetInboxTool(mockClient, { invalid: 'arg' });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_get_inbox' }],
        isError: true,
      });
    });

    it('should handle missing inbox_id', async () => {
      const result = await handleGetInboxTool(mockClient, {});

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_get_inbox' }],
        isError: true,
      });
    });

    it('should handle non-string inbox_id', async () => {
      const result = await handleGetInboxTool(mockClient, { inbox_id: 123 });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_get_inbox' }],
        isError: true,
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('Inbox not found');
      mockClient.getInbox.mockRejectedValueOnce(error);

      const result = await handleGetInboxTool(mockClient, { inbox_id: 'invalid-id' });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Inbox not found' }],
        isError: true,
      });
    });
  });

  describe('handleCreateInboxTool', () => {
    const mockInbox: AgentMailInbox = {
      id: 'inbox-new',
      name: 'New Inbox',
      address: 'new@example.com',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    it('should create inbox successfully', async () => {
      mockClient.createInbox.mockResolvedValueOnce(mockInbox);

      const result = await handleCreateInboxTool(mockClient, { name: 'New Inbox' });

      expect(mockClient.createInbox).toHaveBeenCalledWith({ name: 'New Inbox' });
      expect(result).toEqual({
        content: [{ type: 'text', text: JSON.stringify(mockInbox, null, 2) }],
        isError: false,
      });
    });

    it('should handle missing arguments', async () => {
      const result = await handleCreateInboxTool(mockClient, null);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: No arguments provided' }],
        isError: true,
      });
    });

    it('should handle invalid arguments', async () => {
      const result = await handleCreateInboxTool(mockClient, { invalid: 'arg' });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_create_inbox' }],
        isError: true,
      });
    });

    it('should handle missing name', async () => {
      const result = await handleCreateInboxTool(mockClient, {});

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_create_inbox' }],
        isError: true,
      });
    });

    it('should handle non-string name', async () => {
      const result = await handleCreateInboxTool(mockClient, { name: 123 });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Invalid arguments for agentmail_create_inbox' }],
        isError: true,
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('Cannot create inbox');
      mockClient.createInbox.mockRejectedValueOnce(error);

      const result = await handleCreateInboxTool(mockClient, { name: 'Test' });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Cannot create inbox' }],
        isError: true,
      });
    });
  });
});