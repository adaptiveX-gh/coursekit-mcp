import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Mock Gamma API Server
 *
 * Simulates Gamma AI API responses for testing without making real API calls.
 * Supports success scenarios, error conditions, and retry logic.
 */
export class MockGammaAPI {
  constructor(options = {}) {
    this.mode = options.mode || 'success'; // 'success', 'error', 'retry'
    this.errorType = options.errorType || 'unauthorized'; // 'unauthorized', 'rateLimit', 'serverError', etc.
    this.retryScenario = options.retryScenario || 'firstAttemptFails';
    this.responses = null;
    this.requestCount = 0;
    this.requests = [];
    this.delay = options.delay || 0; // Simulated network delay in ms
  }

  /**
   * Initialize mock API with response fixtures
   */
  async initialize() {
    const fixturesPath = path.join(__dirname, '../fixtures/gamma-responses.json');
    const content = await fs.readFile(fixturesPath, 'utf-8');
    this.responses = JSON.parse(content);
  }

  /**
   * Mock fetch implementation
   */
  async fetch(url, options = {}) {
    this.requestCount++;
    this.requests.push({ url, options, timestamp: Date.now() });

    // Simulate network delay
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    const method = options.method || 'GET';
    const endpoint = this.extractEndpoint(url);

    // Route to appropriate handler
    if (method === 'POST' && endpoint.includes('/content/generate')) {
      return this.mockCreatePresentation(options);
    } else if (method === 'GET' && endpoint.includes('/content/')) {
      return this.mockGetPresentation(endpoint);
    } else if (method === 'POST' && endpoint.includes('/export')) {
      return this.mockExportPresentation(options);
    } else if (method === 'DELETE' && endpoint.includes('/content/')) {
      return this.mockDeletePresentation();
    } else if (method === 'GET' && endpoint.includes('/templates')) {
      return this.mockListTemplates();
    }

    console.error(`MockGammaAPI: Unhandled endpoint ${method} ${endpoint}`);
    return this.mockResponse(404, { error: { code: 'NOT_FOUND', message: `Endpoint not found: ${endpoint}` } });
  }

