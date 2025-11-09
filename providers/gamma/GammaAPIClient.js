import {
  GammaAPIError,
  GammaAuthenticationError,
  GammaNetworkError,
  GammaTimeoutError,
  createErrorFromResponse,
  isRetryableError,
  calculateRetryDelay
} from './GammaErrors.js';

/**
 * Gamma AI API Client
 *
 * Interfaces with the Gamma AI API for presentation generation.
 * Includes authentication, request handling, content conversion, and error management.
 *
 * @example
 * const client = new GammaAPIClient(apiKey);
 * const presentation = await client.createPresentation({
 *   title: 'My Presentation',
 *   prompt: 'Create a slide about AI',
 *   context: { ... }
 * });
 */
export class GammaAPIClient {
  /**
   * Create a new Gamma API client
   * @param {string} apiKey - Gamma API key
   * @param {Object} options - Client options
   * @param {string} options.baseUrl - API base URL
   * @param {number} options.timeout - Request timeout in ms
   * @param {number} options.maxRetries - Maximum retry attempts
   * @param {boolean} options.logging - Enable request/response logging
   */
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new GammaAuthenticationError('API key is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || 'https://api.gamma.app/v1';
    this.timeout = options.timeout || 60000; // 60 seconds
    this.maxRetries = options.maxRetries || 3;
    this.logging = options.logging !== undefined ? options.logging : false;

    // Rate limiting tracking
    this.rateLimitRemaining = null;
    this.rateLimitReset = null;

    // Request counter for logging
    this.requestCount = 0;
  }

