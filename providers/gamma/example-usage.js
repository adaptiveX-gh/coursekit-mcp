/**
 * Gamma AI Provider - Usage Examples
 *
 * Demonstrates how to use the Gamma AI provider to generate
 * presentations from CourseKit course content.
 *
 * Run: node providers/gamma/example-usage.js
 */

import { GammaAPIClient } from './GammaAPIClient.js';
import { GammaContentConverter } from './GammaContentConverter.js';
import {
  GammaAPIError,
  GammaRateLimitError,
  GammaAuthenticationError
} from './GammaErrors.js';
import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// EXAMPLE 1: Basic Presentation Generation
// ============================================================================

async function example1_basicGeneration() {
  console.log('\n=== Example 1: Basic Presentation Generation ===\n');

  try {
    // Initialize client
    const apiKey = process.env.GAMMA_API_KEY;
    if (!apiKey) {
      console.log('⚠️  GAMMA_API_KEY not set in environment');
      console.log('   This is a demo - skipping actual API call\n');
      return;
    }

    const client = new GammaAPIClient(apiKey, {
      logging: false,
      timeout: 60000,
      maxRetries: 3
    });

    // Create presentation
    console.log('Creating presentation...');
    const result = await client.createPresentation({
      title: 'Introduction to Business Agility',
      prompt: 'Create a 10-slide presentation about business agility fundamentals',
      context: {
        audience: 'beginners',
        duration: '2 hours',
        focus: 'practical frameworks'
      }
    });

    console.log(`✅ Presentation created: ${result.id}`);
    console.log(`   Status: ${result.status}`);

    // Wait for completion
    console.log('\nWaiting for generation to complete...');
    const completed = await client.waitForCompletion(result.id, 300000, 2000);

    console.log(`✅ Presentation ready!`);
    console.log(`   View at: ${completed.url}`);

    return completed;

  } catch (error) {
    if (error instanceof GammaAuthenticationError) {
      console.error('❌ Authentication failed - check your API key');
    } else if (error instanceof GammaRateLimitError) {
      console.error(`❌ Rate limited - retry after ${error.retryAfter} seconds`);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// ============================================================================
// EXAMPLE 2: Convert CourseKit Course to Presentation
// ============================================================================

async function example2_coursekitConversion() {
  console.log('\n=== Example 2: CourseKit Course Conversion ===\n');

  try {
    // Initialize converter
    const converter = new GammaContentConverter({
      includeNotes: true,
      includeExercises: true,
      slideTransition: 'slide-left'
    });

    // Check if CourseKit directory exists
    const coursekitPath = './.coursekit';
    try {
      await fs.access(coursekitPath);
    } catch {
      console.log(`⚠️  CourseKit directory not found at ${coursekitPath}`);
      console.log('   Run CourseKit workflow first to generate course content\n');
      return;
    }

    // Convert course
    console.log('Converting CourseKit course to Gamma format...');
    const presentation = await converter.convertCourse(coursekitPath, {
      maxSlides: 50,
      style: 'professional'
    });

    console.log(`✅ Conversion complete:`);
    console.log(`   Title: ${presentation.title}`);
    console.log(`   Slides: ${presentation.slides.length}`);
    console.log(`   Style: ${presentation.style}`);

    // Validate
    console.log('\nValidating presentation structure...');
    const validation = converter.validate(presentation);

    if (validation.valid) {
      console.log('✅ Validation passed');
    } else {
      console.log('❌ Validation failed:');
      validation.issues.errors.forEach(err => console.log(`   - ${err}`));
    }

    if (validation.issues.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      validation.issues.warnings.forEach(warn => console.log(`   - ${warn}`));
    }

    // Show slide breakdown
    console.log('\nSlide breakdown:');
    const slideTypes = presentation.slides.reduce((acc, slide) => {
      acc[slide.type] = (acc[slide.type] || 0) + 1;
      return acc;
    }, {});
    Object.entries(slideTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    return presentation;

  } catch (error) {
    console.error('❌ Conversion error:', error.message);
  }
}

// ============================================================================
// EXAMPLE 3: Full Workflow (CourseKit → Gamma → Export)
// ============================================================================

async function example3_fullWorkflow() {
  console.log('\n=== Example 3: Full Workflow (CourseKit → Gamma → Export) ===\n');

  try {
    // Check prerequisites
    const apiKey = process.env.GAMMA_API_KEY;
    if (!apiKey) {
      console.log('⚠️  GAMMA_API_KEY not set - skipping API calls\n');
      return;
    }

    const coursekitPath = './.coursekit';
    try {
      await fs.access(coursekitPath);
    } catch {
      console.log('⚠️  CourseKit directory not found - run CourseKit workflow first\n');
      return;
    }

    // Step 1: Convert CourseKit content
    console.log('Step 1: Converting CourseKit course...');
    const converter = new GammaContentConverter();
    const presentation = await converter.convertCourse(coursekitPath);
    console.log(`✅ Converted to ${presentation.slides.length} slides`);

    // Step 2: Validate
    console.log('\nStep 2: Validating presentation...');
    const validation = converter.validate(presentation);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.issues.errors.join(', ')}`);
    }
    console.log('✅ Validation passed');

    // Step 3: Generate with Gamma AI
    console.log('\nStep 3: Generating Gamma presentation...');
    const client = new GammaAPIClient(apiKey);
    const gammaFormat = converter.toGammaAPIFormat(presentation);

    const result = await client.createPresentation({
      title: presentation.title,
      prompt: `Create a professional presentation with ${presentation.slides.length} slides`,
      context: gammaFormat,
      options: {
        style: 'professional',
        maxSlides: presentation.slides.length
      }
    });

    console.log(`✅ Presentation created: ${result.id}`);

    // Step 4: Wait for completion
    console.log('\nStep 4: Waiting for generation...');
    const completed = await client.waitForCompletion(result.id, 300000, 2000);
    console.log(`✅ Generation complete: ${completed.url}`);

    // Step 5: Export to PDF
    console.log('\nStep 5: Exporting to PDF...');
    const pdf = await client.exportPresentation(completed.id, 'pdf');

    const outputPath = './course-presentation.pdf';
    await fs.writeFile(outputPath, Buffer.from(await pdf.arrayBuffer()));
    console.log(`✅ Exported to ${outputPath}`);

    console.log('\n🎉 Full workflow complete!');
    console.log(`   Presentation ID: ${completed.id}`);
    console.log(`   URL: ${completed.url}`);
    console.log(`   PDF: ${outputPath}`);

    return completed;

  } catch (error) {
    console.error('❌ Workflow error:', error.message);
    if (error instanceof GammaAPIError) {
      console.error(`   Code: ${error.code}`);
      console.error(`   Status: ${error.statusCode}`);
    }
  }
}

// ============================================================================
// EXAMPLE 4: Error Handling Patterns
// ============================================================================

async function example4_errorHandling() {
  console.log('\n=== Example 4: Error Handling Patterns ===\n');

  const apiKey = process.env.GAMMA_API_KEY || 'demo-key';
  const client = new GammaAPIClient(apiKey, {
    logging: false,
    maxRetries: 2
  });

  // Pattern 1: Specific error types
  console.log('Pattern 1: Handling specific error types');
  try {
    await client.createPresentation({
      title: 'Test',
      prompt: 'Test prompt'
    });
  } catch (error) {
    if (error instanceof GammaAuthenticationError) {
      console.log('   → Authentication error detected');
      console.log('     Action: Check API key configuration');
    } else if (error instanceof GammaRateLimitError) {
      console.log('   → Rate limit error detected');
      console.log(`     Action: Retry after ${error.retryAfter} seconds`);
    } else if (error instanceof GammaAPIError) {
      console.log(`   → API error: ${error.code}`);
      console.log(`     Message: ${error.message}`);
    }
  }

  // Pattern 2: Retry with backoff
  console.log('\nPattern 2: Manual retry with exponential backoff');
  async function retryWithBackoff(fn, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (error instanceof GammaRateLimitError && attempt < maxRetries - 1) {
          const delay = error.retryAfter ? error.retryAfter * 1000 : Math.pow(2, attempt) * 1000;
          console.log(`   → Rate limited, waiting ${delay}ms before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  // Pattern 3: Fallback on error
  console.log('\nPattern 3: Fallback to alternative provider');
  try {
    const result = await client.createPresentation({
      title: 'Test',
      prompt: 'Test'
    });
  } catch (error) {
    if (error instanceof GammaAPIError) {
      console.log('   → Gamma failed, falling back to Slidev');
      console.log('     (In production, this would trigger Slidev provider)');
    }
  }

  console.log('\n✅ Error handling patterns demonstrated');
}

// ============================================================================
// EXAMPLE 5: Rate Limit Management
// ============================================================================

async function example5_rateLimitManagement() {
  console.log('\n=== Example 5: Rate Limit Management ===\n');

  const apiKey = process.env.GAMMA_API_KEY || 'demo-key';
  const client = new GammaAPIClient(apiKey);

  // Check current rate limit status
  console.log('Checking rate limit status...');
  const status = client.getRateLimitStatus();

  console.log(`Current status:`);
  console.log(`   Remaining requests: ${status.remaining || 'Unknown'}`);
  console.log(`   Resets at: ${status.resetAt || 'Unknown'}`);
  console.log(`   Resets in: ${status.resetIn ? Math.round(status.resetIn) + 's' : 'Unknown'}`);

  // Monitor rate limits during requests
  console.log('\nRate limit monitoring during requests:');
  console.log('   (Would track after each API call in production)');

  // Best practices
  console.log('\nRate limit best practices:');
  console.log('   ✓ Check status before making requests');
  console.log('   ✓ Respect Retry-After headers');
  console.log('   ✓ Implement exponential backoff');
  console.log('   ✓ Use fallback providers when rate limited');
  console.log('   ✓ Monitor daily/hourly quotas');
}

// ============================================================================
// EXAMPLE 6: Content Conversion Details
// ============================================================================

async function example6_conversionDetails() {
  console.log('\n=== Example 6: Content Conversion Details ===\n');

  // Create sample CourseKit content
  const sampleConstitution = `# Business Agility Workshop

## Vision & Purpose

Transform decision latency into customer value through practical frameworks.

## Problem Statement

Organizations struggle with slow decisions and framework fights.
`;

  const sampleSpecification = `# Course Specification

## Learning Outcomes

- Understand business agility principles
- Apply O-I-S framework to real scenarios
- Create testable hypotheses for experiments
`;

  const samplePlan = `# Course Plan

## Module 1: Introduction (30 min)

Welcome to business agility fundamentals.

### Section 1.1: Core Concepts

What is agility? Definition and principles.

### Section 1.2: Common Problems

Decision latency, output-over-outcome thinking.

## Module 2: Practice (45 min)

Exercise: Create an O-I-S card for your context.
`;

  // Create temporary CourseKit directory
  const tempDir = './temp-coursekit-example';
  await fs.mkdir(tempDir, { recursive: true });

  try {
    await fs.writeFile(path.join(tempDir, 'constitution.md'), sampleConstitution);
    await fs.writeFile(path.join(tempDir, 'specification.md'), sampleSpecification);
    await fs.writeFile(path.join(tempDir, 'plan.md'), samplePlan);

    // Convert
    const converter = new GammaContentConverter();
    const presentation = await converter.convertCourse(tempDir);

    console.log('Conversion results:');
    console.log(`   Title: ${presentation.title}`);
    console.log(`   Total slides: ${presentation.slides.length}`);

    console.log('\nSlide details:');
    presentation.slides.forEach((slide, index) => {
      console.log(`   ${index + 1}. [${slide.type}] ${slide.title || '(no title)'}`);
      if (slide.speakerNotes) {
        console.log(`      Notes: ${slide.speakerNotes.substring(0, 50)}...`);
      }
    });

    // Show learning outcome mapping
    console.log('\nLearning outcome mapping:');
    const slidesWithOutcomes = presentation.slides.filter(
      s => s.metadata?.learningOutcomes?.length > 0
    );
    console.log(`   ${slidesWithOutcomes.length} slides mapped to learning outcomes`);

  } finally {
    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

// ============================================================================
// Main: Run All Examples
// ============================================================================

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         Gamma AI Provider - Usage Examples                   ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');

  const examples = [
    { name: 'Basic Generation', fn: example1_basicGeneration },
    { name: 'CourseKit Conversion', fn: example2_coursekitConversion },
    { name: 'Full Workflow', fn: example3_fullWorkflow },
    { name: 'Error Handling', fn: example4_errorHandling },
    { name: 'Rate Limit Management', fn: example5_rateLimitManagement },
    { name: 'Conversion Details', fn: example6_conversionDetails }
  ];

  for (const example of examples) {
    try {
      await example.fn();
    } catch (error) {
      console.error(`\n❌ Example failed: ${error.message}\n`);
    }
  }

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                     Examples Complete                         ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // Summary
  console.log('Next steps:');
  console.log('   1. Set GAMMA_API_KEY in .env');
  console.log('   2. Run CourseKit workflow to generate course content');
  console.log('   3. Use Gamma provider to create presentation');
  console.log('   4. Export to PDF/PPTX for distribution');
  console.log('');
  console.log('Learn more:');
  console.log('   - README: providers/gamma/README.md');
  console.log('   - Tests: npm test providers/gamma/GammaClient.test.js');
  console.log('   - Gamma API: https://gamma.app/docs/api');
  console.log('');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export for use in other modules
export {
  example1_basicGeneration,
  example2_coursekitConversion,
  example3_fullWorkflow,
  example4_errorHandling,
  example5_rateLimitManagement,
  example6_conversionDetails
};
