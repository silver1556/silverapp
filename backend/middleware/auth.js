/**
 * Enhanced Authentication Middleware
 * Comprehensive JWT token verification and user authentication with security improvements
 */

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const { AppError, AuthenticationError, AuthorizationError } = require('../errors/AppError');
const { TokenManager } = require('../utils/security');
const { logger, loggerUtils } = require('../config/logger');
const redisService = require('../services/redis');
const config = require('../config/env');

/**
 * Enhanced JWT token verification and user authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    // 1) Get token from header or cookie
    let token;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      logger.warn('Authentication attempt without token:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });
      return next(new AuthenticationError('Access token required'));
    }

    // 2) Verify token format and structure
    if (token.split('.').length !== 3) {
      logger.warn('Invalid token format:', {
        ip: req.ip,
        tokenLength: token.length,
        url: req.originalUrl
      });
      return next(new AuthenticationError('Invalid token format'));
    }

    // 3) Verify token signature and decode
    let decoded;
    try {
      decoded = TokenManager.verifyAccessToken(token);
    } catch (error) {
      logger.warn('Token verification failed:', {
        error: error.name,
        message: error.message,
        ip: req.ip,
        url: req.originalUrl
      });
      
      if (error.name === 'TokenExpiredError') {
        return next(new AuthenticationError('Access token expired'));
      }
      return next(new AuthenticationError('Invalid access token'));
    }

    // 4) Check if token is blacklisted
    const isBlacklisted = await checkTokenBlacklist(token);
    if (isBlacklisted) {
      logger.warn('Blacklisted token used:', {
        userId: decoded.userId,
        ip: req.ip,
        url: req.originalUrl
      });
      return next(new AuthenticationError('Token has been revoked'));
    }

    // 5) Check if user still exists and is active
    const user = await User.findByPk(decoded.userId, {
      attributes: [
        'id', 'username', 'email', 'phone_number', 'first_name', 'last_name',
        'is_active', 'is_verified', 'phone_verified', 'email_verified',
        'last_login', 'password_changed_at', 'role', 'created_at'
      ]
    });

    if (!user) {
      logger.warn('Token for non-existent user:', {
        userId: decoded.userId,
        ip: req.ip,
        url: req.originalUrl
      });
      return next(new AuthenticationError('User no longer exists'));
    }

    // 6) Check if user account is active
    if (!user.is_active) {
      logger.warn('Inactive user authentication attempt:', {
        userId: user.id,
        username: user.username,
        ip: req.ip,
        url: req.originalUrl
      });
      return next(new AuthenticationError('User account is deactivated'));
    }

    // 7) Check if user changed password after token was issued
    if (user.password_changed_at) {
      const passwordChangedTimestamp = Math.floor(user.password_changed_at.getTime() / 1000);
      if (decoded.iat < passwordChangedTimestamp) {
        logger.warn('Token issued before password change:', {
          userId: user.id,
          tokenIat: decoded.iat,
          passwordChanged: passwordChangedTimestamp,
          ip: req.ip
        });
        return next(new AuthenticationError('Password recently changed. Please log in again'));
      }
    }

    // 8) Check token age and require re-authentication for sensitive operations
    const tokenAge = Date.now() / 1000 - decoded.iat;
    const maxTokenAge = 24 * 60 * 60; // 24 hours
    
    if (tokenAge > maxTokenAge) {
      logger.warn('Token too old for sensitive operation:', {
        userId: user.id,
        tokenAge: Math.floor(tokenAge / 3600),
        ip: req.ip,
        url: req.originalUrl
      });
      
      // For sensitive operations, require fresh authentication
      const sensitiveEndpoints = ['/change-password', '/delete-account', '/payment'];
      if (sensitiveEndpoints.some(endpoint => req.originalUrl.includes(endpoint))) {
        return next(new AuthenticationError('Please re-authenticate for this operation'));
      }
    }

    // 9) Update user's last activity
    await updateUserActivity(user.id, req.ip, req.get('User-Agent'));

    // 10) Grant access to protected route
    req.user = user;
    req.token = token;
    req.tokenDecoded = decoded;

    // Log successful authentication
    loggerUtils.logAuth('token_verified', user.id, req.ip, {
      userAgent: req.get('User-Agent'),
      tokenType: 'access',
      url: req.originalUrl,
      method: req.method
    });

    next();
  } catch (error) {
    logger.error('Authentication middleware error:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      url: req.originalUrl
    });
    return next(new AuthenticationError('Authentication failed'));
  }
};

/**
 * Enhanced optional authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Get token from header or cookie
    let token;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(); // Continue without authentication
    }

    // Verify token
    let decoded;
    try {
      decoded = TokenManager.verifyAccessToken(token);
    } catch (error) {
      logger.debug('Optional auth token verification failed:', {
        error: error.name,
        ip: req.ip
      });
      return next(); // Continue without authentication if token is invalid
    }

    // Check if token is blacklisted
    const isBlacklisted = await checkTokenBlacklist(token);
    if (isBlacklisted) {
      return next(); // Continue without authentication
    }

    // Check if user exists and is active
    const user = await User.findByPk(decoded.userId, {
      attributes: [
        'id', 'username', 'email', 'phone_number', 'first_name', 'last_name',
        'is_active', 'is_verified', 'phone_verified', 'role'
      ]
    });

    if (user && user.is_active) {
      req.user = user;
      req.token = token;
      req.tokenDecoded = decoded;
      
      // Update user activity for authenticated optional requests
      await updateUserActivity(user.id, req.ip, req.get('User-Agent'));
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error:', {
      error: error.message,
      ip: req.ip
    });
    next(); // Continue without authentication on error
  }
};

/**
 * Enhanced role-based authorization middleware
 * @param {...string} roles - Required roles
 * @returns {Function} Middleware function
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Role check without authentication:', {
        requiredRoles: roles,
        ip: req.ip,
        url: req.originalUrl
      });
      return next(new AuthenticationError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Insufficient role permissions:', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        ip: req.ip,
        url: req.originalUrl
      });
      return next(new AuthorizationError('Insufficient permissions'));
    }

    logger.debug('Role authorization successful:', {
      userId: req.user.id,
      userRole: req.user.role,
      requiredRoles: roles
    });

    next();
  };
};

/**
 * Enhanced ownership verification middleware
 * @param {string} resourceUserIdField - Field name containing the user ID in request params/body
 * @returns {Function} Middleware function
 */
const requireOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    const resourceUserId = req.params[resourceUserIdField] || 
                          req.body[resourceUserIdField] || 
                          req.query[resourceUserIdField];
    
    if (!resourceUserId) {
      logger.warn('Ownership check without resource user ID:', {
        field: resourceUserIdField,
        userId: req.user.id,
        url: req.originalUrl
      });
      return next(new AuthorizationError('Resource user ID not provided'));
    }

    if (req.user.id !== resourceUserId && req.user.role !== 'admin') {
      logger.warn('Ownership violation:', {
        userId: req.user.id,
        resourceUserId,
        userRole: req.user.role,
        ip: req.ip,
        url: req.originalUrl
      });
      return next(new AuthorizationError('Access denied'));
    }

    next();
  };
};

/**
 * Enhanced phone number ownership verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyPhoneOwnership = async (req, res, next) => {
  try {
    const { phone_number } = req.body;
    
    if (!phone_number) {
      return next(new AppError('Phone number is required', 400));
    }

    // Check if phone number belongs to authenticated user
    if (req.user && req.user.phone_number !== phone_number) {
      logger.warn('Phone ownership violation:', {
        userId: req.user.id,
        userPhone: req.user.phone_number?.substring(0, 3) + '***',
        requestedPhone: phone_number.substring(0, 3) + '***',
        ip: req.ip
      });
      return next(new AuthorizationError('Phone number does not belong to authenticated user'));
    }

    next();
  } catch (error) {
    logger.error('Phone ownership verification error:', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });
    return next(new AppError('Phone verification failed', 500));
  }
};

/**
 * Enhanced rate limiting for authentication endpoints
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @param {Function} keyGenerator - Function to generate rate limit key
 * @returns {Function} Middleware function
 */
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000, keyGenerator = null) => {
  return async (req, res, next) => {
    try {
      if (!redisService.isReady()) {
        logger.warn('Redis not available for rate limiting');
        return next(); // Skip rate limiting if Redis is not available
      }

      // Generate rate limit key
      let key;
      if (keyGenerator && typeof keyGenerator === 'function') {
        key = keyGenerator(req);
      } else {
        const identifier = req.body.phone_number || req.body.username || req.ip;
        key = `auth_rate_limit:${identifier}`;
      }

      // Check current attempts
      const current = await redisService.incr(key);
      
      if (current === 1) {
        await redisService.expire(key, Math.ceil(windowMs / 1000));
      }

      if (current > maxAttempts) {
        const ttl = await redisService.ttl(key);
        
        loggerUtils.logSecurity('rate_limit_exceeded', req.ip, {
          endpoint: req.originalUrl,
          attempts: current,
          maxAttempts,
          resetTime: new Date(Date.now() + (ttl * 1000)),
          identifier: req.body.phone_number || req.body.username || 'unknown'
        });

        return res.status(429).json({
          status: 'error',
          message: 'Too many authentication attempts',
          retryAfter: ttl,
          maxAttempts,
          resetTime: new Date(Date.now() + (ttl * 1000))
        });
      }

      // Add rate limit info to request
      req.rateLimit = {
        current,
        remaining: Math.max(0, maxAttempts - current),
        resetTime: new Date(Date.now() + windowMs)
      };

      next();
    } catch (error) {
      logger.error('Auth rate limiting error:', {
        error: error.message,
        ip: req.ip
      });
      next(); // Continue without rate limiting on error
    }
  };
};