  /**
   * Extract endpoint from full URL
   */
  extractEndpoint(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      // If URL parsing fails, treat as relative path
      return url;
    }
  }

  /**
   * Mock create presentation
   */
  async mockCreatePresentation(options) {
    if (this.mode === 'error') {
      return this.mockErrorResponse();
    }

    if (this.mode === 'retry') {
      return this.mockRetryResponse();
    }

    // Success mode
    const response = this.responses.success.create;
    return this.mockResponse(200, response);
  }

  /**
   * Mock get presentation
   */
  async mockGetPresentation(endpoint) {
    if (this.mode === 'error' && this.errorType === 'notFound') {
      return this.mockResponse(404, this.responses.errors.notFound.error);
    }

    // For completion polling, alternate between processing and completed
    if (this.requestCount % 3 === 0) {
      // Third call returns completed
      return this.mockResponse(200, this.responses.success.getPresentation.completed);
    } else {
      // Earlier calls return processing
      return this.mockResponse(200, this.responses.success.getPresentation.processing);
    }
  }

  /**
   * Mock export presentation
   */
  async mockExportPresentation(options) {
    const body = JSON.parse(options.body || '{}');
    const format = body.format || 'pdf';

    if (this.mode === 'error' && this.errorType === 'invalidFormat') {
      return this.mockResponse(400, this.responses.errors.invalidFormat.error);
    }

    const exportData = this.responses.success.export[format];
    if (!exportData) {
      return this.mockResponse(400, {
        error: {
          code: 'INVALID_FORMAT',
          message: `Invalid format: ${format}`
        }
      });
    }

    // Return blob-like response
    return this.mockBlobResponse(exportData);
  }

  /**
   * Mock delete presentation
   */
  async mockDeletePresentation() {
    return this.mockResponse(200, { success: true, message: 'Presentation deleted' });
  }

  /**
   * Mock list templates
   */
  async mockListTemplates() {
    return this.mockResponse(200, [
      { id: 'tpl_1', name: 'Modern', category: 'professional' },
      { id: 'tpl_2', name: 'Corporate', category: 'business' },
      { id: 'tpl_3', name: 'Creative', category: 'creative' }
    ]);
  }

  /**
   * Mock error response based on errorType
   */
  mockErrorResponse() {
    const errorConfig = this.responses.errors[this.errorType];

    if (!errorConfig) {
      return this.mockResponse(500, {
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Unknown error occurred'
        }
      });
    }

    if (this.errorType === 'rateLimit') {
      return this.mockResponse(
        errorConfig.status,
        errorConfig.error,
        errorConfig.headers
      );
    }

    return this.mockResponse(errorConfig.status, errorConfig.error);
  }

  /**
   * Mock retry response (fail first, then succeed)
   */
  mockRetryResponse() {
    const scenario = this.responses.retry[this.retryScenario];

    if (!scenario || !Array.isArray(scenario)) {
      return this.mockResponse(200, this.responses.success.create);
    }

    // Return responses in sequence based on request count
    const index = Math.min(this.requestCount - 1, scenario.length - 1);
    const responseConfig = scenario[index];

    // Determine HTTP status code (support both 'status' and 'httpStatus' fields)
    const httpStatus = responseConfig.httpStatus || responseConfig.status;

    // If response has an error field, it's an error response
    if (responseConfig.error) {
      return this.mockResponse(httpStatus, responseConfig.error);
    }

    // Otherwise it's a success response - remove httpStatus from response body
    const { httpStatus: _, ...responseBody } = responseConfig;
    return this.mockResponse(httpStatus, responseBody);
  }

  /**
   * Create mock Response object
   */
  mockResponse(status, data, headers = {}) {
    const isOk = status >= 200 && status < 300;

    // Create headers Map with get method
    const headersMap = new Map(Object.entries({
      'content-type': 'application/json',
      ...headers
    }));

    return {
      ok: isOk,
      status,
      statusText: this.getStatusText(status),
      headers: {
        get: (key) => headersMap.get(key) || headersMap.get(key.toLowerCase()),
        has: (key) => headersMap.has(key) || headersMap.has(key.toLowerCase()),
        entries: () => headersMap.entries(),
        keys: () => headersMap.keys(),
        values: () => headersMap.values()
      },
      async json() {
        return data;
      },
      async text() {
        return JSON.stringify(data);
      },
      async blob() {
        return new Blob([JSON.stringify(data)]);
      }
    };
  }

  /**
   * Create mock Blob response
   */
  mockBlobResponse(data) {
    const headersMap = new Map(Object.entries({
      'content-type': 'application/octet-stream'
    }));

    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {
        get: (key) => headersMap.get(key) || headersMap.get(key.toLowerCase()),
        has: (key) => headersMap.has(key) || headersMap.has(key.toLowerCase()),
        entries: () => headersMap.entries(),
        keys: () => headersMap.keys(),
        values: () => headersMap.values()
      },
      async json() {
        throw new Error('Cannot parse blob as JSON');
      },
      async text() {
        return data;
      },
      async blob() {
        return new Blob([data]);
      }
    };
  }

  /**
   * Get HTTP status text
   */
  getStatusText(status) {
    const statusTexts = {
      200: 'OK',
      400: 'Bad Request',
      401: 'Unauthorized',
      404: 'Not Found',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      503: 'Service Unavailable'
    };

    return statusTexts[status] || 'Unknown';
  }

  /**
   * Reset mock state
   */
  reset() {
    this.requestCount = 0;
    this.requests = [];
  }

  /**
   * Get request history
   */
  getRequestHistory() {
    return [...this.requests];
  }

  /**
   * Set mode for next request
   */
  setMode(mode, options = {}) {
    this.mode = mode;
    if (options.errorType) this.errorType = options.errorType;
    if (options.retryScenario) this.retryScenario = options.retryScenario;
  }
}

/**
 * Create global fetch mock
 */
export function createFetchMock(mockAPI) {
  return async (url, options) => {
    return await mockAPI.fetch(url, options);
  };
}
