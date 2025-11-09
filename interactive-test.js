#!/usr/bin/env node
import readline from 'readline';
import { spawn } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 CourseKit Interactive Tester');
console.log('Commands:');
console.log('  1 - Create Constitution');
console.log('  2 - Create Specification');
console.log('  3 - Create Plan');
console.log('  4 - Generate Tasks');
console.log('  5 - Implement a Task');
console.log('  q - Quit\n');

const server = spawn('node', ['index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

server.stdout.on('data', (data) => {
  try {
    const response = JSON.parse(data);
    console.log('\n✅ Response:', JSON.stringify(response.result, null, 2));
  } catch (e) {
    console.log('Raw output:', data.toString());
  }
  promptUser();
});

let requestId = 1;

function sendRequest(method, params) {
  const request = {
    jsonrpc: '2.0',
    id: requestId++,
    method: method,
    params: params
  };
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Initialize
sendRequest('initialize', {});

function promptUser() {
  rl.question('\nEnter command (1-5 or q): ', (answer) => {
    switch(answer) {
      case '1':
        rl.question('Enter vision: ', (vision) => {
          sendRequest('tools/call', {
            name: 'coursekit.constitution',
            arguments: { vision }
          });
        });
        break;
      case '2':
        rl.question('Enter description: ', (description) => {
          sendRequest('tools/call', {
            name: 'coursekit.specify',
            arguments: { description }
          });
        });
        break;
      case '3':
        sendRequest('tools/call', {
          name: 'coursekit.plan',
          arguments: { format: 'workshop', duration: '4 hours' }
        });
        console.log('Creating plan...');
        break;
      case '4':
        sendRequest('tools/call', {
          name: 'coursekit.tasks',
          arguments: { granularity: 'medium' }
        });
        console.log('Generating tasks...');
        break;
      case '5':
        rl.question('Enter task name (e.g., "Create Module 1 slides"): ', (task) => {
          sendRequest('tools/call', {
            name: 'coursekit.implement',
            arguments: { task }
          });
        });
        break;
      case 'q':
        console.log('Goodbye!');
        server.kill();
        process.exit(0);
        break;
      default:
        console.log('Unknown command');
        promptUser();
    }
  });
}