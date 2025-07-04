/**
 * Enhanced Authentication Controller
 * Comprehensive authentication with improved security, error handling, and logging
 */

const bcrypt = require('bcryptjs');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError, ValidationError, AuthenticationError } = require('../errors/AppError');
const { TokenManager } = require('../utils/security');
const { generateNumericCode, removeSensitiveFields } = require('../utils/helpers');
const { logger, loggerUtils } = require('../config/logger');
const smsService = require('../services/sms');
const redisService = require('../services/redis');
const User = require('../models/User');
const config = require('../config/env');

/**
 * Enhanced user registration with comprehensive validation and security
 * @route POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res, next) => {
  const {
    username,
    phone_number,
    email,
    password,
    first_name,
    last_name,
    date_of_birth,
    gender,
    terms_accepted,
    privacy_accepted
  } = req.body;

  try {
    // Enhanced duplicate check with detailed error messages
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Sequelize.Op.or]: [
          { username: username.toLowerCase() },
          { phone_number },
          { phone_number: `+86${phone_number}` },
          ...(email ? [{ email: email.toLowerCase() }] : [])
        ]
      },
      attributes: ['id', 'username', 'phone_number', 'email']
    });

    if (existingUser) {
      let conflictField = '';
      if (existingUser.username === username.toLowerCase()) {
        conflictField = 'Username';
      } else if (existingUser.phone_number === phone_number || existingUser.phone_number === `+86${phone_number}`) {
        conflictField = 'Phone number';
      } else if (email && existingUser.email === email.toLowerCase()) {
        conflictField = 'Email';
      }
      
      logger.warn('Registration attempt with existing data:', {
        conflictField,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return next(new ValidationError(`${conflictField} is already registered`));
    }

    // Create new user with enhanced data
    const userData = {
      username: username.toLowerCase(),
      phone_number: phone_number.startsWith('+86') ? phone_number : `+86${phone_number}`,
      password_hash: password, // Will be hashed by model hook
      first_name,
      last_name,
      date_of_birth,
      gender,
      last_ip: req.ip,
      last_user_agent: req.get('User-Agent')
    };

    if (email) {
      userData.email = email.toLowerCase();
    }

    const user = await User.create(userData);

    // Generate verification code with enhanced security
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // Send verification SMS with error handling
    const smsResult = await smsService.sendVerificationCode(user.phone_number, verificationCode);
    
    if (!smsResult.success) {
      logger.error('Failed to send verification SMS during registration:', {
        userId: user.id,
        phone: user.phone_number.substring(0, 3) + '***',
        error: smsResult.error
      });
      // Don't fail registration if SMS fails, user can request new code
    }

    // Log successful registration
    loggerUtils.logAuth('register', user.id, req.ip, {
      username: user.username,
      phone: user.phone_number.substring(0, 3) + '***',
      smsResult: smsResult.success,
      userAgent: req.get('User-Agent')
    });

    // Track registration in Redis for analytics
    if (redisService.isReady()) {
      try {
        await redisService.incr('stats:registrations:total');
        await redisService.incr(`stats:registrations:${new Date().toISOString().split('T')[0]}`);
      } catch (error) {
        logger.error('Failed to track registration stats:', error);
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please verify your phone number.',
      data: {
        user: removeSensitiveFields(user.toJSON()),
        verification_required: true,
        sms_sent: smsResult.success
      }
    });

  } catch (error) {
    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path;
      logger.warn('Registration unique constraint violation:', {
        field,
        ip: req.ip
      });
      return next(new ValidationError(`${field} is already registered`));
    }
    
    logger.error('Registration error:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    throw error;
  }
});

/**
 * Enhanced login with comprehensive security measures
 * @route POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res, next) => {
  const { identifier, password } = req.body;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    // Find user by username or phone number
    const user = await User.findByIdentifier(identifier);
    
    if (!user) {
      loggerUtils.logSecurity('failed_login_attempt', ip, {
        identifier: identifier.substring(0, 3) + '***',
        reason: 'user_not_found',
        userAgent
      });
      return next(new AuthenticationError('Invalid credentials'));
    }

    // Check if account is locked
    if (user.isLocked()) {
      loggerUtils.logSecurity('locked_account_login_attempt', ip, {
        userId: user.id,
        lockedUntil: user.locked_until,
        userAgent
      });
      return next(new AuthenticationError('Account is temporarily locked. Please try again later.'));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment failed attempts
      await user.incrementFailedAttempts();
      
      loggerUtils.logSecurity('failed_login_attempt', ip, {
        userId: user.id,
        reason: 'invalid_password',
        failedAttempts: user.failed_login_attempts,
        userAgent
      });
      
      return next(new AuthenticationError('Invalid credentials'));
    }

    // Check if user is active
    if (!user.is_active) {
      loggerUtils.logSecurity('inactive_account_login_attempt', ip, {
        userId: user.id,
        userAgent
      });
      return next(new AuthenticationError('Account is deactivated'));
    }

    // Check if phone is verified
    if (!user.phone_verified) {
      logger.warn('Unverified phone login attempt:', {
        userId: user.id,
        phone: user.phone_number.substring(0, 3) + '***',
        ip
      });
      return next(new AuthenticationError('Phone number not verified. Please verify your phone number first.'));
    }

    // Generate tokens with enhanced payload
    const tokenPayload = { 
      userId: user.id, 
      username: user.username,
      role: user.role,
      verified: user.is_verified
    };
    const tokens = TokenManager.generateTokenPair(tokenPayload);

    // Update user login information
    user.refresh_token = tokens.refreshToken;
    user.refresh_token_expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.updateLastLogin(ip, userAgent);

    // Log successful login
    loggerUtils.logAuth('login', user.id, ip, {
      method: 'password',
      userAgent,
      loginCount: user.login_count
    });

    // Track login in Redis for analytics
    if (redisService.isReady()) {
      try {
        await redisService.incr('stats:logins:total');
        await redisService.incr(`stats:logins:${new Date().toISOString().split('T')[0]}`);
        await redisService.set(`user_last_login:${user.id}`, new Date().toISOString(), 86400 * 7);
      } catch (error) {
        logger.error('Failed to track login stats:', error);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: removeSensitiveFields(user.toJSON()),
        tokens,
        session_info: {
          login_time: new Date().toISOString(),
          expires_in: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', {
      error: error.message,
      stack: error.stack,
      identifier: identifier.substring(0, 3) + '***',
      ip,
      userAgent
    });
    throw error;
  }
});

/**
 * Enhanced OTP login with security improvements
 * @route POST /api/v1/auth/login-otp
 */
