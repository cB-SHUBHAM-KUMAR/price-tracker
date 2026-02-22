/**
 * @fileoverview Utility functions for formatting data.
 */

export const formatDate = (date) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(date));

export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export const truncate = (str, length = 50) =>
  str.length > length ? `${str.substring(0, length)}...` : str;

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
