/**
 * PDF Processing Demo
 *
 * Demonstrates PDF text extraction and content analysis capabilities
 */

import { extractPDFText, extractLearningOutcomes, extractConcepts } from './pdf-processor.js';

async function demo() {
  console.log('PDF Processing Demo');
  console.log('===================\n');

  console.log('This demo shows how to use the PDF processor to:');
  console.log('1. Extract text from PDF files');
  console.log('2. Automatically identify learning outcomes');
  console.log('3. Extract key concepts and topics\n');

  console.log('Usage Example:');
  console.log('--------------');
  console.log('');
  console.log('import { extractPDFText, extractLearningOutcomes, extractConcepts } from "./pdf-processor.js";');
  console.log('');
  console.log('// Extract text from a PDF');
  console.log('const result = await extractPDFText("/path/to/course-syllabus.pdf");');
  console.log('');
  console.log('if (result.success) {');
  console.log('  console.log("Extracted text:", result.text);');
  console.log('  console.log("Pages:", result.metadata.pages);');
  console.log('  console.log("File size:", result.metadata.size, "bytes");');
  console.log('');
  console.log('  // Analyze the content');
  console.log('  const outcomes = extractLearningOutcomes(result.text);');
  console.log('  const concepts = extractConcepts(result.text);');
  console.log('');
  console.log('  console.log("Found", outcomes.length, "learning outcomes");');
  console.log('  console.log("Found", concepts.length, "key concepts");');
  console.log('} else {');
  console.log('  console.error("Error:", result.error);');
  console.log('}');
  console.log('');

  console.log('\nFeatures:');
  console.log('----------');
  console.log('- Extracts text content from any PDF file');
  console.log('- Provides detailed metadata (pages, size, creation date, etc.)');
  console.log('- Automatically identifies learning outcomes using pattern matching');
  console.log('- Recognizes: numbered lists, bullet points, "participants will..." statements');
  console.log('- Extracts section headers and key concepts');
  console.log('- Comprehensive error handling for invalid or corrupted PDFs');
  console.log('');

  console.log('Testing:');
  console.log('--------');
  console.log('Run the test suite with:');
  console.log('  node lib/ingest/pdf-processor.test.js');
  console.log('');

  console.log('Note: The pdf-parse library is now installed and fully functional!');
  console.log('');
}

demo().catch(error => {
  console.error('Demo failed:', error);
  process.exit(1);
});
