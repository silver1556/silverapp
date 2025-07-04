/**
 * Enhanced User Model
 * Comprehensive user schema with security improvements and optimized database interactions
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');
const config = require('../config/env');
const { logger } = require('../config/logger');

/**
 * Enhanced User model definition with comprehensive security features
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: {
      name: 'unique_username',
      msg: 'Username already exists'
    },
    validate: {
      len: {
        args: [3, 30],
        msg: 'Username must be between 3 and 30 characters'
      },
      isAlphanumeric: {
        msg: 'Username can only contain letters and numbers'
      },
      notIn: {
        args: [['admin', 'root', 'user', 'test', 'api', 'www', 'mail', 'support', 'system']],
        msg: 'Username is reserved'
      }
    }
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: true, // Email is optional
    unique: {
      name: 'unique_email',
      msg: 'Email already exists'
    },
    validate: {
      isEmail: {
        msg: 'Invalid email format'
      },
      len: {
        args: [0, 255],
        msg: 'Email must be less than 255 characters'
      }
    }
  },
  
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false, // Phone number is mandatory
    unique: {
      name: 'unique_phone',
      msg: 'Phone number already exists'
    },
    validate: {
      is: {
        args: /^(\+86)?1[3-9]\d{9}$/,
        msg: 'Invalid Chinese phone number format'
      }
    }
  },
  
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [60, 255],
        msg: 'Invalid password hash length'
      }
    }
  },
  
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: {
        args: [1, 50],
        msg: 'First name must be between 1 and 50 characters'
      },
      notEmpty: {
        msg: 'First name cannot be empty'
      },
      is: {
        args: /^[\u4e00-\u9fa5a-zA-Z\s]+$/,
        msg: 'First name can only contain Chinese characters, letters, and spaces'
      }
    }
  },
  
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: {
        args: [1, 50],
        msg: 'Last name must be between 1 and 50 characters'
      },
      notEmpty: {
        msg: 'Last name cannot be empty'
      },
      is: {
        args: /^[\u4e00-\u9fa5a-zA-Z\s]+$/,
        msg: 'Last name can only contain Chinese characters, letters, and spaces'
      }
    }
  },
  
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Invalid date format'
      },
      isBefore: {
        args: new Date().toISOString().split('T')[0],
        msg: 'Date of birth must be in the past'
      },
      isAfter: {
        args: '1900-01-01',
        msg: 'Date of birth must be after 1900'
      }
    }
  },
  
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    allowNull: true,
    defaultValue: 'prefer_not_to_say'
  },
  
  profile_picture: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Profile picture must be a valid URL'
      },
      len: {
        args: [0, 500],
        msg: 'Profile picture URL must be less than 500 characters'
      }
    }
  },
  
  cover_picture: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Cover picture must be a valid URL'
      },
      len: {
        args: [0, 500],
        msg: 'Cover picture URL must be less than 500 characters'
      }
    }
  },
  
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Bio must be less than 500 characters'
      }
    }
  },
  
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Location must be less than 100 characters'
      }
    }
  },
  
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Website must be a valid URL'
      },
      len: {
        args: [0, 255],
        msg: 'Website URL must be less than 255 characters'
      }
    }
  },
  
  // Enhanced verification fields
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Blue checkmark verification status'
  },
  
  phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Phone number verification status'
  },
  
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Email verification status'
  },
  
  // Enhanced account status fields
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Account active status'
  },
  
  is_private: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Private account setting'
  },
  
  is_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Premium subscription status'
  },
  
  premium_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Premium subscription expiration date'
  },
  
  premium_type: {
    type: DataTypes.ENUM('monthly', 'biannual', 'yearly'),
    allowNull: true,
    comment: 'Premium subscription type'
  },
  
  // Enhanced authentication fields
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last login timestamp'
  },
  
  login_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Total login count'
  },
  
  failed_login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Failed login attempts counter'
  },
  
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Account lock expiration time'
  },
  
  password_changed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last password change timestamp'
  },
  
  // Enhanced token management
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Current refresh token'
  },
  
  refresh_token_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Refresh token expiration time'
  },
  
  // Enhanced verification system
  verification_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Current verification code'
  },
  
  verification_code_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Verification code expiration time'
  },
  
  verification_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Verification attempts counter'
  },
  
  // Enhanced password reset
  password_reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Password reset token'
  },
  
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Password reset token expiration'
  },
  
  // Enhanced two-factor authentication
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Two-factor authentication status'
  },
  
  two_factor_secret: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Two-factor authentication secret'
  },
  
  backup_codes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Two-factor backup codes'
  },
  
  // Enhanced user preferences
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'zh-CN',
    allowNull: false,
    validate: {
      isIn: {
        args: [['zh-CN', 'zh-TW', 'en-US']],
        msg: 'Invalid language code'
      }
    },
    comment: 'User interface language'
  },
  
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'Asia/Shanghai',
    allowNull: false,
    comment: 'User timezone'
  },
  
  // Enhanced virtual currency system
  virtual_currency: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Virtual currency balance'
  },
  
  // Enhanced user role system
  role: {
    type: DataTypes.ENUM('user', 'moderator', 'admin', 'super_admin'),
    defaultValue: 'user',
    allowNull: false,
    comment: 'User role for permissions'
  },
  
  // Enhanced privacy settings
  privacy_settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      profile_visibility: 'public',
      friend_list_visibility: 'friends',
      post_visibility: 'public',
      message_permissions: 'friends',
      search_visibility: true,
      online_status_visibility: 'friends'
    },
    comment: 'User privacy preferences'
  },
  
  // Enhanced notification settings
  notification_settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      push_notifications: true,
      email_notifications: false,
      sms_notifications: false,
      friend_requests: true,
      messages: true,
      posts: true,
      comments: true,
      likes: true,
      mentions: true
    },
    comment: 'User notification preferences'
  },
  
  // Enhanced security tracking
  last_ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Last known IP address'
  },
  
  last_user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Last known user agent'
  },
  
  security_alerts_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Security alerts preference'
  },
  
  // Enhanced account metrics
  posts_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Total posts count'
  },
  
  friends_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Total friends count'
  },
  
  followers_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Total followers count'
  },
  
  following_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    },
    comment: 'Total following count'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  // Enhanced indexes for better performance
  indexes: [
    {
      unique: true,
      fields: ['username'],
      name: 'idx_users_username'
    },
    {
      unique: true,
      fields: ['email'],
      name: 'idx_users_email',
      where: {
        email: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    },
    {
      unique: true,
      fields: ['phone_number'],
      name: 'idx_users_phone'
    },
    {
      fields: ['is_active'],
      name: 'idx_users_active'
    },
    {
      fields: ['phone_verified'],
      name: 'idx_users_phone_verified'
    },
    {
      fields: ['is_verified'],
      name: 'idx_users_verified'
    },
    {
      fields: ['role'],
      name: 'idx_users_role'
    },
    {
      fields: ['created_at'],
      name: 'idx_users_created'
    },
    {
      fields: ['last_login'],
      name: 'idx_users_last_login'
    },
    {
      fields: ['premium_expires_at'],
      name: 'idx_users_premium_expires'
    },
    {
      fields: ['locked_until'],
      name: 'idx_users_locked'
    },
    {
      fields: ['verification_code_expires'],
      name: 'idx_users_verification_expires'
    },
    {
      fields: ['password_reset_expires'],
      name: 'idx_users_password_reset_expires'
    }
  ],
  
  // Enhanced hooks for password hashing and security
  hooks: {
    beforeCreate: async (user) => {
      // Hash password
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, config.security.bcryptRounds);
      }
      
      // Normalize phone number
      if (user.phone_number && !user.phone_number.startsWith('+86')) {
        user.phone_number = `+86${user.phone_number}`;
      }
      
      // Normalize email
      if (user.email) {
        user.email = user.email.toLowerCase().trim();
      }
      
      // Normalize username
      if (user.username) {
        user.username = user.username.toLowerCase().trim();
      }
    },
    
    beforeUpdate: async (user) => {
      // Hash password if changed
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, config.security.bcryptRounds);
        user.password_changed_at = new Date();
        
        // Clear all refresh tokens when password changes
        user.refresh_token = null;
        user.refresh_token_expires = null;
      }
      
      // Normalize email if changed
      if (user.changed('email') && user.email) {
        user.email = user.email.toLowerCase().trim();
      }
      
      // Normalize username if changed
      if (user.changed('username') && user.username) {
        user.username = user.username.toLowerCase().trim();
      }
    },
    
    afterCreate: async (user) => {
      logger.info('New user created:', {
        userId: user.id,
        username: user.username,
        phone: user.phone_number?.substring(0, 3) + '***'
      });
    },
    
    afterUpdate: async (user) => {
      // Log security-relevant changes
      const securityFields = ['password_hash', 'email', 'phone_number', 'two_factor_enabled'];
      const changedSecurityFields = securityFields.filter(field => user.changed(field));
      
      if (changedSecurityFields.length > 0) {
        logger.info('User security update:', {
          userId: user.id,
          changedFields: changedSecurityFields
        });
      }
    }
  },
  
  // Enhanced scopes for common queries
  scopes: {
    active: {
      where: {
        is_active: true
      }
    },
    
    verified: {
      where: {
        phone_verified: true
      }
    },
    
    premium: {
      where: {
        is_premium: true,
        premium_expires_at: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      }
    },
    
    public: {
      where: {
        is_private: false,
        is_active: true
      }
    },
    
    withoutSensitive: {
      attributes: {
        exclude: [
          'password_hash', 'refresh_token', 'verification_code', 
          'password_reset_token', 'two_factor_secret', 'backup_codes',
          'failed_login_attempts', 'verification_attempts'
        ]
      }
    }
  }
});

/**
 * Enhanced instance methods
 */

