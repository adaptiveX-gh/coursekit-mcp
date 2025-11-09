/**
 * Gamma AI Integration Tests
 *
 * Comprehensive integration tests for the complete Gamma AI integration with CourseKit.
 * Tests ConfigurationManager, GammaAPIClient, GammaAISkill, ImplementationCoachSkill,
 * and ProviderRegistry working together.
 *
 * Usage: node test/gamma-integration.test.js
 */

import { test, describe, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import components to test
import { ConfigurationManager } from '../config/ConfigurationManager.js';
import { GammaAPIClient } from '../providers/gamma/GammaAPIClient.js';
import { GammaAISkill } from '../registry/GammaAISkill.js';
import { ImplementationCoachSkill } from '../registry/ImplementationCoachSkill.js';
import { ProviderRegistry } from '../registry/ProviderRegistry.js';

// Import mocks
import { MockGammaAPI, createFetchMock } from './mocks/MockGammaAPI.js';
import { MockConfigurationManager } from './mocks/MockConfigurationManager.js';
import { MockProgressReporter } from './mocks/MockProgressReporter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ========================================================================
// TEST FIXTURES AND HELPERS
// ========================================================================

let testFixtures = {};
let originalFetch;

/**
 * Load test fixtures
 */
async function loadFixtures() {
  const fixturesDir = path.join(__dirname, 'fixtures');

  const files = {
    'coursekit-context': 'coursekit-context.json',
    'gamma-responses': 'gamma-responses.json',
    'config-test-data': 'config-test-data.json',
    'task-definitions': 'task-definitions.json'
  };

  for (const [key, filename] of Object.entries(files)) {
    const content = await fs.readFile(path.join(fixturesDir, filename), 'utf-8');
    testFixtures[key] = JSON.parse(content);
  }
}

/**
 * Create test configuration
 */
function createTestConfig() {
  const configData = testFixtures['config-test-data'];
  // Deep clone to avoid shared state between tests
  return new MockConfigurationManager({
    systemDefaults: JSON.parse(JSON.stringify(configData.systemDefaults)),
    providerDefaults: JSON.parse(JSON.stringify(configData.providerDefaults)),
    userPreferences: JSON.parse(JSON.stringify(configData.userPreferences)),
    envConfig: JSON.parse(JSON.stringify(configData.envConfig))
  });
}

/**
 * Measure memory usage
 */
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    rss: usage.rss
  };
}

/**
 * Measure execution time
 */
async function measureTime(fn) {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    duration: end - start
  };
}

// ========================================================================
// CONFIGURATION MANAGER INTEGRATION TESTS
// ========================================================================

