/**
 * @fileoverview Price formatter utilities for the frontend.
 */

export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

export const getPositionColor = (position) => {
  const map = {
    Underpriced: '#22c55e',
    'Good Deal': '#10b981',
    Fair: '#6366f1',
    'Slightly Inflated': '#f59e0b',
    Overpriced: '#ef4444',
  };
  return map[position] || '#64748b';
};

export const getPositionEmoji = (position) => {
  const map = {
    Underpriced: '📉',
    'Good Deal': '💰',
    Fair: '✅',
    'Slightly Inflated': '⚠️',
    Overpriced: '🚨',
  };
  return map[position] || '❓';
};

export const getConfidenceLabel = (score) => {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Moderate';
  if (score >= 40) return 'Low';
  return 'Very Low';
};
