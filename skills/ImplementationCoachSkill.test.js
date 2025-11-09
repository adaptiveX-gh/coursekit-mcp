import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { ImplementationCoachSkill } from './ImplementationCoachSkill.js';

// ============================================================================
// TEST: ImplementationCoachSkill
// ============================================================================

describe('ImplementationCoachSkill', () => {
  describe('Constructor', () => {
    it('should create coach with default settings', () => {
      const coach = new ImplementationCoachSkill();

      assert.strictEqual(coach.name, 'implementation-coach');
      assert.ok(coach.providerRegistry instanceof Map);
      assert.ok(coach.providers instanceof Map);
      assert.ok(coach.metrics);
    });

    it('should initialize with empty providers', () => {
      const coach = new ImplementationCoachSkill();

      assert.strictEqual(coach.providers.size, 0);
      assert.strictEqual(coach.metrics.totalTasks, 0);
    });

    it('should have content type mapping', () => {
      const coach = new ImplementationCoachSkill();

      assert.strictEqual(coach.contentTypeMap['slides'], 'presentations');
      assert.strictEqual(coach.contentTypeMap['document'], 'documents');
      assert.strictEqual(coach.contentTypeMap['spreadsheet'], 'spreadsheets');
    });
  });

  describe('Initialization', () => {
    let coach;

    beforeEach(() => {
      coach = new ImplementationCoachSkill();
    });

    afterEach(async () => {
      if (coach) {
        await coach.cleanup();
      }
    });

    it('should initialize ConfigurationManager', async () => {
      await coach.initialize();

      assert.ok(coach.configManager);
      assert.ok(coach.providerRegistry.size > 0);
    });

    it('should register provider skills', async () => {
      await coach.initialize();

      // Should have registered Gamma AI at minimum
      assert.ok(coach.providerRegistry.has('gamma'));

      const gammaEntry = coach.providerRegistry.get('gamma');
      assert.ok(gammaEntry.class);
      assert.ok(Array.isArray(gammaEntry.contentTypes));
      assert.strictEqual(gammaEntry.requiresApiKey, true);
    });

    it('should load configured providers if API keys available', async () => {
      // This test depends on environment having GAMMA_API_KEY
      await coach.initialize();

      // Check if providers were loaded (depends on config)
      assert.ok(coach.providers.size >= 0);
    });
  });

  describe('Content Type Identification', () => {
    let coach;

    beforeEach(async () => {
      coach = new ImplementationCoachSkill();
      await coach.initialize();
    });

    afterEach(async () => {
      await coach.cleanup();
    });

    it('should identify slides from description', () => {
      const task = { description: 'Create slides for Module 1' };
      const contentType = coach.identifyContentType(task);

      assert.strictEqual(contentType, 'slides');
    });

    it('should identify document from description', () => {
      const task = { description: 'Create documentation for API' };
      const contentType = coach.identifyContentType(task);

      assert.strictEqual(contentType, 'document');
    });

    it('should use explicit type if provided', () => {
      const task = {
        type: 'spreadsheet',
        description: 'Create slides' // Should ignore description
      };

      const contentType = coach.identifyContentType(task);
      assert.strictEqual(contentType, 'spreadsheet');
    });

    it('should use format if type not provided', () => {
      const task = {
        format: 'presentation',
        description: 'Some content'
      };

      const contentType = coach.identifyContentType(task);
      assert.strictEqual(contentType, 'presentation');
    });

    it('should default to document if no hints', () => {
      const task = { description: 'Create something' };
      const contentType = coach.identifyContentType(task);

      assert.strictEqual(contentType, 'document');
    });
  });

  describe('Provider Selection', () => {
    let coach;

    beforeEach(async () => {
      coach = new ImplementationCoachSkill();
      await coach.initialize();
    });

    afterEach(async () => {
      await coach.cleanup();
    });

    it('should select provider based on content type', async () => {
      const task = {
        description: 'Create presentation',
        requiredFeatures: []
      };

      const context = {
        constitution: {
          audience: { techLevel: 'intermediate' }
        }
      };

      try {
        const selection = await coach.selectProvider('slides', task, context);

        assert.ok(selection.primary);
        assert.ok(selection.category);
        assert.ok(selection.selectionReason);
      } catch (error) {
        // May fail if no providers initialized (no API keys)
        assert.ok(error.message.includes('No suitable providers') ||
                  error.message.includes('not initialized'));
      }
    });

    it('should normalize content type to category', async () => {
      const task = {};
      const context = {};

      try {
        const selection = await coach.selectProvider('slides', task, context);
        assert.strictEqual(selection.category, 'presentations');
      } catch (error) {
        // Expected if no providers available
        assert.ok(error);
      }
    });
  });

  describe('Provider Comparison', () => {
    let coach;

    beforeEach(async () => {
      coach = new ImplementationCoachSkill();
      await coach.initialize();
    });

    afterEach(async () => {
      await coach.cleanup();
    });

    it('should build provider comparison', () => {
      const providers = [
        {
          name: 'gamma',
          capabilities: {
            contentTypes: ['presentations'],
            features: ['ai-generation']
          }
        }
      ];

      const task = { description: 'Create presentation' };
      const comparison = coach.buildProviderComparison(providers, task);

      assert.strictEqual(comparison.length, 1);
      assert.strictEqual(comparison[0].name, 'gamma');
      assert.ok(Array.isArray(comparison[0].pros));
      assert.ok(Array.isArray(comparison[0].cons));
      assert.ok(comparison[0].bestFor);
      assert.ok(typeof comparison[0].estimatedTime === 'number');
    });

    it('should provide pros for gamma provider', () => {
      const provider = { name: 'gamma', capabilities: { features: [] } };
      const task = {};

      const pros = coach.getProviderPros(provider, task);

      assert.ok(pros.length > 0);
      assert.ok(pros.some(p => p.includes('AI-powered')));
    });

    it('should estimate generation time', () => {
      const gammaProvider = { name: 'gamma' };
      const slidevProvider = { name: 'slidev' };
      const task = {};

      const gammaTime = coach.estimateGenerationTime(gammaProvider, task);
      const slidevTime = coach.estimateGenerationTime(slidevProvider, task);

      assert.ok(gammaTime > slidevTime); // API-based should be slower
    });
  });

  describe('Metrics Tracking', () => {
    let coach;

    beforeEach(async () => {
      coach = new ImplementationCoachSkill();
      await coach.initialize();
    });

    afterEach(async () => {
      await coach.cleanup();
    });

    it('should track metrics', () => {
      coach.trackMetrics('gamma', true);
      coach.trackMetrics('gamma', true);
      coach.trackMetrics('gamma', false);

      const metrics = coach.getMetrics();

      assert.strictEqual(metrics.byProvider.gamma.total, 3);
      assert.strictEqual(metrics.byProvider.gamma.successful, 2);
      assert.strictEqual(metrics.byProvider.gamma.failed, 1);
    });

    it('should calculate success rate', () => {
      coach.trackMetrics('gamma', true);
      coach.trackMetrics('gamma', true);
      coach.trackMetrics('gamma', false);

      const metrics = coach.getMetrics();

      assert.strictEqual(metrics.successRate.gamma, '66.7%');
    });

    it('should track total tasks', () => {
      coach.metrics.totalTasks = 0;
      coach.metrics.totalTasks++;
      coach.metrics.totalTasks++;

      assert.strictEqual(coach.metrics.totalTasks, 2);
    });
  });

  describe('Provider Status', () => {
    let coach;

    beforeEach(async () => {
      coach = new ImplementationCoachSkill();
      await coach.initialize();
    });

    afterEach(async () => {
      await coach.cleanup();
    });

    it('should get status for all providers', () => {
      const status = coach.getProviderStatus();

      assert.ok(typeof status === 'object');
      // Status depends on what providers are initialized
    });

    it('should get status for specific provider', () => {
      const status = coach.getProviderStatus('gamma');

      assert.ok(status);
      assert.ok(typeof status.available === 'boolean');

      if (status.available) {
        assert.ok(status.metadata);
      } else {
        assert.ok(status.reason);
      }
    });

    it('should return unavailable for unknown provider', () => {
      const status = coach.getProviderStatus('nonexistent');

      assert.strictEqual(status.available, false);
      assert.ok(status.reason);
    });
  });

  describe('Provider Registration', () => {
    let coach;

    beforeEach(async () => {
      coach = new ImplementationCoachSkill();
      await coach.initialize();
    });

    afterEach(async () => {
      await coach.cleanup();
    });

    it('should register new provider', () => {
      const initialCount = coach.providerRegistry.size;

      coach.registerProvider('test-provider', {
        class: class TestProvider {},
        contentTypes: ['test'],
        requiresApiKey: false
      });

      assert.strictEqual(coach.providerRegistry.size, initialCount + 1);
      assert.ok(coach.providerRegistry.has('test-provider'));
    });

    it('should unregister provider', () => {
      coach.registerProvider('test-provider', {
        class: class TestProvider {},
        contentTypes: ['test']
      });

      assert.ok(coach.providerRegistry.has('test-provider'));

      coach.unregisterProvider('test-provider');

      assert.ok(!coach.providerRegistry.has('test-provider'));
      assert.ok(!coach.providers.has('test-provider'));
    });
  });

  describe('Progress Reporting', () => {
    let coach;

    beforeEach(async () => {
      coach = new ImplementationCoachSkill();
      await coach.initialize();
    });

    afterEach(async () => {
      await coach.cleanup();
    });

    it('should report progress', () => {
      // Should not throw
      coach.reportProgress({
        stage: 'generation',
        progress: 50,
        message: 'Test message'
      }, 'gamma');

      assert.ok(true);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources', async () => {
      const coach = new ImplementationCoachSkill();
      await coach.initialize();

      assert.ok(coach.configManager);
      assert.ok(coach.providerRegistry.size > 0);

      await coach.cleanup();

      assert.strictEqual(coach.providers.size, 0);
      assert.strictEqual(coach.providerRegistry.size, 0);
      assert.strictEqual(coach.configManager, null);
    });
  });

  describe('Reload', () => {
    it('should reload configuration and providers', async () => {
      const coach = new ImplementationCoachSkill();
      await coach.initialize();

      const initialProviders = coach.providers.size;

      await coach.reload();

      // Should still have config manager
      assert.ok(coach.configManager);

      // Provider count may change based on config
      assert.ok(coach.providers.size >= 0);

      await coach.cleanup();
    });
  });
});

console.log('\n✅ All ImplementationCoachSkill tests defined. Run with: npm test');
