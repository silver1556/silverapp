# SilverApp Backend - China Edition

A comprehensive social media backend API built for the Chinese market with full support for local services and infrastructure.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based with refresh tokens
- **Real-time Chat & Messaging** - Socket.IO with horizontal scaling support
- **Social Features** - Posts, comments, likes, friend system
- **File Upload & Storage** - Multi-cloud support (Tencent COS + Alibaba OSS)
- **Push Notifications** - Comprehensive support for all Chinese Android vendors + iOS
- **Payment Integration** - WeChat Pay + Alipay support
- **SMS Verification** - Alibaba Cloud SMS + Tencent Cloud SMS

### China-Specific Services
- **Cloud Storage**: Tencent Cloud COS + Alibaba Cloud OSS
- **SMS Services**: Alibaba Cloud SMS + Tencent Cloud SMS  
- **Payment**: WeChat Pay + Alipay integration
- **Push Notifications**: Xiaomi, Huawei, OPPO, Vivo + Apple Push Notifications
- **Analytics**: Baidu Analytics + Tencent Analytics

### Security & Performance
- **Enhanced Security**: XSS protection, SQL injection prevention, rate limiting
- **Horizontal Scaling**: Redis-backed Socket.IO clustering
- **Database Security**: SSL certificate validation for production
- **Secret Management**: File-based secret loading with rotation support
- **Comprehensive Validation**: Input sanitization and validation

## 📋 Prerequisites

- **Node.js** 18+ 
- **MySQL** 8.0+
- **Redis** 6.0+
- **China Cloud Accounts** (Tencent Cloud, Alibaba Cloud)

## 🛠 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd silverapp-backend
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Environment Configuration

Create `.env` file in the project root:

```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=silverapp
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Database SSL (Production)
DB_SSL_CA=/path/to/ca-cert.pem
DB_SSL_CERT=/path/to/client-cert.pem
DB_SSL_KEY=/path/to/client-key.pem

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_chars
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_at_least_32_chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Alibaba Cloud SMS
ALIBABA_ACCESS_KEY_ID=your_alibaba_access_key
ALIBABA_ACCESS_KEY_SECRET=your_alibaba_secret
ALIBABA_SMS_SIGN_NAME=your_sms_sign
ALIBABA_SMS_TEMPLATE_CODE=your_template_code

# Tencent Cloud SMS (Backup)
TENCENT_SECRET_ID=your_tencent_secret_id
TENCENT_SECRET_KEY=your_tencent_secret_key
TENCENT_SMS_APP_ID=your_sms_app_id
TENCENT_SMS_SIGN=your_sms_sign
TENCENT_SMS_TEMPLATE_ID=your_template_id

# Tencent Cloud COS
TENCENT_COS_SECRET_ID=your_cos_secret_id
TENCENT_COS_SECRET_KEY=your_cos_secret_key
TENCENT_COS_BUCKET=your_bucket_name
TENCENT_COS_REGION=ap-beijing
TENCENT_COS_DOMAIN=your_custom_domain

# Alibaba Cloud OSS (Backup)
ALIBABA_OSS_ACCESS_KEY_ID=your_oss_access_key
ALIBABA_OSS_ACCESS_KEY_SECRET=your_oss_secret
ALIBABA_OSS_BUCKET=your_oss_bucket
ALIBABA_OSS_REGION=oss-cn-hangzhou

# WeChat Pay
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_MCH_ID=your_merchant_id
WECHAT_API_KEY=your_api_key

# Alipay
ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY_PATH=/path/to/alipay_private_key.pem
ALIPAY_PUBLIC_KEY_PATH=/path/to/alipay_public_key.pem

# Push Notifications
# Xiaomi Push
XIAOMI_PUSH_APP_SECRET=your_xiaomi_app_secret
XIAOMI_PUSH_PACKAGE_NAME=com.yourapp.package

# Huawei Push
HUAWEI_PUSH_APP_ID=your_huawei_app_id
HUAWEI_PUSH_APP_SECRET=your_huawei_app_secret

# OPPO Push
OPPO_PUSH_APP_KEY=your_oppo_app_key
OPPO_PUSH_MASTER_SECRET=your_oppo_master_secret
OPPO_PUSH_APP_SECRET=your_oppo_app_secret

# Vivo Push
VIVO_PUSH_APP_ID=your_vivo_app_id
VIVO_PUSH_APP_KEY=your_vivo_app_key
VIVO_PUSH_APP_SECRET=your_vivo_app_secret

# Apple Push Notifications (iOS)
APNS_KEY_PATH=/path/to/AuthKey_XXXXXXXXXX.p8
APNS_KEY_ID=your_key_id
APNS_TEAM_ID=your_team_id
APNS_BUNDLE_ID=com.yourapp.bundle
APNS_PRODUCTION=false

# Analytics
BAIDU_ANALYTICS_SITE_ID=your_baidu_site_id
BAIDU_ANALYTICS_TOKEN=your_baidu_token
TENCENT_ANALYTICS_APP_ID=your_tencent_app_id
TENCENT_ANALYTICS_SECRET_KEY=your_tencent_secret
```

