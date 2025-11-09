/**
 * Gamma API Error Classes
 *
 * Comprehensive error types for Gamma AI API interactions
 */

/**
 * Base error class for all Gamma API errors
 * @extends Error
 */
export class GammaAPIError extends Error {
  constructor(message, code, statusCode, details = {}) {
    super(message);
    this.name = 'GammaAPIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

/**
 * Authentication errors (401, 403)
 */
export class GammaAuthenticationError extends GammaAPIError {
  constructor(message, details = {}) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
    this.name = 'GammaAuthenticationError';
  }
}

/**
 * Rate limit errors (429)
 */
export class GammaRateLimitError extends GammaAPIError {
  constructor(message, retryAfter = null, details = {}) {
    super(message, 'RATE_LIMIT_ERROR', 429, details);
    this.name = 'GammaRateLimitError';
    this.retryAfter = retryAfter; // Seconds to wait before retrying
  }
}

/**
 * Not found errors (404)
 */
export class GammaNotFoundError extends GammaAPIError {
  constructor(resource, resourceId, details = {}) {
    super(`${resource} not found: ${resourceId}`, 'NOT_FOUND', 404, details);
    this.name = 'GammaNotFoundError';
    this.resource = resource;
    this.resourceId = resourceId;
  }
}

/**
 * Validation errors (400)
 */
export class GammaValidationError extends GammaAPIError {
  constructor(message, validationErrors = [], details = {}) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'GammaValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Server errors (500, 502, 503, 504)
 */
export class GammaServerError extends GammaAPIError {
  constructor(message, statusCode = 500, details = {}) {
    super(message, 'SERVER_ERROR', statusCode, details);
    this.name = 'GammaServerError';
  }
}

/**
 * Network errors (timeouts, connection failures)
 */
export class GammaNetworkError extends GammaAPIError {
  constructor(message, originalError, details = {}) {
    super(message, 'NETWORK_ERROR', null, details);
    this.name = 'GammaNetworkError';
    this.originalError = originalError;
  }
}

/**
 * Timeout errors
 */
export class GammaTimeoutError extends GammaAPIError {
  constructor(operation, timeout, details = {}) {
    super(
      `Operation '${operation}' timed out after ${timeout}ms`,
      'TIMEOUT_ERROR',
      null,
      details
    );
    this.name = 'GammaTimeoutError';
    this.operation = operation;
    this.timeout = timeout;
  }
}

/**
 * Content conversion errors
 */
export class GammaConversionError extends GammaAPIError {
  constructor(message, sourceFormat, targetFormat, details = {}) {
    super(message, 'CONVERSION_ERROR', null, details);
    this.name = 'GammaConversionError';
    this.sourceFormat = sourceFormat;
    this.targetFormat = targetFormat;
  }
}

/**
 * Export errors
 */
export class GammaExportError extends GammaAPIError {
  constructor(message, format, details = {}) {
    super(message, 'EXPORT_ERROR', null, details);
    this.name = 'GammaExportError';
    this.format = format;
  }
}

/**
 * Quota exceeded errors
 */
export class GammaQuotaError extends GammaAPIError {
  constructor(message, quotaType, limit, current, details = {}) {
    super(message, 'QUOTA_EXCEEDED', 429, details);
    this.name = 'GammaQuotaError';
    this.quotaType = quotaType; // 'daily', 'monthly', 'concurrent', etc.
    this.limit = limit;
    this.current = current;
  }
}

/**
 * Parse HTTP error and create appropriate error instance
 * @param {Response} response - Fetch Response object
 * @param {Object} errorBody - Parsed error response body
 * @returns {GammaAPIError} Appropriate error instance
 */
export function createErrorFromResponse(response, errorBody = {}) {
  const statusCode = response.status;
  const message = errorBody.message || errorBody.error || response.statusText || 'Unknown error';
  const details = {
    url: response.url,
    method: response.method || 'GET',
    statusCode: statusCode,
    ...errorBody
  };

  switch (statusCode) {
    case 400:
      return new GammaValidationError(
        message,
        errorBody.errors || errorBody.validation_errors || [],
        details
      );

    case 401:
    case 403:
      return new GammaAuthenticationError(message, details);

    case 404:
      return new GammaNotFoundError(
        errorBody.resource || 'Resource',
        errorBody.resource_id || 'unknown',
        details
      );

    case 429:
      const retryAfter = response.headers?.get('Retry-After');
      if (errorBody.quota_exceeded) {
        return new GammaQuotaError(
          message,
          errorBody.quota_type || 'unknown',
          errorBody.limit,
          errorBody.current,
          details
        );
      }
      return new GammaRateLimitError(
        message,
        retryAfter ? parseInt(retryAfter) : null,
        details
      );

    case 500:
    case 502:
    case 503:
    case 504:
      return new GammaServerError(message, statusCode, details);

    default:
      return new GammaAPIError(message, 'UNKNOWN_ERROR', statusCode, details);
  }
}

/**
 * Check if error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} True if error should be retried
 */
export function isRetryableError(error) {
  // Network errors are retryable
  if (error instanceof GammaNetworkError) {
    return true;
  }

  // Rate limit errors are retryable after waiting
  if (error instanceof GammaRateLimitError) {
    return true;
  }

  // Server errors (5xx) are retryable
  if (error instanceof GammaServerError) {
    return error.statusCode >= 500 && error.statusCode < 600;
  }

  // Specific status codes that are retryable
  if (error.statusCode === 408 || error.statusCode === 429) {
    return true;
  }

  return false;
}

/**
 * Calculate retry delay with exponential backoff and jitter
 * @param {number} attempt - Retry attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000)
 * @param {number} maxDelay - Maximum delay in milliseconds (default: 30000)
 * @param {Error} error - The error that triggered the retry
 * @returns {number} Delay in milliseconds
 */
export function calculateRetryDelay(attempt, baseDelay = 1000, maxDelay = 30000, error = null) {
  // If rate limit error with Retry-After header, use that
  if (error instanceof GammaRateLimitError && error.retryAfter) {
    return Math.min(error.retryAfter * 1000, maxDelay);
  }

  // Exponential backoff: delay = baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);

  // Add jitter (random 0-25% of delay)
  const jitter = exponentialDelay * Math.random() * 0.25;

  // Calculate final delay with cap
  const delay = Math.min(exponentialDelay + jitter, maxDelay);

  return Math.round(delay);
}
