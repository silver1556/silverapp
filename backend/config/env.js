/**
 * Environment Configuration
 * Enhanced configuration with secure key management for China-compatible services
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Validates required environment variables with enhanced security
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value if not found
 * @param {boolean} isSecret - Whether this is a secret that should be loaded securely
 * @returns {*} Environment variable value or default
 */
const getEnvVar = (key, defaultValue = null, isSecret = false) => {
  let value = process.env[key];
  
  // For secrets in production, try to load from secure file first
  if (isSecret && process.env.NODE_ENV === 'production') {
    const secretPath = process.env[`${key}_FILE`];
    if (secretPath && fs.existsSync(secretPath)) {
      try {
        value = fs.readFileSync(secretPath, 'utf8').trim();
      } catch (error) {
        console.warn(`Failed to read secret file for ${key}:`, error.message);
      }
    }
  }
  
  if (!value && defaultValue === null) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  return value || defaultValue;
};

/**
 * Validate configuration values
 */
const validateConfig = () => {
  const errors = [];
  
  // Validate database configuration
  if (!process.env.DB_HOST) errors.push('DB_HOST is required');
  if (!process.env.DB_NAME) errors.push('DB_NAME is required');
  if (!process.env.DB_USER) errors.push('DB_USER is required');
  if (!process.env.DB_PASSWORD) errors.push('DB_PASSWORD is required');
  
  // Validate JWT secrets
  if (!process.env.JWT_SECRET) errors.push('JWT_SECRET is required');
  if (!process.env.JWT_REFRESH_SECRET) errors.push('JWT_REFRESH_SECRET is required');
  
  // Validate JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }
  
  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    errors.push('JWT_REFRESH_SECRET must be at least 32 characters long');
  }
  
  // Validate port
  const port = parseInt(process.env.PORT || '3000');
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push('PORT must be a valid port number between 1 and 65535');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

// Validate configuration on startup
validateConfig();

/**
 * Enhanced environment configuration object
 */
