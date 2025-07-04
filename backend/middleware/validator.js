/**
 * Request Validation Middleware
 * Enhanced validation with comprehensive schemas and custom validation rules
 */

const Joi = require('joi');
const { ValidationError } = require('../errors/AppError');
const { logger } = require('../config/logger');
const { ValidationManager } = require('../utils/security');

/**
 * Common validation schemas with enhanced security
 */
const commonSchemas = {
  // User ID validation with strict UUID format
  userId: Joi.string().uuid({ version: 'uuidv4' }).required(),
  
  // Enhanced pagination with stricter limits
  pagination: Joi.object({
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).max(100000)
  }),
  
  // Enhanced phone number validation for China
  phoneNumber: Joi.string().pattern(/^(\+86)?1[3-9]\d{9}$/).required()
    .messages({
      'string.pattern.base': 'Phone number must be a valid Chinese mobile number'
    }),
  
  // Enhanced email validation (optional)
  email: Joi.string().email({ 
    minDomainSegments: 2,
    tlds: { allow: true }
  }).max(255).optional().allow('', null),
  
  // Enhanced username validation
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/)
    .invalid('admin', 'root', 'user', 'test', 'api', 'www', 'mail', 'support', 'system')
    .required()
    .messages({
      'string.pattern.base': 'Username must start with a letter and contain only letters, numbers, and underscores',
      'any.invalid': 'Username is reserved and cannot be used'
    }),
  
  // Enhanced password validation
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
  
  // Enhanced verification code
  verificationCode: Joi.string().pattern(/^\d{6}$/).required()
    .messages({
      'string.pattern.base': 'Verification code must be exactly 6 digits'
    }),
  
  // Enhanced name validation
  firstName: Joi.string().min(1).max(50).pattern(/^[\u4e00-\u9fa5a-zA-Z\s]+$/).required()
    .messages({
      'string.pattern.base': 'First name can only contain Chinese characters, letters, and spaces'
    }),
  
  lastName: Joi.string().min(1).max(50).pattern(/^[\u4e00-\u9fa5a-zA-Z\s]+$/).required()
    .messages({
      'string.pattern.base': 'Last name can only contain Chinese characters, letters, and spaces'
    }),
  
  // Enhanced date validation
  dateOfBirth: Joi.date()
    .max('now')
    .min('1900-01-01')
    .optional()
    .messages({
      'date.max': 'Date of birth cannot be in the future',
      'date.min': 'Date of birth must be after 1900'
    }),
  
  // Enhanced gender validation
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
  
  // Enhanced bio validation
  bio: Joi.string().max(500).pattern(/^[^<>]*$/).optional().allow('')
    .messages({
      'string.pattern.base': 'Bio cannot contain HTML tags'
    }),
  
  // Enhanced location validation
  location: Joi.string().max(100).pattern(/^[^<>]*$/).optional().allow('')
    .messages({
      'string.pattern.base': 'Location cannot contain HTML tags'
    }),
  
  // Enhanced website validation
  website: Joi.string().uri({ scheme: ['http', 'https'] }).max(255).optional().allow('', null),
  
  // Enhanced post content validation
  postContent: Joi.string().max(5000).pattern(/^[^<>]*$/).optional().allow('')
    .messages({
      'string.pattern.base': 'Post content cannot contain HTML tags'
    }),
  
  // Enhanced media URLs validation
  mediaUrls: Joi.array()
    .items(Joi.string().uri({ scheme: ['http', 'https'] }).max(500))
    .max(10)
    .optional(),
  
  // Enhanced privacy settings
  privacy: Joi.string().valid('public', 'friends', 'private').default('public'),
  
  // Enhanced message content validation
  messageContent: Joi.string().max(2000).min(1).required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message is too long'
    }),
  
  // Enhanced message type validation
  messageType: Joi.string()
    .valid('text', 'image', 'video', 'audio', 'file', 'location', 'contact', 'sticker', 'gif')
    .default('text'),

  // Search query validation
  searchQuery: Joi.string().min(1).max(100).pattern(/^[^<>]*$/).required()
    .messages({
      'string.pattern.base': 'Search query cannot contain HTML tags'
    }),

  // File validation
  fileType: Joi.string().valid(
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov',
    'audio/mp3', 'audio/wav', 'audio/aac',
    'application/pdf'
  ).required(),

  // Amount validation for payments
  amount: Joi.number().positive().precision(2).max(100000).required()
    .messages({
      'number.positive': 'Amount must be positive',
      'number.max': 'Amount cannot exceed 100,000'
    }),

  // Device ID validation
  deviceId: Joi.string().min(10).max(255).pattern(/^[a-zA-Z0-9_-]+$/).required()
    .messages({
      'string.pattern.base': 'Device ID contains invalid characters'
    })
};

