const { ForbiddenError } = require('../utils/errors');

/**
 * Middleware factory: Authorize — restricts access to specified roles.
 *
 * Usage:
 *   router.get('/admin-stuff', authenticate, authorize('admin'), handler);
 *   router.get('/pharma-or-admin', authenticate, authorize('pharmacist', 'admin'), handler);
 *
 * @param  {...string} allowedRoles
 */
const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`
        )
      );
    }
    next();
  };
};

module.exports = authorize;
