function errorHandler(error, req, res, next) {
  let message = "Something went wrong!";
  let statusCode = error.statusCode || 500;
  let details = error.details;
  if (error instanceof CustomError) {
    message = error.message;
  }

  console.log(`Error: ${req.method} >> ${req.baseUrl}`, error);
  res.status(statusCode).json({ message, statusCode, details });
}

module.exports = errorHandler;