/**
 * Enhanced refresh token validation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AuthenticationError('Refresh token required'));
    }

    // Verify refresh token format
    if (refreshToken.split('.').length !== 3) {
      return next(new AuthenticationError('Invalid refresh token format'));
    }

    // Verify refresh token signature
    let decoded;
    try {
      decoded = TokenManager.verifyRefreshToken(refreshToken);
    } catch (error) {
      logger.warn('Refresh token verification failed:', {
        error: error.name,
        ip: req.ip
      });
      return next(new AuthenticationError('Invalid refresh token'));
    }

    // Check if token is blacklisted
    const isBlacklisted = await checkTokenBlacklist(refreshToken);
    if (isBlacklisted) {
      return next(new AuthenticationError('Refresh token has been revoked'));
    }

    // Check if user exists
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'username', 'is_active', 'refresh_token', 'refresh_token_expires']
    });

    if (!user) {
      return next(new AuthenticationError('User no longer exists'));
    }

    if (!user.is_active) {
      return next(new AuthenticationError('User account is deactivated'));
    }

    // Check if stored refresh token matches
    if (user.refresh_token !== refreshToken) {
      logger.warn('Refresh token mismatch:', {
        userId: user.id,
        ip: req.ip
      });
      return next(new AuthenticationError('Invalid refresh token'));
    }

    // Check if refresh token is expired
    if (user.refresh_token_expires && new Date() > user.refresh_token_expires) {
      logger.warn('Expired refresh token used:', {
        userId: user.id,
        expiredAt: user.refresh_token_expires,
        ip: req.ip
      });
      return next(new AuthenticationError('Refresh token expired'));
    }

    req.user = user;
    req.refreshToken = refreshToken;

    next();
  } catch (error) {
    logger.error('Refresh token validation error:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    return next(new AuthenticationError('Refresh token validation failed'));
  }
};

/**
 * Enhanced token blacklist checking
 * @param {string} token - JWT token
 * @returns {Promise<boolean>} Whether token is blacklisted
 */
const checkTokenBlacklist = async (token) => {
  try {
    if (!redisService.isReady()) {
      logger.warn('Redis not available for token blacklist check');
      return false; // Assume token is valid if Redis is not available
    }

    const key = `blacklisted_token:${token}`;
    return await redisService.exists(key);
  } catch (error) {
    logger.error('Token blacklist check error:', {
      error: error.message,
      tokenLength: token?.length
    });
    return false; // Assume token is valid on error
  }
};

