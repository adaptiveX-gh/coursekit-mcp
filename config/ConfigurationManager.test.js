#!/usr/bin/env node

/**
 * ConfigurationManager Tests
 *
 * Tests all functionality of the ConfigurationManager class including:
 * - Multi-source configuration loading
 * - Configuration precedence
 * - Provider selection logic
 * - Security features
 * - Path sanitization
 * - API key handling
 */

import { ConfigurationManager } from './ConfigurationManager.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test runner
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('\n🧪 ConfigurationManager Test Suite\n');
    console.log('='.repeat(60));

    for (const { name, fn } of this.tests) {
      try {
        await fn();
        this.passed++;
        console.log(`✓ ${name}`);
      } catch (error) {
        this.failed++;
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
        if (error.stack) {
          console.log(`  ${error.stack.split('\n')[1]?.trim()}`);
        }
      }
    }

    console.log('='.repeat(60));
    console.log(`\nResults: ${this.passed} passed, ${this.failed} failed`);
    console.log(`Total: ${this.tests.length} tests\n`);

    return this.failed === 0;
  }
}

// Helper assertion functions
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value should not be null or undefined');
  }
}

function assertNull(value, message) {
  if (value !== null) {
    throw new Error(message || `Expected null, got ${JSON.stringify(value)}`);
  }
}

function assertThrows(fn, message) {
  let threw = false;
  try {
    fn();
  } catch (error) {
    threw = true;
  }
  if (!threw) {
    throw new Error(message || 'Expected function to throw');
  }
}

// Test suite
const runner = new TestRunner();

// Test 1: Initialization
runner.test('should initialize configuration manager', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  assertNotNull(config.mergedConfig, 'Merged config should exist');
  assertNotNull(config.systemDefaults, 'System defaults should be loaded');
  assertNotNull(config.providerDefaults, 'Provider defaults should be loaded');
});

// Test 2: Get configuration values
runner.test('should get configuration values using dot notation', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  const systemName = config.get('system.name');
  assertEqual(systemName, 'CourseKit MCP Server', 'Should get system name');

  const slidevEnabled = config.get('providers.presentations.slidev.enabled');
  assertEqual(slidevEnabled, true, 'Slidev should be enabled');

  const nonExistent = config.get('does.not.exist', 'default');
  assertEqual(nonExistent, 'default', 'Should return default for non-existent path');
});

// Test 3: Set configuration values
runner.test('should set user preferences and update merged config', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  config.set('providers.presentations.preferredProvider', 'gamma');
  const value = config.get('providers.presentations.preferredProvider');
  assertEqual(value, 'gamma', 'Should set and retrieve preference');

  config.set('custom.nested.value', 42);
  const nested = config.get('custom.nested.value');
  assertEqual(nested, 42, 'Should create nested paths');
});

// Test 4: Provider selection - basic
runner.test('should select best provider for slides with code', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  const provider = config.getProvider('slides', {
    features: ['code-highlighting'],
    techLevel: 'advanced'
  });

  assertNotNull(provider, 'Should find a provider');
  assertEqual(provider.name, 'slidev', 'Slidev should be best for code slides');
  assert(provider.priority > 0, 'Should have priority score');
});

// Test 5: Provider selection - no match
runner.test('should return null when no provider matches', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  const provider = config.getProvider('nonexistent-type', {});
  assertNull(provider, 'Should return null for unsupported content type');
});

// Test 6: Provider selection - format matching
runner.test('should prioritize providers by format match', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  const provider = config.getProvider('documentation', {
    format: 'markdown'
  });

  assertNotNull(provider, 'Should find a provider');
  assertEqual(provider.name, 'markdown', 'Should select markdown for markdown format');
});

// Test 7: Get provider config
runner.test('should get provider configuration by name', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  const slidevConfig = config.getProviderConfig('slidev');
  assertNotNull(slidevConfig, 'Slidev config should exist');
  assertEqual(slidevConfig.enabled, true, 'Slidev should be enabled');
  assertNotNull(slidevConfig.capabilities, 'Should have capabilities');
  assertNotNull(slidevConfig.config, 'Should have config');
});

// Test 8: API key retrieval
runner.test('should retrieve API keys from environment', async () => {
  // Set a test API key
  process.env.GAMMA_API_KEY = 'test_key_12345';

  const config = new ConfigurationManager();
  await config.initialize();

  const apiKey = config.getAPIKey('gamma');
  assertEqual(apiKey, 'test_key_12345', 'Should retrieve API key from environment');

  // Clean up
  delete process.env.GAMMA_API_KEY;
});

// Test 9: API key security - no logging
runner.test('should not expose API keys in safe config', async () => {
  process.env.GAMMA_API_KEY = 'secret_key';

  const config = new ConfigurationManager();
  await config.initialize();

  const safeConfig = config.getSafeConfig();
  const configString = JSON.stringify(safeConfig);

  assert(!configString.includes('secret_key'), 'Should not expose API key in safe config');

  delete process.env.GAMMA_API_KEY;
});

