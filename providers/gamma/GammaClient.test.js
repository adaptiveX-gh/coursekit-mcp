import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  GammaAPIError,
  GammaAuthenticationError,
  GammaRateLimitError,
  GammaNotFoundError,
  GammaValidationError,
  GammaServerError,
  GammaNetworkError,
  GammaTimeoutError,
  GammaConversionError,
  GammaExportError,
  GammaQuotaError,
  createErrorFromResponse,
  isRetryableError,
  calculateRetryDelay
} from './GammaErrors.js';

import { GammaAPIClient } from './GammaAPIClient.js';
import { GammaContentConverter } from './GammaContentConverter.js';

// ============================================================================
// TEST: Gamma Errors
// ============================================================================

describe('GammaErrors', () => {
  describe('Error Classes', () => {
    it('should create GammaAPIError with all properties', () => {
      const error = new GammaAPIError('Test error', 'TEST_CODE', 500, { detail: 'test' });

      assert.strictEqual(error.name, 'GammaAPIError');
      assert.strictEqual(error.message, 'Test error');
      assert.strictEqual(error.code, 'TEST_CODE');
      assert.strictEqual(error.statusCode, 500);
      assert.deepStrictEqual(error.details, { detail: 'test' });
      assert.ok(error.timestamp);
      assert.ok(error instanceof Error);
    });

    it('should create GammaAuthenticationError', () => {
      const error = new GammaAuthenticationError('Invalid API key');

      assert.strictEqual(error.name, 'GammaAuthenticationError');
      assert.strictEqual(error.statusCode, 401);
      assert.strictEqual(error.code, 'AUTHENTICATION_ERROR');
    });

    it('should create GammaRateLimitError with retryAfter', () => {
      const error = new GammaRateLimitError('Rate limit exceeded', 60);

      assert.strictEqual(error.name, 'GammaRateLimitError');
      assert.strictEqual(error.statusCode, 429);
      assert.strictEqual(error.retryAfter, 60);
    });

    it('should create GammaNotFoundError', () => {
      const error = new GammaNotFoundError('Presentation', 'pres_123');

      assert.strictEqual(error.name, 'GammaNotFoundError');
      assert.strictEqual(error.statusCode, 404);
      assert.strictEqual(error.resource, 'Presentation');
      assert.strictEqual(error.resourceId, 'pres_123');
    });

    it('should create GammaTimeoutError', () => {
      const error = new GammaTimeoutError('createPresentation', 30000);

      assert.strictEqual(error.name, 'GammaTimeoutError');
      assert.strictEqual(error.operation, 'createPresentation');
      assert.strictEqual(error.timeout, 30000);
    });

    it('should serialize error to JSON', () => {
      const error = new GammaAPIError('Test', 'CODE', 500);
      const json = error.toJSON();

      assert.strictEqual(json.name, 'GammaAPIError');
      assert.strictEqual(json.message, 'Test');
      assert.strictEqual(json.code, 'CODE');
      assert.strictEqual(json.statusCode, 500);
    });
  });

  describe('createErrorFromResponse', () => {
    it('should create ValidationError for 400', () => {
      const response = {
        status: 400,
        statusText: 'Bad Request',
        url: 'https://api.gamma.app/test',
        headers: { get: () => null }
      };
      const errorBody = { message: 'Validation failed', errors: ['Field required'] };

      const error = createErrorFromResponse(response, errorBody);

      assert.ok(error instanceof GammaValidationError);
      assert.strictEqual(error.statusCode, 400);
      assert.deepStrictEqual(error.validationErrors, ['Field required']);
    });

    it('should create AuthenticationError for 401', () => {
      const response = {
        status: 401,
        statusText: 'Unauthorized',
        url: 'https://api.gamma.app/test',
        headers: { get: () => null }
      };
      const errorBody = { message: 'Invalid API key' };

      const error = createErrorFromResponse(response, errorBody);

      assert.ok(error instanceof GammaAuthenticationError);
      assert.strictEqual(error.statusCode, 401);
    });

    it('should create NotFoundError for 404', () => {
      const response = {
        status: 404,
        statusText: 'Not Found',
        url: 'https://api.gamma.app/test',
        headers: { get: () => null }
      };
      const errorBody = { resource: 'Presentation', resource_id: 'pres_123' };

      const error = createErrorFromResponse(response, errorBody);

      assert.ok(error instanceof GammaNotFoundError);
      assert.strictEqual(error.resource, 'Presentation');
    });

    it('should create RateLimitError for 429', () => {
      const response = {
        status: 429,
        statusText: 'Too Many Requests',
        url: 'https://api.gamma.app/test',
        headers: { get: (header) => header === 'Retry-After' ? '60' : null }
      };
      const errorBody = { message: 'Rate limit exceeded' };

      const error = createErrorFromResponse(response, errorBody);

      assert.ok(error instanceof GammaRateLimitError);
      assert.strictEqual(error.retryAfter, 60);
    });

    it('should create QuotaError for 429 with quota_exceeded', () => {
      const response = {
        status: 429,
        statusText: 'Too Many Requests',
        url: 'https://api.gamma.app/test',
        headers: { get: () => null }
      };
      const errorBody = {
        message: 'Daily quota exceeded',
        quota_exceeded: true,
        quota_type: 'daily',
        limit: 5000,
        current: 5000
      };

      const error = createErrorFromResponse(response, errorBody);

      assert.ok(error instanceof GammaQuotaError);
      assert.strictEqual(error.quotaType, 'daily');
      assert.strictEqual(error.limit, 5000);
    });

    it('should create ServerError for 500', () => {
      const response = {
        status: 500,
        statusText: 'Internal Server Error',
        url: 'https://api.gamma.app/test',
        headers: { get: () => null }
      };
      const errorBody = { message: 'Server error' };

      const error = createErrorFromResponse(response, errorBody);

      assert.ok(error instanceof GammaServerError);
      assert.strictEqual(error.statusCode, 500);
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      assert.strictEqual(isRetryableError(new GammaNetworkError('Network error')), true);
      assert.strictEqual(isRetryableError(new GammaRateLimitError('Rate limit')), true);
      assert.strictEqual(isRetryableError(new GammaServerError('Server error', 503)), true);
    });

    it('should identify non-retryable errors', () => {
      assert.strictEqual(isRetryableError(new GammaAuthenticationError('Auth failed')), false);
      assert.strictEqual(isRetryableError(new GammaValidationError('Validation failed')), false);
      assert.strictEqual(isRetryableError(new GammaNotFoundError('Resource', 'id')), false);
    });
  });

  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff', () => {
      const delay0 = calculateRetryDelay(0, 1000, 30000);
      const delay1 = calculateRetryDelay(1, 1000, 30000);
      const delay2 = calculateRetryDelay(2, 1000, 30000);

      // Exponential growth: 1000, 2000, 4000 (plus jitter)
      assert.ok(delay0 >= 1000 && delay0 <= 1250); // 1000 + 25% jitter
      assert.ok(delay1 >= 2000 && delay1 <= 2500);
      assert.ok(delay2 >= 4000 && delay2 <= 5000);
    });

    it('should respect maxDelay cap', () => {
      const delay = calculateRetryDelay(10, 1000, 5000);
      assert.ok(delay <= 5000);
    });

    it('should use Retry-After header for rate limit errors', () => {
      const error = new GammaRateLimitError('Rate limit', 120);
      const delay = calculateRetryDelay(0, 1000, 30000, error);

      // Should use retryAfter * 1000, but capped at maxDelay
      assert.strictEqual(delay, 30000);
    });
  });
});