const config = {
  // Application settings
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '3000')),
  API_VERSION: getEnvVar('API_VERSION', 'v1'),

  // Database configuration (Enhanced for China cloud providers)
  database: {
    host: getEnvVar('DB_HOST'),
    port: parseInt(getEnvVar('DB_PORT', '3306')),
    name: getEnvVar('DB_NAME'),
    username: getEnvVar('DB_USER'),
    password: getEnvVar('DB_PASSWORD', null, true), // Mark as secret
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: parseInt(getEnvVar('DB_POOL_MAX', '10')),
      min: parseInt(getEnvVar('DB_POOL_MIN', '0')),
      acquire: parseInt(getEnvVar('DB_POOL_ACQUIRE', '30000')),
      idle: parseInt(getEnvVar('DB_POOL_IDLE', '10000'))
    },
    // Enhanced connection options for China cloud providers
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timezone: '+08:00', // China Standard Time
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
      // SSL configuration for cloud databases
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  },

  // Enhanced JWT configuration with rotation support
  jwt: {
    secret: getEnvVar('JWT_SECRET', null, true), // Mark as secret
    refreshSecret: getEnvVar('JWT_REFRESH_SECRET', null, true), // Mark as secret
    expiresIn: getEnvVar('JWT_EXPIRE', '15m'),
    refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRE', '7d'),
    issuer: getEnvVar('JWT_ISSUER', 'silverapp'),
    audience: getEnvVar('JWT_AUDIENCE', 'silverapp-users'),
    algorithm: 'HS256'
  },

  // Enhanced Redis configuration (Tencent Cloud Redis)
  redis: {
    host: getEnvVar('REDIS_HOST', 'localhost'),
    port: parseInt(getEnvVar('REDIS_PORT', '6379')),
    password: getEnvVar('REDIS_PASSWORD', '', true), // Mark as secret
    db: parseInt(getEnvVar('REDIS_DB', '0')),
    retryDelayOnFailover: parseInt(getEnvVar('REDIS_RETRY_DELAY', '100')),
    maxRetriesPerRequest: parseInt(getEnvVar('REDIS_MAX_RETRIES', '3')),
    connectTimeout: parseInt(getEnvVar('REDIS_CONNECT_TIMEOUT', '10000')),
    lazyConnect: true,
    keepAlive: true,
    family: 4, // IPv4
    keyPrefix: getEnvVar('REDIS_KEY_PREFIX', 'silverapp:')
  },

  // Enhanced Alibaba Cloud SMS configuration
  alibabaCloud: {
    accessKeyId: getEnvVar('ALIBABA_ACCESS_KEY_ID', null, true), // Mark as secret
    accessKeySecret: getEnvVar('ALIBABA_ACCESS_KEY_SECRET', null, true), // Mark as secret
    smsSignName: getEnvVar('ALIBABA_SMS_SIGN_NAME'),
    smsTemplateCode: getEnvVar('ALIBABA_SMS_TEMPLATE_CODE'),
    region: getEnvVar('ALIBABA_REGION', 'cn-hangzhou'),
    endpoint: getEnvVar('ALIBABA_SMS_ENDPOINT', 'https://dysmsapi.aliyuncs.com')
  },

  // Enhanced Tencent Cloud SMS configuration (backup)
  tencentCloud: {
    secretId: getEnvVar('TENCENT_SECRET_ID', null, true), // Mark as secret
    secretKey: getEnvVar('TENCENT_SECRET_KEY', null, true), // Mark as secret
    smsAppId: getEnvVar('TENCENT_SMS_APP_ID'),
    smsSign: getEnvVar('TENCENT_SMS_SIGN'),
    smsTemplateId: getEnvVar('TENCENT_SMS_TEMPLATE_ID'),
    region: getEnvVar('TENCENT_REGION', 'ap-beijing'),
    endpoint: getEnvVar('TENCENT_SMS_ENDPOINT', 'sms.tencentcloudapi.com')
  },

  // Enhanced Tencent Cloud COS (Cloud Object Storage) configuration
  tencentCOS: {
    secretId: getEnvVar('TENCENT_COS_SECRET_ID', null, true), // Mark as secret
    secretKey: getEnvVar('TENCENT_COS_SECRET_KEY', null, true), // Mark as secret
    bucket: getEnvVar('TENCENT_COS_BUCKET'),
    region: getEnvVar('TENCENT_COS_REGION', 'ap-beijing'),
    domain: getEnvVar('TENCENT_COS_DOMAIN'),
    protocol: getEnvVar('TENCENT_COS_PROTOCOL', 'https'),
    timeout: parseInt(getEnvVar('TENCENT_COS_TIMEOUT', '60000'))
  },

  // Enhanced Alibaba Cloud OSS configuration
  alibabaOSS: {
    accessKeyId: getEnvVar('ALIBABA_OSS_ACCESS_KEY_ID', null, true), // Mark as secret
    accessKeySecret: getEnvVar('ALIBABA_OSS_ACCESS_KEY_SECRET', null, true), // Mark as secret
    bucket: getEnvVar('ALIBABA_OSS_BUCKET'),
    region: getEnvVar('ALIBABA_OSS_REGION', 'oss-cn-hangzhou'),
    endpoint: getEnvVar('ALIBABA_OSS_ENDPOINT'),
    internal: getEnvVar('ALIBABA_OSS_INTERNAL', 'false') === 'true',
    timeout: parseInt(getEnvVar('ALIBABA_OSS_TIMEOUT', '60000'))
  },

  // Enhanced WeChat Mini Program configuration
  wechat: {
    appId: getEnvVar('WECHAT_APP_ID'),
    appSecret: getEnvVar('WECHAT_APP_SECRET', null, true), // Mark as secret
    mchId: getEnvVar('WECHAT_MCH_ID'), // For WeChat Pay
    apiKey: getEnvVar('WECHAT_API_KEY', null, true), // For WeChat Pay, mark as secret
    certPath: getEnvVar('WECHAT_CERT_PATH'), // Certificate path for WeChat Pay
    keyPath: getEnvVar('WECHAT_KEY_PATH'), // Private key path for WeChat Pay
    notifyUrl: getEnvVar('WECHAT_NOTIFY_URL'),
    sandbox: getEnvVar('WECHAT_SANDBOX', 'false') === 'true'
  },

  // Enhanced Alipay configuration with secure key handling
  alipay: {
    appId: getEnvVar('ALIPAY_APP_ID'),
    privateKeyPath: getEnvVar('ALIPAY_PRIVATE_KEY_PATH'), // Path to private key file
    publicKeyPath: getEnvVar('ALIPAY_PUBLIC_KEY_PATH'), // Path to public key file
    gateway: getEnvVar('ALIPAY_GATEWAY', 'https://openapi.alipay.com/gateway.do'),
    charset: 'utf-8',
    signType: 'RSA2',
    version: '1.0',
    timeout: parseInt(getEnvVar('ALIPAY_TIMEOUT', '30000')),
    sandbox: getEnvVar('ALIPAY_SANDBOX', 'false') === 'true'
  },

  // Enhanced security settings
  security: {
    bcryptRounds: parseInt(getEnvVar('BCRYPT_ROUNDS', '12')),
    rateLimitWindowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000')),
    rateLimitMaxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100')),
    sessionSecret: getEnvVar('SESSION_SECRET', null, true), // Mark as secret
    csrfSecret: getEnvVar('CSRF_SECRET', null, true), // Mark as secret
    encryptionKey: getEnvVar('ENCRYPTION_KEY', null, true), // Mark as secret
    passwordMinLength: parseInt(getEnvVar('PASSWORD_MIN_LENGTH', '8')),
    passwordMaxLength: parseInt(getEnvVar('PASSWORD_MAX_LENGTH', '128')),
    maxLoginAttempts: parseInt(getEnvVar('MAX_LOGIN_ATTEMPTS', '5')),
    lockoutDuration: parseInt(getEnvVar('LOCKOUT_DURATION', '900000')) // 15 minutes
  },

  // Enhanced file upload settings
  upload: {
    maxFileSize: parseInt(getEnvVar('MAX_FILE_SIZE', '10485760')), // 10MB
    maxFiles: parseInt(getEnvVar('MAX_FILES', '10')),
    uploadPath: getEnvVar('UPLOAD_PATH', 'uploads/'),
    provider: getEnvVar('UPLOAD_PROVIDER', 'tencent'), // 'tencent' or 'alibaba'
    cdnDomain: getEnvVar('CDN_DOMAIN'),
    allowedTypes: getEnvVar('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/gif,image/webp,video/mp4').split(','),
    tempPath: getEnvVar('TEMP_UPLOAD_PATH', '/tmp/uploads'),
    cleanupInterval: parseInt(getEnvVar('UPLOAD_CLEANUP_INTERVAL', '3600000')) // 1 hour
  },

  // Enhanced push notification settings (comprehensive support)
  push: {
    provider: getEnvVar('PUSH_PROVIDER', 'xiaomi'), // Primary provider
    
    // Xiaomi Push (Android)
    xiaomi: {
      appSecret: getEnvVar('XIAOMI_PUSH_APP_SECRET', null, true), // Mark as secret
      packageName: getEnvVar('XIAOMI_PUSH_PACKAGE_NAME'),
      baseUrl: getEnvVar('XIAOMI_PUSH_BASE_URL', 'https://api.xmpush.xiaomi.com')
    },
    
    // Huawei Push (Android)
    huawei: {
      appId: getEnvVar('HUAWEI_PUSH_APP_ID'),
      appSecret: getEnvVar('HUAWEI_PUSH_APP_SECRET', null, true), // Mark as secret
      baseUrl: getEnvVar('HUAWEI_PUSH_BASE_URL', 'https://push-api.cloud.huawei.com')
    },
    
    // OPPO Push (Android)
    oppo: {
      appKey: getEnvVar('OPPO_PUSH_APP_KEY'),
      masterSecret: getEnvVar('OPPO_PUSH_MASTER_SECRET', null, true), // Mark as secret
      appSecret: getEnvVar('OPPO_PUSH_APP_SECRET', null, true), // Mark as secret
      baseUrl: getEnvVar('OPPO_PUSH_BASE_URL', 'https://api.push.oppomobile.com')
    },
    
    // Vivo Push (Android)
    vivo: {
      appId: getEnvVar('VIVO_PUSH_APP_ID'),
      appKey: getEnvVar('VIVO_PUSH_APP_KEY'),
      appSecret: getEnvVar('VIVO_PUSH_APP_SECRET', null, true), // Mark as secret
      baseUrl: getEnvVar('VIVO_PUSH_BASE_URL', 'https://api-push.vivo.com.cn')
    },
    
    // Apple Push Notification Service (iOS)
    apns: {
      keyPath: getEnvVar('APNS_KEY_PATH'), // Path to .p8 key file
      keyId: getEnvVar('APNS_KEY_ID'),
      teamId: getEnvVar('APNS_TEAM_ID'),
      bundleId: getEnvVar('APNS_BUNDLE_ID'),
      production: getEnvVar('APNS_PRODUCTION', 'false') === 'true',
      topic: getEnvVar('APNS_TOPIC')
    }
  },

  // Enhanced analytics configuration (Chinese services)
  analytics: {
    provider: getEnvVar('ANALYTICS_PROVIDER', 'baidu'), // 'baidu', 'tencent'
    baidu: {
      siteId: getEnvVar('BAIDU_ANALYTICS_SITE_ID'),
      token: getEnvVar('BAIDU_ANALYTICS_TOKEN', null, true), // Mark as secret
      apiUrl: getEnvVar('BAIDU_ANALYTICS_API_URL', 'https://hm.baidu.com/hm.gif')
    },
    tencent: {
      appId: getEnvVar('TENCENT_ANALYTICS_APP_ID'),
      secretKey: getEnvVar('TENCENT_ANALYTICS_SECRET_KEY', null, true), // Mark as secret
      apiUrl: getEnvVar('TENCENT_ANALYTICS_API_URL', 'https://analytics.qq.com/api/event')
    }
  },

  // Application-specific settings
  app: {
    name: getEnvVar('APP_NAME', 'SilverApp'),
    version: getEnvVar('APP_VERSION', '1.0.0'),
    description: getEnvVar('APP_DESCRIPTION', 'Social Media App for China'),
    supportEmail: getEnvVar('SUPPORT_EMAIL', 'support@silverapp.cn'),
    maxUsersPerConversation: parseInt(getEnvVar('MAX_USERS_PER_CONVERSATION', '100')),
    maxPostsPerDay: parseInt(getEnvVar('MAX_POSTS_PER_DAY', '50')),
    maxFriendsPerUser: parseInt(getEnvVar('MAX_FRIENDS_PER_USER', '5000')),
    verificationCodeExpiry: parseInt(getEnvVar('VERIFICATION_CODE_EXPIRY', '600000')), // 10 minutes
    passwordResetExpiry: parseInt(getEnvVar('PASSWORD_RESET_EXPIRY', '900000')) // 15 minutes
  },

  // Monitoring and logging
  monitoring: {
    enableMetrics: getEnvVar('ENABLE_METRICS', 'true') === 'true',
    metricsPort: parseInt(getEnvVar('METRICS_PORT', '9090')),
    logLevel: getEnvVar('LOG_LEVEL', process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    logFormat: getEnvVar('LOG_FORMAT', 'json'),
    enableRequestLogging: getEnvVar('ENABLE_REQUEST_LOGGING', 'true') === 'true',
    enableErrorTracking: getEnvVar('ENABLE_ERROR_TRACKING', 'true') === 'true'
  }
};

