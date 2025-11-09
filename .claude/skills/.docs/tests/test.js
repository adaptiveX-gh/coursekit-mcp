#!/usr/bin/env node

/**
 * Test script for CourseKit MCP Server
 * This tests the standalone implementation without MCP SDK
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Testing CourseKit MCP Server\n');

// Start the server
const server = spawn('node', [path.join(__dirname, 'index.js')], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Handle server output
server.stderr.on('data', (data) => {
  console.log('Server:', data.toString().trim());
});

server.stdout.on('data', (data) => {
  try {
    const response = JSON.parse(data.toString());
    console.log('Response:', JSON.stringify(response, null, 2));
  } catch (e) {
    console.log('Raw output:', data.toString());
  }
});

// Test sequence
const tests = [
  {
    name: 'Initialize',
    request: {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {}
    }
  },
  {
    name: 'List Tools',
    request: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    }
  },
  {
    name: 'Create Constitution',
    request: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'coursekit.constitution',
        arguments: {
          vision: 'Create an engaging workshop on AI-assisted development'
        }
      }
    }
  },
  {
    name: 'Create Specification',
    request: {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'coursekit.specify',
        arguments: {
          description: 'A 4-hour hands-on workshop for developers learning AI coding assistants'
        }
      }
    }
  }
];

// Run tests sequentially
async function runTests() {
  for (const test of tests) {
    console.log(`\n📝 Test: ${test.name}`);
    console.log('Request:', JSON.stringify(test.request, null, 2));
    
    // Send request
    server.stdin.write(JSON.stringify(test.request) + '\n');
    
    // Wait a bit for response
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Clean shutdown
  setTimeout(() => {
    console.log('\n✅ Tests complete, shutting down server');
    server.kill();
    process.exit(0);
  }, 2000);
}

// Start tests after server initializes
setTimeout(runTests, 1000);

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});
