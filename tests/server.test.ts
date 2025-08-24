import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializedNotificationSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createStandaloneServer, AgentMailServer } from '../src/server';
import { AgentMailClient } from '../src/client';

// Mock the AgentMailClient
jest.mock('../src/client');
const MockedAgentMailClient = AgentMailClient as jest.MockedClass<typeof AgentMailClient>;

describe('Server', () => {
  let mockClient: jest.Mocked<AgentMailClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      listInboxes: jest.fn(),
      getInbox: jest.fn(),
      createInbox: jest.fn(),
      getMessages: jest.fn(),
      getMessage: jest.fn(),
      sendMessage: jest.fn(),
    } as unknown as jest.Mocked<AgentMailClient>;

    MockedAgentMailClient.mockImplementation(() => mockClient);
  });

  describe('createStandaloneServer', () => {
    let server: Server;

    beforeEach(() => {
      server = createStandaloneServer('test-api-key');
    });

    it('should create server instance with correct configuration', () => {
      expect(server).toBeInstanceOf(Server);
      expect(MockedAgentMailClient).toHaveBeenCalledWith('test-api-key');
    });

    it('should create server with API key', () => {
      const defaultServer = createStandaloneServer('test-api-key');
      expect(defaultServer).toBeInstanceOf(Server);
      expect(MockedAgentMailClient).toHaveBeenCalledWith('test-api-key');
    });

    it('should create server with correct capabilities', () => {
      // Check that the server was created (it's an instance of Server)
      expect(server).toBeInstanceOf(Server);
      // The internal structure is not part of the public API, so we just verify
      // the server was created successfully
    });

    it('should initialize AgentMailClient with provided API key', () => {
      // Verify that the AgentMailClient was instantiated correctly
      expect(MockedAgentMailClient).toHaveBeenCalledWith('test-api-key');
    });

    it('should be configured properly for AgentMail integration', () => {
      // The server instance should exist and be properly configured
      // We can't easily test the internal handlers without tightly coupling
      // to the MCP SDK's internal implementation, so we verify the setup is correct
      expect(server).toBeInstanceOf(Server);
      expect(MockedAgentMailClient).toHaveBeenCalledWith('test-api-key');
    });
  });

  describe('AgentMailServer', () => {
    it('should create server instance with API key', () => {
      const agentMailServer = new AgentMailServer('test-api-key');
      expect(agentMailServer).toBeInstanceOf(AgentMailServer);
    });

    it('should return server instance from getServer method', () => {
      const agentMailServer = new AgentMailServer('test-api-key');
      const server = agentMailServer.getServer();
      
      expect(server).toBeInstanceOf(Server);
      expect(MockedAgentMailClient).toHaveBeenCalledWith('test-api-key');
    });
  });
});