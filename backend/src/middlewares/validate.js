const { BadRequestError } = require('../utils/errors');

/**
 * Middleware factory: Validate — validates `req.body` against a Zod schema.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), controller.register);
 *
 * @param {import('zod').ZodSchema} schema
 */
const validate = (schema) => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map(
        (e) => `${e.path.join('.')}: ${e.message}`
      );
      return next(new BadRequestError(messages.join('; ')));
    }
    // Replace body with parsed (coerced/trimmed) data
    req.body = result.data;
    next();
  };
};

module.exports = validate;
