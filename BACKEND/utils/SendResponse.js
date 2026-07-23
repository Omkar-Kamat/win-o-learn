/**
 * File: SendResponse.js
 * Description: Implementation of SendResponse.js
 */

// Performs the send response operation
const sendResponse = (res, statusCode, success, message, data = null) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
    });
};


export default sendResponse;
