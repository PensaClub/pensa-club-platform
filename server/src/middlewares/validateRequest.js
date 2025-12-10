// server/src/middlewares/validateRequest.js

const { ZodError } = require('zod');

const validateRequest = (schemas) => {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

const validateBody = (schema) => validateRequest({ body: schema });
const validateQuery = (schema) => validateRequest({ query: schema });
const validateParams = (schema) => validateRequest({ params: schema });

module.exports = { validateRequest, validateBody, validateQuery, validateParams };