/**
 * Enhanced authentication validation schemas
 */
const authSchemas = {
  register: Joi.object({
    username: commonSchemas.username,
    phone_number: commonSchemas.phoneNumber,
    email: commonSchemas.email,
    password: commonSchemas.password,
    first_name: commonSchemas.firstName,
    last_name: commonSchemas.lastName,
    date_of_birth: commonSchemas.dateOfBirth,
    gender: commonSchemas.gender,
    terms_accepted: Joi.boolean().valid(true).required()
      .messages({
        'any.only': 'Terms and conditions must be accepted'
      }),
    privacy_accepted: Joi.boolean().valid(true).required()
      .messages({
        'any.only': 'Privacy policy must be accepted'
      })
  }),
  
  login: Joi.object({
    identifier: Joi.string().min(3).max(50).required()
      .messages({
        'string.min': 'Username or phone number is too short',
        'string.max': 'Username or phone number is too long'
      }),
    password: Joi.string().min(1).max(128).required()
      .messages({
        'string.min': 'Password is required'
      })
  }),
  
  loginWithOTP: Joi.object({
    phone_number: commonSchemas.phoneNumber,
    verification_code: commonSchemas.verificationCode
  }),
  
  verifyPhone: Joi.object({
    phone_number: commonSchemas.phoneNumber,
    verification_code: commonSchemas.verificationCode
  }),
  
  sendVerificationCode: Joi.object({
    phone_number: commonSchemas.phoneNumber
  }),
  
  refreshToken: Joi.object({
    refreshToken: Joi.string().min(10).required()
      .messages({
        'string.min': 'Invalid refresh token format'
      })
  }),
  
  forgotPassword: Joi.object({
    phone_number: commonSchemas.phoneNumber
  }),
  
  resetPassword: Joi.object({
    phone_number: commonSchemas.phoneNumber,
    verification_code: commonSchemas.verificationCode,
    new_password: commonSchemas.password
  }),
  
  changePassword: Joi.object({
    current_password: Joi.string().min(1).max(128).required(),
    new_password: commonSchemas.password
  }).custom((value, helpers) => {
    if (value.current_password === value.new_password) {
      return helpers.error('password.same');
    }
    return value;
  }).messages({
    'password.same': 'New password must be different from current password'
  })
};

/**
 * Enhanced user validation schemas
 */
const userSchemas = {
  updateProfile: Joi.object({
    first_name: commonSchemas.firstName.optional(),
    last_name: commonSchemas.lastName.optional(),
    bio: commonSchemas.bio,
    location: commonSchemas.location,
    website: commonSchemas.website,
    date_of_birth: commonSchemas.dateOfBirth,
    gender: commonSchemas.gender,
    is_private: Joi.boolean().optional()
  }),
  
  updateProfilePicture: Joi.object({
    profile_picture: Joi.string().uri({ scheme: ['http', 'https'] }).max(500).required()
  }),
  
  updateCoverPicture: Joi.object({
    cover_picture: Joi.string().uri({ scheme: ['http', 'https'] }).max(500).required()
  }),
  
  searchUsers: Joi.object({
    query: commonSchemas.searchQuery,
    ...commonSchemas.pagination
  })
};

/**
 * Enhanced post validation schemas
 */
