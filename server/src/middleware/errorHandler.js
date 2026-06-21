function errorHandler(error, request, response, next) {
  let status = error.status || 500;
  let message = status >= 500 ? 'Something went wrong. Please try again shortly.' : error.message;
  let details = error.details;

  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Submitted data is invalid.';
    details = Object.fromEntries(Object.entries(error.errors).map(([field, fieldError]) => [field, fieldError.message]));
  }

  if (error.name === 'CastError') {
    status = 400;
    message = `Invalid ${error.path || 'identifier'}.`;
  }

  if (error.code === 11000) {
    status = 409;
    message = 'A record with this value already exists.';
    details = error.keyValue;
  }

  const payload = {
    message
  };

  if (details) payload.details = details;
  if (process.env.NODE_ENV !== 'production' && status >= 500) payload.debug = error.message;

  response.status(status).json(payload);
}

module.exports = { errorHandler };
