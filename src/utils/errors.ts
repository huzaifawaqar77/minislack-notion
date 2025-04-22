/**
 * Custom API error class
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle API errors
 * @param error - The error to handle
 * @param defaultMessage - Default message to use if error is not an ApiError
 * @returns Object with status code and message
 */
export function handleApiError(error: any, defaultMessage = 'An unexpected error occurred') {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      message: error.message
    };
  }
  
  console.error('Unhandled error:', error);
  return {
    statusCode: 500,
    message: defaultMessage
  };
}
