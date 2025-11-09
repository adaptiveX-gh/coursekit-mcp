import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { ProviderRegistry } from './ProviderRegistry.js';
import { BaseContentSkill } from './BaseContentSkill.js';

// Mock provider for testing
class MockProvider extends BaseContentSkill {
  constructor(config = {}) {
    super('mock-provider', config);
  }

  async initialize(options) {
    this.initialized = true;
    return Promise.resolve();
  }

  async gatherRequirements(task, context) {
    return { mock: true };
  }

  async generateContent(requirements, context) {
    return { success: true, content: 'mock content' };
  }

  async validate(content) {
    return { valid: true, issues: { errors: [], warnings: [] } };
  }

  getCapabilities() {
    return {
      contentTypes: ['test'],
      formats: ['mock'],
      features: ['test-feature']
    };
  }
}

// Incomplete provider for testing validation
class IncompleteProvider {
  async initialize() {}
  // Missing required methods
}

// ============================================================================
// TEST: ProviderRegistry
// ============================================================================

describe('ProviderRegistry', () => {
  describe('Constructor', () => {
    it('should create registry with default settings', () => {
      const registry = new ProviderRegistry();

      assert.ok(registry.providers instanceof Map);
      assert.ok(registry.instances instanceof Map);
      assert.ok(registry.metadata instanceof Map);
      assert.ok(registry.metrics);
      assert.ok(registry.healthStatus instanceof Map);
    });

    it('should have required and optional method lists', () => {
      const registry = new ProviderRegistry();

      assert.ok(Array.isArray(registry.requiredMethods));
      assert.ok(Array.isArray(registry.optionalMethods));
      assert.ok(registry.requiredMethods.includes('initialize'));
      assert.ok(registry.requiredMethods.includes('generateContent'));
    });
  });

  describe('Provider Registration', () => {
    let registry;

    beforeEach(() => {
      registry = new ProviderRegistry();
    });

    afterEach(async () => {
      await registry.cleanup();
    });

    it('should register a valid provider', () => {
      const result = registry.registerProvider('mock', MockProvider, {
        capabilities: {
          contentTypes: ['test'],
          formats: ['mock']
        }
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.name, 'mock');
      assert.ok(registry.providers.has('mock'));
    });

    it('should throw error for invalid provider name', () => {
      assert.throws(
        () => registry.registerProvider('', MockProvider),
        { message: /must be a non-empty string/ }
      );
    });

    it('should throw error for already registered provider', () => {
      registry.registerProvider('mock', MockProvider);

      assert.throws(
        () => registry.registerProvider('mock', MockProvider),
        { message: /already registered/ }
      );
    });

    it('should throw error for invalid provider class', () => {
      assert.throws(
        () => registry.registerProvider('invalid', 'not-a-class'),
        { message: /must be a class/ }
      );
    });

    it('should throw error for incomplete provider interface', () => {
      assert.throws(
        () => registry.registerProvider('incomplete', IncompleteProvider),
        { message: /missing required methods/ }
      );
    });

    it('should initialize provider metrics on registration', () => {
      registry.registerProvider('mock', MockProvider);

      assert.strictEqual(registry.metrics.usage.mock, 0);
      assert.strictEqual(registry.metrics.success.mock, 0);
      assert.strictEqual(registry.metrics.failure.mock, 0);
      assert.ok(Array.isArray(registry.metrics.timing.mock));
    });

    it('should initialize health status on registration', () => {
      registry.registerProvider('mock', MockProvider);

      const health = registry.healthStatus.get('mock');
      assert.strictEqual(health.status, 'registered');
      assert.strictEqual(health.available, false);
    });
  });

  describe('Provider Unregistration', () => {
    let registry;

    beforeEach(() => {
      registry = new ProviderRegistry();
    });

    afterEach(async () => {
      await registry.cleanup();
    });

    it('should unregister a provider', async () => {
      registry.registerProvider('mock', MockProvider);
      assert.ok(registry.providers.has('mock'));

      const result = await registry.unregisterProvider('mock');

      assert.strictEqual(result, true);
      assert.ok(!registry.providers.has('mock'));
    });

    it('should return false for non-existent provider', async () => {
      const result = await registry.unregisterProvider('nonexistent');
      assert.strictEqual(result, false);
    });

    it('should cleanup provider instance on unregister', async () => {
      registry.registerProvider('mock', MockProvider);
      await registry.getProvider('mock'); // Initialize

      assert.ok(registry.instances.has('mock'));

      await registry.unregisterProvider('mock');

      assert.ok(!registry.instances.has('mock'));
    });
  });

  describe('Provider Lifecycle', () => {
    let registry;

    beforeEach(() => {
      registry = new ProviderRegistry();
    });

    afterEach(async () => {
      await registry.cleanup();
    });

    it('should get provider instance (lazy init)', async () => {
      registry.registerProvider('mock', MockProvider);

      assert.ok(!registry.instances.has('mock'));

      const instance = await registry.getProvider('mock');

      assert.ok(instance);
      assert.ok(registry.instances.has('mock'));
      assert.strictEqual(instance.initialized, true);
    });

    it('should return cached instance on second call', async () => {
      registry.registerProvider('mock', MockProvider);

      const instance1 = await registry.getProvider('mock');
      const instance2 = await registry.getProvider('mock');

      assert.strictEqual(instance1, instance2);
    });

    it('should throw error for unregistered provider', async () => {
      await assert.rejects(
        async () => await registry.getProvider('nonexistent'),
        { message: /not registered/ }
      );
    });

    it('should update health status on successful init', async () => {
      registry.registerProvider('mock', MockProvider);

      await registry.getProvider('mock');

      const health = registry.healthStatus.get('mock');
      assert.strictEqual(health.status, 'healthy');
      assert.strictEqual(health.available, true);
    });
  });

  describe('Capability Matching', () => {
    let registry;

    beforeEach(() => {
      registry = new ProviderRegistry();

      registry.registerProvider('provider1', MockProvider, {
        capabilities: {
          contentTypes: ['presentations'],
          formats: ['pdf', 'pptx'],
          features: ['ai-generation', 'themes'],
          techLevel: ['beginner', 'intermediate']
        }
      });

      registry.registerProvider('provider2', MockProvider, {
        capabilities: {
          contentTypes: ['presentations', 'documents'],
          formats: ['markdown'],
          features: ['templates'],
          techLevel: ['intermediate', 'advanced']
        }
      });
    });

    afterEach(async () => {
      await registry.cleanup();
    });

    it('should get providers for content type', () => {
      const providers = registry.getProvidersForType('presentations');

      assert.strictEqual(providers.length, 2);
      assert.ok(providers.includes('provider1'));
      assert.ok(providers.includes('provider2'));
    });

    it('should return empty array for unknown content type', () => {
      const providers = registry.getProvidersForType('unknown');
      assert.strictEqual(providers.length, 0);
    });

    it('should match provider capabilities', () => {
      const requirements = {
        contentType: 'presentations',
        features: ['ai-generation'],
        format: 'pdf',
        techLevel: 'beginner'
      };

      const matches = registry.matchProviderCapabilities(requirements);

      assert.ok(matches.length > 0);
      assert.strictEqual(matches[0].name, 'provider1'); // Should rank first
      assert.ok(matches[0].score > 0);
    });

    it('should filter out non-matching content types', () => {
      const requirements = {
        contentType: 'spreadsheets'
      };

      const matches = registry.matchProviderCapabilities(requirements);
      assert.strictEqual(matches.length, 0);
    });

    it('should rank providers by score', () => {
      const requirements = {
        contentType: 'presentations',
        features: ['ai-generation', 'themes'],
        format: 'pdf'
      };

      const matches = registry.matchProviderCapabilities(requirements);

      // Should be sorted by score
      for (let i = 1; i < matches.length; i++) {
        assert.ok(matches[i - 1].score >= matches[i].score);
      }
    });

    it('should rank providers with task context', () => {
      // Set providers as available
      registry.healthStatus.set('provider1', { status: 'healthy', available: true });
      registry.healthStatus.set('provider2', { status: 'healthy', available: true });

      const task = {
        contentType: 'presentations',
        requiredFeatures: ['ai-generation'],
        format: 'pdf'
      };

      const context = {
        constitution: {
          audience: { techLevel: 'beginner' }
        }
      };

      const ranked = registry.rankProviders(task, context);

      assert.ok(ranked.length > 0);
      assert.ok(ranked[0].score > 0);
      assert.ok(ranked[0].metrics);
    });
  });

  describe('Availability Filtering', () => {
    let registry;

    beforeEach(() => {
      registry = new ProviderRegistry();

      registry.registerProvider('available', MockProvider);
      registry.registerProvider('unavailable', MockProvider);

      // Set health status
      registry.healthStatus.set('available', {
        status: 'healthy',
        available: true
      });

      registry.healthStatus.set('unavailable', {
        status: 'error',
        available: false
      });
    });

    afterEach(async () => {
      await registry.cleanup();
    });

    it('should filter by availability', () => {
      const providers = ['available', 'unavailable'];
      const available = registry.filterByAvailability(providers);

      assert.strictEqual(available.length, 1);
      assert.ok(available.includes('available'));
      assert.ok(!available.includes('unavailable'));
    });
  });

  describe('Metrics Tracking', () => {
    let registry;

    beforeEach(() => {
      registry = new ProviderRegistry();
      registry.registerProvider('mock', MockProvider);
    });

    afterEach(async () => {
      await registry.cleanup();
    });

    it('should track usage', () => {
      registry.trackUsage('mock', true, 1000);
      registry.trackUsage('mock', true, 1500);
      registry.trackUsage('mock', false, 2000);

      const metrics = registry.getProviderMetrics('mock');

      assert.strictEqual(metrics.usage, 3);
      assert.strictEqual(metrics.success, 2);
      assert.strictEqual(metrics.failure, 1);
    });

    it('should calculate success rate', () => {
      registry.trackUsage('mock', true, 1000);
      registry.trackUsage('mock', true, 1000);
      registry.trackUsage('mock', false, 1000);

      const metrics = registry.getProviderMetrics('mock');

      assert.strictEqual(metrics.successRate, 66.7);
    });

    it('should track timing', () => {
      registry.trackUsage('mock', true, 1000);
      registry.trackUsage('mock', true, 2000);

      const metrics = registry.getProviderMetrics('mock');

      assert.strictEqual(metrics.averageTime, 1500);
    });

    it('should track user preferences', () => {
      registry.trackPreference('mock', 'presentations');
      registry.trackPreference('mock', 'presentations');

      const preferences = registry.metrics.preferences;

      assert.strictEqual(preferences.presentations.mock, 2);
    });

    it('should get all metrics', () => {
      registry.trackUsage('mock', true, 1000);

      const allMetrics = registry.getAllMetrics();

      assert.ok(allMetrics.providers);
      assert.ok(allMetrics.providers.mock);
      assert.ok(allMetrics.preferences);
    });

    it('should reset metrics', () => {
      registry.trackUsage('mock', true, 1000);

      assert.strictEqual(registry.metrics.usage.mock, 1);

      registry.resetMetrics();

      assert.strictEqual(registry.metrics.usage.mock, 0);
    });
  });

  describe('Health Checks', () => {
    let registry;

    beforeEach(() => {
      registry = new ProviderRegistry();
    });

    afterEach(async () => {
      await registry.cleanup();
    });

    it('should perform health check on provider', async () => {
      registry.registerProvider('mock', MockProvider);

      const health = await registry.healthCheck('mock');

      assert.ok(health.status);
      assert.ok(typeof health.available === 'boolean');
      assert.ok(health.lastCheck);
    });

    it('should return not_found for unregistered provider', async () => {
      const health = await registry.healthCheck('nonexistent');

      assert.strictEqual(health.status, 'not_found');
      assert.strictEqual(health.available, false);
    });

    it('should check all providers', async () => {
      registry.registerProvider('mock1', MockProvider);
      registry.registerProvider('mock2', MockProvider);

      const results = await registry.healthCheckAll();

      assert.ok(results.mock1);
      assert.ok(results.mock2);
    });

    it('should update health status after check', async () => {
      registry.registerProvider('mock', MockProvider);

      await registry.healthCheckAll();

      const health = registry.healthStatus.get('mock');
      assert.ok(health);
      assert.ok(health.lastCheck);
    });
  });

  describe('Provider Status', () => {
    let registry;

    beforeEach(() => {
      registry = new ProviderRegistry();
    });

    afterEach(async () => {
      await registry.cleanup();
    });

    it('should get provider status', () => {
      registry.registerProvider('mock', MockProvider, {
        capabilities: { contentTypes: ['test'] }
      });

      const status = registry.getProviderStatus('mock');

      assert.strictEqual(status.registered, true);
      assert.strictEqual(status.name, 'mock');
      assert.strictEqual(status.initialized, false);
      assert.ok(status.capabilities);
    });

    it('should return not registered for unknown provider', () => {
      const status = registry.getProviderStatus('nonexistent');

      assert.strictEqual(status.registered, false);
    });

    it('should get all provider status', () => {
      registry.registerProvider('mock1', MockProvider);
      registry.registerProvider('mock2', MockProvider);

      const allStatus = registry.getAllProviderStatus();

      assert.ok(allStatus.mock1);
      assert.ok(allStatus.mock2);
    });
  });

  describe('Statistics', () => {
    let registry;

    beforeEach(() => {
      registry = new ProviderRegistry();
    });

    afterEach(async () => {
      await registry.cleanup();
    });

    it('should get registry statistics', () => {
      registry.registerProvider('mock1', MockProvider, {
        capabilities: { contentTypes: ['presentations'] }
      });

      registry.registerProvider('mock2', MockProvider, {
        capabilities: { contentTypes: ['presentations', 'documents'] }
      });

      const stats = registry.getStatistics();

      assert.strictEqual(stats.total, 2);
      assert.strictEqual(stats.initialized, 0);
      assert.ok(stats.byContentType);
      assert.strictEqual(stats.byContentType.presentations, 2);
      assert.strictEqual(stats.byContentType.documents, 1);
    });
  });

  describe('Cleanup', () => {
    let registry;

    beforeEach(() => {
      registry = new ProviderRegistry();
    });

    it('should cleanup all instances', async () => {
      registry.registerProvider('mock', MockProvider);
      await registry.getProvider('mock'); // Initialize

      assert.strictEqual(registry.instances.size, 1);

      await registry.cleanup();

      assert.strictEqual(registry.instances.size, 0);
    });
  });
});

console.log('\n✅ All ProviderRegistry tests defined. Run with: npm test');
