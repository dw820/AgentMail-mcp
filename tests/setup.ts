// Global test setup
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});