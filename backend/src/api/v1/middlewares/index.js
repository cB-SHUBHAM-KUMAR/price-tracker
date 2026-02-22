/**
 * @fileoverview V1-specific middlewares (e.g. API-key checks, v1 deprecation notices).
 * Version-specific middleware lives here. Shared middleware is in src/middlewares/.
 */

/**
 * Example: Add a deprecation header when v1 is eventually sunset.
 */
const deprecationNotice = (_req, res, next) => {
  // Uncomment when v1 is deprecated:
  // res.set('Sunset', 'Sat, 01 Jan 2028 00:00:00 GMT');
  // res.set('Deprecation', 'true');
  next();
};

module.exports = { deprecationNotice };
