/**
 * PDF Processor Tests
 *
 * Tests for PDF text extraction and content analysis
 */

import { extractPDFText, extractLearningOutcomes, extractConcepts } from './pdf-processor.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test 1: Basic PDF text extraction
async function testPDFExtraction() {
  console.log('\n=== Test 1: PDF Text Extraction ===');

  // Create a minimal test PDF buffer (simple text PDF)
  // This is a minimal valid PDF with "Hello World" text
  const testPdfContent = Buffer.from(`%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Hello World) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
409
%%EOF`);

  const testPdfPath = path.join(__dirname, 'test-sample.pdf');

  try {
    // Write test PDF
    await fs.writeFile(testPdfPath, testPdfContent);

    // Extract text
    const result = await extractPDFText(testPdfPath);

    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✓ PDF extraction successful');
      console.log('  - Pages:', result.metadata.pages);
      console.log('  - Size:', result.metadata.size, 'bytes');
      console.log('  - Text length:', result.text.length, 'characters');
      console.log('  - Method:', result.metadata.method);
      console.log('  - Extracted text preview:', result.text.substring(0, 100));
    } else {
      console.log('✗ PDF extraction failed:', result.error);
      console.log('  Help:', result.help);
    }

    // Cleanup
    await fs.unlink(testPdfPath);

    return result.success;
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    // Cleanup on error
    try {
      await fs.unlink(testPdfPath);
    } catch {}
    return false;
  }
}

// Test 2: Learning outcomes extraction
function testLearningOutcomesExtraction() {
  console.log('\n=== Test 2: Learning Outcomes Extraction ===');

  const sampleText = `
Course Learning Outcomes

Participants will be able to:
1. Understand the fundamentals of agile development
2. Apply Scrum framework in team projects
3. Create effective user stories and acceptance criteria

Additional Skills:
- Demonstrate proficiency in backlog management
- Analyze sprint velocity and improve team performance
- Learners will facilitate daily stand-up meetings effectively

Upon completion, students can identify and resolve common team impediments.
  `;

  const outcomes = extractLearningOutcomes(sampleText);

  console.log(`Found ${outcomes.length} learning outcomes:`);
  outcomes.forEach((outcome, idx) => {
    console.log(`  ${idx + 1}. [${outcome.source}, ${outcome.confidence}] ${outcome.text}`);
  });

  const expectedMin = 5; // We should find at least 5 outcomes
  if (outcomes.length >= expectedMin) {
    console.log(`✓ Found ${outcomes.length} outcomes (expected at least ${expectedMin})`);
    return true;
  } else {
    console.log(`✗ Found only ${outcomes.length} outcomes (expected at least ${expectedMin})`);
    return false;
  }
}

// Test 3: Concepts extraction
function testConceptsExtraction() {
  console.log('\n=== Test 3: Concepts Extraction ===');

  const sampleText = `
INTRODUCTION TO AGILE

Scrum Framework:
The Scrum framework is an iterative approach to project management.

SPRINT PLANNING
Teams meet to plan the upcoming sprint and select backlog items.

User Stories:
User stories are short descriptions of features from the user perspective.

RETROSPECTIVES
Teams reflect on what went well and what could be improved.
  `;

  const concepts = extractConcepts(sampleText);

  console.log(`Found ${concepts.length} concepts:`);
  concepts.forEach((concept, idx) => {
    console.log(`  ${idx + 1}. [${concept.type}, ${concept.confidence}] ${concept.text}`);
  });

  const expectedMin = 3; // We should find at least 3 concepts
  if (concepts.length >= expectedMin) {
    console.log(`✓ Found ${concepts.length} concepts (expected at least ${expectedMin})`);
    return true;
  } else {
    console.log(`✗ Found only ${concepts.length} concepts (expected at least ${expectedMin})`);
    return false;
  }
}

// Test 4: Error handling
async function testErrorHandling() {
  console.log('\n=== Test 4: Error Handling ===');

  // Test with non-existent file
  const result = await extractPDFText('/non/existent/file.pdf');

  if (!result.success && result.error) {
    console.log('✓ Correctly handled non-existent file');
    console.log('  Error:', result.error);
    console.log('  Help:', result.help);
    return true;
  } else {
    console.log('✗ Failed to handle error properly');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('PDF Processor Test Suite');
  console.log('========================\n');

  const results = {
    extraction: await testPDFExtraction(),
    outcomes: testLearningOutcomesExtraction(),
    concepts: testConceptsExtraction(),
    errors: await testErrorHandling()
  };

  console.log('\n=== Test Summary ===');
  console.log('PDF Extraction:', results.extraction ? '✓ PASS' : '✗ FAIL');
  console.log('Learning Outcomes:', results.outcomes ? '✓ PASS' : '✗ FAIL');
  console.log('Concepts:', results.concepts ? '✓ PASS' : '✗ FAIL');
  console.log('Error Handling:', results.errors ? '✓ PASS' : '✗ FAIL');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;

  console.log(`\nTotal: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n✗ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
