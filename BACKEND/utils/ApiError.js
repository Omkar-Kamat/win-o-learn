/**
 * File: ApiError.js
 * Description: Implementation of ApiError.js
 */
class ApiError extends Error {
    // Performs the constructor operation
    constructor(statusCode, message, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}


export default ApiError;