// ============================================================================
// TEST: Gamma API Client
// ============================================================================

describe('GammaAPIClient', () => {
  describe('Constructor', () => {
    it('should create client with API key', () => {
      const client = new GammaAPIClient('test-api-key');

      assert.strictEqual(client.apiKey, 'test-api-key');
      assert.strictEqual(client.baseUrl, 'https://api.gamma.app/v1');
      assert.strictEqual(client.timeout, 60000);
      assert.strictEqual(client.maxRetries, 3);
    });

    it('should throw error without API key', () => {
      assert.throws(
        () => new GammaAPIClient(),
        GammaAuthenticationError
      );
    });

    it('should accept custom options', () => {
      const client = new GammaAPIClient('test-key', {
        baseUrl: 'https://custom.api.com',
        timeout: 10000,
        maxRetries: 5,
        logging: true
      });

      assert.strictEqual(client.baseUrl, 'https://custom.api.com');
      assert.strictEqual(client.timeout, 10000);
      assert.strictEqual(client.maxRetries, 5);
      assert.strictEqual(client.logging, true);
    });
  });

  describe('Authentication', () => {
    it('should generate correct auth headers', () => {
      const client = new GammaAPIClient('test-api-key');
      const headers = client.getAuthHeaders();

      assert.strictEqual(headers['Authorization'], 'Bearer test-api-key');
      assert.strictEqual(headers['Content-Type'], 'application/json');
      assert.strictEqual(headers['User-Agent'], 'CourseKit-MCP/0.2.0');
    });
  });

  describe('API Methods', () => {
    it('should validate createPresentation parameters', async () => {
      const client = new GammaAPIClient('test-key');

      await assert.rejects(
        async () => await client.createPresentation({ prompt: 'test' }),
        { message: /Title is required/ }
      );

      await assert.rejects(
        async () => await client.createPresentation({ title: 'Test' }),
        { message: /Prompt is required/ }
      );
    });

    it('should validate getPresentation parameters', async () => {
      const client = new GammaAPIClient('test-key');

      await assert.rejects(
        async () => await client.getPresentation(),
        { message: /Presentation ID is required/ }
      );
    });

    it('should validate exportPresentation parameters', async () => {
      const client = new GammaAPIClient('test-key');

      await assert.rejects(
        async () => await client.exportPresentation(),
        { message: /Presentation ID is required/ }
      );

      await assert.rejects(
        async () => await client.exportPresentation('pres_123', 'invalid'),
        { message: /Invalid format/ }
      );
    });

    it('should validate deletePresentation parameters', async () => {
      const client = new GammaAPIClient('test-key');

      await assert.rejects(
        async () => await client.deletePresentation(),
        { message: /Presentation ID is required/ }
      );
    });
  });

  describe('Rate Limit Tracking', () => {
    it('should track rate limit status', () => {
      const client = new GammaAPIClient('test-key');

      assert.strictEqual(client.rateLimitRemaining, null);
      assert.strictEqual(client.rateLimitReset, null);

      const status = client.getRateLimitStatus();
      assert.strictEqual(status.remaining, null);
      assert.strictEqual(status.resetAt, null);
    });
  });

  describe('Sanitization', () => {
    it('should sanitize sensitive data for logging', () => {
      const client = new GammaAPIClient('test-key');

      const data = {
        title: 'Test',
        apiKey: 'secret-key',
        password: 'secret-pass',
        token: 'secret-token'
      };

      const sanitized = client.sanitizeForLog(data);

      assert.strictEqual(sanitized.title, 'Test');
      assert.strictEqual(sanitized.apiKey, '***REDACTED***');
      assert.strictEqual(sanitized.password, '***REDACTED***');
      assert.strictEqual(sanitized.token, '***REDACTED***');
    });
  });
});