const loginWithOTP = asyncHandler(async (req, res, next) => {
  const { phone_number, verification_code } = req.body;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    // Find user by phone number
    const user = await User.findByPhoneNumber(phone_number);
    
    if (!user) {
      loggerUtils.logSecurity('failed_otp_login', ip, {
        phone: phone_number.substring(0, 3) + '***',
        reason: 'user_not_found',
        userAgent
      });
      return next(new AuthenticationError('User not found'));
    }

    // Check if account is locked
    if (user.isLocked()) {
      loggerUtils.logSecurity('locked_account_otp_attempt', ip, {
        userId: user.id,
        lockedUntil: user.locked_until,
        userAgent
      });
      return next(new AuthenticationError('Account is temporarily locked. Please try again later.'));
    }

    // Check if user is active
    if (!user.is_active) {
      loggerUtils.logSecurity('inactive_account_otp_attempt', ip, {
        userId: user.id,
        userAgent
      });
      return next(new AuthenticationError('Account is deactivated'));
    }

    // Verify OTP with enhanced security
    if (!user.verifyCode(verification_code)) {
      // Increment failed attempts for OTP as well
      await user.incrementFailedAttempts();
      
      loggerUtils.logSecurity('failed_otp_login', ip, {
        userId: user.id,
        phone: phone_number.substring(0, 3) + '***',
        reason: 'invalid_code',
        failedAttempts: user.failed_login_attempts,
        userAgent
      });
      return next(new AuthenticationError('Invalid or expired verification code'));
    }

    // Clear verification code and reset failed attempts
    user.clearVerificationCode();
    user.failed_login_attempts = 0;
    
    // Mark phone as verified if not already
    if (!user.phone_verified) {
      user.phone_verified = true;
    }

    // Generate tokens
    const tokenPayload = { 
      userId: user.id, 
      username: user.username,
      role: user.role,
      verified: user.is_verified
    };
    const tokens = TokenManager.generateTokenPair(tokenPayload);

    // Update user login information
    user.refresh_token = tokens.refreshToken;
    user.refresh_token_expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.updateLastLogin(ip, userAgent);

    // Log successful OTP login
    loggerUtils.logAuth('login_otp', user.id, ip, {
      method: 'otp',
      userAgent,
      loginCount: user.login_count
    });

    // Track OTP login in Redis
    if (redisService.isReady()) {
      try {
        await redisService.incr('stats:otp_logins:total');
        await redisService.incr(`stats:otp_logins:${new Date().toISOString().split('T')[0]}`);
      } catch (error) {
        logger.error('Failed to track OTP login stats:', error);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: removeSensitiveFields(user.toJSON()),
        tokens,
        session_info: {
          login_time: new Date().toISOString(),
          expires_in: tokens.expiresIn,
          method: 'otp'
        }
      }
    });

  } catch (error) {
    logger.error('OTP login error:', {
      error: error.message,
      stack: error.stack,
      phone: phone_number.substring(0, 3) + '***',
      ip,
      userAgent
    });
    throw error;
  }
});

