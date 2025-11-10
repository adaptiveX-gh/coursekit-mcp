#!/usr/bin/env node

/**
 * MCP Tools Integration Tests
 *
 * Tests for the new MCP tools:
 * - coursekit.ingest (material ingestion)
 * - coursekit.themes (theme extraction)
 * - coursekit.research (research needs)
 *
 * These tests verify tool behavior, integration, and error handling.
 *
 * Usage: node test/mcp-tools-integration.test.js
 */

import { test, describe, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import modules to test
import { analyzeMaterials } from '../lib/ingest/material-analyzer.js';
import { synthesizeThemes } from '../lib/themes/theme-synthesizer.js';
import { validatePlan } from '../lib/validators/plan-validator.js';
import { identifyResearchNeeds, formatResearchNeeds } from '../lib/validators/gap-identifier.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ========================================================================
// TEST FIXTURES
// ========================================================================

const TEST_DATA_DIR = path.join(__dirname, 'test-data');
const TEMP_DIR = path.join(__dirname, 'temp');

// Sample markdown content for testing
const SAMPLE_MARKDOWN = `# Introduction to Testing

## Learning Outcomes
After completing this module, you will be able to:
- Understand the fundamentals of software testing
- Apply unit testing principles to real code
- Create comprehensive test suites
- Evaluate test coverage metrics

## Key Concepts
- Test-Driven Development (TDD)
- Unit Testing vs Integration Testing
- Mocking and Stubbing
- Test Coverage Analysis

## Prerequisites
- Basic programming knowledge
- Understanding of functions and classes
- Familiarity with JavaScript

## Examples
- Writing your first unit test
- Mocking external dependencies
- Testing async code
`;

const SAMPLE_CONSTITUTION = `# Course Constitution

## Core Principles
- Learner-centered design: Every decision prioritizes learner success
- Active learning: Minimize passive content, maximize hands-on practice
- Clear progression: Each concept builds on the previous
- Real-world application: Use authentic examples and scenarios
- Inclusive design: Accessible to all learners

## Target Audience
- Technical background: Intermediate developers
- Learning style: Hands-on learners
- Time constraints: Busy professionals

## Instructional Guidelines
- Start with why: Always explain value before how
- Show don't tell: Demonstrate before explaining
- Practice immediately: Follow concepts with activities
`;

const SAMPLE_PLAN = `# Course Plan

## Module 1: Foundations (45 minutes)
### Learning Objectives
- Understand core testing concepts
- Set up testing environment
- Write first unit test

### Activities
- Environment setup (10 min)
- Live coding demo (15 min)
- Hands-on exercise (20 min)

## Module 2: Advanced Testing (60 minutes)
### Learning Objectives
- Apply mocking techniques
- Test async code
- Measure code coverage

### Activities
- Mocking demonstration (20 min)
- Pair programming (30 min)
- Coverage analysis (10 min)
`;

// ========================================================================
// TEST SETUP AND TEARDOWN
// ========================================================================

before(async () => {
  console.log('Setting up test environment...');

  // Create test directories
  await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  await fs.mkdir(TEMP_DIR, { recursive: true });

  // Create test markdown file
  await fs.writeFile(
    path.join(TEST_DATA_DIR, 'sample-course.md'),
    SAMPLE_MARKDOWN
  );

  // Create test constitution
  await fs.writeFile(
    path.join(TEST_DATA_DIR, 'constitution.md'),
    SAMPLE_CONSTITUTION
  );

  // Create test plan
  await fs.writeFile(
    path.join(TEST_DATA_DIR, 'plan.md'),
    SAMPLE_PLAN
  );

  console.log('✓ Test environment ready\n');
});

after(async () => {
  console.log('\nCleaning up test environment...');

  // Clean up test directories
  try {
    await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
    console.log('✓ Test environment cleaned up');
  } catch (error) {
    console.error('Warning: Failed to clean up test directories:', error.message);
  }
});

// ========================================================================
// COURSEKIT.INGEST TESTS
// ========================================================================

describe('coursekit.ingest - Material Ingestion', () => {
  test('should ingest markdown files successfully', async () => {
    const sources = {
      markdownPaths: [path.join(TEST_DATA_DIR, 'sample-course.md')]
    };

    const result = await analyzeMaterials(sources);

    assert.strictEqual(result.success, true, 'Ingestion should succeed');
    assert.ok(result.synthesized, 'Should have synthesized data');
    assert.ok(Array.isArray(result.synthesized.learningOutcomes), 'Should have learning outcomes array');
    assert.ok(Array.isArray(result.synthesized.concepts), 'Should have concepts array');
    assert.strictEqual(result.metadata.totalSources, 1, 'Should track source count');
    assert.ok(result.materials.length > 0, 'Should have processed materials');
  });

  test('should extract learning outcomes from markdown', async () => {
    const sources = {
      markdownPaths: [path.join(TEST_DATA_DIR, 'sample-course.md')]
    };

    const result = await analyzeMaterials(sources);

    assert.ok(result.synthesized.learningOutcomes.length > 0, 'Should extract learning outcomes');

    const outcomes = result.synthesized.learningOutcomes;
    assert.ok(outcomes.some(o => o.text.toLowerCase().includes('testing')),
      'Should extract testing-related outcomes');
  });

  test('should extract concepts from materials', async () => {
    const sources = {
      markdownPaths: [path.join(TEST_DATA_DIR, 'sample-course.md')]
    };

    const result = await analyzeMaterials(sources);

    assert.ok(result.synthesized.concepts.length > 0, 'Should extract concepts');

    const concepts = result.synthesized.concepts;
    // Concepts have either 'text' or 'name' field depending on processor
    assert.ok(concepts.some(c => {
      const text = (c.text || c.name || '').toLowerCase();
      return text.includes('test') || text.includes('mock') || text.includes('coverage');
    }), 'Should extract testing-related concepts');
  });

  test('should handle empty sources gracefully', async () => {
    const sources = {
      markdownPaths: [],
      pdfPaths: [],
      textPaths: [],
      urls: []
    };

    const result = await analyzeMaterials(sources);

    assert.strictEqual(result.success, true, 'Should succeed with empty sources');
    assert.strictEqual(result.metadata.totalSources, 0, 'Should report zero sources');
    assert.strictEqual(result.synthesized.learningOutcomes.length, 0, 'Should have no outcomes');
  });

  test('should handle invalid file paths', async () => {
    const sources = {
      markdownPaths: ['D:\\nonexistent\\file.md']
    };

    const result = await analyzeMaterials(sources);

    assert.strictEqual(result.success, true, 'Should continue despite errors');
    // The markdown processor returns success: false in the material entry
    // but the overall analysis succeeds
    assert.strictEqual(result.metadata.totalSources, 1, 'Should track attempted source');

    // Check if error was tracked either in materials or metadata
    const hasFailedMaterial = result.materials.some(m => m.success === false);
    const hasError = result.metadata.errors.length > 0;

    assert.ok(hasFailedMaterial || hasError, 'Should record failure');
  });

  test('should track metadata correctly', async () => {
    const sources = {
      markdownPaths: [path.join(TEST_DATA_DIR, 'sample-course.md')]
    };

    const result = await analyzeMaterials(sources);

    assert.ok(result.metadata.processedAt, 'Should have timestamp');
    assert.ok(result.metadata.totalSources >= 0, 'Should track total sources');
    assert.ok(Array.isArray(result.metadata.errors), 'Should have errors array');
    assert.ok(Array.isArray(result.metadata.warnings), 'Should have warnings array');
  });
});

// ========================================================================
// COURSEKIT.THEMES TESTS
// ========================================================================

describe('coursekit.themes - Theme Extraction', () => {
  test('should extract themes from materials', async () => {
    // First ingest materials
    const sources = {
      markdownPaths: [path.join(TEST_DATA_DIR, 'sample-course.md')]
    };
    const materials = await analyzeMaterials(sources);

    // Then extract themes
    const themesResult = await synthesizeThemes(materials, null, {
      granularity: 'medium'
    });

    assert.strictEqual(themesResult.success, true, 'Theme extraction should succeed');
    assert.ok(Array.isArray(themesResult.themes), 'Should have themes array');
    assert.ok(themesResult.metadata.totalOutcomes > 0, 'Should track outcomes count');
  });

  test('should validate themes against constitution', async () => {
    const sources = {
      markdownPaths: [path.join(TEST_DATA_DIR, 'sample-course.md')]
    };
    const materials = await analyzeMaterials(sources);
    const constitution = await fs.readFile(
      path.join(TEST_DATA_DIR, 'constitution.md'),
      'utf-8'
    );

    const themesResult = await synthesizeThemes(materials, constitution, {
      granularity: 'medium',
      validateAlignment: true
    });

    assert.strictEqual(themesResult.success, true, 'Should succeed');
    assert.ok(themesResult.metadata.alignmentScore !== null, 'Should have alignment score');
    assert.ok(themesResult.metadata.alignmentScore >= 0, 'Alignment score should be valid');
  });

  test('should handle different granularity levels', async () => {
    const sources = {
      markdownPaths: [path.join(TEST_DATA_DIR, 'sample-course.md')]
    };
    const materials = await analyzeMaterials(sources);

    // Test coarse granularity
    const coarse = await synthesizeThemes(materials, null, { granularity: 'coarse' });
    assert.ok(coarse.success, 'Coarse granularity should work');

    // Test medium granularity
    const medium = await synthesizeThemes(materials, null, { granularity: 'medium' });
    assert.ok(medium.success, 'Medium granularity should work');

    // Test fine granularity
    const fine = await synthesizeThemes(materials, null, { granularity: 'fine' });
    assert.ok(fine.success, 'Fine granularity should work');
  });

  test('should warn when no learning outcomes found', async () => {
    const emptyMaterials = {
      synthesized: {
        learningOutcomes: [],
        concepts: [],
        topics: []
      }
    };

    const themesResult = await synthesizeThemes(emptyMaterials);

    assert.strictEqual(themesResult.success, true, 'Should succeed');
    assert.ok(themesResult.warnings.length > 0, 'Should have warnings');
    assert.ok(themesResult.warnings.some(w => w.includes('No learning outcomes')),
      'Should warn about missing outcomes');
  });

  test('should include metadata in theme results', async () => {
    const sources = {
      markdownPaths: [path.join(TEST_DATA_DIR, 'sample-course.md')]
    };
    const materials = await analyzeMaterials(sources);
    const themesResult = await synthesizeThemes(materials);

    assert.ok(themesResult.metadata, 'Should have metadata');
    assert.ok(typeof themesResult.metadata.totalOutcomes === 'number', 'Should track outcomes');
    assert.ok(typeof themesResult.metadata.themesGenerated === 'number', 'Should track themes');
    assert.ok(themesResult.metadata.synthesizedAt, 'Should have timestamp');
  });
});

// ========================================================================
// COURSEKIT.RESEARCH TESTS
// ========================================================================

describe('coursekit.research - Research Needs Identification', () => {
  test('should identify research needs from plan', async () => {
    const plan = await fs.readFile(
      path.join(TEST_DATA_DIR, 'plan.md'),
      'utf-8'
    );

    const context = {
      constitution: SAMPLE_CONSTITUTION,
      materials: null,
      themes: null
    };

    const validation = validatePlan(plan, context);
    const researchNeeds = identifyResearchNeeds(plan, validation.outline, context);

    assert.ok(researchNeeds, 'Should return research needs object');
    assert.ok(typeof researchNeeds.hasGaps === 'boolean', 'Should indicate if gaps exist');
    assert.ok(Array.isArray(researchNeeds.researchNeeds), 'Should have research needs array');
    assert.ok(researchNeeds.metadata, 'Should have metadata');
  });

  test('should categorize research needs by type', async () => {
    const plan = await fs.readFile(
      path.join(TEST_DATA_DIR, 'plan.md'),
      'utf-8'
    );

    const validation = validatePlan(plan, {});
    const researchNeeds = identifyResearchNeeds(plan, validation.outline, {});

    if (researchNeeds.hasGaps) {
      const types = new Set(researchNeeds.researchNeeds.map(n => n.type));
      assert.ok(types.size > 0, 'Should have at least one type');

      // Valid types: data, example, evidence, concept
      const validTypes = ['data', 'example', 'evidence', 'concept'];
      types.forEach(type => {
        assert.ok(validTypes.includes(type), `Type ${type} should be valid`);
      });
    }
  });

  test('should prioritize research needs', async () => {
    const plan = await fs.readFile(
      path.join(TEST_DATA_DIR, 'plan.md'),
      'utf-8'
    );

    const validation = validatePlan(plan, {});
    const researchNeeds = identifyResearchNeeds(plan, validation.outline, {});

    if (researchNeeds.hasGaps) {
      // Check that priorities are valid
      const validPriorities = ['critical', 'high', 'medium', 'low'];
      researchNeeds.researchNeeds.forEach(need => {
        assert.ok(validPriorities.includes(need.priority),
          `Priority ${need.priority} should be valid`);
      });

      // Check priority breakdown in metadata
      assert.ok(researchNeeds.metadata.priorityBreakdown, 'Should have priority breakdown');
      assert.ok(typeof researchNeeds.metadata.priorityBreakdown.critical === 'number');
      assert.ok(typeof researchNeeds.metadata.priorityBreakdown.high === 'number');
      assert.ok(typeof researchNeeds.metadata.priorityBreakdown.medium === 'number');
      assert.ok(typeof researchNeeds.metadata.priorityBreakdown.low === 'number');
    }
  });

  test('should format research needs correctly', async () => {
    const plan = await fs.readFile(
      path.join(TEST_DATA_DIR, 'plan.md'),
      'utf-8'
    );

    const validation = validatePlan(plan, {});
    const researchNeeds = identifyResearchNeeds(plan, validation.outline, {});

    if (researchNeeds.hasGaps) {
      const formatted = formatResearchNeeds(researchNeeds.researchNeeds);

      assert.ok(formatted, 'Should return formatted object');
      assert.ok(Array.isArray(formatted.research_needs), 'Should have research_needs array');
      assert.ok(formatted.metadata, 'Should have metadata');
      assert.strictEqual(formatted.version, '1.0', 'Should have version');

      // Check that each need has required fields
      formatted.research_needs.forEach(need => {
        assert.ok(need.id, 'Need should have ID');
        assert.ok(need.type, 'Need should have type');
        assert.ok(need.priority, 'Need should have priority');
        assert.ok(need.description, 'Need should have description');
        assert.ok(need.context, 'Need should have context');
        assert.ok(need.status, 'Need should have status');
      });
    }
  });

  test('should track metadata correctly', async () => {
    const plan = await fs.readFile(
      path.join(TEST_DATA_DIR, 'plan.md'),
      'utf-8'
    );

    const validation = validatePlan(plan, {});
    const researchNeeds = identifyResearchNeeds(plan, validation.outline, {});

    assert.ok(researchNeeds.metadata, 'Should have metadata');
    assert.ok(typeof researchNeeds.metadata.totalGaps === 'number', 'Should track total gaps');
    assert.ok(researchNeeds.metadata.identifiedAt, 'Should have timestamp');
    assert.ok(researchNeeds.metadata.priorityBreakdown, 'Should have priority breakdown');
  });
});

// ========================================================================
// INTEGRATION FLOW TESTS
// ========================================================================

describe('Integration - Complete Workflow', () => {
  test('should complete ingest → themes flow', async () => {
    // Step 1: Ingest materials
    const sources = {
      markdownPaths: [path.join(TEST_DATA_DIR, 'sample-course.md')]
    };
    const materials = await analyzeMaterials(sources);

    assert.strictEqual(materials.success, true, 'Ingest should succeed');

    // Step 2: Extract themes
    const themes = await synthesizeThemes(materials);

    assert.strictEqual(themes.success, true, 'Theme extraction should succeed');
    assert.ok(themes.themes.length >= 0, 'Should have themes array');
  });

  test('should complete ingest → themes → plan → research flow', async () => {
    // Step 1: Ingest
    const sources = {
      markdownPaths: [path.join(TEST_DATA_DIR, 'sample-course.md')]
    };
    const materials = await analyzeMaterials(sources);

    // Step 2: Themes
    const constitution = await fs.readFile(
      path.join(TEST_DATA_DIR, 'constitution.md'),
      'utf-8'
    );
    const themes = await synthesizeThemes(materials, constitution);

    // Step 3: Plan validation
    const plan = await fs.readFile(
      path.join(TEST_DATA_DIR, 'plan.md'),
      'utf-8'
    );

    const context = {
      constitution,
      materials,
      themes
    };

    const validation = validatePlan(plan, context);

    assert.ok(validation, 'Plan validation should complete');
    assert.ok(typeof validation.valid === 'boolean', 'Should have valid flag');
    assert.ok(typeof validation.score === 'number', 'Should have score');

    // Step 4: Research needs
    const researchNeeds = identifyResearchNeeds(plan, validation.outline, context);

    assert.ok(researchNeeds, 'Research needs identification should complete');
    assert.ok(typeof researchNeeds.hasGaps === 'boolean', 'Should indicate gaps');
  });

  test('should handle workflow with missing context gracefully', async () => {
    // Test plan validation without full context
    const plan = await fs.readFile(
      path.join(TEST_DATA_DIR, 'plan.md'),
      'utf-8'
    );

    const validation = validatePlan(plan, {});

    assert.ok(validation, 'Should validate plan even without context');
    assert.ok(validation.valid !== undefined, 'Should have valid flag');
  });
});

// ========================================================================
// ERROR HANDLING TESTS
// ========================================================================

describe('Error Handling', () => {
  test('ingest should handle file read errors', async () => {
    const sources = {
      markdownPaths: ['D:\\nonexistent\\file.md']
    };

    const result = await analyzeMaterials(sources);

    assert.strictEqual(result.success, true, 'Should continue despite errors');
    assert.strictEqual(result.metadata.totalSources, 1, 'Should track attempted source');

    // Error handling: either in materials with success:false or in metadata.errors
    const hasFailedMaterial = result.materials.some(m => m.success === false);
    const hasError = result.metadata.errors.length > 0;

    assert.ok(hasFailedMaterial || hasError, 'Should handle errors gracefully');
  });

  test('themes should handle invalid materials format', async () => {
    const invalidMaterials = {
      synthesized: null
    };

    const result = await synthesizeThemes(invalidMaterials);

    assert.strictEqual(result.success, true, 'Should handle gracefully');
    assert.ok(result.warnings.length > 0, 'Should warn about issues');
  });

  test('research should handle invalid plan format', async () => {
    const invalidPlan = 'This is not a valid plan structure';

    const validation = validatePlan(invalidPlan, {});
    const researchNeeds = identifyResearchNeeds(invalidPlan, validation.outline, {});

    assert.ok(researchNeeds, 'Should return results even with invalid plan');
  });
});

// ========================================================================
// TEST RUNNER
// ========================================================================

console.log('\n🧪 MCP Tools Integration Test Suite\n');
console.log('Testing: coursekit.ingest, coursekit.themes, coursekit.research');
console.log('='.repeat(70));
