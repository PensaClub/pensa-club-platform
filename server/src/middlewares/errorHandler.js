const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } = require("sequelize");
const CustomError = require("../utils/customError");

function errorHandler(error, req, res, next) {
  let message = "Something went wrong!";
  let statusCode = error.statusCode || 500;
  let details = error.details;
  if (error instanceof CustomError) {
    message = error.message;
  } else if (error instanceof UniqueConstraintError || error instanceof ForeignKeyConstraintError || error instanceof DatabaseError) {
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
    message = "Validation error(s)";
    details = validationErrors;
    statusCode = 400;
  }

  console.log(`Error: ${req.method} >> ${req.baseUrl}`, error.message);
  res.status(statusCode).json({ message, statusCode, details });
}

const dbErrors = {
  23505: { message: "Unique constraint violation", statusCode: 409 },
  23503: { message: "Foreign key violation", statusCode: 409 },
  23502: { message: "Not null violation", statusCode: 400 },
  23514: { message: "Check violation", statusCode: 400 },
  22001: { message: "String data right truncation", statusCode: 400 },
  22003: { message: "Numeric value out of range", statusCode: 400 },
  42601: { message: "Syntax error", statusCode: 400 },
  42883: { message: "Undefined function", statusCode: 500 },
  42501: { message: "Permission denied", statusCode: 403 },
  "22P02": { message: "Invalid text representation", statusCode: 400 },
};

module.exports = errorHandler;
