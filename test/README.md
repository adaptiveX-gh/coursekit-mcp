# CourseKit Integration Tests

Comprehensive integration test suite for the Gamma AI integration with CourseKit MCP Server.

## Overview

This test suite validates the complete integration between:
- **ConfigurationManager** - Multi-source configuration management
- **GammaAPIClient** - Gamma AI API communication
- **GammaAISkill** - Presentation generation skill
- **ImplementationCoachSkill** - Provider routing and orchestration
- **ProviderRegistry** - Provider discovery and lifecycle management

## Test Structure

```
test/
├── gamma-integration.test.js  # Main integration test suite
├── fixtures/                   # Test data
│   ├── coursekit-context.json
│   ├── gamma-responses.json
│   ├── config-test-data.json
│   └── task-definitions.json
├── mocks/                      # Mock implementations
│   ├── MockGammaAPI.js
│   ├── MockConfigurationManager.js
│   └── MockProgressReporter.js
└── README.md                   # This file
```

## Running Tests

### Run All Integration Tests
```bash
node test/gamma-integration.test.js
```

### Run Specific Test Suite
```bash
# Configuration Manager tests only
node test/gamma-integration.test.js --test-name-pattern="Configuration Manager"

# Gamma API Client tests only
node test/gamma-integration.test.js --test-name-pattern="Gamma API Client"

# End-to-end tests only
node test/gamma-integration.test.js --test-name-pattern="End-to-End"
```

### Run with Memory Profiling
```bash
node --expose-gc test/gamma-integration.test.js
```

## Test Suites

### 1. Configuration Manager Integration
Tests multi-source configuration loading and management.

**Key Tests:**
- Configuration loading from all 4 sources (system, provider, user, env)
- Precedence order validation (env > user > provider > system)
- Nested value get/set operations with dot notation
- Provider selection based on task characteristics
- API key security and sanitization
- User preference persistence

**Expected Duration:** < 100ms per test

### 2. Gamma API Client Integration
Tests HTTP communication with mocked Gamma AI API.

**Key Tests:**
- Successful presentation creation flow
- Error handling (401, 429, 500)
- Retry logic with exponential backoff
- Polling for completion
- Export functionality (PDF, PPTX, HTML)
- Rate limit tracking

**Expected Duration:** < 500ms per test (includes simulated retries)

### 3. Gamma AI Skill Integration
Tests presentation generation skill with mocked dependencies.

**Key Tests:**
- Requirement gathering from task and context
- Content generation with API client
- Progress reporting during generation
- Error handling with fallback suggestions
- Content validation
- Export format handling

**Expected Duration:** < 1000ms per test

### 4. Implementation Coach Integration
Tests provider routing and orchestration.

**Key Tests:**
- Provider selection based on content type
- Task routing to appropriate provider
- Fallback to alternative providers on failure
- Usage metrics tracking
- User preference respect
- Provider status monitoring

**Expected Duration:** < 1000ms per test

### 5. Provider Registry Integration
Tests centralized provider management.

**Key Tests:**
- Provider registration and validation
- Duplicate registration prevention
- Content type to provider mapping
- Capability-based provider ranking
- Usage tracking and metrics
- Health checks and availability filtering

**Expected Duration:** < 200ms per test

### 6. End-to-End Integration
Tests complete workflows from task definition to generated content.

**Key Tests:**
- Full presentation generation flow
- Provider failure and retry scenarios
- Export after generation
- Context maintenance through workflow

**Expected Duration:** < 2000ms per test

### 7. Performance Benchmarks
Validates performance characteristics and establishes baselines.

**Benchmarks:**
- Configuration loading: < 100ms
- Provider initialization: < 500ms
- Complete generation flow: monitored (no threshold)

**Results logged to console for tracking over time.**

### 8. Memory Leak Detection
Detects memory leaks through repeated iterations.

**Tests:**
- Multiple configuration iterations: < 10MB growth
- Provider cleanup validation: < 10MB growth after cleanup

**Run with `--expose-gc` flag for accurate results.**

## Test Fixtures

### coursekit-context.json
Complete course context including constitution, specification, plan, and tasks.
Used to test realistic scenarios with full course data.

### gamma-responses.json
Mock Gamma AI API responses for various scenarios:
- Success responses (create, get, export)
- Error responses (unauthorized, rate limit, server error)
- Retry scenarios (first attempt fails, multiple failures)