const postSchemas = {
  createPost: Joi.object({
    content: commonSchemas.postContent,
    media_urls: commonSchemas.mediaUrls,
    privacy: commonSchemas.privacy,
    location: commonSchemas.location,
    tagged_users: Joi.array().items(commonSchemas.userId).max(20).optional()
  }).or('content', 'media_urls')
    .messages({
      'object.missing': 'Post must have either content or media'
    }),
  
  updatePost: Joi.object({
    content: commonSchemas.postContent,
    media_urls: commonSchemas.mediaUrls,
    privacy: commonSchemas.privacy,
    location: commonSchemas.location,
    tagged_users: Joi.array().items(commonSchemas.userId).max(20).optional()
  }),
  
  createComment: Joi.object({
    content: Joi.string().min(1).max(1000).pattern(/^[^<>]*$/).required()
      .messages({
        'string.pattern.base': 'Comment cannot contain HTML tags'
      }),
    media_urls: Joi.array().items(Joi.string().uri()).max(5).optional()
  }),
  
  getFeed: Joi.object({
    ...commonSchemas.pagination
  }),
  
  getUserPosts: Joi.object({
    userId: commonSchemas.userId,
    ...commonSchemas.pagination
  }),
  
  searchPosts: Joi.object({
    query: commonSchemas.searchQuery,
    ...commonSchemas.pagination
  }),

  reportPost: Joi.object({
    reason: Joi.string().valid(
      'spam', 'harassment', 'hate_speech', 'violence', 
      'nudity', 'false_information', 'copyright', 'other'
    ).required(),
    description: Joi.string().max(500).optional().allow('')
  })
};

/**
 * Enhanced message validation schemas
 */
const messageSchemas = {
  sendMessage: Joi.object({
    receiver_id: commonSchemas.userId,
    content: commonSchemas.messageContent.optional(),
    message_type: commonSchemas.messageType,
    media_url: Joi.string().uri({ scheme: ['http', 'https'] }).max(500).optional(),
    reply_to_id: commonSchemas.userId.optional(),
    location_data: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      address: Joi.string().max(200).optional()
    }).optional(),
    contact_data: Joi.object({
      name: Joi.string().max(100).required(),
      phone: Joi.string().max(20).optional(),
      email: Joi.string().email().optional()
    }).optional()
  }).or('content', 'media_url')
    .messages({
      'object.missing': 'Message must have either content or media'
    }),
  
  getConversation: Joi.object({
    conversationId: Joi.string().pattern(/^[a-f0-9-]+_[a-f0-9-]+$/).required()
      .messages({
        'string.pattern.base': 'Invalid conversation ID format'
      }),
    ...commonSchemas.pagination
  }),
  
  getConversations: Joi.object({
    ...commonSchemas.pagination
  }),
  
  markAsRead: Joi.object({
    messageId: commonSchemas.userId
  }),
  
  deleteMessage: Joi.object({
    messageId: commonSchemas.userId
  }),
  
  searchMessages: Joi.object({
    query: commonSchemas.searchQuery,
    ...commonSchemas.pagination
  }),

  addReaction: Joi.object({
    emoji: Joi.string().pattern(/^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u).required()
      .messages({
        'string.pattern.base': 'Invalid emoji format'
      })
  }),

  forwardMessage: Joi.object({
    receiver_ids: Joi.array().items(commonSchemas.userId).min(1).max(10).required()
      .messages({
        'array.min': 'At least one recipient is required',
        'array.max': 'Cannot forward to more than 10 recipients'
      })
  })
};

/**
 * Enhanced friend validation schemas
 */
const friendSchemas = {
  sendFriendRequest: Joi.object({
    friend_id: commonSchemas.userId
  }),
  
  respondToFriendRequest: Joi.object({
    action: Joi.string().valid('accept', 'decline', 'block').required()
  }),
  
  getFriends: Joi.object({
    userId: commonSchemas.userId.optional(),
    ...commonSchemas.pagination
  }),
  
  getFriendRequests: Joi.object({
    type: Joi.string().valid('received', 'sent').default('received'),
    ...commonSchemas.pagination
  }),
  
  removeFriend: Joi.object({
    friend_id: commonSchemas.userId
  }),
  
  blockUser: Joi.object({
    user_id: commonSchemas.userId
  }),
  
  unblockUser: Joi.object({
    user_id: commonSchemas.userId
  })
};

/**
 * Enhanced notification validation schemas
 */
