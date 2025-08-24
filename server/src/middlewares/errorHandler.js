const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } = require('sequelize');
const { TokenExpiredError } = require('jsonwebtoken');
const { ZodError } = require('zod');
const CustomError = require('../utils/customError');

function errorHandler(error, req, res, next) {
    let message = `Something went wrong! ${error}`;
    let statusCode = error.statusCode || 500;
    let details = error.details;

    if (error instanceof CustomError) {
        message = error.message;
        statusCode = error.statusCode;
        details = error.details;
    } else if (error instanceof ZodError) {
        statusCode = 400;
        message = 'Validation failed';
        details = error.errors.map((err) => {
            let currentValue = req.body;
            for (const pathItem of err.path) {
                if (currentValue && typeof currentValue === 'object') {
                    currentValue = currentValue[pathItem];
                } else {
                    currentValue = undefined;
                    break;
                }
            }

            return {
                field: err.path.join('.'),
                message: err.message,
                currentValue: currentValue,
                code: err.code,
            };
        });
    } else if (error instanceof UniqueConstraintError) {
        const isCompoundConstraint = error.fields && Object.keys(error.fields).length > 1 && error.fields.slug && error.fields.is_draft;
        if (isCompoundConstraint) {
            const fieldErrors = [
                {
                    field: 'slug',
                    value: error.fields.slug,
                    message: 'This URL address is already taken for this draft status. You can use the same URL for a different draft status.',
                },
            ];
            message = 'Unique constraint violation.';
            details = fieldErrors;
            statusCode = 409;
        } else {
            const fieldErrors = error.errors.map((err) => {
                if (err.path === 'slug') {
                    return {
                        field: 'slug',
                        value: err.value,
                        message: 'This URL address is already taken.',
                    };
                }
                return {
                    field: err.path,
                    value: err.value,
                    message: `${err.path.charAt(0).toUpperCase() + err.path.slice(1)} '${err.value}' is already taken.`,
                };
            });
            message = 'Unique constraint violation.';
            details = fieldErrors;
            statusCode = 409;
        }
    } else if (error instanceof ForeignKeyConstraintError || error instanceof DatabaseError) {
        const dbError = dbErrors[error.original?.code];
        if (dbError) {
            message = dbError.message;
            statusCode = dbError.statusCode;
            details = error.message;
        }
    } else if (error instanceof ValidationError) {
        const validationErrors = error.errors.map((err) => ({
            message: err.message,
            path: err.path,
            value: err.value,
        }));
        message = 'Validation error(s)';
        details = validationErrors;
        statusCode = 400;
    } else if (error instanceof TokenExpiredError) {
        message = 'Your session has expired. Please log in again.';
        statusCode = 401;
    }

    console.log(`Error: ${req.method} >> ${req.baseUrl}${req.path} >> Message: ${message} >> Status Code: ${statusCode} >> Details:`, details);

    return res.status(statusCode).json({ message, statusCode, details });
}

const dbErrors = {
    23503: { message: 'Foreign key violation', statusCode: 409 },
    23502: { message: 'Not null violation', statusCode: 400 },
    23514: { message: 'Check violation', statusCode: 400 },
    22001: { message: 'String data right truncation', statusCode: 400 },
    22003: { message: 'Numeric value out of range', statusCode: 400 },
    42601: { message: 'Syntax error', statusCode: 400 },
    42883: { message: 'Undefined function', statusCode: 500 },
    42501: { message: 'Permission denied', statusCode: 403 },
    '22P02': { message: 'Invalid text representation', statusCode: 400 },
};

module.exports = errorHandler;