/**
 * Enhanced password comparison with timing attack protection
 * @param {string} password - Plain text password
 * @returns {Promise<boolean>} Password match result
 */
User.prototype.comparePassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password_hash);
  } catch (error) {
    logger.error('Password comparison error:', {
      userId: this.id,
      error: error.message
    });
    return false;
  }
};

/**
 * Enhanced verification code generation with rate limiting
 * @returns {string} 6-digit verification code
 */
User.prototype.generateVerificationCode = function() {
  // Check if too many attempts
  if (this.verification_attempts >= 5) {
    const lastAttempt = this.verification_code_expires || new Date(0);
    const timeSinceLastAttempt = Date.now() - lastAttempt.getTime();
    
    if (timeSinceLastAttempt < 60 * 60 * 1000) { // 1 hour
      throw new Error('Too many verification attempts. Please try again later.');
    }
    
    // Reset attempts after cooldown
    this.verification_attempts = 0;
  }
  
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verification_code = code;
  this.verification_code_expires = new Date(Date.now() + config.app.verificationCodeExpiry);
  this.verification_attempts += 1;
  
  return code;
};

/**
 * Enhanced verification code verification with attempt tracking
 * @param {string} code - Verification code to check
 * @returns {boolean} Verification result
 */
User.prototype.verifyCode = function(code) {
  if (!this.verification_code || !this.verification_code_expires) {
    return false;
  }
  
  if (new Date() > this.verification_code_expires) {
    return false;
  }
  
  const isValid = this.verification_code === code;
  
  if (isValid) {
    // Reset attempts on successful verification
    this.verification_attempts = 0;
  }
  
  return isValid;
};

