/**
 * File: AsyncHandler.js
 * Description: Implementation of AsyncHandler.js
 */

// Performs the async handler operation
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};


export default asyncHandler;