  /**
   * Get authorization headers
   * @private
   * @returns {Object} Headers object
   */
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'CourseKit-MCP/0.2.0'
    };
  }

  /**
   * Make HTTP request with retry logic and error handling
   * @private
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async request(method, endpoint, data = null, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = ++this.requestCount;

    const requestOptions = {
      method,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      },
      signal: AbortSignal.timeout(this.timeout)
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(data);
    }

    let lastError = null;
    const maxAttempts = this.maxRetries + 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        if (this.logging) {
          this.log('REQUEST', requestId, method, endpoint, {
            attempt: attempt + 1,
            maxAttempts,
            ...this.sanitizeForLog(data)
          });
        }

        const response = await fetch(url, requestOptions);

        // Update rate limit info from headers
        this.updateRateLimitInfo(response);

        // Handle successful responses
        if (response.ok) {
          const responseData = await this.parseResponse(response);

          if (this.logging) {
            this.log('RESPONSE', requestId, method, endpoint, {
              status: response.status,
              ...this.sanitizeForLog(responseData)
            });
          }

          return responseData;
        }

        // Handle error responses
        const errorBody = await this.parseErrorResponse(response);
        const error = createErrorFromResponse(response, errorBody);

        if (this.logging) {
          this.log('ERROR', requestId, method, endpoint, {
            status: response.status,
            error: error.message,
            retryable: isRetryableError(error)
          });
        }

        // If not retryable or last attempt, throw immediately
        if (!isRetryableError(error) || attempt === maxAttempts - 1) {
          throw error;
        }

        lastError = error;

        // Calculate delay and wait before retry
        const delay = calculateRetryDelay(attempt, 1000, 30000, error);

        if (this.logging) {
          this.log('RETRY', requestId, method, endpoint, {
            attempt: attempt + 1,
            delay,
            reason: error.message
          });
        }

        await this.sleep(delay);

      } catch (error) {
        // Handle network/timeout errors
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          const timeoutError = new GammaTimeoutError(
            `${method} ${endpoint}`,
            this.timeout,
            { attempt: attempt + 1 }
          );

          if (attempt === maxAttempts - 1) {
            throw timeoutError;
          }

          lastError = timeoutError;
          const delay = calculateRetryDelay(attempt);
          await this.sleep(delay);
          continue;
        }

        // Network errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          const networkError = new GammaNetworkError(
            `Network error: ${error.message}`,
            error
          );

          if (attempt === maxAttempts - 1) {
            throw networkError;
          }

          lastError = networkError;
          const delay = calculateRetryDelay(attempt);
          await this.sleep(delay);
          continue;
        }

        // Other errors - re-throw immediately if not our custom errors
        if (!(error instanceof GammaAPIError)) {
          throw error;
        }

        // Custom errors - retry if retryable
        if (!isRetryableError(error) || attempt === maxAttempts - 1) {
          throw error;
        }

        lastError = error;
        const delay = calculateRetryDelay(attempt, 1000, 30000, error);
        await this.sleep(delay);
      }
    }

    // Should never reach here, but throw last error if we do
    throw lastError || new GammaAPIError('Request failed after all retries', 'MAX_RETRIES_EXCEEDED');
  }

  /**
   * Parse successful response
   * @private
   */
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // For non-JSON responses (like exports), return the blob
    return await response.blob();
  }

  /**
   * Parse error response
   * @private
   */
  async parseErrorResponse(response) {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return { message: await response.text() };
    } catch (error) {
      return { message: response.statusText };
    }
  }

  /**
   * Update rate limit information from response headers
   * @private
   */
  updateRateLimitInfo(response) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (remaining) this.rateLimitRemaining = parseInt(remaining);
    if (reset) this.rateLimitReset = parseInt(reset);
  }

  /**
   * Sleep for specified milliseconds
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log request/response (sanitized)
   * @private
   */
  log(type, requestId, method, endpoint, data) {
    const timestamp = new Date().toISOString();
    console.error(`[Gamma ${type}] [${requestId}] ${timestamp} ${method} ${endpoint}`, data);
  }

  /**
   * Sanitize data for logging (remove sensitive information)
   * @private
   */
  sanitizeForLog(data) {
    if (!data) return {};

    const sanitized = { ...data };

    // Remove sensitive fields
    const sensitiveFields = ['apiKey', 'token', 'password', 'secret', 'authorization'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  // ========================================================================
  // CORE API METHODS
  // ========================================================================

  /**
   * Create a new presentation
   * @param {Object} params - Presentation parameters
   * @param {string} params.title - Presentation title
   * @param {string} params.prompt - Generation prompt
   * @param {Object} params.context - Additional context
   * @param {Object} params.options - Generation options
   * @returns {Promise<Object>} Created presentation
   *
   * @example
   * const presentation = await client.createPresentation({
   *   title: 'Business Agility 101',
   *   prompt: 'Create a 10-slide presentation about business agility',
   *   context: { audience: 'beginners', duration: '2 hours' },
   *   options: { style: 'professional', maxSlides: 10 }
   * });
   */
  async createPresentation({ title, prompt, context = {}, options = {} }) {
    if (!title) {
      throw new GammaAPIError('Title is required', 'INVALID_PARAMETERS');
    }
    if (!prompt) {
      throw new GammaAPIError('Prompt is required', 'INVALID_PARAMETERS');
    }

    const requestData = {
      title,
      prompt,
      context,
      ...options
    };

    return await this.request('POST', '/content/generate', requestData);
  }

  /**
   * Get presentation by ID
   * @param {string} presentationId - Presentation ID
   * @returns {Promise<Object>} Presentation data
   */
  async getPresentation(presentationId) {
    if (!presentationId) {
      throw new GammaAPIError('Presentation ID is required', 'INVALID_PARAMETERS');
    }

    return await this.request('GET', `/content/${presentationId}`);
  }

  /**
   * Wait for presentation generation to complete
   * @param {string} presentationId - Presentation ID
   * @param {number} maxWaitTime - Maximum wait time in ms (default: 5 minutes)
   * @param {number} pollInterval - Polling interval in ms (default: 2 seconds)
   * @returns {Promise<Object>} Completed presentation
   */
  async waitForCompletion(presentationId, maxWaitTime = 300000, pollInterval = 2000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const presentation = await this.getPresentation(presentationId);

      // Check status
      if (presentation.status === 'completed' || presentation.status === 'ready') {
        return presentation;
      }

      if (presentation.status === 'failed' || presentation.status === 'error') {
        throw new GammaAPIError(
          `Presentation generation failed: ${presentation.error || 'Unknown error'}`,
          'GENERATION_FAILED'
        );
      }

      // Wait before next poll
      await this.sleep(pollInterval);
    }

    throw new GammaTimeoutError(
      'waitForCompletion',
      maxWaitTime,
      { presentationId }
    );
  }

  /**
   * Export presentation to specified format
   * @param {string} presentationId - Presentation ID
   * @param {string} format - Export format ('pdf', 'pptx', 'html')
   * @returns {Promise<Blob>} Exported content
   */
  async exportPresentation(presentationId, format = 'pdf') {
    if (!presentationId) {
      throw new GammaAPIError('Presentation ID is required', 'INVALID_PARAMETERS');
    }

    const validFormats = ['pdf', 'pptx', 'html'];
    if (!validFormats.includes(format)) {
      throw new GammaAPIError(
        `Invalid format: ${format}. Valid formats: ${validFormats.join(', ')}`,
        'INVALID_FORMAT'
      );
    }

    return await this.request('POST', `/content/${presentationId}/export`, { format });
  }

  /**
   * List available templates
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of templates
   */
  async listTemplates(filters = {}) {
    return await this.request('GET', '/templates', null, {
      headers: filters
    });
  }

  /**
   * Delete a presentation
   * @param {string} presentationId - Presentation ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deletePresentation(presentationId) {
    if (!presentationId) {
      throw new GammaAPIError('Presentation ID is required', 'INVALID_PARAMETERS');
    }

    return await this.request('DELETE', `/content/${presentationId}`);
  }

  /**
   * Get current rate limit status
   * @returns {Object} Rate limit info
   */
  getRateLimitStatus() {
    return {
      remaining: this.rateLimitRemaining,
      resetAt: this.rateLimitReset ? new Date(this.rateLimitReset * 1000) : null,
      resetIn: this.rateLimitReset ? Math.max(0, this.rateLimitReset - Date.now() / 1000) : null
    };
  }
}
