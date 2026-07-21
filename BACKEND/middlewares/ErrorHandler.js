const ErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;

    const field = Object.keys(err.keyValue)[0];

    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Mongoose Validation Error
  else if (err.name === "ValidationError") {
    statusCode = 400;

    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  // Invalid Mongo ObjectId
  else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  // JWT Errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }

  const response = {
    success: false, 
    message,
    errors: err.errors || null,
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default ErrorHandler;