import { loadConfig } from '../src/config';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    it('should load configuration with required API key', () => {
      process.env.AGENTMAIL_API_KEY = 'test-api-key';

      const config = loadConfig();

      expect(config).toEqual({
        apiKey: 'test-api-key',
        port: 8080,
        isProduction: false,
      });
    });

    it('should load configuration with custom port', () => {
      process.env.AGENTMAIL_API_KEY = 'test-api-key';
      process.env.PORT = '3000';

      const config = loadConfig();

      expect(config.port).toBe(3000);
    });

    it('should load configuration with production environment', () => {
      process.env.AGENTMAIL_API_KEY = 'test-api-key';
      process.env.NODE_ENV = 'production';

      const config = loadConfig();

      expect(config.isProduction).toBe(true);
    });

    it('should load configuration with all custom values', () => {
      process.env.AGENTMAIL_API_KEY = 'custom-api-key';
      process.env.PORT = '5000';
      process.env.NODE_ENV = 'production';

      const config = loadConfig();

      expect(config).toEqual({
        apiKey: 'custom-api-key',
        port: 5000,
        isProduction: true,
      });
    });

    it('should throw error when API key is missing', () => {
      delete process.env.AGENTMAIL_API_KEY;

      expect(() => loadConfig()).toThrow(
        'AGENTMAIL_API_KEY environment variable is required'
      );
    });

    it('should throw error when API key is empty string', () => {
      process.env.AGENTMAIL_API_KEY = '';

      expect(() => loadConfig()).toThrow(
        'AGENTMAIL_API_KEY environment variable is required'
      );
    });

    it('should handle invalid port gracefully', () => {
      process.env.AGENTMAIL_API_KEY = 'test-api-key';
      process.env.PORT = 'invalid-port';

      const config = loadConfig();

      expect(config.port).toBeNaN();
    });

    it('should handle zero port', () => {
      process.env.AGENTMAIL_API_KEY = 'test-api-key';
      process.env.PORT = '0';

      const config = loadConfig();

      expect(config.port).toBe(0);
    });

    it('should handle negative port', () => {
      process.env.AGENTMAIL_API_KEY = 'test-api-key';
      process.env.PORT = '-1';

      const config = loadConfig();

      expect(config.port).toBe(-1);
    });

    it('should recognize development environment as non-production', () => {
      process.env.AGENTMAIL_API_KEY = 'test-api-key';
      process.env.NODE_ENV = 'development';

      const config = loadConfig();

      expect(config.isProduction).toBe(false);
    });

    it('should recognize test environment as non-production', () => {
      process.env.AGENTMAIL_API_KEY = 'test-api-key';
      process.env.NODE_ENV = 'test';

      const config = loadConfig();

      expect(config.isProduction).toBe(false);
    });
  });
});