describe('Configuration Manager Integration', () => {
  let config;

  beforeEach(async () => {
    config = createTestConfig();
    await config.initialize();
  });

  test('should load configuration from all 4 sources', async () => {
    assert.ok(config.systemDefaults, 'System defaults loaded');
    assert.ok(config.providerDefaults, 'Provider defaults loaded');
    assert.ok(config.userPreferences, 'User preferences loaded');
    assert.ok(config.envConfig, 'Environment config loaded');
  });

  test('should respect precedence order (env > user > provider > system)', async () => {
    // User preference should override provider default
    const theme = config.get('providers.presentations.gamma.config.defaultTheme');
    assert.strictEqual(theme, 'corporate', 'User preference should override provider default');
  });

  test('should get nested values with dot notation', async () => {
    const enabled = config.get('providers.presentations.gamma.enabled');
    assert.strictEqual(enabled, true);

    const priority = config.get('providers.presentations.gamma.priority');
    assert.strictEqual(priority, 10);

    const missing = config.get('providers.nonexistent.value', 'default');
    assert.strictEqual(missing, 'default');
  });

  test('should set nested values with dot notation', async () => {
    config.set('providers.presentations.preferredProvider', 'slidev');

    const value = config.get('providers.presentations.preferredProvider');
    assert.strictEqual(value, 'slidev');
  });

  test('should select provider based on task characteristics', async () => {
    const provider = config.getProvider('presentations', {
      features: ['ai-generation', 'themes'],
      format: 'gamma',
      techLevel: 'beginner'
    });

    assert.ok(provider, 'Provider should be found');
    assert.strictEqual(provider.name, 'gamma');
    assert.ok(provider.priority > 0, 'Provider should have positive score');
  });

  test('should handle missing API key gracefully', async () => {
    // Temporarily remove API key from env config
    const originalKey = config.envConfig.gamma_api_key;
    delete config.envConfig.gamma_api_key;
    delete process.env.GAMMA_API_KEY;

    const apiKey = config.getAPIKey('gamma');
    assert.strictEqual(apiKey, null);

    // Restore
    config.envConfig.gamma_api_key = originalKey;
  });

  test('should sanitize sensitive fields in safe config', async () => {
    const safeConfig = config.getSafeConfig();
    const exported = config.exportConfig();

    // Check that API keys are redacted
    assert.ok(!JSON.stringify(safeConfig).includes('test-api-key'));
    assert.ok(JSON.stringify(exported.envConfig).includes('***REDACTED***'));
  });

  test('should save and persist user preferences', async () => {
    let savedPreferences = null;
    config.onSave((prefs) => {
      savedPreferences = prefs;
    });

    config.set('providers.presentations.gamma.config.maxSlides', 60);
    await config.save();

    assert.ok(savedPreferences, 'Save callback should be called');
    assert.strictEqual(savedPreferences.providers.presentations.gamma.config.maxSlides, 60);
  });

  test('should validate configuration schema', async () => {
    const validConfig = {
      system: { version: '0.2.0' },
      providers: {
        presentations: {
          gamma: {
            capabilities: {}
          }
        }
      }
    };

    const result = config.validateConfig(validConfig);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
  });
});

// ========================================================================
// GAMMA API CLIENT INTEGRATION TESTS
// ========================================================================