/**
 * Enhanced send login code with rate limiting
 * @route POST /api/v1/auth/send-login-code
 */
const sendLoginCode = asyncHandler(async (req, res, next) => {
  const { phone_number } = req.body;
  const ip = req.ip;

  try {
    // Find user by phone number
    const user = await User.findByPhoneNumber(phone_number);
    
    if (!user) {
      // Don't reveal if user exists or not for security
      logger.warn('Login code requested for non-existent user:', {
        phone: phone_number.substring(0, 3) + '***',
        ip
      });
      return res.status(200).json({
        status: 'success',
        message: 'If the phone number is registered, a login code will be sent'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      logger.warn('Login code requested for inactive user:', {
        userId: user.id,
        ip
      });
      return res.status(200).json({
        status: 'success',
        message: 'If the phone number is registered, a login code will be sent'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      logger.warn('Login code requested for locked user:', {
        userId: user.id,
        lockedUntil: user.locked_until,
        ip
      });
      return next(new AuthenticationError('Account is temporarily locked. Please try again later.'));
    }

    // Generate verification code
    try {
      const verificationCode = user.generateVerificationCode();
      await user.save();

      // Send login code SMS
      const smsResult = await smsService.sendLoginCode(user.phone_number, verificationCode);
      
      if (!smsResult.success) {
        logger.error('Failed to send login code SMS:', {
          userId: user.id,
          phone: user.phone_number.substring(0, 3) + '***',
          error: smsResult.error,
          ip
        });
        return next(new AppError('Failed to send verification code', 500));
      }

      // Log code sent event
      loggerUtils.logAuth('login_code_sent', user.id, ip, {
        phone: user.phone_number.substring(0, 3) + '***'
      });

      res.status(200).json({
        status: 'success',
        message: 'Login code sent successfully'
      });

    } catch (error) {
      if (error.message.includes('Too many verification attempts')) {
        return next(new AppError(error.message, 429));
      }
      throw error;
    }

  } catch (error) {
    logger.error('Send login code error:', {
      error: error.message,
      stack: error.stack,
      phone: phone_number.substring(0, 3) + '***',
      ip
    });
    throw error;
  }
});

/**
 * Enhanced phone verification with security improvements
 * @route POST /api/v1/auth/verify-phone
 */
const verifyPhone = asyncHandler(async (req, res, next) => {
  const { phone_number, verification_code } = req.body;
  const ip = req.ip;

  try {
    // Find user by phone number
    const user = await User.findByPhoneNumber(phone_number);
    
    if (!user) {
      loggerUtils.logSecurity('phone_verification_attempt_no_user', ip, {
        phone: phone_number.substring(0, 3) + '***'
      });
      return next(new AuthenticationError('User not found'));
    }

    // Verify code
    if (!user.verifyCode(verification_code)) {
      loggerUtils.logSecurity('failed_phone_verification', ip, {
        userId: user.id,
        phone: phone_number.substring(0, 3) + '***',
        reason: 'invalid_code',
        attempts: user.verification_attempts
      });
      return next(new AuthenticationError('Invalid or expired verification code'));
    }

    // Mark phone as verified
    user.phone_verified = true;
    user.clearVerificationCode();
    await user.save();

    // Log verification event
    loggerUtils.logAuth('phone_verified', user.id, ip, {
      phone: phone_number.substring(0, 3) + '***'
    });

    // Track phone verification in Redis
    if (redisService.isReady()) {
      try {
        await redisService.incr('stats:phone_verifications:total');
        await redisService.incr(`stats:phone_verifications:${new Date().toISOString().split('T')[0]}`);
      } catch (error) {
        logger.error('Failed to track phone verification stats:', error);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Phone number verified successfully',
      data: {
        user: removeSensitiveFields(user.toJSON())
      }
    });

  } catch (error) {
    logger.error('Phone verification error:', {
      error: error.message,
      stack: error.stack,
      phone: phone_number.substring(0, 3) + '***',
      ip
    });
    throw error;
  }
});

/**
 * Enhanced send verification code with improved rate limiting
 * @route POST /api/v1/auth/send-verification-code
 */
const sendVerificationCode = asyncHandler(async (req, res, next) => {
  const { phone_number } = req.body;
  const ip = req.ip;

  try {
    // Find user by phone number
    const user = await User.findByPhoneNumber(phone_number);
    
    if (!user) {
      logger.warn('Verification code requested for non-existent user:', {
        phone: phone_number.substring(0, 3) + '***',
        ip
      });
      return next(new AuthenticationError('User not found'));
    }

    // Generate verification code with rate limiting
    try {
      const verificationCode = user.generateVerificationCode();
      await user.save();

      // Send verification SMS
      const smsResult = await smsService.sendVerificationCode(user.phone_number, verificationCode);
      
      if (!smsResult.success) {
        logger.error('Failed to send verification SMS:', {
          userId: user.id,
          phone: user.phone_number.substring(0, 3) + '***',
          error: smsResult.error,
          ip
        });
        return next(new AppError('Failed to send verification code', 500));
      }

      // Log code sent event
      loggerUtils.logAuth('verification_code_sent', user.id, ip, {
        phone: user.phone_number.substring(0, 3) + '***'
      });

      res.status(200).json({
        status: 'success',
        message: 'Verification code sent successfully'
      });

    } catch (error) {
      if (error.message.includes('Too many verification attempts')) {
        return next(new AppError(error.message, 429));
      }
      throw error;
    }

  } catch (error) {
    logger.error('Send verification code error:', {
      error: error.message,
      stack: error.stack,
      phone: phone_number.substring(0, 3) + '***',
      ip
    });
    throw error;
  }
});

/**
 * Enhanced refresh token with security improvements
 * @route POST /api/v1/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    // Verify refresh token (validation done in middleware)
    const user = req.user;

    // Generate new tokens
    const tokenPayload = { 
      userId: user.id, 
      username: user.username,
      role: user.role,
      verified: user.is_verified
    };
    const tokens = TokenManager.generateTokenPair(tokenPayload);

    // Update stored refresh token
    user.refresh_token = tokens.refreshToken;
    user.refresh_token_expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    // Log token refresh
    loggerUtils.logAuth('token_refresh', user.id, ip, {
      userAgent
    });

    // Track token refresh in Redis
    if (redisService.isReady()) {
      try {
        await redisService.incr('stats:token_refreshes:total');
        await redisService.incr(`stats:token_refreshes:${new Date().toISOString().split('T')[0]}`);
      } catch (error) {
        logger.error('Failed to track token refresh stats:', error);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        tokens,
        session_info: {
          refresh_time: new Date().toISOString(),
          expires_in: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      ip,
      userAgent
    });
    throw error;
  }
});

/**
 * Enhanced forgot password with security improvements
 * @route POST /api/v1/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { phone_number } = req.body;
  const ip = req.ip;

  try {
    // Find user by phone number
    const user = await User.findByPhoneNumber(phone_number);
    
    if (!user) {
      // Don't reveal if user exists or not
      logger.warn('Password reset requested for non-existent user:', {
        phone: phone_number.substring(0, 3) + '***',
        ip
      });
      return res.status(200).json({
        status: 'success',
        message: 'If the phone number is registered, a reset code will be sent'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      logger.warn('Password reset requested for locked user:', {
        userId: user.id,
        lockedUntil: user.locked_until,
        ip
      });
      return res.status(200).json({
        status: 'success',
        message: 'If the phone number is registered, a reset code will be sent'
      });
    }

    // Generate verification code for password reset
    try {
      const verificationCode = user.generateVerificationCode();
      await user.save();

      // Send password reset SMS
      const smsResult = await smsService.sendPasswordResetCode(user.phone_number, verificationCode);
      
      if (!smsResult.success) {
        logger.error('Failed to send password reset SMS:', {
          userId: user.id,
          phone: user.phone_number.substring(0, 3) + '***',
          error: smsResult.error,
          ip
        });
      }

      // Log password reset request
      loggerUtils.logAuth('password_reset_requested', user.id, ip, {
        phone: user.phone_number.substring(0, 3) + '***'
      });

      res.status(200).json({
        status: 'success',
        message: 'If the phone number is registered, a reset code will be sent'
      });

    } catch (error) {
      if (error.message.includes('Too many verification attempts')) {
        return res.status(200).json({
          status: 'success',
          message: 'If the phone number is registered, a reset code will be sent'
        });
      }
      throw error;
    }

  } catch (error) {
    logger.error('Forgot password error:', {
      error: error.message,
      stack: error.stack,
      phone: phone_number.substring(0, 3) + '***',
      ip
    });
    throw error;
  }
});

/**
 * Enhanced reset password with security improvements
 * @route POST /api/v1/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res, next) => {
  const { phone_number, verification_code, new_password } = req.body;
  const ip = req.ip;

  try {
    // Find user by phone number
    const user = await User.findByPhoneNumber(phone_number);
    
    if (!user) {
      loggerUtils.logSecurity('password_reset_attempt_no_user', ip, {
        phone: phone_number.substring(0, 3) + '***'
      });
      return next(new AuthenticationError('User not found'));
    }

    // Verify code
    if (!user.verifyCode(verification_code)) {
      loggerUtils.logSecurity('failed_password_reset', ip, {
        userId: user.id,
        phone: phone_number.substring(0, 3) + '***',
        reason: 'invalid_code',
        attempts: user.verification_attempts
      });
      return next(new AuthenticationError('Invalid or expired verification code'));
    }

    // Update password
    user.password_hash = new_password; // Will be hashed by model hook
    user.clearVerificationCode();
    user.failed_login_attempts = 0; // Reset failed attempts
    user.locked_until = null; // Unlock account if locked
    
    // Invalidate all existing refresh tokens for security
    user.refresh_token = null;
    user.refresh_token_expires = null;
    
    await user.save();

    // Log password reset
    loggerUtils.logAuth('password_reset', user.id, ip, {
      phone: phone_number.substring(0, 3) + '***'
    });

    // Track password reset in Redis
    if (redisService.isReady()) {
      try {
        await redisService.incr('stats:password_resets:total');
        await redisService.incr(`stats:password_resets:${new Date().toISOString().split('T')[0]}`);
      } catch (error) {
        logger.error('Failed to track password reset stats:', error);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully'
    });

  } catch (error) {
    logger.error('Reset password error:', {
      error: error.message,
      stack: error.stack,
      phone: phone_number.substring(0, 3) + '***',
      ip
    });
    throw error;
  }
});

/**
 * Enhanced change password with security improvements
 * @route POST /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req, res, next) => {
  const { current_password, new_password } = req.body;
  const user = req.user;
  const ip = req.ip;

  try {
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(current_password);
    
    if (!isCurrentPasswordValid) {
      loggerUtils.logSecurity('failed_password_change', ip, {
        userId: user.id,
        reason: 'invalid_current_password'
      });
      return next(new AuthenticationError('Current password is incorrect'));
    }

    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(new_password);
    if (isSamePassword) {
      return next(new ValidationError('New password must be different from current password'));
    }

    // Update password
    user.password_hash = new_password; // Will be hashed by model hook and set password_changed_at
    
    // Keep current refresh token valid but invalidate others
    // This allows the current session to continue but forces re-login on other devices
    await user.save();

    // Log password change
    loggerUtils.logAuth('password_changed', user.id, ip, {
      userAgent: req.get('User-Agent')
    });

    // Track password change in Redis
    if (redisService.isReady()) {
      try {
        await redisService.incr('stats:password_changes:total');
        await redisService.incr(`stats:password_changes:${new Date().toISOString().split('T')[0]}`);
      } catch (error) {
        logger.error('Failed to track password change stats:', error);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change password error:', {
      error: error.message,
      stack: error.stack,
      userId: user.id,
      ip
    });
    throw error;
  }
});

/**
 * Enhanced get current user profile
 * @route GET /api/v1/auth/me
 */
const getMe = asyncHandler(async (req, res, next) => {
  const user = req.user;

  try {
    // Get fresh user data with additional fields
    const freshUser = await User.findByPk(user.id, {
      attributes: {
        exclude: [
          'password_hash', 'refresh_token', 'verification_code', 
          'password_reset_token', 'two_factor_secret', 'backup_codes'
        ]
      }
    });

    if (!freshUser) {
      return next(new AuthenticationError('User not found'));
    }

    res.status(200).json({
      status: 'success',
      message: 'User profile retrieved successfully',
      data: {
        user: freshUser,
        session_info: {
          login_count: freshUser.login_count,
          last_login: freshUser.last_login,
          account_created: freshUser.created_at,
          premium_status: freshUser.isPremiumActive()
        }
      }
    });

  } catch (error) {
    logger.error('Get user profile error:', {
      error: error.message,
      stack: error.stack,
      userId: user.id
    });
    throw error;
  }
});

/**
 * Enhanced logout with comprehensive cleanup
 * @route POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const token = req.token;
  const ip = req.ip;

  try {
    // Blacklist current access token
    if (token) {
      const { blacklistToken } = require('../middleware/auth');
      await blacklistToken(token);
    }

    // Clear refresh token
    user.refresh_token = null;
    user.refresh_token_expires = null;
    await user.save();

    // Clear user activity tracking
    if (redisService.isReady()) {
      try {
        await redisService.del(`user_activity:${user.id}`);
        await redisService.del(`user_last_login:${user.id}`);
      } catch (error) {
        logger.error('Failed to clear user activity on logout:', error);
      }
    }

    // Log logout
    loggerUtils.logAuth('logout', user.id, ip, {
      userAgent: req.get('User-Agent'),
      method: 'manual'
    });

    // Track logout in Redis
    if (redisService.isReady()) {
      try {
        await redisService.incr('stats:logouts:total');
        await redisService.incr(`stats:logouts:${new Date().toISOString().split('T')[0]}`);
      } catch (error) {
        logger.error('Failed to track logout stats:', error);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', {
      error: error.message,
      stack: error.stack,
      userId: user.id,
      ip
    });
    throw error;
  }
});

/**
 * Enhanced logout from all devices
 * @route POST /api/v1/auth/logout-all
 */
const logoutAll = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const ip = req.ip;

  try {
    // Clear all refresh tokens
    user.refresh_token = null;
    user.refresh_token_expires = null;
    await user.save();

    // Clear all user activity tracking
    if (redisService.isReady()) {
      try {
        const keys = await redisService.client.keys(`user_activity:${user.id}*`);
        if (keys.length > 0) {
          await redisService.client.del(...keys);
        }
        await redisService.del(`user_last_login:${user.id}`);
      } catch (error) {
        logger.error('Failed to clear user activities on logout all:', error);
      }
    }

    // Log logout all
    loggerUtils.logAuth('logout_all', user.id, ip, {
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out from all devices successfully'
    });

  } catch (error) {
    logger.error('Logout all error:', {
      error: error.message,
      stack: error.stack,
      userId: user.id,
      ip
    });
    throw error;
  }
});

module.exports = {
  register,
  login,
  loginWithOTP,
  sendLoginCode,
  verifyPhone,
  sendVerificationCode,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  logout,
  logoutAll
};