### config-test-data.json
Configuration data for all sources:
- System defaults
- Provider defaults
- User preferences
- Environment variables
- Expected merged result

### task-definitions.json
Sample task definitions for different scenarios:
- Presentation task (basic)
- Document task
- Technical presentation (code-heavy)
- Export tasks (PDF, PPTX)

## Mock Implementations

### MockGammaAPI
Simulates Gamma AI API responses without network calls.

**Features:**
- Configurable response modes (success, error, retry)
- Request history tracking
- Simulated network delay
- Blob response support

**Usage:**
```javascript
const mockAPI = new MockGammaAPI({ mode: 'success' });
await mockAPI.initialize();
globalThis.fetch = createFetchMock(mockAPI);
```

### MockConfigurationManager
In-memory configuration manager for testing without file I/O.

**Features:**
- Same interface as real ConfigurationManager
- Synchronous initialization
- Save callback for testing persistence
- Full configuration merging logic

**Usage:**
```javascript
const config = new MockConfigurationManager({
  systemDefaults: {...},
  providerDefaults: {...},
  userPreferences: {...}
});
await config.initialize();
```

### MockProgressReporter
Captures progress events for testing without console output.

**Features:**
- Event collection and filtering
- Stage-based progress tracking
- Timeline and statistics
- Wait for completion helpers

**Usage:**
```javascript
const reporter = new MockProgressReporter();
skill.setProgressCallback((event) => {
  reporter.report(event.stage, event.progress, event.message);
});

const events = reporter.getEvents();
const completed = await reporter.waitForStageCompletion('generation');
```

## Writing New Tests

### Test Structure Template
```javascript
describe('My Test Suite', () => {
  let componentUnderTest;

  beforeEach(async () => {
    // Setup
    componentUnderTest = new MyComponent();
    await componentUnderTest.initialize();
  });

  afterEach(async () => {
    // Cleanup
    await componentUnderTest.cleanup();
  });

  test('should do something specific', async () => {
    // Arrange
    const input = {...};

    // Act
    const result = await componentUnderTest.doSomething(input);

    // Assert
    assert.strictEqual(result.success, true);
    assert.ok(result.data);
  });
});
```

### Using Mocks
```javascript
import { MockGammaAPI, createFetchMock } from './mocks/MockGammaAPI.js';

let mockAPI;
let originalFetch;

beforeEach(async () => {
  mockAPI = new MockGammaAPI();
  await mockAPI.initialize();

  originalFetch = globalThis.fetch;
  globalThis.fetch = createFetchMock(mockAPI);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  mockAPI.reset();
});
```

### Testing Error Scenarios
```javascript
test('should handle API error', async () => {
  mockAPI.setMode('error', { errorType: 'unauthorized' });

  await assert.rejects(
    async () => {
      await client.createPresentation({...});
    },
    {
      name: 'GammaAuthenticationError',
      message: /Invalid API key/
    }
  );
});
```

## Continuous Integration

### Adding to CI Pipeline
```yaml
# .github/workflows/test.yml
- name: Run Integration Tests
  run: node test/gamma-integration.test.js
  env:
    GAMMA_API_KEY: ${{ secrets.GAMMA_API_KEY_TEST }}
```

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
node test/gamma-integration.test.js || exit 1
```

## Troubleshooting

### Tests Timing Out
- Check if mock API is properly initialized
- Verify fetch mock is correctly set up
- Increase timeout values for slow environments

### Memory Tests Failing
- Run with `--expose-gc` flag
- Ensure cleanup methods are called
- Check for circular references

### Random Failures
- Check for async/await issues
- Verify mocks are reset between tests
- Look for shared state between tests

## Performance Tracking

Test execution times are logged to console. Track trends over time:

```bash
# Run and save results
node test/gamma-integration.test.js > test-results.log 2>&1

# Extract performance data
grep "✓.*took.*ms" test-results.log
```

## Coverage Goals

Target coverage for integration paths:
- **Configuration Manager:** 80%+
- **Gamma API Client:** 75%+
- **Skills Integration:** 70%+
- **End-to-End Flows:** 80%+

## Next Steps

1. Add more error scenarios
2. Test concurrent requests
3. Add load testing
4. Test network failure recovery
5. Add integration with real Gamma API (opt-in)

## Resources

- [Node.js Test Runner Docs](https://nodejs.org/api/test.html)
- [CourseKit Documentation](../CLAUDE.md)
- [Gamma AI API Docs](https://gamma.app/docs/api)
