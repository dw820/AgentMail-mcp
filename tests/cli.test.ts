import { parseArgs } from '../src/cli';

describe('CLI', () => {
  const originalArgv = process.argv;
  const originalConsoleLog = console.log;
  const originalProcessExit = process.exit;

  let mockConsoleLog: jest.Mock;
  let mockProcessExit: jest.MockedFunction<typeof process.exit>;

  beforeEach(() => {
    mockConsoleLog = jest.fn();
    mockProcessExit = jest.fn() as any;

    console.log = mockConsoleLog;
    process.exit = mockProcessExit;
  });

  afterEach(() => {
    process.argv = originalArgv;
    console.log = originalConsoleLog;
    process.exit = originalProcessExit;
  });

  describe('parseArgs', () => {
    it('should parse no arguments and return empty options', () => {
      process.argv = ['node', 'index.js'];

      const options = parseArgs();

      expect(options).toEqual({});
    });

    it('should parse --port flag with value', () => {
      process.argv = ['node', 'index.js', '--port', '3000'];

      const options = parseArgs();

      expect(options).toEqual({ port: 3000 });
    });

    it('should parse --stdio flag', () => {
      process.argv = ['node', 'index.js', '--stdio'];

      const options = parseArgs();

      expect(options).toEqual({ stdio: true });
    });

    it('should parse both --port and --stdio flags', () => {
      process.argv = ['node', 'index.js', '--port', '5000', '--stdio'];

      const options = parseArgs();

      expect(options).toEqual({ port: 5000, stdio: true });
    });

    it('should parse flags in different order', () => {
      process.argv = ['node', 'index.js', '--stdio', '--port', '4000'];

      const options = parseArgs();

      expect(options).toEqual({ port: 4000, stdio: true });
    });

    it('should throw error for --port without value', () => {
      process.argv = ['node', 'index.js', '--port'];

      expect(() => parseArgs()).toThrow('--port flag requires a value');
    });

    it('should throw error for --port at end of arguments', () => {
      process.argv = ['node', 'index.js', '--stdio', '--port'];

      expect(() => parseArgs()).toThrow('--port flag requires a value');
    });

    it('should handle --help flag and exit', () => {
      process.argv = ['node', 'index.js', '--help'];

      parseArgs();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('AgentMail MCP Server')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('USAGE:')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('OPTIONS:')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('ENVIRONMENT VARIABLES:')
      );
      expect(mockProcessExit).toHaveBeenCalledWith(0);
    });

    it('should handle unknown flags gracefully', () => {
      process.argv = ['node', 'index.js', '--unknown-flag'];

      const options = parseArgs();

      expect(options).toEqual({});
    });

    it('should handle multiple unknown flags', () => {
      process.argv = ['node', 'index.js', '--unknown1', '--unknown2', 'value'];

      const options = parseArgs();

      expect(options).toEqual({});
    });

    it('should parse valid port numbers', () => {
      process.argv = ['node', 'index.js', '--port', '8080'];

      const options = parseArgs();

      expect(options.port).toBe(8080);
    });

    it('should parse port as NaN for invalid numbers', () => {
      process.argv = ['node', 'index.js', '--port', 'not-a-number'];

      const options = parseArgs();

      expect(options.port).toBeNaN();
    });

    it('should parse zero port', () => {
      process.argv = ['node', 'index.js', '--port', '0'];

      const options = parseArgs();

      expect(options.port).toBe(0);
    });

    it('should parse negative port', () => {
      process.argv = ['node', 'index.js', '--port', '-1'];

      const options = parseArgs();

      expect(options.port).toBe(-1);
    });

    it('should handle mixed valid and invalid arguments', () => {
      process.argv = ['node', 'index.js', '--stdio', '--unknown', '--port', '9000'];

      const options = parseArgs();

      expect(options).toEqual({ stdio: true, port: 9000 });
    });

    it('should handle help message content', () => {
      process.argv = ['node', 'index.js', '--help'];

      parseArgs();

      const helpMessage = mockConsoleLog.mock.calls[0][0];
      expect(helpMessage).toContain('agentmail-mcp [OPTIONS]');
      expect(helpMessage).toContain('--port <PORT>');
      expect(helpMessage).toContain('--stdio');
      expect(helpMessage).toContain('--help');
      expect(helpMessage).toContain('AGENTMAIL_API_KEY');
      expect(helpMessage).toContain('PORT');
      expect(helpMessage).toContain('NODE_ENV');
    });
  });
});