### 4. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE silverapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Run migrations (when available)
npm run migrate
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 🏗 Architecture

### Core Components

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic services
├── utils/           # Utility functions
└── errors/          # Error handling
```

### Key Services

- **SMS Service** (`services/sms.js`) - Multi-provider SMS with fallback
- **Storage Service** (`services/storage.js`) - Multi-cloud file storage
- **Push Service** (`services/push.js`) - Comprehensive push notifications
- **Payment Service** (`services/payment.js`) - WeChat Pay + Alipay
- **Socket Service** (`services/socket.js`) - Real-time communication with scaling
- **Analytics Service** (`services/analytics.js`) - Chinese analytics platforms

## 🔧 API Endpoints

### Authentication
```
POST   /api/v1/auth/register           # User registration
POST   /api/v1/auth/login              # Login with password
POST   /api/v1/auth/login-otp          # Login with OTP
POST   /api/v1/auth/verify-phone       # Verify phone number
POST   /api/v1/auth/send-verification-code  # Send verification SMS
POST   /api/v1/auth/refresh-token      # Refresh access token
POST   /api/v1/auth/forgot-password    # Password reset
POST   /api/v1/auth/reset-password     # Reset password with code
POST   /api/v1/auth/change-password    # Change password
GET    /api/v1/auth/me                 # Get current user
POST   /api/v1/auth/logout             # Logout
POST   /api/v1/auth/logout-all         # Logout from all devices
```

### Posts & Social
```
POST   /api/v1/posts                   # Create post
GET    /api/v1/posts/feed              # Get user feed
GET    /api/v1/posts/:id               # Get single post
PUT    /api/v1/posts/:id               # Update post
DELETE /api/v1/posts/:id               # Delete post
POST   /api/v1/posts/:id/like          # Like/unlike post
POST   /api/v1/posts/:id/comments      # Add comment
GET    /api/v1/posts/:id/comments      # Get comments
POST   /api/v1/posts/:id/share         # Share post
```

### Chat & Messaging
```
POST   /api/v1/chat/messages           # Send message
GET    /api/v1/chat/conversations      # Get conversations
GET    /api/v1/chat/conversations/:id/messages  # Get messages
PUT    /api/v1/chat/messages/:id/read  # Mark as read
DELETE /api/v1/chat/messages/:id       # Delete message
GET    /api/v1/chat/search             # Search messages
```

### Friends
```
POST   /api/v1/friends/request         # Send friend request
PUT    /api/v1/friends/request/:id     # Accept/decline request
GET    /api/v1/friends                 # Get friends list
GET    /api/v1/friends/requests        # Get friend requests
DELETE /api/v1/friends/:id             # Remove friend
POST   /api/v1/friends/block           # Block user
POST   /api/v1/friends/unblock         # Unblock user
```

### File Upload
```
POST   /api/v1/upload/avatar           # Upload avatar
POST   /api/v1/upload/cover            # Upload cover photo
POST   /api/v1/upload/post-media       # Upload post media
POST   /api/v1/upload/message-media    # Upload message media
POST   /api/v1/upload/presigned-url    # Get presigned URL
DELETE /api/v1/upload/:key             # Delete file
```

### Notifications
```
GET    /api/v1/notifications           # Get notifications
GET    /api/v1/notifications/counts    # Get notification counts
PUT    /api/v1/notifications/:id/read  # Mark as read
PUT    /api/v1/notifications/read-all  # Mark all as read
DELETE /api/v1/notifications/:id       # Delete notification
```

### Push Notifications
```
POST   /api/v1/push/register-token     # Register device token
DELETE /api/v1/push/remove-token       # Remove device token
GET    /api/v1/push/tokens             # Get user tokens
POST   /api/v1/push/test               # Test notification
```

### Payments
```
POST   /api/v1/payment/create-order    # Create payment order
GET    /api/v1/payment/query/:id       # Query order status
POST   /api/v1/payment/refund          # Process refund
GET    /api/v1/payment/orders          # Get user orders
```

## 🔒 Security Features

### Enhanced Security Measures
- **XSS Protection**: Robust HTML sanitization using `xss` library
- **SQL Injection Prevention**: Comprehensive input validation and sanitization
- **Rate Limiting**: Redis-backed rate limiting with multiple strategies
- **JWT Security**: Secure token generation with rotation support
- **SSL/TLS**: Strict certificate validation for database connections
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for production deployment

### Input Validation
- **Joi Validation**: Comprehensive request validation schemas
- **Custom Validators**: Username, phone, email, password strength validation
- **File Upload Security**: Type validation, size limits, malware scanning
- **SQL Injection Filters**: Multiple layers of protection

## 📊 Monitoring & Analytics

### Built-in Analytics
- **Baidu Analytics**: Primary analytics provider for China
- **Tencent Analytics**: Backup analytics provider
- **Custom Event Tracking**: User actions, social interactions, errors
- **Performance Monitoring**: Request timing, error rates, uptime

### Logging
- **Winston Logger**: Structured logging with multiple transports
- **Security Logging**: Authentication events, security violations
- **Request Logging**: API request/response logging
- **Error Tracking**: Comprehensive error logging and alerting

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**: Set all required environment variables
2. **SSL Certificates**: Configure database SSL certificates
3. **Redis Cluster**: Set up Redis for horizontal scaling
4. **Load Balancer**: Configure load balancer for multiple instances
5. **Monitoring**: Set up monitoring and alerting
6. **Backups**: Configure database and file backups

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
EXPOSE 3000
CMD ["npm", "start"]
```