/**
 * Enhanced verification code clearing
 */
User.prototype.clearVerificationCode = function() {
  this.verification_code = null;
  this.verification_code_expires = null;
  this.verification_attempts = 0;
};

/**
 * Enhanced full name getter
 * @returns {string} Full name
 */
User.prototype.getFullName = function() {
  return `${this.first_name} ${this.last_name}`.trim();
};

/**
 * Enhanced public profile data with privacy controls
 * @param {string} viewerId - ID of user viewing the profile
 * @returns {Object} Public profile information
 */
User.prototype.getPublicProfile = function(viewerId = null) {
  const baseProfile = {
    id: this.id,
    username: this.username,
    first_name: this.first_name,
    last_name: this.last_name,
    profile_picture: this.profile_picture,
    is_verified: this.is_verified,
    is_premium: this.is_premium,
    created_at: this.created_at
  };
  
  // Add additional fields based on privacy settings and relationship
  if (!this.is_private || viewerId === this.id) {
    baseProfile.bio = this.bio;
    baseProfile.location = this.location;
    baseProfile.website = this.website;
    baseProfile.posts_count = this.posts_count;
    baseProfile.friends_count = this.friends_count;
    baseProfile.followers_count = this.followers_count;
    baseProfile.following_count = this.following_count;
  }
  
  return baseProfile;
};