/**
 * Load secure keys from files in production
 */
if (process.env.NODE_ENV === 'production') {
  // Load Alipay keys from files
  if (config.alipay.privateKeyPath && fs.existsSync(config.alipay.privateKeyPath)) {
    try {
      config.alipay.privateKey = fs.readFileSync(config.alipay.privateKeyPath, 'utf8');
    } catch (error) {
      console.error('Failed to load Alipay private key:', error.message);
    }
  }
  
  if (config.alipay.publicKeyPath && fs.existsSync(config.alipay.publicKeyPath)) {
    try {
      config.alipay.publicKey = fs.readFileSync(config.alipay.publicKeyPath, 'utf8');
    } catch (error) {
      console.error('Failed to load Alipay public key:', error.message);
    }
  }
  
  // Load WeChat certificates from files
  if (config.wechat.certPath && fs.existsSync(config.wechat.certPath)) {
    try {
      config.wechat.cert = fs.readFileSync(config.wechat.certPath);
    } catch (error) {
      console.error('Failed to load WeChat certificate:', error.message);
    }
  }
  
  if (config.wechat.keyPath && fs.existsSync(config.wechat.keyPath)) {
    try {
      config.wechat.key = fs.readFileSync(config.wechat.keyPath);
    } catch (error) {
      console.error('Failed to load WeChat private key:', error.message);
    }
  }
}

/**
 * Validate critical configuration in production
 */
if (process.env.NODE_ENV === 'production') {
  const criticalChecks = [];
  
  // Check database configuration
  if (!config.database.host || !config.database.name) {
    criticalChecks.push('Database configuration incomplete');
  }
  
  // Check JWT secrets
  if (!config.jwt.secret || !config.jwt.refreshSecret) {
    criticalChecks.push('JWT secrets not configured');
  }
  
  // Check at least one SMS provider
  if (!config.alibabaCloud.accessKeyId && !config.tencentCloud.secretId) {
    criticalChecks.push('No SMS provider configured');
  }
  
  // Check at least one storage provider
  if (!config.tencentCOS.secretId && !config.alibabaOSS.accessKeyId) {
    criticalChecks.push('No storage provider configured');
  }
  
  if (criticalChecks.length > 0) {
    console.error('Critical configuration issues in production:');
    criticalChecks.forEach(check => console.error(`- ${check}`));
    process.exit(1);
  }
}

module.exports = config;