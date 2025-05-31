/**
 * Format ETH values for display
 * @param {string|number} value - The value to format
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} Formatted ETH value
 */
export const formatETH = (value, decimals = 4) => {
  if (!value || value === '0') return '0';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle very small numbers
  if (num < 0.0001) {
    return num.toExponential(2);
  }
  
  return num.toFixed(decimals).replace(/\.?0+$/, '');
};

/**
 * Convert Wei to ETH
 * @param {string} wei - Wei value as string
 * @returns {string} ETH value
 */
export const weiToETH = (wei) => {
  if (!wei) return '0';
  return (parseFloat(wei) / Math.pow(10, 18)).toString();
};

/**
 * Convert ETH to Wei
 * @param {string|number} eth - ETH value
 * @returns {string} Wei value as string
 */
export const ethToWei = (eth) => {
  if (!eth) return '0';
  const ethValue = typeof eth === 'string' ? parseFloat(eth) : eth;
  return (ethValue * Math.pow(10, 18)).toString();
}; 