// Test 10: Path sanitization
runner.test('should sanitize file paths to prevent traversal', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  assertThrows(
    () => config.sanitizePath('../../../etc/passwd'),
    'Should throw for directory traversal'
  );

  assertThrows(
    () => config.sanitizePath('path\x00with\x00nulls'),
    'Should throw for null bytes'
  );

  const safe = config.sanitizePath('./config/default.json');
  assertNotNull(safe, 'Should sanitize safe paths');
});

// Test 11: Configuration validation
runner.test('should validate configuration structure', async () => {
  const config = new ConfigurationManager();

  const valid = { system: {}, providers: {} };
  const result1 = config.validateConfig(valid);
  assertEqual(result1.valid, true, 'Valid config should pass');

  const invalid = { providers: 'not-an-object' };
  const result2 = config.validateConfig(invalid);
  assertEqual(result2.valid, false, 'Invalid config should fail');
  assert(result2.errors.length > 0, 'Should have error messages');
});

// Test 12: Configuration precedence
runner.test('should respect configuration precedence', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  // Set user preference
  config.set('defaults.quality', 'draft');

  // User preference should override system default
  const quality = config.get('defaults.quality');
  assertEqual(quality, 'draft', 'User preference should override default');
});

// Test 13: Save user preferences
runner.test('should save user preferences to file', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  config.set('test.save.value', 'test123');
  await config.save();

  // Create new instance and verify it loads the saved preference
  const config2 = new ConfigurationManager();
  await config2.initialize();

  const value = config2.get('test.save.value');
  assertEqual(value, 'test123', 'Should load saved preferences');
});

// Test 14: Deep merge
runner.test('should deep merge configurations correctly', async () => {
  const config = new ConfigurationManager();

  const target = { a: { b: 1, c: 2 } };
  const source = { a: { c: 3, d: 4 }, e: 5 };

  const merged = config.deepMerge(target, source);

  assertEqual(merged.a.b, 1, 'Should keep target values');
  assertEqual(merged.a.c, 3, 'Should override with source values');
  assertEqual(merged.a.d, 4, 'Should add new source values');
  assertEqual(merged.e, 5, 'Should add top-level source values');
});

// Test 15: Sensitive field redaction
runner.test('should redact sensitive fields from config', async () => {
  const config = new ConfigurationManager();

  const sensitive = {
    apiKey: 'secret123',
    password: 'pass456',
    normalField: 'visible',
    nested: {
      token: 'token789',
      safe: 'also-visible'
    }
  };

  const redacted = config.redactSensitiveFields(sensitive);

  assertEqual(redacted.apiKey, '***REDACTED***', 'Should redact apiKey');
  assertEqual(redacted.password, '***REDACTED***', 'Should redact password');
  assertEqual(redacted.normalField, 'visible', 'Should keep normal fields');
  assertEqual(redacted.nested.token, '***REDACTED***', 'Should redact nested tokens');
  assertEqual(redacted.nested.safe, 'also-visible', 'Should keep safe nested fields');
});

// Test 16: Export configuration
runner.test('should export configuration for debugging', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  const exported = config.exportConfig();

  assertNotNull(exported.systemDefaults, 'Should export system defaults');
  assertNotNull(exported.providerDefaults, 'Should export provider defaults');
  assertNotNull(exported.userPreferences, 'Should export user preferences');
  assertNotNull(exported.merged, 'Should export merged config');
});

// Test 17: Provider disabled handling
runner.test('should skip disabled providers', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  // Gamma should be disabled by default
  const provider = config.getProvider('slides', {
    features: ['ai-design']
  });

  // Should not select Gamma since it's disabled
  if (provider) {
    assert(provider.name !== 'gamma', 'Should not select disabled provider');
  }
});

// Test 18: Missing API key handling
runner.test('should handle missing API keys gracefully', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  // Try to get API key for Gamma without setting env var
  delete process.env.GAMMA_API_KEY;

  const apiKey = config.getAPIKey('gamma');
  assertNull(apiKey, 'Should return null for missing API key');
});

// Test 19: Environment variable loading
runner.test('should load environment variables with COURSEKIT prefix', async () => {
  process.env.COURSEKIT_TEST_VAR = 'test_value';

  const config = new ConfigurationManager();
  await config.initialize();

  assert(config.envConfig.test_var === 'test_value', 'Should load COURSEKIT_ prefixed vars');

  delete process.env.COURSEKIT_TEST_VAR;
});

// Test 20: Get all providers
runner.test('should get all providers by category', async () => {
  const config = new ConfigurationManager();
  await config.initialize();

  const providers = config.getAllProviders();

  assertNotNull(providers.presentations, 'Should have presentations category');
  assertNotNull(providers.documents, 'Should have documents category');
  assertNotNull(providers.presentations.slidev, 'Should have slidev provider');
  assertNotNull(providers.documents.markdown, 'Should have markdown provider');
});

// Run all tests
runner.run().then(success => {
  process.exit(success ? 0 : 1);
});