const notificationSchemas = {
  getNotifications: Joi.object({
    category: Joi.string().valid('social', 'system', 'promotional', 'security').optional(),
    ...commonSchemas.pagination
  }),
  
  markAsRead: Joi.object({
    notificationId: commonSchemas.userId
  }),
  
  markAllAsRead: Joi.object({
    category: Joi.string().valid('social', 'system', 'promotional', 'security').optional()
  }),
  
  deleteNotification: Joi.object({
    notificationId: commonSchemas.userId
  }),

  updateNotificationSettings: Joi.object({
    push_notifications: Joi.boolean().optional(),
    email_notifications: Joi.boolean().optional(),
    sms_notifications: Joi.boolean().optional(),
    categories: Joi.object({
      social: Joi.object({
        push: Joi.boolean().optional(),
        email: Joi.boolean().optional(),
        sms: Joi.boolean().optional()
      }).optional(),
      system: Joi.object({
        push: Joi.boolean().optional(),
        email: Joi.boolean().optional(),
        sms: Joi.boolean().optional()
      }).optional(),
      promotional: Joi.object({
        push: Joi.boolean().optional(),
        email: Joi.boolean().optional(),
        sms: Joi.boolean().optional()
      }).optional(),
      security: Joi.object({
        push: Joi.boolean().optional(),
        email: Joi.boolean().optional(),
        sms: Joi.boolean().optional()
      }).optional()
    }).optional(),
    quiet_hours: Joi.object({
      enabled: Joi.boolean().optional(),
      start_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      end_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
    }).optional()
  }),

  snoozeNotification: Joi.object({
    snooze_until: Joi.date().greater('now').required()
      .messages({
        'date.greater': 'Snooze time must be in the future'
      })
  })
};

/**
 * Payment validation schemas
 */
const paymentSchemas = {
  createOrder: Joi.object({
    amount: commonSchemas.amount,
    description: Joi.string().min(1).max(200).pattern(/^[^<>]*$/).required()
      .messages({
        'string.pattern.base': 'Description cannot contain HTML tags'
      }),
    provider: Joi.string().valid('wechat', 'alipay').default('wechat'),
    orderType: Joi.string().valid('premium', 'gift', 'boost', 'coins').required(),
    returnUrl: Joi.string().uri({ scheme: ['http', 'https'] }).optional(),
    notifyUrl: Joi.string().uri({ scheme: ['http', 'https'] }).optional(),
    recipientId: commonSchemas.userId.optional(),
    postId: commonSchemas.userId.optional(),
    boostDuration: Joi.number().integer().min(1).max(720).optional(), // Max 30 days in hours
    giftType: Joi.string().valid('premium', 'coins', 'sticker').optional()
  }),

  refundOrder: Joi.object({
    outTradeNo: Joi.string().min(10).max(100).required(),
    refundAmount: commonSchemas.amount,
    refundReason: Joi.string().min(1).max(200).pattern(/^[^<>]*$/).required()
      .messages({
        'string.pattern.base': 'Refund reason cannot contain HTML tags'
      }),
    provider: Joi.string().valid('wechat', 'alipay').required()
  })
};

/**
 * Upload validation schemas
 */