describe('Gamma API Client Integration', () => {
  let mockAPI;
  let client;

  beforeEach(async () => {
    mockAPI = new MockGammaAPI();
    await mockAPI.initialize();

    // Replace global fetch with mock
    originalFetch = globalThis.fetch;
    globalThis.fetch = createFetchMock(mockAPI);

    client = new GammaAPIClient('test-api-key-12345', {
      baseUrl: 'https://api.gamma.app/v1',
      timeout: 5000,
      maxRetries: 3,
      logging: false
    });

    // Override sleep method to speed up tests (reduce retry delays)
    client.sleep = async (ms) => {
      // Reduce delay to 1/100th for testing (e.g., 1000ms -> 10ms)
      await new Promise(resolve => setTimeout(resolve, Math.min(ms / 100, 50)));
    };
  });

  afterEach(() => {
    // Restore original fetch
    globalThis.fetch = originalFetch;
    mockAPI.reset();
  });

  test('should successfully create presentation', async () => {
    mockAPI.setMode('success');

    const result = await client.createPresentation({
      title: 'Test Presentation',
      prompt: 'Create a test presentation',
      context: {},
      options: {}
    });

    assert.ok(result.id, 'Presentation should have ID');
    assert.strictEqual(result.status, 'pending');
    assert.strictEqual(mockAPI.requestCount, 1);
  });

  test('should handle 401 Unauthorized error', async () => {
    mockAPI.setMode('error', { errorType: 'unauthorized' });

    await assert.rejects(
      async () => {
        await client.createPresentation({
          title: 'Test',
          prompt: 'Test'
        });
      },
      {
        name: 'GammaAuthenticationError'
      }
    );
  });

  test('should handle 429 Rate Limit with retry-after', async () => {
    mockAPI.setMode('error', { errorType: 'rateLimit' });

    await assert.rejects(
      async () => {
        await client.createPresentation({
          title: 'Test',
          prompt: 'Test'
        });
      },
      {
        name: 'GammaRateLimitError'
      }
    );
  });

  test('should handle 500 Server Error with retries', async () => {
    mockAPI.setMode('error', { errorType: 'serverError' });

    await assert.rejects(
      async () => {
        await client.createPresentation({
          title: 'Test',
          prompt: 'Test'
        });
      }
    );

    // Should have retried (1 initial + 3 retries = 4 total)
    assert.ok(mockAPI.requestCount >= 2, 'Should have retried');
  });

  test('should retry on failure then succeed', async () => {
    mockAPI.setMode('retry', { retryScenario: 'firstAttemptFails' });

    const result = await client.createPresentation({
      title: 'Test',
      prompt: 'Test'
    });

    assert.ok(result.id, 'Should eventually succeed');
    assert.ok(mockAPI.requestCount >= 2, 'Should have retried');
  });

  test('should poll for completion and wait', async () => {
    mockAPI.setMode('success');

    // Create presentation
    const created = await client.createPresentation({
      title: 'Test',
      prompt: 'Test'
    });

    // Wait for completion
    const completed = await client.waitForCompletion(created.id, 10000, 500);

    assert.strictEqual(completed.status, 'completed');
    assert.ok(mockAPI.requestCount >= 3, 'Should have polled multiple times');
  });

  test('should export presentation in different formats', async () => {
    mockAPI.setMode('success');

    const pdfExport = await client.exportPresentation('pres_12345', 'pdf');
    assert.ok(pdfExport, 'PDF export should succeed');

    mockAPI.reset();
    const pptxExport = await client.exportPresentation('pres_12345', 'pptx');
    assert.ok(pptxExport, 'PPTX export should succeed');

    mockAPI.reset();
    const htmlExport = await client.exportPresentation('pres_12345', 'html');
    assert.ok(htmlExport, 'HTML export should succeed');
  });

  test('should handle invalid export format', async () => {
    await assert.rejects(
      async () => {
        await client.exportPresentation('pres_12345', 'invalid');
      },
      {
        message: /Invalid format/
      }
    );
  });

  test('should track rate limit information', async () => {
    mockAPI.setMode('success');

    await client.createPresentation({
      title: 'Test',
      prompt: 'Test'
    });

    const rateLimitStatus = client.getRateLimitStatus();
    assert.ok(rateLimitStatus !== undefined);
  });
});

// ========================================================================
// GAMMA AI SKILL INTEGRATION TESTS
// ========================================================================