// ============================================================================
// TEST: Gamma Content Converter
// ============================================================================

describe('GammaContentConverter', () => {
  let testDir;

  before(async () => {
    // Create temporary test directory
    testDir = path.join(__dirname, 'test-coursekit');
    await fs.mkdir(testDir, { recursive: true });
  });

  after(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('Constructor', () => {
    it('should create converter with default options', () => {
      const converter = new GammaContentConverter();

      assert.strictEqual(converter.includeNotes, true);
      assert.strictEqual(converter.includeExercises, true);
      assert.strictEqual(converter.slideTransition, 'slide-left');
    });

    it('should accept custom options', () => {
      const converter = new GammaContentConverter({
        includeNotes: false,
        includeExercises: false,
        slideTransition: 'fade'
      });

      assert.strictEqual(converter.includeNotes, false);
      assert.strictEqual(converter.includeExercises, false);
      assert.strictEqual(converter.slideTransition, 'fade');
    });
  });

  describe('Constitution Parsing', () => {
    it('should parse constitution structure', () => {
      const converter = new GammaContentConverter();
      const content = `# Business Agility Workshop

## Vision & Purpose

Transform decision latency into agility.

## Problem Statement

Organizations struggle with slow decisions and framework fights.

## Transformation Goals

- Artifact 1: O-I-S Card
- Artifact 2: Hypothesis Canvas
`;

      const parsed = converter.parseConstitution(content);

      assert.strictEqual(parsed.title, 'Business Agility Workshop');
      assert.ok(parsed.visionpurpose.includes('Transform decision latency'));
      assert.ok(parsed.problemstatement.includes('Organizations struggle'));
    });
  });

  describe('Specification Parsing', () => {
    it('should parse learning outcomes', () => {
      const converter = new GammaContentConverter();
      const content = `# Course Specification

## Learning Outcomes

- Understand business agility principles
- Apply O-I-S framework
- Create hypotheses for experiments
`;

      const parsed = converter.parseSpecification(content);

      assert.strictEqual(parsed.title, 'Course Specification');
      assert.strictEqual(parsed.outcomes.length, 3);
      assert.ok(parsed.outcomes[0].includes('business agility'));
    });
  });

  describe('Plan Parsing', () => {
    it('should parse modules and structure', () => {
      const converter = new GammaContentConverter();
      const content = `# Course Plan

## Module 1: Introduction (30 min)

Welcome to business agility.

### Section 1.1: Foundations

Core concepts.

## Module 2: Practice (45 min)

Exercise: Create an O-I-S card
`;

      const parsed = converter.parsePlan(content);

      assert.strictEqual(parsed.modules.length, 3);
      assert.strictEqual(parsed.modules[0].title, 'Module 1: Introduction (30 min)');
      assert.strictEqual(parsed.modules[0].duration, 30);
      assert.strictEqual(parsed.modules[0].level, 1);
      assert.strictEqual(parsed.modules[1].level, 2);
      assert.strictEqual(parsed.exercises.length, 1);
    });
  });

  describe('Content Conversion', () => {
    beforeEach(async () => {
      // Create test CourseKit files
      await fs.writeFile(
        path.join(testDir, 'constitution.md'),
        '# Test Workshop\n\n## Vision\n\nTest vision.'
      );

      await fs.writeFile(
        path.join(testDir, 'specification.md'),
        '# Test Course\n\n## Learning Outcomes\n\n- Outcome 1\n- Outcome 2'
      );

      await fs.writeFile(
        path.join(testDir, 'plan.md'),
        '# Plan\n\n## Module 1: Intro\n\nContent here.'
      );
    });

    it('should convert CourseKit course to Gamma format', async () => {
      const converter = new GammaContentConverter();
      const presentation = await converter.convertCourse(testDir);

      assert.ok(presentation.title);
      assert.ok(Array.isArray(presentation.slides));
      assert.ok(presentation.slides.length > 0);
      assert.strictEqual(presentation.metadata.source, 'CourseKit');
    });

    it('should include title slide', async () => {
      const converter = new GammaContentConverter();
      const presentation = await converter.convertCourse(testDir);

      const titleSlide = presentation.slides[0];
      assert.strictEqual(titleSlide.type, 'title');
      assert.ok(titleSlide.title);
    });

    it('should respect maxSlides limit', async () => {
      const converter = new GammaContentConverter();
      const presentation = await converter.convertCourse(testDir, { maxSlides: 3 });

      assert.strictEqual(presentation.slides.length, 3);
      assert.strictEqual(presentation.metadata.truncated, true);
    });
  });

  describe('API Format Conversion', () => {
    it('should convert to Gamma API format', () => {
      const converter = new GammaContentConverter();
      const presentation = {
        title: 'Test Presentation',
        subtitle: 'Subtitle',
        style: 'professional',
        slides: [
          { type: 'title', title: 'Title', content: 'Content' },
          { type: 'content', title: 'Slide 1', content: ['Point 1', 'Point 2'] }
        ],
        metadata: {}
      };

      const apiFormat = converter.toGammaAPIFormat(presentation);

      assert.strictEqual(apiFormat.title, 'Test Presentation');
      assert.strictEqual(apiFormat.slides.length, 2);
      assert.strictEqual(apiFormat.slides[1].content, 'Point 1\nPoint 2');
    });
  });

  describe('Validation', () => {
    it('should validate presentation structure', () => {
      const converter = new GammaContentConverter();
      const presentation = {
        title: 'Valid Presentation',
        slides: [
          { type: 'title', title: 'Title' },
          { type: 'content', title: 'Slide 1', content: 'Content' }
        ]
      };

      const validation = converter.validate(presentation);

      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.issues.errors.length, 0);
    });

    it('should detect missing title', () => {
      const converter = new GammaContentConverter();
      const presentation = { slides: [{ type: 'content' }] };

      const validation = converter.validate(presentation);

      assert.strictEqual(validation.valid, false);
      assert.ok(validation.issues.errors.some(e => e.includes('title is required')));
    });

    it('should detect missing slides', () => {
      const converter = new GammaContentConverter();
      const presentation = { title: 'Test', slides: [] };

      const validation = converter.validate(presentation);

      assert.strictEqual(validation.valid, false);
      assert.ok(validation.issues.errors.some(e => e.includes('at least one slide')));
    });

    it('should warn about large presentations', () => {
      const converter = new GammaContentConverter();
      const presentation = {
        title: 'Large Presentation',
        slides: Array(150).fill({ type: 'content', title: 'Slide' })
      };

      const validation = converter.validate(presentation);

      assert.strictEqual(validation.valid, true);
      assert.ok(validation.issues.warnings.some(w => w.includes('Large presentation')));
    });
  });

  describe('Utility Functions', () => {
    it('should extract duration from text', () => {
      const converter = new GammaContentConverter();

      assert.strictEqual(converter.extractDuration('Module 1 (30 min)'), 30);
      assert.strictEqual(converter.extractDuration('Module 2 (45 minutes)'), 45);
      assert.strictEqual(converter.extractDuration('No duration'), 0);
    });

    it('should normalize section names', () => {
      const converter = new GammaContentConverter();

      assert.strictEqual(converter.normalizeSectionName('Learning Outcomes'), 'learningoutcomes');
      assert.strictEqual(converter.normalizeSectionName('The Vision & Purpose'), 'visionpurpose');
    });

    it('should find related outcomes by keywords', () => {
      const converter = new GammaContentConverter();
      const content = 'This slide covers business agility principles and frameworks.';
      const outcomes = [
        'Understand business agility principles',
        'Apply testing strategies',
        'Create agility frameworks'
      ];

      const related = converter.findRelatedOutcomes(content, outcomes);

      assert.ok(related.length >= 1);
      assert.ok(related.some(o => o.includes('business agility')));
    });
  });
});

console.log('\n✅ All Gamma Client tests defined. Run with: npm test');
