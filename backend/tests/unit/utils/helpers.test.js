/**
 * @fileoverview Example unit test for helper utilities.
 */

const { pick, parsePagination, slugify } = require('../../../src/utils/helpers');

describe('Utility Helpers', () => {
  describe('pick()', () => {
    it('should pick specified keys from object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('parsePagination()', () => {
    it('should return defaults for empty query', () => {
      const result = parsePagination({});
      expect(result).toEqual({ page: 1, limit: 10, skip: 0 });
    });
  });

  describe('slugify()', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });
  });
});
