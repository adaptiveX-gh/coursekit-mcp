#!/usr/bin/env node

/**
 * CourseKit MCP Test Runner
 *
 * Comprehensive test runner that executes all test suites
 * and provides consolidated reporting.
 *
 * Usage: npm test
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test suite configuration
const TEST_SUITES = [
  {
    name: 'Configuration Manager',
    path: './config/ConfigurationManager.test.js',
    category: 'unit'
  },
  {
    name: 'Gamma API Client',
    path: './providers/gamma/GammaClient.test.js',
    category: 'unit'
  },
  {
    name: 'Gamma AI Skill',
    path: './registry/GammaAISkill.test.js',
    category: 'unit'
  },
  {
    name: 'Implementation Coach Skill',
    path: './registry/ImplementationCoachSkill.test.js',
    category: 'unit'
  },
  {
    name: 'Provider Registry',
    path: './registry/ProviderRegistry.test.js',
    category: 'unit'
  },
  {
    name: 'Gamma Integration',
    path: './test/gamma-integration.test.js',
    category: 'integration'
  },
  {
    name: 'MCP Tools Integration',
    path: './test/mcp-tools-integration.test.js',
    category: 'integration'
  }
];

/**
 * Run a single test suite
 */
async function runTestSuite(suite) {
  return new Promise((resolve) => {
    const testPath = path.join(__dirname, suite.path);

    console.log(`\n${'='.repeat(70)}`);
    console.log(`Running: ${suite.name} (${suite.category})`);
    console.log(`${'='.repeat(70)}\n`);

    const startTime = Date.now();
    const child = spawn('node', [testPath], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      resolve({
        suite: suite.name,
        category: suite.category,
        passed: code === 0,
        exitCode: code,
        duration
      });
    });

    child.on('error', (error) => {
      console.error(`Failed to run test suite: ${error.message}`);
      resolve({
        suite: suite.name,
        category: suite.category,
        passed: false,
        exitCode: 1,
        duration: Date.now() - startTime,
        error: error.message
      });
    });
  });
}

/**
 * Generate test summary report
 */
function generateSummary(results) {
  console.log('\n\n');
  console.log('═'.repeat(70));
  console.log('TEST SUMMARY');
  console.log('═'.repeat(70));
  console.log('');

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  // Overall statistics
  console.log(`Total Suites: ${results.length}`);
  console.log(`Passed: ${passed.length} ✓`);
  console.log(`Failed: ${failed.length} ${failed.length > 0 ? '✗' : ''}`);
  console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log('');

  // Category breakdown
  const byCategory = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = { passed: 0, failed: 0, duration: 0 };
    }
    if (result.passed) {
      acc[result.category].passed++;
    } else {
      acc[result.category].failed++;
    }
    acc[result.category].duration += result.duration;
    return acc;
  }, {});

  console.log('By Category:');
  Object.entries(byCategory).forEach(([category, stats]) => {
    const status = stats.failed === 0 ? '✓' : '✗';
    console.log(`  ${category}: ${stats.passed}/${stats.passed + stats.failed} passed ${status} (${(stats.duration / 1000).toFixed(2)}s)`);
  });
  console.log('');

  // Individual suite results
  console.log('Individual Results:');
  results.forEach(result => {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    const duration = (result.duration / 1000).toFixed(2);
    console.log(`  ${status} ${result.suite} (${duration}s)`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });

  console.log('');
  console.log('═'.repeat(70));

  if (failed.length === 0) {
    console.log('✓ ALL TESTS PASSED');
  } else {
    console.log('✗ SOME TESTS FAILED');
    console.log('');
    console.log('Failed Suites:');
    failed.forEach(result => {
      console.log(`  - ${result.suite} (exit code: ${result.exitCode})`);
    });
  }
  console.log('═'.repeat(70));
  console.log('');

  return failed.length === 0;
}

/**
 * Generate coverage summary (placeholder for future implementation)
 */
function generateCoverageSummary() {
  console.log('\nTest Coverage:');
  console.log('  Note: Install and configure nyc/c8 for detailed coverage reports');
  console.log('  Recommendation: Add "coverage" script to package.json');
  console.log('');
}

/**
 * Main test runner
 */
async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║          CourseKit MCP - Comprehensive Test Suite                ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('');

  const startTime = Date.now();
  const results = [];

  // Check if we should run specific categories
  const args = process.argv.slice(2);
  const categoryFilter = args.find(arg => arg.startsWith('--category='))?.split('=')[1];

  const suitesToRun = categoryFilter
    ? TEST_SUITES.filter(s => s.category === categoryFilter)
    : TEST_SUITES;

  if (suitesToRun.length === 0) {
    console.error(`No test suites found for category: ${categoryFilter}`);
    process.exit(1);
  }

  console.log(`Running ${suitesToRun.length} test suite(s)...`);
  if (categoryFilter) {
    console.log(`Filter: category=${categoryFilter}`);
  }
  console.log('');

  // Run all test suites sequentially
  for (const suite of suitesToRun) {
    const result = await runTestSuite(suite);
    results.push(result);
  }

  const totalDuration = Date.now() - startTime;

  // Generate summary
  const allPassed = generateSummary(results);
  generateCoverageSummary();

  console.log(`Total Execution Time: ${(totalDuration / 1000).toFixed(2)}s\n`);

  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run tests
main().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