/**
 * Enhanced last login update with security tracking
 * @param {string} ip - IP address
 * @param {string} userAgent - User agent string
 */
User.prototype.updateLastLogin = async function(ip = null, userAgent = null) {
  this.last_login = new Date();
  this.login_count += 1;
  this.failed_login_attempts = 0; // Reset failed attempts on successful login
  
  if (ip) {
    this.last_ip = ip;
  }
  
  if (userAgent) {
    this.last_user_agent = userAgent;
  }
  
  await this.save();
};

/**
 * Enhanced account locking mechanism
 * @param {number} duration - Lock duration in milliseconds
 */
User.prototype.lockAccount = async function(duration = config.security.lockoutDuration) {
  this.locked_until = new Date(Date.now() + duration);
  await this.save();
  
  logger.warn('User account locked:', {
    userId: this.id,
    username: this.username,
    lockedUntil: this.locked_until,
    failedAttempts: this.failed_login_attempts
  });
};

/**
 * Check if account is currently locked
 * @returns {boolean} Lock status
 */
User.prototype.isLocked = function() {
  return this.locked_until && new Date() < this.locked_until;
};

/**
 * Enhanced failed login attempt tracking
 */
User.prototype.incrementFailedAttempts = async function() {
  this.failed_login_attempts += 1;
  
  if (this.failed_login_attempts >= config.security.maxLoginAttempts) {
    await this.lockAccount();
  } else {
    await this.save();
  }
};

/**
 * Check if premium subscription is active
 * @returns {boolean} Premium status
 */
User.prototype.isPremiumActive = function() {
  return this.is_premium && 
         this.premium_expires_at && 
         new Date() < this.premium_expires_at;
};

/**
 * Enhanced class methods
 */

/**
 * Enhanced user search by identifier with security considerations
 * @param {string} identifier - Username or phone number
 * @returns {Promise<User|null>} User instance or null
 */
User.findByIdentifier = async function(identifier) {
  try {
    // Normalize identifier
    const normalizedIdentifier = identifier.toLowerCase().trim();
    
    return await User.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { username: normalizedIdentifier },
          { phone_number: identifier }, // Don't normalize phone for search
          { phone_number: `+86${identifier}` } // Try with country code
        ],
        is_active: true
      }
    });
  } catch (error) {
    logger.error('Error finding user by identifier:', {
      error: error.message,
      identifier: identifier.substring(0, 3) + '***'
    });
    return null;
  }
};

/**
 * Enhanced phone number search with normalization
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<User|null>} User instance or null
 */
