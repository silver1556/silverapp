/**
 * Enhanced Global Error Handler Middleware
 * Comprehensive error handling with security-focused logging and response formatting
 */

const { logger } = require('../config/logger');
const { AppError } = require('./AppError');
const config = require('../config/env');

/**
 * Enhanced Sequelize validation error handler
 * @param {Error} err - Sequelize validation error
 * @returns {AppError} Formatted application error
 */
const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map(error => ({
    field: error.path,
    message: error.message,
    value: error.value,
    type: error.validatorKey
  }));
  
  const message = `Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`;
  
  // Log detailed error for debugging
  logger.warn('Sequelize validation error:', {
    errors,
    model: err.model?.name,
    sql: err.sql
  });
  
  return new AppError(message, 400);
};

/**
 * Enhanced Sequelize unique constraint error handler
 * @param {Error} err - Sequelize unique constraint error
 * @returns {AppError} Formatted application error
 */
const handleSequelizeUniqueConstraintError = (err) => {
  const field = err.errors[0]?.path;
  const value = err.errors[0]?.value;
  
  // Don't expose the actual value in the error message for security
  const message = field ? `${field} already exists` : 'Duplicate entry detected';
  
  logger.warn('Unique constraint violation:', {
    field,
    table: err.table,
    constraint: err.parent?.constraint,
    // Don't log the actual value for security
    hasValue: !!value
  });
  
  return new AppError(message, 409);
};

/**
 * Enhanced Sequelize foreign key constraint error handler
 * @param {Error} err - Sequelize foreign key constraint error
 * @returns {AppError} Formatted application error
 */
const handleSequelizeForeignKeyConstraintError = (err) => {
  const message = 'Invalid reference to related resource';
  
  logger.warn('Foreign key constraint violation:', {
    table: err.table,
    constraint: err.parent?.constraint,
    detail: err.parent?.detail
  });
  
  return new AppError(message, 400);
};

/**
 * Enhanced JWT error handler
 * @param {Error} err - JWT error
 * @returns {AppError} Formatted application error
 */
const handleJWTError = (err) => {
  let message = 'Authentication failed';
  let statusCode = 401;
  
  switch (err.name) {
    case 'JsonWebTokenError':
      message = 'Invalid token';
      break;
    case 'TokenExpiredError':
      message = 'Token expired';
      break;
    case 'NotBeforeError':
      message = 'Token not active';
      break;
    default:
      message = 'Authentication failed';
  }
  
  logger.warn('JWT error:', {
    name: err.name,
    message: err.message,
    expiredAt: err.expiredAt
  });
  
  return new AppError(message, statusCode);
};

/**
 * Enhanced Multer error handler (file upload)
 * @param {Error} err - Multer error
 * @returns {AppError} Formatted application error
 */
const handleMulterError = (err) => {
  let message = 'File upload error';
  let statusCode = 400;
  
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File too large';
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected file field';
      break;
    case 'LIMIT_PART_COUNT':
      message = 'Too many parts';
      break;
    case 'LIMIT_FIELD_KEY':
      message = 'Field name too long';
      break;
    case 'LIMIT_FIELD_VALUE':
      message = 'Field value too long';
      break;
    case 'LIMIT_FIELD_COUNT':
      message = 'Too many fields';
      break;
    default:
      message = 'File upload error';
  }
  
  logger.warn('File upload error:', {
    code: err.code,
    field: err.field,
    limit: err.limit
  });
  
  return new AppError(message, statusCode);
};

/**
 * Enhanced MongoDB/Database connection error handler
 * @param {Error} err - Database connection error
 * @returns {AppError} Formatted application error
 */
const handleDatabaseConnectionError = (err) => {
  logger.error('Database connection error:', {
    code: err.code,
    errno: err.errno,
    syscall: err.syscall,
    hostname: err.hostname,
    port: err.port
  });
  
  return new AppError('Database connection failed', 503);
};

/**
 * Enhanced Redis error handler
 * @param {Error} err - Redis error
 * @returns {AppError} Formatted application error
 */