/**
 * Enhanced token blacklisting
 * @param {string} token - JWT token to blacklist
 * @param {number} expiresIn - Token expiration time in seconds
 */
const blacklistToken = async (token, expiresIn = null) => {
  try {
    if (!redisService.isReady()) {
      logger.warn('Redis not available for token blacklisting');
      return;
    }

    const key = `blacklisted_token:${token}`;
    
    if (expiresIn) {
      await redisService.set(key, 'blacklisted', expiresIn);
    } else {
      // Decode token to get expiration time
      const decoded = TokenManager.decodeToken(token);
      if (decoded && decoded.payload.exp) {
        const ttl = decoded.payload.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await redisService.set(key, 'blacklisted', ttl);
        }
      } else {
        // Default to 24 hours if we can't determine expiration
        await redisService.set(key, 'blacklisted', 86400);
      }
    }

    logger.info('Token blacklisted successfully');
  } catch (error) {
    logger.error('Token blacklisting error:', {
      error: error.message,
      tokenLength: token?.length
    });
  }
};

/**
 * Update user activity tracking
 * @param {string} userId - User ID
 * @param {string} ip - IP address
 * @param {string} userAgent - User agent string
 */
const updateUserActivity = async (userId, ip, userAgent) => {
  try {
    if (!redisService.isReady()) {
      return;
    }

    const activityKey = `user_activity:${userId}`;
    const activityData = {
      lastSeen: new Date().toISOString(),
      ip: ip,
      userAgent: userAgent,
      timestamp: Date.now()
    };

    await redisService.set(activityKey, activityData, 86400); // 24 hours TTL
  } catch (error) {
    logger.error('Failed to update user activity:', {
      error: error.message,
      userId
    });
  }
};

/**
 * Enhanced logout with comprehensive token cleanup
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const logout = async (req, res, next) => {
  try {
    const token = req.token;
    const user = req.user;

    if (token) {
      // Blacklist the access token
      await blacklistToken(token);
    }

    if (user && user.refresh_token) {
      // Blacklist the refresh token
      await blacklistToken(user.refresh_token);
      
      // Clear refresh token from database
      await user.update({
        refresh_token: null,
        refresh_token_expires: null
      });
    }

    // Clear activity tracking
    if (redisService.isReady() && user) {
      await redisService.del(`user_activity:${user.id}`);
    }

    // Log logout event
    loggerUtils.logAuth('logout', user?.id || 'unknown', req.ip, {
      userAgent: req.get('User-Agent'),
      method: 'manual'
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });
    return next(new AppError('Logout failed', 500));
  }
};

/**
 * Enhanced device-specific authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireDeviceAuth = async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'];
    const deviceFingerprint = req.headers['x-device-fingerprint'];

    if (!deviceId) {
      return next(new AuthenticationError('Device ID required'));
    }

    // Verify device is registered for this user
    if (redisService.isReady()) {
      const deviceKey = `user_device:${req.user.id}:${deviceId}`;
      const deviceData = await redisService.get(deviceKey, true);

      if (!deviceData) {
        logger.warn('Unregistered device access attempt:', {
          userId: req.user.id,
          deviceId: deviceId.substring(0, 8) + '...',
          ip: req.ip
        });
        return next(new AuthorizationError('Device not registered'));
      }

      // Update device last seen
      deviceData.lastSeen = new Date().toISOString();
      deviceData.ip = req.ip;
      await redisService.set(deviceKey, deviceData, 86400 * 30); // 30 days
    }

    req.deviceId = deviceId;
    req.deviceFingerprint = deviceFingerprint;

    next();
  } catch (error) {
    logger.error('Device authentication error:', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });
    return next(new AppError('Device authentication failed', 500));
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requireOwnership,
  verifyPhoneOwnership,
  authRateLimit,
  validateRefreshToken,
  checkTokenBlacklist,
  blacklistToken,
  logout,
  requireDeviceAuth,
  updateUserActivity
};