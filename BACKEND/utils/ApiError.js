class ApiError extends Error {
    constructor(statusCode, message, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
export default ApiError;