const uploadSchemas = {
  presignedUrl: Joi.object({
    fileName: Joi.string().min(1).max(255).pattern(/^[^<>\/\\|:*?"]+$/).required()
      .messages({
        'string.pattern.base': 'File name contains invalid characters'
      }),
    fileType: commonSchemas.fileType,
    uploadType: Joi.string().valid('avatar', 'cover', 'post', 'message', 'general').default('general')
  })
};

/**
 * Push notification validation schemas
 */
const pushSchemas = {
  registerToken: Joi.object({
    token: Joi.string().min(10).max(4096).required(),
    provider: Joi.string().valid('xiaomi', 'huawei', 'oppo', 'vivo', 'apns').required(),
    deviceId: commonSchemas.deviceId,
    deviceInfo: Joi.object({
      platform: Joi.string().valid('android', 'ios').required(),
      model: Joi.string().max(100).optional(),
      version: Joi.string().max(50).optional(),
      appVersion: Joi.string().max(20).optional()
    }).optional()
  }),

  removeToken: Joi.object({
    deviceId: commonSchemas.deviceId
  }),

  sendNotification: Joi.object({
    userId: commonSchemas.userId,
    title: Joi.string().min(1).max(100).pattern(/^[^<>]*$/).required()
      .messages({
        'string.pattern.base': 'Title cannot contain HTML tags'
      }),
    body: Joi.string().min(1).max(500).pattern(/^[^<>]*$/).required()
      .messages({
        'string.pattern.base': 'Body cannot contain HTML tags'
      }),
    data: Joi.object().optional(),
    badge: Joi.number().integer().min(0).max(999).optional(),
    sound: Joi.string().max(50).optional()
  }),

  testNotification: Joi.object({
    token: Joi.string().min(10).max(4096).required(),
    provider: Joi.string().valid('xiaomi', 'huawei', 'oppo', 'vivo', 'apns').required()
  })
};

/**
 * Enhanced validation middleware with comprehensive error handling
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Source of data to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      
      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false, // Return all validation errors
        stripUnknown: true, // Remove unknown fields
        convert: true, // Convert types when possible
        allowUnknown: false, // Reject unknown fields
        presence: 'required' // Make all fields required by default unless specified
      });
      
      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
          type: detail.type
        }));
        
        logger.warn('Validation failed:', {
          url: req.originalUrl,
          method: req.method,
          source,
          errors: validationErrors,
          userId: req.user?.id || 'anonymous',
          ip: req.ip
        });
        
        return next(new ValidationError(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`));
      }
      
      // Replace the original data with validated and sanitized data
      req[source] = value;
      
      // Log successful validation in debug mode
      logger.debug('Validation successful:', {
        url: req.originalUrl,
        method: req.method,
        source,
        fieldCount: Object.keys(value).length
      });
      
      next();
    } catch (err) {
      logger.error('Validation middleware error:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
      });
      return next(new ValidationError('Validation failed'));
    }
  };
};

/**
 * Enhanced custom validation functions
 */
const customValidations = {
  /**
   * Validate username availability with enhanced checks
   */
  validateUsernameAvailability: async (req, res, next) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return next();
      }
      
      const validation = ValidationManager.validateUsername(username);
      if (!validation.isValid) {
        logger.warn('Username validation failed:', {
          username: username.substring(0, 3) + '***',
          errors: validation.errors,
          ip: req.ip
        });
        return next(new ValidationError(`Username validation failed: ${validation.errors.join(', ')}`));
      }
      
      // Check if username is already taken
      const User = require('../models/User');
      const existingUser = await User.findOne({ 
        where: { username: validation.sanitized },
        attributes: ['id', 'username']
      });
      
      if (existingUser) {
        logger.warn('Username already taken:', {
          username: validation.sanitized,
          ip: req.ip
        });
        return next(new ValidationError('Username is already taken'));
      }
      
      // Update request with sanitized username
      req.body.username = validation.sanitized;
      next();
    } catch (error) {
      logger.error('Username validation error:', {
        error: error.message,
        stack: error.stack,
        ip: req.ip
      });
      return next(new ValidationError('Username validation failed'));
    }
  },
  
  /**
   * Validate phone number availability with enhanced checks
   */
  validatePhoneAvailability: async (req, res, next) => {
    try {
      const { phone_number } = req.body;
      
      if (!phone_number) {
        return next();
      }
      
      const validation = ValidationManager.validatePhoneNumber(phone_number);
      if (!validation.isValid) {
        logger.warn('Phone number validation failed:', {
          phone: phone_number.substring(0, 3) + '***',
          errors: validation.errors,
          ip: req.ip
        });
        return next(new ValidationError(`Phone number validation failed: ${validation.errors.join(', ')}`));
      }
      
      // Check if phone number is already registered
      const User = require('../models/User');
      const existingUser = await User.findOne({ 
        where: { phone_number: validation.sanitized },
        attributes: ['id', 'phone_number']
      });
      
      if (existingUser && req.route.path !== '/verify-phone') {
        logger.warn('Phone number already registered:', {
          phone: validation.sanitized.substring(0, 3) + '***',
          ip: req.ip
        });
        return next(new ValidationError('Phone number is already registered'));
      }
      
      // Update request with sanitized phone number
      req.body.phone_number = validation.sanitized;
      next();
    } catch (error) {
      logger.error('Phone validation error:', {
        error: error.message,
        stack: error.stack,
        ip: req.ip
      });
      return next(new ValidationError('Phone validation failed'));
    }
  },
  
  /**
   * Validate email availability with enhanced checks
   */
  validateEmailAvailability: async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return next(); // Email is optional
      }
      
      const validation = ValidationManager.validateEmail(email);
      if (!validation.isValid) {
        logger.warn('Email validation failed:', {
          email: email.substring(0, 3) + '***',
          errors: validation.errors,
          ip: req.ip
        });
        return next(new ValidationError(`Email validation failed: ${validation.errors.join(', ')}`));
      }
      
      // Check if email is already registered
      const User = require('../models/User');
      const existingUser = await User.findOne({ 
        where: { email: validation.sanitized },
        attributes: ['id', 'email']
      });
      
      if (existingUser) {
        logger.warn('Email already registered:', {
          email: validation.sanitized.substring(0, 3) + '***',
          ip: req.ip
        });
        return next(new ValidationError('Email is already registered'));
      }
      
      // Update request with sanitized email
      req.body.email = validation.sanitized;
      next();
    } catch (error) {
      logger.error('Email validation error:', {
        error: error.message,
        stack: error.stack,
        ip: req.ip
      });
      return next(new ValidationError('Email validation failed'));
    }
  },
  
  /**
   * Validate password strength with enhanced security
   */
  validatePasswordStrength: (req, res, next) => {
    try {
      const { password, new_password } = req.body;
      const passwordToValidate = new_password || password;
      
      if (!passwordToValidate) {
        return next();
      }
      
      const validation = ValidationManager.validatePassword(passwordToValidate);
      if (!validation.isValid) {
        logger.warn('Password strength validation failed:', {
          errors: validation.errors,
          strength: validation.strength,
          ip: req.ip,
          userId: req.user?.id
        });
        return next(new ValidationError(`Password validation failed: ${validation.errors.join(', ')}`));
      }
      
      if (validation.strength === 'weak') {
        return next(new ValidationError('Password is too weak. Please choose a stronger password.'));
      }
      
      next();
    } catch (error) {
      logger.error('Password strength validation error:', {
        error: error.message,
        stack: error.stack,
        ip: req.ip
      });
      return next(new ValidationError('Password validation failed'));
    }
  },

  /**
   * Validate file upload parameters
   */
  validateFileUpload: (req, res, next) => {
    try {
      if (!req.file && !req.files) {
        return next();
      }

      const files = req.files || [req.file];
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/avi', 'video/mov',
        'audio/mp3', 'audio/wav', 'audio/aac'
      ];

      for (const file of files) {
        if (!allowedTypes.includes(file.mimetype)) {
          logger.warn('Invalid file type uploaded:', {
            mimetype: file.mimetype,
            filename: file.originalname,
            userId: req.user?.id,
            ip: req.ip
          });
          return next(new ValidationError(`File type ${file.mimetype} is not allowed`));
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          logger.warn('File size too large:', {
            size: file.size,
            filename: file.originalname,
            userId: req.user?.id,
            ip: req.ip
          });
          return next(new ValidationError('File size exceeds 10MB limit'));
        }
      }

      next();
    } catch (error) {
      logger.error('File upload validation error:', {
        error: error.message,
        stack: error.stack,
        ip: req.ip
      });
      return next(new ValidationError('File validation failed'));
    }
  }
};

