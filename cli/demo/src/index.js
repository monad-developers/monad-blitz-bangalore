// Monad FaaS Function - demo
// Runtime: JavaScript

/**
 * Main function entry point
 * @param {Object} context - Execution context
 * @param {Object} context.trigger - Trigger data
 * @param {Object} context.env - Environment variables
 * @returns {Object} Function result
 */
function main(context) {
  console.log('Function triggered!', context.trigger);
  
  // Your function logic here
  const result = {
    message: 'Hello from Monad FaaS!',
    timestamp: new Date().toISOString(),
    triggerType: context.trigger?.type || 'unknown'
  };
  
  return result;
}

// Export for WASM compilation
if (typeof module !== 'undefined') {
  module.exports = { main };
}
