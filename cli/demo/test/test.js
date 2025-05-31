// Test file for demo

const { main } = require('../src/index.js');

// Mock context
const mockContext = {
  trigger: {
    type: 'test',
    data: { message: 'test trigger' }
  },
  env: {
    NODE_ENV: 'test'
  }
};

// Run test
console.log('Testing function...');
const result = main(mockContext);
console.log('Result:', result);
console.log('✅ Test completed!');