/**
 * Combine multiple validation middlewares
 * @param {...Function} validators - Validation middlewares to combine
 * @returns {Array} Array of validation middlewares
 */
const combineValidations = (...validators) => {
  return validators;
};

/**
 * Create conditional validation
 * @param {Function} condition - Condition function
 * @param {Function} validator - Validator to apply if condition is true
 * @returns {Function} Conditional validation middleware
 */
const conditionalValidation = (condition, validator) => {
  return (req, res, next) => {
    if (condition(req)) {
      return validator(req, res, next);
    }
    next();
  };
};

/**
 * Sanitize request data
 * @param {Array} fields - Fields to sanitize
 * @returns {Function} Sanitization middleware
 */
const sanitizeFields = (fields = []) => {
  return (req, res, next) => {
    try {
      for (const field of fields) {
        if (req.body[field] && typeof req.body[field] === 'string') {
          req.body[field] = ValidationManager.sanitizeHtml(req.body[field]);
        }
      }
      next();
    } catch (error) {
      logger.error('Field sanitization error:', error);
      next();
    }
  };
};

module.exports = {
  validate,
  commonSchemas,
  authSchemas,
  userSchemas,
  postSchemas,
  messageSchemas,
  friendSchemas,
  notificationSchemas,
  paymentSchemas,
  uploadSchemas,
  pushSchemas,
  customValidations,
  combineValidations,
  conditionalValidation,
  sanitizeFields
};