const handleRedisError = (err) => {
  logger.error('Redis error:', {
    code: err.code,
    errno: err.errno,
    syscall: err.syscall,
    address: err.address,
    port: err.port
  });
  
  return new AppError('Cache service unavailable', 503);
};

/**
 * Enhanced rate limit error handler
 * @param {Error} err - Rate limit error
 * @returns {AppError} Formatted application error
 */
const handleRateLimitError = (err) => {
  logger.warn('Rate limit exceeded:', {
    ip: err.ip,
    limit: err.limit,
    current: err.current,
    resetTime: err.resetTime
  });
  
  return new AppError('Too many requests, please try again later', 429);
};

/**
 * Enhanced validation error handler
 * @param {Error} err - Validation error
 * @returns {AppError} Formatted application error
 */
const handleValidationError = (err) => {
  // Extract validation details if available
  const details = err.details || [];
  
  logger.warn('Validation error:', {
    message: err.message,
    details: details.map(d => ({
      field: d.path?.join('.'),
      message: d.message,
      type: d.type
    }))
  });
  
  return new AppError(err.message || 'Validation failed', 400);
};

/**
 * Send error response in development
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendErrorDev = (err, req, res) => {
  // Log full error details in development
  logger.error('Development error:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    body: req.body,
    query: req.query,
    params: req.params
  });

  res.status(err.statusCode).json({
    status: err.status,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
      statusCode: err.statusCode
    },
    request: {
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Send error response in production
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    // Log operational errors with context but without sensitive data
    logger.warn('Operational error:', {
      message: err.message,
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      timestamp: new Date().toISOString(),
      requestId: req.id || generateRequestId()
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('System error:', {
      error: err.message,
      stack: err.stack,
      name: err.name,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      timestamp: new Date().toISOString(),
      requestId: req.id || generateRequestId()
    });
  }
};

/**
 * Generate unique request ID for error tracking
 * @returns {string} Unique request ID
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Enhanced global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Generate request ID for tracking
  const requestId = req.id || generateRequestId();
  req.id = requestId;
  
  // Add request context to error
  err.requestContext = {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString(),
    requestId
  };
  
  if (config.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    
    // Handle specific error types
    if (err.name === 'SequelizeValidationError') {
      error = handleSequelizeValidationError(error);
    } else if (err.name === 'SequelizeUniqueConstraintError') {
      error = handleSequelizeUniqueConstraintError(error);
    } else if (err.name === 'SequelizeForeignKeyConstraintError') {
      error = handleSequelizeForeignKeyConstraintError(error);
    } else if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
      error = handleDatabaseConnectionError(error);
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError') {
      error = handleJWTError(error);
    } else if (err.name === 'MulterError') {
      error = handleMulterError(error);
    } else if (err.name === 'RedisError' || err.code === 'ECONNREFUSED' && err.port === config.redis.port) {
      error = handleRedisError(error);
    } else if (err.name === 'ValidationError') {
      error = handleValidationError(error);
    } else if (err.statusCode === 429) {
      error = handleRateLimitError(error);
    }
    
    sendErrorProd(error, req, res);
  }
};

/**
 * Enhanced unhandled promise rejection handler
 */
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', {
    error: err.message,
    stack: err.stack,
    name: err.name,
    promise: promise.toString(),
    timestamp: new Date().toISOString()
  });
  
  // Close server & exit process in production
  if (config.NODE_ENV === 'production') {
    process.exit(1);
  }
});

/**
 * Enhanced uncaught exception handler
 */
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', {
    error: err.message,
    stack: err.stack,
    name: err.name,
    timestamp: new Date().toISOString()
  });
  
  // Close server & exit process
  process.exit(1);
});

/**
 * Handle SIGTERM gracefully
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  process.exit(0);
});

/**
 * Handle SIGINT gracefully
 */
process.on('SIGINT', () => {
  logger.info('SIGINT received. Starting graceful shutdown...');
  process.exit(0);
});

module.exports = globalErrorHandler;