describe('Gamma AI Skill Integration', () => {
  let skill;
  let mockAPI;
  let progressReporter;
  let context;

  beforeEach(async () => {
    mockAPI = new MockGammaAPI();
    await mockAPI.initialize();

    originalFetch = globalThis.fetch;
    globalThis.fetch = createFetchMock(mockAPI);

    skill = new GammaAISkill();

    await skill.initialize({
      apiKey: 'test-api-key-12345',
      clientOptions: { logging: false }
    });

    // Override sleep method in the client to speed up tests
    if (skill.client && skill.client.sleep) {
      skill.client.sleep = async (ms) => {
        await new Promise(resolve => setTimeout(resolve, Math.min(ms / 100, 50)));
      };
    }

    progressReporter = new MockProgressReporter();
    skill.setProgressCallback((event) => {
      progressReporter.report(event.stage, event.progress, event.message);
    });

    context = testFixtures['coursekit-context'];
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    mockAPI.reset();
  });

  test('should gather requirements from task and context', async () => {
    const task = testFixtures['task-definitions'].presentationTask;

    const requirements = await skill.gatherRequirements(task, context);

    assert.ok(requirements.style, 'Should determine style');
    assert.ok(requirements.length, 'Should determine length');
    assert.ok(requirements.images, 'Should determine image preferences');
    assert.ok(requirements.exportFormat, 'Should determine export format');
    assert.ok(requirements.theme, 'Should select theme');
  });

  test('should generate presentation content', async () => {
    mockAPI.setMode('success');

    const task = testFixtures['task-definitions'].presentationTask;
    const requirements = await skill.gatherRequirements(task, context);

    const result = await skill.generateContent(requirements, context);

    assert.strictEqual(result.success, true);
    assert.ok(result.metadata.presentationId);
    assert.ok(result.metadata.url);
    assert.ok(result.metadata.slideCount > 0);
  });

  test('should report progress during generation', async () => {
    mockAPI.setMode('success');

    const task = testFixtures['task-definitions'].presentationTask;
    const requirements = await skill.gatherRequirements(task, context);

    await skill.generateContent(requirements, context);

    const events = progressReporter.getEvents();
    assert.ok(events.length > 0, 'Should emit progress events');

    const stages = progressReporter.getAllStages();
    assert.ok(stages.generation, 'Should have generation stage');
    assert.strictEqual(stages.generation.progress, 100);
  });

  test('should handle API errors with fallback info', async () => {
    mockAPI.setMode('error', { errorType: 'unauthorized' });

    const task = testFixtures['task-definitions'].presentationTask;
    const requirements = await skill.gatherRequirements(task, context);

    const result = await skill.generateContent(requirements, context);

    assert.strictEqual(result.success, false);
    assert.ok(result.error);
    assert.ok(result.error.message);
    assert.ok(result.guidance);
  });

  test('should validate generated content', async () => {
    mockAPI.setMode('success');

    const task = testFixtures['task-definitions'].presentationTask;
    const requirements = await skill.gatherRequirements(task, context);
    const result = await skill.generateContent(requirements, context);

    const validation = await skill.validate(result);

    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.issues.errors.length, 0);
  });

  test('should export in requested format', async () => {
    mockAPI.setMode('success');

    const task = testFixtures['task-definitions'].exportToPDFTask;
    const requirements = await skill.gatherRequirements(task, context);

    const result = await skill.generateContent(requirements, context);

    assert.ok(result.content, 'Should have exported content');
    assert.strictEqual(result.metadata.exportFormat, 'pdf');
  });
});

// ========================================================================
// IMPLEMENTATION COACH INTEGRATION TESTS
// ========================================================================

describe('Implementation Coach Integration', () => {
  let coach;
  let mockAPI;
  let mockConfig;
  let context;

  beforeEach(async () => {
    mockAPI = new MockGammaAPI();
    await mockAPI.initialize();

    originalFetch = globalThis.fetch;
    globalThis.fetch = createFetchMock(mockAPI);

    // Set up environment for Gamma API key
    process.env.GAMMA_API_KEY = 'test-api-key-12345';

    // Create mock configuration with provider settings
    mockConfig = createTestConfig();
    await mockConfig.initialize();

    coach = new ImplementationCoachSkill();

    // Inject mock configuration manager
    coach.configManager = mockConfig;

    // Manually register and load providers since we're bypassing normal initialize
    await coach.registerProviderSkills();
    await coach.loadConfiguredProviders();

    console.log(`[${coach.name}] Initialized with ${coach.providerRegistry.size} provider types`);
    console.log(`[${coach.name}] ${coach.providers.size} providers ready`);

    context = testFixtures['coursekit-context'];
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    mockAPI.reset();
    delete process.env.GAMMA_API_KEY;
  });

  test('should initialize with providers', async () => {
    assert.ok(coach.providers.size > 0, 'Should have initialized providers');
    assert.ok(coach.providers.has('gamma'), 'Should have Gamma provider');
  });

  test('should select provider based on content type', async () => {
    const task = testFixtures['task-definitions'].presentationTask;

    const selection = await coach.selectProvider('presentation', task, context);

    assert.ok(selection.primary, 'Should select primary provider');
    assert.strictEqual(selection.primary.name, 'gamma');
  });

  test('should route task to appropriate provider', async () => {
    mockAPI.setMode('success');

    const task = testFixtures['task-definitions'].presentationTask;

    const result = await coach.route(task, context);

    assert.ok(result, 'Should return result');
    assert.strictEqual(result.provider, 'gamma');
  });

  test('should track usage metrics', async () => {
    mockAPI.setMode('success');

    const task = testFixtures['task-definitions'].presentationTask;
    await coach.route(task, context);

    const metrics = coach.getMetrics();

    assert.ok(metrics.totalTasks > 0);
    assert.ok(metrics.byProvider.gamma);
  });

  test('should fallback to alternative provider on failure', async () => {
    // This test requires multiple providers to be set up
    // For now, we'll test that the fallback logic is triggered

    mockAPI.setMode('error', { errorType: 'unauthorized' });

    const task = testFixtures['task-definitions'].presentationTask;

    await assert.rejects(
      async () => {
        await coach.route(task, context);
      },
      'Should fail if no fallback available'
    );

    const metrics = coach.getMetrics();
    assert.ok(metrics.failures.gamma > 0, 'Should track failures');
  });

  test('should respect user preferences', async () => {
    // User preferences are loaded from config
    const preferredProvider = coach.configManager.get('providers.presentations.preferredProvider');

    assert.strictEqual(preferredProvider, 'gamma');
  });

  test('should get provider status', async () => {
    const status = coach.getProviderStatus('gamma');

    assert.ok(status.available);
    assert.ok(status.initialized);
    assert.ok(status.metadata);
  });
});

