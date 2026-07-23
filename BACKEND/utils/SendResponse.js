// Dispatches and sends response. 
const sendResponse = (res, statusCode, success, message, data = null) => res.status(statusCode).json({
  success: success,
  message: message,
  data: data
});
export default sendResponse;