User.findByPhoneNumber = async function(phoneNumber) {
  try {
    // Try both with and without country code
    const searchNumbers = [phoneNumber];
    
    if (!phoneNumber.startsWith('+86')) {
      searchNumbers.push(`+86${phoneNumber}`);
    }
    
    return await User.findOne({
      where: {
        phone_number: {
          [sequelize.Sequelize.Op.in]: searchNumbers
        },
        is_active: true
      }
    });
  } catch (error) {
    logger.error('Error finding user by phone:', {
      error: error.message,
      phone: phoneNumber.substring(0, 3) + '***'
    });
    return null;
  }
};

/**
 * Enhanced email search with normalization
 * @param {string} email - Email address
 * @returns {Promise<User|null>} User instance or null
 */
User.findByEmail = async function(email) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    return await User.findOne({
      where: {
        email: normalizedEmail,
        is_active: true
      }
    });
  } catch (error) {
    logger.error('Error finding user by email:', {
      error: error.message,
      email: email.substring(0, 3) + '***'
    });
    return null;
  }
};

/**
 * Enhanced user search with privacy controls and performance optimization
 * @param {string} query - Search query
 * @param {number} limit - Result limit
 * @param {string} viewerId - ID of user performing search
 * @returns {Promise<User[]>} Array of users
 */
User.searchUsers = async function(query, limit = 20, viewerId = null) {
  try {
    const normalizedQuery = query.toLowerCase().trim();
    
    return await User.findAll({
      where: {
        [sequelize.Sequelize.Op.and]: [
          { is_active: true },
          {
            [sequelize.Sequelize.Op.or]: [
              { 
                username: { 
                  [sequelize.Sequelize.Op.like]: `%${normalizedQuery}%` 
                } 
              },
              { 
                first_name: { 
                  [sequelize.Sequelize.Op.like]: `%${normalizedQuery}%` 
                } 
              },
              { 
                last_name: { 
                  [sequelize.Sequelize.Op.like]: `%${normalizedQuery}%` 
                } 
              }
            ]
          },
          // Exclude private users unless they're friends (simplified for now)
          {
            [sequelize.Sequelize.Op.or]: [
              { is_private: false },
              { id: viewerId } // Always include self in search
            ]
          }
        ]
      },
      attributes: [
        'id', 'username', 'first_name', 'last_name', 
        'profile_picture', 'is_verified', 'is_premium'
      ],
      limit: limit,
      order: [
        // Prioritize exact username matches
        [sequelize.Sequelize.literal(`CASE WHEN username = '${normalizedQuery}' THEN 0 ELSE 1 END`)],
        ['is_verified', 'DESC'],
        ['created_at', 'DESC']
      ]
    });
  } catch (error) {
    logger.error('Error searching users:', {
      error: error.message,
      query: query.substring(0, 10) + '...',
      viewerId
    });
    return [];
  }
};

/**
 * Clean up expired verification codes and reset tokens
 * @returns {Promise<number>} Number of users cleaned up
 */
User.cleanupExpiredTokens = async function() {
  try {
    const [affectedRows] = await User.update(
      {
        verification_code: null,
        verification_code_expires: null,
        password_reset_token: null,
        password_reset_expires: null
      },
      {
        where: {
          [sequelize.Sequelize.Op.or]: [
            {
              verification_code_expires: {
                [sequelize.Sequelize.Op.lt]: new Date()
              }
            },
            {
              password_reset_expires: {
                [sequelize.Sequelize.Op.lt]: new Date()
              }
            }
          ]
        }
      }
    );
    
    if (affectedRows > 0) {
      logger.info(`Cleaned up expired tokens for ${affectedRows} users`);
    }
    
    return affectedRows;
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
    return 0;
  }
};

/**
 * Update user statistics
 * @param {string} userId - User ID
 * @param {Object} stats - Statistics to update
 */
User.updateStats = async function(userId, stats) {
  try {
    await User.update(stats, {
      where: { id: userId },
      fields: ['posts_count', 'friends_count', 'followers_count', 'following_count']
    });
  } catch (error) {
    logger.error('Error updating user stats:', {
      error: error.message,
      userId,
      stats
    });
  }
};

module.exports = User;