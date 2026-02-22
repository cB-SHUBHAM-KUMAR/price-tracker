/**
 * @fileoverview General helper / utility functions.
 */

/**
 * Picks only the specified keys from an object.
 */
const pick = (object, keys) => {
  return keys.reduce((result, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      result[key] = object[key];
    }
    return result;
  }, {});
};

/**
 * Parses pagination query params with defaults and limits.
 */
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Slugifies a string (e.g. "Hello World" → "hello-world").
 */
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

module.exports = { pick, parsePagination, slugify };