### Scaling Considerations

- **Horizontal Scaling**: Redis adapter enables multiple server instances
- **Database**: Use read replicas for better performance
- **File Storage**: CDN integration for faster file delivery
- **Caching**: Redis caching for frequently accessed data

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## 📝 Development

### Code Quality
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (when configured)
- **Husky**: Git hooks for quality checks
- **Jest**: Testing framework

### Development Scripts
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
npm run migrate      # Run database migrations
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Email**: support@silverapp.cn
- **Documentation**: [API Documentation](docs/api.md)
- **Issues**: [GitHub Issues](issues)

## 🔄 Recent Updates

### v1.1.0 - Enhanced Security & Scaling
- ✅ **Enhanced Rate Limiting**: Updated to modern Redis store
- ✅ **Horizontal Scaling**: Socket.IO Redis adapter for multi-instance support
- ✅ **Database Security**: Strict SSL certificate validation
- ✅ **XSS Protection**: Robust HTML sanitization
- ✅ **File Upload Security**: Centralized validation system
- ✅ **Secret Management**: File-based secret loading with rotation

### Key Improvements
- **Security**: Enhanced XSS protection and SSL validation
- **Scalability**: Redis-backed Socket.IO clustering
- **Performance**: Optimized rate limiting and caching
- **Maintainability**: Centralized validation and error handling
- **Production Ready**: Comprehensive monitoring and logging

---

**Built with ❤️ for the Chinese market**