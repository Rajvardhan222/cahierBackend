import { ApiError } from "./ApiError.js";

export const errorHandler = (err, req, res, next) => {
    // If the error is an instance of ApiError, use its properties
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        message: err.message,
        errors: err.errors,
        success: err.success,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      });
    }
  
    // For other errors, send a generic error response
    res.status(500).json({
      message:'An unexpected error occurred',
      success: false,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  };