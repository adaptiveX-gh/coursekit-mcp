/**
 * Verification script for Prompt 4.1 deliverables
 * Checks that all required files are present and valid
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED_FILES = [
  'test/gamma-integration.test.js',
  'test/README.md',
  '.claude/skills/.docs/implementation-summaries/PROMPT-4.1-IntegrationTests.md',
  '.claude/skills/.docs/implementation-summaries/PROMPT-4.1-Deliverables.md',
  'test/fixtures/coursekit-context.json',
  'test/fixtures/gamma-responses.json',
  'test/fixtures/config-test-data.json',
  'test/fixtures/task-definitions.json',
  'test/mocks/MockGammaAPI.js',
  'test/mocks/MockConfigurationManager.js',
  'test/mocks/MockProgressReporter.js'
];

async function verifyFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const stats = await fs.stat(fullPath);
    const size = stats.size;
    return { exists: true, size };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

async function verifyJSON(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    JSON.parse(content);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

async function main() {
  console.log('Verifying Prompt 4.1 Deliverables...\n');

  let allValid = true;

  for (const file of REQUIRED_FILES) {
    const result = await verifyFile(file);

    if (result.exists) {
      console.log(`✓ ${file} (${result.size} bytes)`);

      // Validate JSON files
      if (file.endsWith('.json')) {
        const jsonResult = await verifyJSON(file);
        if (!jsonResult.valid) {
          console.log(`  ✗ Invalid JSON: ${jsonResult.error}`);
          allValid = false;
        }
      }
    } else {
      console.log(`✗ ${file} - MISSING`);
      allValid = false;
    }
  }

  console.log('\n' + '='.repeat(60));

  if (allValid) {
    console.log('✓ All deliverables present and valid!');
    console.log('\nNext steps:');
    console.log('  npm run test:integration    - Run integration tests');
    console.log('  cat test/README.md          - Read test documentation');
    process.exit(0);
  } else {
    console.log('✗ Some deliverables are missing or invalid');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});