// ========================================================================
// PROVIDER REGISTRY INTEGRATION TESTS
// ========================================================================

describe('Provider Registry Integration', () => {
  let registry;

  beforeEach(async () => {
    registry = new ProviderRegistry();
    await registry.initialize();
  });

  afterEach(async () => {
    await registry.cleanup();
  });

  test('should register providers', async () => {
    const result = registry.registerProvider('gamma', GammaAISkill, {
      capabilities: {
        contentTypes: ['presentations'],
        formats: ['gamma', 'pdf'],
        features: ['ai-generation']
      }
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.name, 'gamma');
  });

  test('should prevent duplicate registration', async () => {
    registry.registerProvider('gamma', GammaAISkill, {
      capabilities: { contentTypes: ['presentations'] }
    });

    assert.throws(() => {
      registry.registerProvider('gamma', GammaAISkill, {
        capabilities: { contentTypes: ['presentations'] }
      });
    }, /already registered/);
  });

  test('should get providers for content type', async () => {
    registry.registerProvider('gamma', GammaAISkill, {
      capabilities: {
        contentTypes: ['presentations', 'slides']
      }
    });

    const providers = registry.getProvidersForType('presentations');

    assert.ok(providers.includes('gamma'));
  });

  test('should rank providers by capability match', async () => {
    registry.registerProvider('gamma', GammaAISkill, {
      capabilities: {
        contentTypes: ['presentations'],
        features: ['ai-generation', 'themes'],
        formats: ['pdf', 'pptx'],
        priority: 10
      }
    });

    // Mark provider as available (normally done by healthCheck)
    registry.healthStatus.set('gamma', {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      available: true,
      message: 'Provider ready'
    });

    const task = {
      contentType: 'presentations',
      requiredFeatures: ['ai-generation'],
      format: 'pdf'
    };

    const ranked = registry.rankProviders(task, testFixtures['coursekit-context']);

    assert.ok(ranked.length > 0);
    assert.ok(ranked[0].score > 0);
  });

  test('should track provider usage', async () => {
    registry.registerProvider('gamma', GammaAISkill, {
      capabilities: { contentTypes: ['presentations'] }
    });

    registry.trackUsage('gamma', true, 1500);
    registry.trackUsage('gamma', true, 1200);
    registry.trackUsage('gamma', false, 2000);

    const metrics = registry.getProviderMetrics('gamma');

    assert.strictEqual(metrics.usage, 3);
    assert.strictEqual(metrics.success, 2);
    assert.strictEqual(metrics.failure, 1);
    assert.ok(metrics.averageTime > 0);
  });

  test('should perform health checks', async () => {
    registry.registerProvider('gamma', GammaAISkill, {
      capabilities: { contentTypes: ['presentations'] },
      requiresApiKey: true,
      apiKeyEnvVar: 'GAMMA_API_KEY'
    });

    // Without API key
    let health = await registry.healthCheck('gamma');
    assert.strictEqual(health.available, false);

    // With API key
    process.env.GAMMA_API_KEY = 'test-key';
    health = await registry.healthCheck('gamma');
    assert.strictEqual(health.available, true);

    delete process.env.GAMMA_API_KEY;
  });

  test('should filter by availability', async () => {
    registry.registerProvider('gamma', GammaAISkill, {
      capabilities: { contentTypes: ['presentations'] },
      requiresApiKey: true,
      apiKeyEnvVar: 'GAMMA_API_KEY'
    });

    // Test with API key available
    process.env.GAMMA_API_KEY = 'test-key';

    // Mark as available
    registry.healthStatus.set('gamma', {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      available: true,
      message: 'Provider ready'
    });

    const available = registry.filterByAvailability(['gamma']);
    assert.ok(available.includes('gamma'));

    // Test without API key
    delete process.env.GAMMA_API_KEY;

    const unavailable = registry.filterByAvailability(['gamma']);
    assert.ok(!unavailable.includes('gamma'));
  });
});

// ========================================================================
// END-TO-END INTEGRATION TESTS
// ========================================================================

describe('End-to-End Integration', () => {
  let coach;
  let mockAPI;
  let mockConfig;
  let context;

  beforeEach(async () => {
    mockAPI = new MockGammaAPI();
    await mockAPI.initialize();

    originalFetch = globalThis.fetch;
    globalThis.fetch = createFetchMock(mockAPI);

    process.env.GAMMA_API_KEY = 'test-api-key-12345';

    // Create mock configuration with provider settings
    mockConfig = createTestConfig();
    await mockConfig.initialize();

    coach = new ImplementationCoachSkill();

    // Inject mock configuration manager
    coach.configManager = mockConfig;

    // Manually register and load providers
    await coach.registerProviderSkills();
    await coach.loadConfiguredProviders();

    console.log(`[${coach.name}] Initialized with ${coach.providerRegistry.size} provider types`);
    console.log(`[${coach.name}] ${coach.providers.size} providers ready`);

    context = testFixtures['coursekit-context'];
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    mockAPI.reset();
    delete process.env.GAMMA_API_KEY;
  });

  test('should complete full presentation generation flow', async () => {
    mockAPI.setMode('success');

    const task = testFixtures['task-definitions'].presentationTask;

    // Complete flow: Task → Coach → Gamma → Generated content
    const result = await coach.route(task, context);

    assert.ok(result.success, 'Generation should succeed');
    assert.ok(result.metadata.presentationId);
    assert.ok(result.metadata.url);
    assert.strictEqual(result.provider, 'gamma');
  });

  test('should handle provider failure and retry', async () => {
    mockAPI.setMode('retry', { retryScenario: 'multipleFailuresThenSuccess' });

    const task = testFixtures['task-definitions'].presentationTask;

    const result = await coach.route(task, context);

    assert.ok(result.success, 'Should eventually succeed after retries');
    assert.ok(mockAPI.requestCount > 2, 'Should have retried multiple times');
  });

  test('should export presentation after generation', async () => {
    mockAPI.setMode('success');

    const task = testFixtures['task-definitions'].exportToPPTXTask;

    const result = await coach.route(task, context);

    assert.ok(result.success);
    assert.ok(result.content, 'Should have exported content');
  });

  test('should maintain context through complete workflow', async () => {
    mockAPI.setMode('success');

    const task = testFixtures['task-definitions'].presentationTask;

    const result = await coach.route(task, context);

    // Verify context was used
    assert.ok(result.requirements);
    assert.ok(result.requirements.task);
    assert.strictEqual(result.requirements.task.id, task.id);
  });
});

// ========================================================================
// PERFORMANCE BENCHMARKS
// ========================================================================

describe('Performance Benchmarks', () => {
  let coach;
  let mockAPI;
  let context;

  before(async () => {
    mockAPI = new MockGammaAPI();
    await mockAPI.initialize();

    originalFetch = globalThis.fetch;
    globalThis.fetch = createFetchMock(mockAPI);

    process.env.GAMMA_API_KEY = 'test-api-key-12345';

    context = testFixtures['coursekit-context'];
  });

  after(() => {
    globalThis.fetch = originalFetch;
    delete process.env.GAMMA_API_KEY;
  });

  test('configuration loading should complete in < 100ms', async () => {
    const { duration } = await measureTime(async () => {
      const config = createTestConfig();
      await config.initialize();
      return config;
    });

    assert.ok(duration < 100, `Config loading took ${duration.toFixed(2)}ms, should be < 100ms`);
    console.log(`  ✓ Configuration loaded in ${duration.toFixed(2)}ms`);
  });

  test('provider initialization should complete in < 500ms', async () => {
    const { duration } = await measureTime(async () => {
      const mockConfig = createTestConfig();
      await mockConfig.initialize();

      coach = new ImplementationCoachSkill();
      coach.configManager = mockConfig;
      await coach.registerProviderSkills();
      await coach.loadConfiguredProviders();

      return coach;
    });

    assert.ok(duration < 500, `Provider init took ${duration.toFixed(2)}ms, should be < 500ms`);
    console.log(`  ✓ Provider initialized in ${duration.toFixed(2)}ms`);
  });

  test('complete generation flow timing', async () => {
    mockAPI.setMode('success');

    const task = testFixtures['task-definitions'].presentationTask;

    const { duration, result } = await measureTime(async () => {
      return await coach.route(task, context);
    });

    assert.ok(result.success);
    console.log(`  ✓ Complete flow took ${duration.toFixed(2)}ms`);
  });
});

// ========================================================================
// MEMORY LEAK DETECTION
// ========================================================================

describe('Memory Leak Detection', () => {
  test('should not leak memory during multiple iterations', async () => {
    const initialMemory = getMemoryUsage();

    // Run multiple iterations
    for (let i = 0; i < 10; i++) {
      const config = createTestConfig();
      await config.initialize();

      // Simulate work
      config.get('providers.presentations.gamma');
      config.set('test.value', i);
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = getMemoryUsage();
    const growth = finalMemory.heapUsed - initialMemory.heapUsed;
    const growthMB = growth / 1024 / 1024;

    console.log(`  Memory growth: ${growthMB.toFixed(2)}MB`);

    // Allow up to 10MB growth for test overhead
    assert.ok(growthMB < 10, `Memory grew by ${growthMB.toFixed(2)}MB, should be < 10MB`);
  });

  test('should cleanup provider instances properly', async () => {
    const mockAPI = new MockGammaAPI();
    await mockAPI.initialize();

    originalFetch = globalThis.fetch;
    globalThis.fetch = createFetchMock(mockAPI);

    process.env.GAMMA_API_KEY = 'test-api-key-12345';

    const initialMemory = getMemoryUsage();

    // Create and cleanup multiple instances
    for (let i = 0; i < 5; i++) {
      const coach = new ImplementationCoachSkill();
      await coach.initialize();
      await coach.cleanup();
    }

    if (global.gc) {
      global.gc();
    }

    const finalMemory = getMemoryUsage();
    const growth = finalMemory.heapUsed - initialMemory.heapUsed;
    const growthMB = growth / 1024 / 1024;

    console.log(`  Memory growth after cleanup: ${growthMB.toFixed(2)}MB`);

    globalThis.fetch = originalFetch;
    delete process.env.GAMMA_API_KEY;

    assert.ok(growthMB < 10, `Memory grew by ${growthMB.toFixed(2)}MB after cleanup`);
  });
});

// ========================================================================
// TEST RUNNER
// ========================================================================

before(async () => {
  console.log('Loading test fixtures...');
  await loadFixtures();
  console.log('✓ Test fixtures loaded\n');
});

after(() => {
  console.log('\n✓ All integration tests completed');
});
