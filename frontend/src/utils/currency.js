/**
 * Format amount to Indian Rupee currency format
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., ₹1,99,000)
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Format amount to Indian Rupee currency format with decimals
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string with decimals (e.g., ₹1,99,000.50)
 */
export const formatCurrencyWithDecimals = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0.00';
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
