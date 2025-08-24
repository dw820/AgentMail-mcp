import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { runStdioTransport } from '../src/transport/stdio';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// Mock the dependencies
jest.mock('@modelcontextprotocol/sdk/server/stdio.js');
const MockedStdioServerTransport = StdioServerTransport as jest.MockedClass<typeof StdioServerTransport>;

describe('Transport', () => {
  describe('runStdioTransport', () => {
    let mockServer: jest.Mocked<Server>;
    let mockTransport: jest.Mocked<StdioServerTransport>;
    let mockConsoleError: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      
      mockServer = {
        connect: jest.fn(),
      } as any;

      mockTransport = {
        connect: jest.fn(),
      } as any;

      MockedStdioServerTransport.mockImplementation(() => mockTransport);

      mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      mockConsoleError.mockRestore();
    });

    it('should create STDIO transport and connect server successfully', async () => {
      mockServer.connect.mockResolvedValueOnce(undefined);

      await runStdioTransport(mockServer);

      expect(MockedStdioServerTransport).toHaveBeenCalledWith();
      expect(mockServer.connect).toHaveBeenCalledWith(mockTransport);
      expect(mockConsoleError).toHaveBeenCalledWith('AgentMail MCP Server running on stdio');
    });

    it('should handle connection errors and rethrow', async () => {
      const connectionError = new Error('Connection failed');
      mockServer.connect.mockRejectedValueOnce(connectionError);

      await expect(runStdioTransport(mockServer)).rejects.toThrow('Connection failed');

      expect(MockedStdioServerTransport).toHaveBeenCalledWith();
      expect(mockServer.connect).toHaveBeenCalledWith(mockTransport);
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to start STDIO transport:', connectionError);
    });

    it('should handle non-Error exceptions', async () => {
      const stringError = 'String error';
      mockServer.connect.mockRejectedValueOnce(stringError);

      await expect(runStdioTransport(mockServer)).rejects.toBe(stringError);

      expect(mockConsoleError).toHaveBeenCalledWith('Failed to start STDIO transport:', stringError);
    });

    it('should create new transport instance each time', async () => {
      mockServer.connect.mockResolvedValue(undefined);

      await runStdioTransport(mockServer);
      await runStdioTransport(mockServer);

      expect(MockedStdioServerTransport).toHaveBeenCalledTimes(2);
      expect(mockServer.connect).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple servers independently', async () => {
      const mockServer2 = {
        connect: jest.fn().mockResolvedValue(undefined),
      } as any;

      mockServer.connect.mockResolvedValueOnce(undefined);

      await Promise.all([
        runStdioTransport(mockServer),
        runStdioTransport(mockServer2),
      ]);

      expect(MockedStdioServerTransport).toHaveBeenCalledTimes(2);
      expect(mockServer.connect).toHaveBeenCalledTimes(1);
      expect(mockServer2.connect).toHaveBeenCalledTimes(1);
    });
  });
});