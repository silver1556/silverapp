# SilverApp Backend - China Edition

A comprehensive social media backend application built with Node.js, Express, and MySQL, specifically designed for the Chinese market with full integration of China-compatible services.

## 🌟 Overview

SilverApp is a Facebook-like social media platform backend that provides a complete set of APIs for user management, social interactions, real-time messaging, payments, and more. The application is specifically optimized for deployment in China with support for local cloud services, payment providers, and push notification systems.

## 🏗️ Architecture

### Core Technologies
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Authentication**: JWT with refresh tokens
- **File Storage**: Tencent Cloud COS + Alibaba Cloud OSS
- **SMS**: Alibaba Cloud SMS + Tencent Cloud SMS
- **Payments**: WeChat Pay + Alipay
- **Push Notifications**: Xiaomi, Huawei, OPPO, Vivo, APNs
- **Analytics**: Baidu Analytics + Tencent Analytics

### Project Structure
```
backend/
├── app.js                      # Express application setup
├── server.js                   # Server entry point
├── package.json                # Dependencies and scripts
├── secret_rotation.js          # JWT secret rotation system
├── config/                     # Configuration files
│   ├── env.js                  # Environment configuration
│   ├── db.js                   # Database configuration
│   └── logger.js               # Winston logger setup
├── controllers/                # Route controllers
│   ├── authController.js       # Authentication logic
│   ├── chatController.js       # Messaging functionality
│   ├── friendController.js     # Friend management
│   ├── notificationController.js # Notification system
│   └── postController.js       # Post management
├── middleware/                 # Express middleware
│   ├── auth.js                 # Authentication middleware
│   ├── rateLimiting.js         # Rate limiting
│   ├── sqlInjectionFilter.js   # SQL injection protection
│   └── validator.js            # Request validation
├── models/                     # Sequelize models
│   ├── User.js                 # User model
│   ├── Post.js                 # Post model
│   ├── Message.js              # Message model
│   ├── Friend.js               # Friend relationship model
│   ├── Notification.js         # Notification model
│   ├── PaymentOrder.js         # Payment order model
│   ├── Gift.js                 # Gift model
│   └── CurrencyTransaction.js  # Virtual currency model
├── routes/                     # API routes
│   ├── authRoutes.js           # Authentication endpoints
│   ├── chatRoutes.js           # Chat endpoints
│   ├── friendRoutes.js         # Friend management endpoints
│   ├── notificationRoutes.js   # Notification endpoints
│   ├── postRoutes.js           # Post endpoints
│   ├── paymentRoutes.js        # Payment endpoints
│   ├── pushRoutes.js           # Push notification endpoints
│   └── uploadRoutes.js         # File upload endpoints
├── services/                   # Business logic services
│   ├── analytics.js            # Analytics service
│   ├── payment.js              # Payment processing
│   ├── paymentProcessor.js     # Payment business logic
│   ├── push.js                 # Push notifications
│   ├── redis.js                # Redis client
│   ├── sms.js                  # SMS service
│   ├── socket.js               # Socket.IO service
│   └── storage.js              # Cloud storage service
├── utils/                      # Utility functions
│   ├── asyncHandler.js         # Async error handling
│   ├── helpers.js              # Common utilities
│   └── security.js             # Security utilities
└── errors/                     # Error handling
    ├── AppError.js             # Custom error classes
    └── errorHandler.js         # Global error handler
```

## 🚀 Features

### 1. User Management & Authentication
- **Registration**: Phone-based registration with SMS verification
- **Login**: Multiple login methods (username/password, phone/OTP)
- **JWT Authentication**: Access and refresh token system
- **Security**: Account locking, rate limiting, password strength validation
- **Profile Management**: Complete user profile with privacy settings
- **Premium Subscriptions**: Paid premium features

### 2. Social Features
- **Posts**: Create, edit, delete posts with media support
- **Comments**: Nested commenting system
- **Likes & Reactions**: Post interaction system
- **Sharing**: Post sharing functionality
- **Privacy Controls**: Public, friends-only, private posts
- **Hashtags**: Hashtag support and trending topics

### 3. Friend System
- **Friend Requests**: Send, accept, decline friend requests
- **Friend Management**: Add, remove, block users
- **Close Friends**: Special friend categories
- **Mutual Friends**: Find common connections
- **Friend Suggestions**: AI-powered friend recommendations
- **Privacy**: Private profiles and friend list visibility

### 4. Real-time Messaging
- **Direct Messages**: One-on-one messaging
- **Message Types**: Text, images, videos, audio, files, location, contacts
- **Real-time Delivery**: Socket.IO powered real-time messaging
- **Read Receipts**: Message delivery and read status
- **Typing Indicators**: Real-time typing status
- **Message Reactions**: Emoji reactions to messages
- **Message Forwarding**: Forward messages to multiple users
- **Message Search**: Search through message history

### 5. Notification System
- **Real-time Notifications**: Socket.IO powered notifications
- **Push Notifications**: Multi-platform push support
- **Notification Types**: Likes, comments, friend requests, messages
- **Notification Settings**: Granular notification preferences
- **Notification Categories**: Social, system, promotional, security
- **Notification History**: Complete notification management

### 6. Payment System
- **WeChat Pay Integration**: Native WeChat Pay support
- **Alipay Integration**: Alipay payment processing
- **Premium Subscriptions**: Monthly, biannual, yearly plans
- **Virtual Currency**: In-app coin system
- **Gifts**: Send virtual gifts to friends
- **Post Boosting**: Paid post promotion
- **Refund System**: Automated refund processing

### 7. File Upload & Storage
- **Multi-cloud Storage**: Tencent COS + Alibaba OSS
- **File Types**: Images, videos, audio, documents
- **Avatar & Cover**: Profile picture management
- **Post Media**: Multiple media attachments
- **Message Media**: File sharing in messages
- **CDN Integration**: Fast global content delivery

### 8. Push Notifications
- **Android Support**: Xiaomi, Huawei, OPPO, Vivo push services
- **iOS Support**: Apple Push Notification Service (APNs)
- **Device Management**: Multi-device token management
- **Notification Targeting**: User-specific notifications
- **Bulk Notifications**: Mass notification system

### 9. Analytics & Monitoring
- **Baidu Analytics**: User behavior tracking
- **Tencent Analytics**: Advanced analytics
- **Event Tracking**: Custom event monitoring
- **Performance Metrics**: API performance tracking
- **Error Tracking**: Comprehensive error logging

### 10. Security Features
- **SQL Injection Protection**: Advanced SQL injection filtering
- **Rate Limiting**: Comprehensive rate limiting system
- **JWT Security**: Token rotation and blacklisting
- **Input Validation**: Joi-based request validation
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: Security headers
- **XSS Protection**: Cross-site scripting prevention

## 📋 API Endpoints

### Authentication (`/api/v1/auth`)
```
POST   /register              # User registration
POST   /login                 # User login
POST   /login-otp             # OTP-based login
POST   /send-login-code       # Send login verification code
POST   /verify-phone          # Verify phone number
POST   /send-verification-code # Send verification code
POST   /refresh-token         # Refresh access token
POST   /forgot-password       # Initiate password reset
POST   /reset-password        # Reset password with code
POST   /change-password       # Change password (authenticated)
GET    /me                    # Get current user profile
POST   /logout                # Logout user
POST   /logout-all            # Logout from all devices
```

### Posts (`/api/v1/posts`)
```
POST   /                      # Create new post
GET    /feed                  # Get user feed
GET    /search                # Search posts
GET    /trending-hashtags     # Get trending hashtags
GET    /user/:userId          # Get user posts
GET    /:id                   # Get single post
PUT    /:id                   # Update post
DELETE /:id                   # Delete post
POST   /:id/like              # Like/unlike post
POST   /:id/comments          # Create comment
GET    /:id/comments          # Get post comments
POST   /:id/share             # Share post
POST   /:id/report            # Report post
```

### Chat (`/api/v1/chat`)
```
POST   /messages              # Send message
GET    /conversations         # Get conversations list
GET    /conversations/:id/messages # Get conversation messages
GET    /search                # Search messages
GET    /unread-count          # Get unread count
PUT    /messages/:id/read     # Mark message as read
DELETE /messages/:id          # Delete message
POST   /messages/:id/reactions # Add reaction
DELETE /messages/:id/reactions/:emoji # Remove reaction
POST   /messages/:id/forward  # Forward message
GET    /messages/:id/status   # Get message status
```

### Friends (`/api/v1/friends`)
```
POST   /request               # Send friend request
PUT    /request/:friendId     # Respond to friend request
GET    /                      # Get friends list
GET    /requests              # Get friend requests
GET    /suggestions           # Get friend suggestions
GET    /blocked               # Get blocked users
GET    /search                # Search users
GET    /:userId/mutual        # Get mutual friends
DELETE /:friendId             # Remove friend
POST   /block                 # Block user
POST   /unblock               # Unblock user
PUT    /:friendId/close-friend # Toggle close friend
```

### Notifications (`/api/v1/notifications`)
```
GET    /                      # Get notifications
GET    /counts                # Get notification counts
GET    /settings              # Get notification settings
GET    /stats                 # Get notification statistics
GET    /:id                   # Get specific notification
PUT    /settings              # Update notification settings
PUT    /:id/read              # Mark as read
PUT    /read-all              # Mark all as read
PUT    /:id/clicked           # Mark as clicked
PUT    /:id/snooze            # Snooze notification
DELETE /:id                   # Delete notification
DELETE /all                   # Delete all notifications
POST   /test                  # Send test notification
```

### Payments (`/api/v1/payment`)
```
POST   /create-order          # Create payment order
POST   /callback/wechat       # WeChat Pay callback
POST   /callback/alipay       # Alipay callback
GET    /query/:outTradeNo     # Query order status
POST   /refund                # Process refund
GET    /orders                # Get user orders
```

### File Upload (`/api/v1/upload`)
```
POST   /avatar                # Upload avatar
POST   /cover                 # Upload cover picture
POST   /post-media            # Upload post media
POST   /message-media         # Upload message media
POST   /presigned-url         # Generate presigned URL
DELETE /:key                  # Delete file
GET    /info/:key             # Get file info
```

### Push Notifications (`/api/v1/push`)
```
POST   /register-token        # Register device token
DELETE /remove-token          # Remove device token
GET    /tokens                # Get user tokens
POST   /send                  # Send notification (admin)
POST   /test                  # Test notification
GET    /stats                 # Get push statistics
GET    /health                # Check service health
```

## 📁 Detailed File Documentation

### Core Application Files

#### `app.js` - Express Application Setup
**Purpose**: Main Express application configuration and middleware setup

**Key Features**:
- **Security Middleware**: Comprehensive security setup with Helmet, CORS, XSS protection, and HPP
- **Rate Limiting**: General rate limiting with Redis backend for distributed systems
- **Body Parsing**: JSON and URL-encoded body parsing with size limits (10MB)
- **SQL Injection Protection**: Custom middleware for detecting and preventing SQL injection attacks
- **Request Logging**: Morgan logging with different configurations for development and production
- **Custom Request Tracking**: Detailed request logging with duration, IP, user agent, and user ID
- **Health Check Endpoints**: `/health` and `/api/status` endpoints for monitoring
- **API Route Mounting**: All API routes mounted under `/api/v1` prefix
- **WeChat Mini Program Support**: Dedicated endpoints for WeChat Mini Program integration
- **Global Error Handling**: Centralized error handling with detailed logging
- **Graceful Shutdown**: SIGTERM and SIGINT handlers for clean application shutdown

**Security Features**:
- Content Security Policy (CSP) configured for China-compatible domains
- CORS configured for production and development environments
- Parameter pollution prevention with whitelisted parameters
- XSS attack prevention
- SQL injection logging and filtering

**Environment-Specific Configuration**:
- Development: Detailed console logging
- Production: File-based logging with security-focused error responses

#### `server.js` - Server Entry Point
**Purpose**: Application bootstrap, service initialization, and server startup

**Key Features**:
- **Service Initialization**: Comprehensive initialization of all services in proper order
- **Database Setup**: Connection testing and database initialization with model associations
- **Redis Integration**: Redis service connection with fallback handling
- **Secret Rotation**: JWT secret rotation system initialization
- **Service Health Checks**: Availability checks for SMS, storage, push, payment, and analytics services
- **Socket.IO Integration**: Real-time communication setup
- **Error Handling**: Uncaught exception and unhandled rejection handlers
- **Graceful Shutdown**: Proper cleanup of database and Redis connections
- **Port Management**: Dynamic port configuration with validation
- **Startup Logging**: Comprehensive startup information and service status

**Service Dependencies**:
- Database (MySQL) - Required
- Redis - Optional with graceful degradation
- SMS Service - Optional (Alibaba Cloud + Tencent Cloud)
- Storage Service - Optional (Tencent COS + Alibaba OSS)
- Push Service - Optional (Multi-platform support)
- Payment Service - Optional (WeChat Pay + Alipay)
- Analytics Service - Optional (Baidu + Tencent)

#### `secret_rotation.js` - JWT Security System
**Purpose**: Automated JWT secret rotation for enhanced security

**Key Features**:
- **Automatic Rotation**: 24-hour rotation cycle with configurable intervals
- **Grace Period**: 1-hour grace period for token validation during rotation
- **Rotation History**: Tracks last 10 rotations for audit purposes
- **Redis Integration**: Distributed system support with rotation state sharing
- **Manual Triggers**: Force rotation capability for security incidents
- **File-based Storage**: Secure secret storage in JSON format
- **Cleanup Operations**: Automatic cleanup of expired tokens and old secrets
- **Statistics**: Rotation statistics and monitoring

**Security Benefits**:
- Reduces impact of secret compromise
- Automatic key rotation without service interruption
- Audit trail for security compliance
- Distributed system synchronization

### Configuration Files

#### `config/env.js` - Environment Configuration
**Purpose**: Centralized configuration management with enhanced security

**Key Features**:
- **Environment Validation**: Comprehensive validation of required environment variables
- **Secure Secret Loading**: File-based secret loading for production environments
- **Database Configuration**: MySQL connection settings with SSL support for cloud databases
- **JWT Configuration**: Enhanced JWT settings with issuer, audience, and algorithm specification
- **Redis Configuration**: Complete Redis setup with retry logic and connection pooling
- **Cloud Service Integration**: Configuration for all Chinese cloud services
- **Security Settings**: Comprehensive security configuration including bcrypt rounds, rate limits
- **File Upload Settings**: Upload limits, allowed types, and storage provider configuration
- **Push Notification Settings**: Multi-platform push service configuration
- **Analytics Configuration**: Baidu and Tencent Analytics setup

**Security Features**:
- Secret strength validation (minimum 32 characters for JWT secrets)
- Production-specific validation checks
- Secure file-based secret loading
- Environment-specific database SSL configuration

**Supported Services**:
- **SMS**: Alibaba Cloud SMS, Tencent Cloud SMS
- **Storage**: Tencent Cloud COS, Alibaba Cloud OSS
- **Payment**: WeChat Pay, Alipay
- **Push**: Xiaomi, Huawei, OPPO, Vivo, APNs
- **Analytics**: Baidu Analytics, Tencent Analytics

#### `config/db.js` - Database Configuration
**Purpose**: Sequelize ORM setup and database management

**Key Features**:
- **Connection Management**: MySQL connection with comprehensive configuration
- **Connection Pooling**: Optimized pool settings for performance
- **Model Associations**: Automatic setup of all model relationships
- **Database Synchronization**: Development and production sync strategies
- **Connection Testing**: Health check functionality
- **Retry Logic**: Automatic retry for connection failures
- **Timezone Configuration**: UTC timezone for consistent data storage
- **Performance Optimization**: Query optimization and connection settings

**Model Associations**:
- User ↔ Post (one-to-many)
- User ↔ Friend (many-to-many through Friend model)
- User ↔ Message (one-to-many for sent/received)
- User ↔ Notification (one-to-many)
- User ↔ PaymentOrder (one-to-many)
- User ↔ Gift (one-to-many for sent/received)
- Post ↔ Comment (self-referencing for comments)

**Error Handling**:
- Connection failure retry logic
- Graceful degradation for connection issues
- Comprehensive error logging

#### `config/logger.js` - Logging Configuration
**Purpose**: Winston logger setup for comprehensive application logging

**Key Features**:
- **Multiple Transports**: File and console logging with rotation
- **Log Levels**: Debug, info, warn, error with environment-specific defaults
- **Structured Logging**: JSON format for production, colorized for development
- **Log Rotation**: Automatic log file rotation (5MB files, 5 file history)
- **Error Tracking**: Separate error log files
- **Exception Handling**: Uncaught exception and rejection logging
- **Utility Functions**: Helper functions for specific logging scenarios

**Log Categories**:
- **Request Logging**: API request details with response times
- **Authentication Events**: Login, logout, registration events
- **Database Operations**: Database query logging (development only)
- **Security Events**: Failed logins, rate limiting, suspicious activity

**Production Features**:
- Structured JSON logging for log aggregation
- Sensitive data redaction
- Performance-optimized logging

### Controllers

#### `controllers/authController.js` - Authentication Logic
**Purpose**: Comprehensive user authentication and authorization system

**Key Features**:
- **Enhanced Registration**: Phone-based registration with SMS verification and comprehensive validation
- **Multiple Login Methods**: Username/password and phone/OTP authentication
- **Security Measures**: Account locking, failed attempt tracking, rate limiting
- **Token Management**: JWT access and refresh token generation with rotation support
- **Password Security**: Bcrypt hashing with configurable rounds, strength validation
- **Phone Verification**: SMS-based phone number verification with rate limiting
- **Password Reset**: Secure password reset flow with verification codes
- **Session Management**: Comprehensive session tracking and management
- **Security Logging**: Detailed logging of all authentication events

**Security Features**:
- Account locking after 5 failed attempts
- Rate limiting on authentication endpoints
- Password strength validation
- Verification code rate limiting (3 SMS per hour)
- IP-based tracking and logging
- Device fingerprinting support
- Refresh token rotation
- Token blacklisting on logout

**API Endpoints**:
- `POST /register` - User registration with phone verification
- `POST /login` - Username/password login
- `POST /login-otp` - Phone/OTP login
- `POST /verify-phone` - Phone number verification
- `POST /send-verification-code` - Send SMS verification code
- `POST /refresh-token` - Refresh access token
- `POST /forgot-password` - Initiate password reset
- `POST /reset-password` - Reset password with code
- `POST /change-password` - Change password (authenticated)
- `GET /me` - Get current user profile
- `POST /logout` - Logout user
- `POST /logout-all` - Logout from all devices

#### `controllers/postController.js` - Post Management
**Purpose**: Social media post functionality with comprehensive features

**Key Features**:
- **Post Creation**: Rich post creation with media support, hashtag extraction, user tagging
- **Feed Generation**: Personalized feed with privacy controls and friend-based filtering
- **Interaction System**: Like/unlike functionality with Redis-based tracking
- **Comment System**: Nested commenting with media support
- **Sharing System**: Post sharing with custom messages
- **Privacy Controls**: Public, friends-only, and private post visibility
- **Content Moderation**: Post reporting and moderation features
- **Search Functionality**: Full-text search across posts
- **Media Handling**: Multiple media attachments with type detection
- **Hashtag System**: Automatic hashtag extraction and trending topics

**Privacy Implementation**:
- Public posts visible to all users
- Friends-only posts visible to confirmed friends
- Private posts visible only to the author
- Dynamic privacy checking based on friendship status

**API Endpoints**:
- `POST /` - Create new post
- `GET /feed` - Get personalized user feed
- `GET /search` - Search posts
- `GET /trending-hashtags` - Get trending hashtags
- `GET /user/:userId` - Get user posts with privacy filtering
- `GET /:id` - Get single post
- `PUT /:id` - Update post (owner only)
- `DELETE /:id` - Delete post (owner/admin only)
- `POST /:id/like` - Toggle like on post
- `POST /:id/comments` - Create comment
- `GET /:id/comments` - Get post comments
- `POST /:id/share` - Share post
- `POST /:id/report` - Report post

#### `controllers/chatController.js` - Messaging System
**Purpose**: Real-time messaging functionality with comprehensive features

**Key Features**:
- **Message Types**: Support for text, images, videos, audio, files, location, and contact messages
- **Real-time Delivery**: Socket.IO integration for instant message delivery
- **Conversation Management**: Automatic conversation creation and management
- **Read Receipts**: Message delivery and read status tracking
- **Message Reactions**: Emoji reactions with user tracking
- **Message Forwarding**: Forward messages to multiple recipients
- **Message Search**: Full-text search across message history
- **Privacy Controls**: Friend-based messaging permissions
- **Blocking Support**: Respect user blocking relationships
- **Media Handling**: File attachments with type validation

**Real-time Features**:
- Instant message delivery via Socket.IO
- Typing indicators
- Online presence tracking
- Read receipt notifications
- Message reaction updates

**API Endpoints**:
- `POST /messages` - Send message
- `GET /conversations` - Get conversations list
- `GET /conversations/:id/messages` - Get conversation messages
- `GET /search` - Search messages
- `GET /unread-count` - Get unread message count
- `PUT /messages/:id/read` - Mark message as read
- `DELETE /messages/:id` - Delete message
- `POST /messages/:id/reactions` - Add reaction
- `DELETE /messages/:id/reactions/:emoji` - Remove reaction
- `POST /messages/:id/forward` - Forward message
- `GET /messages/:id/status` - Get message delivery status

#### `controllers/friendController.js` - Social Connections
**Purpose**: Comprehensive friend relationship management system

**Key Features**:
- **Friend Request System**: Send, accept, decline, and block friend requests
- **Friend Management**: Add, remove, and organize friends
- **Close Friends**: Special friend categories for enhanced privacy
- **Mutual Friends**: Discover common connections between users
- **Friend Suggestions**: Algorithm-based friend recommendations
- **User Search**: Search for users with privacy controls
- **Blocking System**: Block and unblock users with relationship cleanup
- **Privacy Controls**: Private profiles and friend list visibility
- **Relationship Tracking**: Track friendship dates and interactions

**Friend Request Workflow**:
1. Send friend request
2. Recipient can accept, decline, or block
3. Accepted requests create bidirectional friendship
4. Declined requests can be sent again later
5. Blocked requests prevent future communication

**API Endpoints**:
- `POST /request` - Send friend request
- `PUT /request/:friendId` - Respond to friend request (accept/decline/block)
- `GET /` - Get friends list with pagination
- `GET /requests` - Get friend requests (received/sent)
- `GET /suggestions` - Get friend suggestions
- `GET /blocked` - Get blocked users
- `GET /search` - Search users
- `GET /:userId/mutual` - Get mutual friends
- `DELETE /:friendId` - Remove friend
- `POST /block` - Block user
- `POST /unblock` - Unblock user
- `PUT /:friendId/close-friend` - Toggle close friend status

#### `controllers/notificationController.js` - Notification System
**Purpose**: Comprehensive user notification management with push integration

**Key Features**:
- **Notification Categories**: Social, system, promotional, and security notifications
- **Real-time Delivery**: Socket.IO integration for instant notifications
- **Push Integration**: Multi-platform push notification support
- **Notification Preferences**: Granular user preferences for notification types
- **Notification History**: Complete notification management and history
- **Bulk Operations**: Mark all as read, delete all notifications
- **Notification Analytics**: Statistics and tracking
- **Snooze Functionality**: Temporarily hide notifications
- **Priority Levels**: Low, normal, high, urgent priority levels

**Notification Types**:
- **Social**: Likes, comments, friend requests, mentions
- **System**: Account updates, security alerts, maintenance
- **Promotional**: Feature announcements, premium offers
- **Security**: Login alerts, password changes, suspicious activity

**API Endpoints**:
- `GET /` - Get user notifications with filtering
- `GET /counts` - Get notification counts by category
- `GET /settings` - Get notification preferences
- `GET /stats` - Get notification statistics
- `GET /:id` - Get specific notification
- `PUT /settings` - Update notification preferences
- `PUT /:id/read` - Mark notification as read
- `PUT /read-all` - Mark all notifications as read
- `PUT /:id/clicked` - Mark notification as clicked
- `PUT /:id/snooze` - Snooze notification
- `DELETE /:id` - Delete notification
- `DELETE /all` - Delete all notifications
- `POST /test` - Send test notification

### Middleware

#### `middleware/auth.js` - Authentication Middleware
**Purpose**: Comprehensive authentication and authorization middleware

**Key Features**:
- **JWT Verification**: Access and refresh token verification with enhanced security
- **Token Blacklisting**: Redis-based token blacklisting for logout functionality
- **Role-based Access**: Role-based authorization middleware
- **Ownership Verification**: Resource ownership validation
- **Rate Limiting**: Authentication-specific rate limiting
- **Device Authentication**: Device-specific authentication support
- **Security Logging**: Comprehensive authentication event logging
- **Session Management**: User session tracking and management

**Security Features**:
- Token format validation
- Token age verification for sensitive operations
- Password change detection and token invalidation
- Account status verification (active, locked)
- IP and user agent tracking
- Failed authentication logging

**Middleware Functions**:
- `authenticate` - Standard JWT authentication
- `optionalAuth` - Optional authentication for public endpoints
- `requireRole` - Role-based access control
- `requireOwnership` - Resource ownership verification
- `verifyPhoneOwnership` - Phone number ownership validation
- `authRateLimit` - Authentication rate limiting
- `validateRefreshToken` - Refresh token validation

#### `middleware/rateLimiting.js` - Rate Limiting System
**Purpose**: Comprehensive API rate limiting and abuse prevention

**Key Features**:
- **Multiple Strategies**: Fixed window, sliding window, and burst rate limiting
- **Redis Backend**: Distributed rate limiting with Redis storage
- **Endpoint-specific Limits**: Different limits for different API endpoints
- **User-based Limiting**: Per-user rate limiting with authentication
- **Dynamic Limits**: Adaptive rate limiting based on user tier
- **IP-based Limiting**: IP address rate limiting for anonymous users
- **Comprehensive Logging**: Rate limit violation logging and monitoring

**Rate Limit Types**:
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **SMS**: 3 SMS per hour per phone number
- **Password Reset**: 3 attempts per hour
- **File Upload**: 10 uploads per 15 minutes
- **Search**: 30 searches per minute
- **Post Creation**: 20 posts per hour
- **Messaging**: 60 messages per minute
- **Friend Requests**: 50 requests per hour

**Advanced Features**:
- Skip rate limiting for admin users in development
- Health check endpoint exemption
- Custom rate limit creation
- Burst rate limiting for short-term spikes
- Sliding window implementation

#### `middleware/sqlInjectionFilter.js` - SQL Injection Protection
**Purpose**: Advanced SQL injection attack detection and prevention

**Key Features**:
- **Pattern Detection**: Comprehensive SQL injection pattern recognition
- **Context Awareness**: Different filtering based on input context
- **Severity Assessment**: Risk level assessment (low, medium, high, critical)
- **Input Sanitization**: Automatic input cleaning and sanitization
- **Logging Mode**: Detection-only mode for monitoring
- **Configurable Response**: Block, sanitize, or log-only modes
- **Custom Patterns**: Support for custom injection patterns

**Detection Patterns**:
- Basic SQL keywords (SELECT, INSERT, UPDATE, DELETE, DROP)
- SQL comments (-- /* */ ;--)
- Boolean-based injection patterns
- Union-based injection attempts
- Time-based blind injection
- Error-based injection
- NoSQL injection patterns
- XPath injection patterns
- LDAP injection patterns

**Security Features**:
- Real-time threat detection
- Comprehensive logging with context
- Configurable severity thresholds
- Input sanitization capabilities
- Custom pattern support

#### `middleware/validator.js` - Request Validation
**Purpose**: Comprehensive request validation using Joi schemas

**Key Features**:
- **Schema-based Validation**: Joi schemas for all API endpoints
- **Custom Validation**: Custom validation rules for complex scenarios
- **Input Sanitization**: Automatic input cleaning and normalization
- **Security Validation**: Username, password, email, phone validation
- **File Validation**: File type and size validation
- **Error Formatting**: Standardized error response formatting

**Validation Schemas**:
- **Authentication**: Registration, login, password reset schemas
- **User Management**: Profile update, search schemas
- **Posts**: Post creation, update, comment schemas
- **Messaging**: Message sending, conversation schemas
- **Friends**: Friend request, management schemas
- **Notifications**: Notification management schemas
- **Payments**: Payment order, refund schemas
- **File Upload**: Upload validation schemas

**Custom Validations**:
- Username availability checking
- Phone number availability checking
- Email availability checking
- Password strength validation
- File upload validation

### Models

#### `models/User.js` - User Model
**Purpose**: Comprehensive user data management and authentication

**Key Features**:
- **User Profile**: Complete user profile with personal information
- **Authentication**: Password hashing, verification, and security features
- **Phone/Email Verification**: Verification status tracking and code management
- **Premium Subscriptions**: Premium status and subscription management
- **Security Features**: Account locking, failed attempt tracking, password change tracking
- **Privacy Settings**: Comprehensive privacy and notification preferences
- **Virtual Currency**: In-app currency system
- **Activity Tracking**: Login count, last login, IP tracking
- **Role System**: User roles for permissions (user, moderator, admin, super_admin)

**Security Features**:
- Bcrypt password hashing with configurable rounds
- Account locking after failed attempts
- Password change timestamp tracking
- Verification code generation with rate limiting
- Two-factor authentication support
- Security alert preferences

**Database Schema**:
- **Identity**: ID (UUID), username, email, phone_number
- **Authentication**: password_hash, refresh_token, verification codes
- **Profile**: names, date_of_birth, gender, bio, location, website
- **Media**: profile_picture, cover_picture
- **Status**: is_active, is_verified, phone_verified, email_verified
- **Premium**: is_premium, premium_expires_at, premium_type
- **Security**: failed_login_attempts, locked_until, password_changed_at
- **Preferences**: privacy_settings, notification_settings
- **Tracking**: last_login, login_count, last_ip, last_user_agent
- **Currency**: virtual_currency balance
- **Metrics**: posts_count, friends_count, followers_count

#### `models/Post.js` - Post Model
**Purpose**: Social media post management with comprehensive features

**Key Features**:
- **Content Management**: Text content, media URLs, and metadata
- **Media Support**: Multiple media types (images, videos, mixed)
- **Post Types**: Regular posts, comments, and shared posts
- **Privacy Controls**: Public, friends-only, and private visibility
- **Social Features**: Likes, comments, shares counting
- **Hashtag Support**: Automatic hashtag extraction and storage
- **User Tagging**: Tag users in posts with notification support
- **Content Moderation**: Reporting and moderation features
- **Scheduling**: Scheduled post support

**Database Schema**:
- **Identity**: ID (UUID), user_id, post_type
- **Content**: content, media_urls, media_type
- **Relationships**: parent_id (for comments), shared_post_id
- **Privacy**: privacy level
- **Metadata**: location, tagged_users, hashtags
- **Metrics**: likes_count, comments_count, shares_count
- **Status**: is_edited, is_deleted, is_reported, is_pinned
- **Scheduling**: scheduled_at, is_published

**Privacy Implementation**:
- Dynamic privacy checking based on user relationships
- Friend-based visibility controls
- Public post global visibility

#### `models/Message.js` - Message Model
**Purpose**: Comprehensive messaging system with real-time features

**Key Features**:
- **Message Types**: Text, image, video, audio, file, location, contact, sticker, GIF
- **Conversation Management**: Automatic conversation ID generation
- **Delivery Tracking**: Delivery and read status with timestamps
- **Message Reactions**: Emoji reactions with user tracking
- **Message Threading**: Reply-to functionality
- **Media Metadata**: File size, duration, dimensions for media messages
- **Message Forwarding**: Track forwarded messages
- **Encryption Support**: End-to-end encryption key storage
- **Message Expiration**: Disappearing messages support

**Database Schema**:
- **Identity**: ID (UUID), sender_id, receiver_id, conversation_id
- **Content**: content, message_type, media_url, media_metadata
- **Relationships**: reply_to_id, forwarded_from
- **Status**: is_read, read_at, is_delivered, delivered_at
- **Editing**: is_edited, edited_at
- **Deletion**: is_deleted, deleted_at, deleted_for
- **Social**: reactions, mentions
- **Special**: location_data, contact_data, expires_at
- **Security**: encryption_key

**Real-time Features**:
- Socket.IO integration for instant delivery
- Read receipt notifications
- Typing indicators
- Online presence tracking

#### `models/Friend.js` - Friend Relationship Model
**Purpose**: Comprehensive social connection management

**Key Features**:
- **Friendship Workflow**: Request, accept, decline, block workflow
- **Relationship Tracking**: Friendship dates, interaction counts
- **Close Friends**: Special friend categories
- **Blocking System**: User blocking with relationship cleanup
- **Mutual Friends**: Common connection discovery
- **Friend Suggestions**: Algorithm-based recommendations
- **Interaction Tracking**: Track friendship interactions and activity

**Database Schema**:
- **Identity**: ID (UUID), user_id, friend_id
- **Status**: status (pending, accepted, blocked, declined)
- **Tracking**: requested_by, requested_at, accepted_at
- **Blocking**: blocked_at, blocked_by
- **Categories**: is_close_friend
- **Analytics**: interaction_count, last_interaction
- **Notes**: private notes about friends

**Relationship Logic**:
- Consistent user ID ordering for friendship pairs
- Bidirectional friendship representation
- Status-based access control
- Blocking relationship enforcement

#### `models/Notification.js` - Notification Model
**Purpose**: Comprehensive notification management system

**Key Features**:
- **Notification Types**: Like, comment, share, follow, friend request, mention, message, system
- **Categories**: Social, system, promotional, security
- **Priority Levels**: Low, normal, high, urgent
- **Delivery Tracking**: Push, email, SMS delivery status
- **User Interaction**: Read, seen, clicked status tracking
- **Rich Content**: Title, message, action URL, image support
- **Expiration**: Notification expiration and cleanup
- **Analytics**: Click tracking and engagement metrics

**Database Schema**:
- **Identity**: ID (UUID), user_id, from_user_id
- **Content**: type, title, message, data, action_url
- **Media**: icon, image_url
- **Status**: is_read, read_at, is_seen, seen_at, is_clicked, clicked_at
- **Classification**: priority, category
- **Delivery**: is_push_sent, push_sent_at, is_email_sent, email_sent_at, is_sms_sent, sms_sent_at
- **Lifecycle**: expires_at, is_deleted, deleted_at
- **Analytics**: metadata

**Notification Workflow**:
- Creation with automatic categorization
- Real-time delivery via Socket.IO
- Push notification integration
- User interaction tracking
- Automatic cleanup of old notifications

#### `models/PaymentOrder.js` - Payment Order Model
**Purpose**: Payment transaction management for Chinese payment systems

**Key Features**:
- **Multi-provider Support**: WeChat Pay and Alipay integration
- **Order Tracking**: Complete order lifecycle management
- **Payment Status**: Pending, paid, failed, cancelled, refunded status tracking
- **Refund Management**: Refund processing and tracking
- **Order Types**: Premium subscriptions, gifts, post boosts, virtual currency
- **Transaction Security**: Transaction ID tracking and verification
- **Metadata Storage**: Additional payment-specific data storage

**Database Schema**:
- **Identity**: ID (UUID), userId, outTradeNo
- **Payment**: amount, description, provider, orderType
- **Status**: status, transactionId, paidAt
- **Refund**: refundId, refundedAt, refundAmount, refundReason
- **Metadata**: paymentData, metadata

**Payment Workflow**:
- Order creation with unique trade number
- Payment provider integration
- Callback verification and processing
- Status updates and notifications
- Refund processing when needed

#### `models/Gift.js` - Gift Model
**Purpose**: Virtual gift system for user interactions

**Key Features**:
- **Gift Types**: Premium subscriptions, virtual coins, stickers
- **Gift Workflow**: Send, deliver, claim workflow
- **Message Support**: Personal messages with gifts
- **Status Tracking**: Pending, delivered, claimed status
- **Amount Tracking**: Gift value and currency tracking

**Database Schema**:
- **Identity**: ID (UUID), senderId, recipientId
- **Gift**: giftType, amount, message
- **Status**: status, deliveredAt, claimedAt

#### `models/CurrencyTransaction.js` - Virtual Currency Model
**Purpose**: Virtual currency transaction tracking

**Key Features**:
- **Transaction Types**: Purchase, gift, spend, refund, bonus
- **Balance Tracking**: Before and after balance recording
- **Transaction History**: Complete transaction audit trail
- **Payment Integration**: Link to real money transactions
- **Related Entity Tracking**: Track related gifts, orders, etc.

**Database Schema**:
- **Identity**: ID (UUID), userId
- **Transaction**: type, amount, balanceBefore, balanceAfter
- **Details**: description, paymentAmount, relatedId

### Services

#### `services/sms.js` - SMS Service
**Purpose**: SMS sending via Chinese cloud providers with fallback support

**Key Features**:
- **Multi-provider Support**: Alibaba Cloud SMS and Tencent Cloud SMS
- **Fallback Mechanism**: Automatic fallback between providers
- **Rate Limiting**: SMS rate limiting (5 SMS per hour per phone)
- **Template Management**: SMS template support for different message types
- **Delivery Tracking**: SMS delivery status tracking
- **Phone Validation**: Chinese phone number format validation
- **Security**: Phone number masking for logging

**Supported Message Types**:
- Verification codes for registration
- Login codes for authentication
- Password reset codes
- General notifications

**Provider Integration**:
- **Alibaba Cloud SMS**: Primary provider with template support
- **Tencent Cloud SMS**: Backup provider with template support
- Automatic provider selection and fallback

#### `services/storage.js` - Cloud Storage Service
**Purpose**: File storage via Chinese cloud providers with multi-cloud support

**Key Features**:
- **Multi-cloud Support**: Tencent Cloud COS and Alibaba Cloud OSS
- **Fallback Mechanism**: Automatic fallback between providers
- **File Type Support**: Images, videos, audio, documents
- **CDN Integration**: Content delivery network support
- **Presigned URLs**: Direct upload URL generation
- **File Management**: Upload, delete, and file info operations
- **Security**: File type validation and size limits

**Storage Providers**:
- **Tencent Cloud COS**: Primary storage with CDN support
- **Alibaba Cloud OSS**: Backup storage with CDN support
- Automatic provider selection based on configuration

**File Operations**:
- Upload with automatic key generation
- Delete with provider-specific handling
- File info retrieval
- Presigned URL generation for direct uploads

#### `services/payment.js` - Payment Service
**Purpose**: Payment processing for Chinese market with WeChat Pay and Alipay

**Key Features**:
- **WeChat Pay Integration**: Native WeChat Pay support with unified order API
- **Alipay Integration**: Alipay payment processing with RSA signature
- **Callback Verification**: Secure payment callback verification
- **Order Management**: Payment order creation and tracking
- **Refund Processing**: Automated refund handling
- **Security**: Payment signature verification and validation

**Payment Providers**:
- **WeChat Pay**: Mobile and web payment support
- **Alipay**: Web and mobile payment support
- Automatic provider selection based on user preference

**Security Features**:
- Payment signature generation and verification
- Callback authenticity verification
- Order amount and status validation
- Secure API key management

#### `services/paymentProcessor.js` - Payment Business Logic
**Purpose**: Business logic for payment processing and feature activation

**Key Features**:
- **Order Processing**: Process successful payments and activate features
- **Premium Subscriptions**: Activate premium features based on payment amount
- **Virtual Currency**: Add virtual coins to user accounts
- **Gift Processing**: Handle gift transactions between users
- **Post Boosting**: Activate post promotion features
- **Refund Processing**: Reverse payment effects for refunds

**Order Types**:
- **Premium**: Activate premium subscription (monthly, biannual, yearly)
- **Coins**: Add virtual currency to user account
- **Gifts**: Transfer benefits to recipient users
- **Boost**: Promote posts for increased visibility

#### `services/push.js` - Push Notification Service
**Purpose**: Multi-platform push notification support for Chinese and international markets

**Key Features**:
- **Android Support**: Xiaomi, Huawei, OPPO, Vivo push services
- **iOS Support**: Apple Push Notification Service (APNs)
- **Device Management**: Multi-device token registration and management
- **Bulk Notifications**: Send notifications to multiple users
- **Delivery Tracking**: Push notification delivery status
- **Platform Optimization**: Platform-specific notification formatting

**Supported Platforms**:
- **Xiaomi Push**: For Xiaomi devices
- **Huawei Push**: For Huawei devices
- **OPPO Push**: For OPPO devices
- **Vivo Push**: For Vivo devices
- **APNs**: For iOS devices

**Features**:
- Token management with Redis storage
- Platform-specific API integration
- Bulk notification support
- Delivery status tracking
- Test notification functionality

#### `services/socket.js` - Real-time Communication
**Purpose**: Socket.IO based real-time features for messaging and notifications

**Key Features**:
- **Real-time Messaging**: Instant message delivery
- **Presence Tracking**: Online/offline status tracking
- **Typing Indicators**: Real-time typing status
- **Notification Delivery**: Real-time notification push
- **Connection Management**: User connection tracking
- **Room Management**: Conversation and user rooms
- **Authentication**: Socket authentication with JWT

**Real-time Features**:
- Instant message delivery
- Read receipt notifications
- Typing indicators
- Online presence updates
- Live notifications
- Friend status changes

#### `services/redis.js` - Redis Client
**Purpose**: Redis cache and session management with comprehensive features

**Key Features**:
- **Connection Management**: Automatic connection and reconnection
- **Data Operations**: Get, set, delete, increment, decrement operations
- **Expiration**: TTL management for cached data
- **Data Structures**: Support for strings, sets, lists, hashes
- **Error Handling**: Graceful error handling and retry logic
- **Performance**: Optimized for high-throughput operations

**Use Cases**:
- Session storage
- Rate limiting counters
- Token blacklisting
- User activity tracking
- Cache management
- Real-time data storage

#### `services/analytics.js` - Analytics Service
**Purpose**: User behavior and performance tracking via Chinese analytics services

**Key Features**:
- **Baidu Analytics**: Web analytics integration
- **Tencent Analytics**: Mobile analytics integration
- **Event Tracking**: Custom event monitoring
- **Performance Metrics**: API performance tracking
- **Error Tracking**: Error monitoring and reporting
- **User Behavior**: User interaction tracking

**Analytics Providers**:
- **Baidu Analytics**: Web-based user tracking
- **Tencent Analytics**: Mobile app analytics
- Custom event tracking for both platforms

**Tracked Events**:
- User actions (login, registration, posts)
- Page views and navigation
- Social interactions (likes, comments, shares)
- Error events and exceptions
- Performance metrics

### Routes

#### `routes/authRoutes.js` - Authentication Routes
**Purpose**: Authentication and user management API endpoints

**Security Features**:
- Rate limiting on all authentication endpoints
- SQL injection protection
- Input validation with Joi schemas
- Custom validation for username, phone, email availability
- Password strength validation

**Endpoints**:
- `POST /register` - User registration with phone verification
- `POST /login` - Username/password authentication
- `POST /login-otp` - Phone/OTP authentication
- `POST /send-login-code` - Send login verification code
- `POST /verify-phone` - Verify phone number
- `POST /send-verification-code` - Send verification code
- `POST /refresh-token` - Refresh access token
- `POST /forgot-password` - Initiate password reset
- `POST /reset-password` - Reset password with verification code
- `POST /change-password` - Change password (authenticated)
- `GET /me` - Get current user profile
- `POST /logout` - Logout user
- `POST /logout-all` - Logout from all devices

#### `routes/postRoutes.js` - Post Management Routes
**Purpose**: Social media post functionality API endpoints

**Features**:
- Optional authentication for public endpoints
- Rate limiting for post creation
- Input validation and sanitization
- SQL injection protection
- Media upload support

**Endpoints**:
- `POST /` - Create new post (authenticated, rate limited)
- `GET /feed` - Get personalized user feed (authenticated)
- `GET /search` - Search posts (public, rate limited)
- `GET /trending-hashtags` - Get trending hashtags (public)
- `GET /user/:userId` - Get user posts (public with privacy)
- `GET /:id` - Get single post (public with privacy)
- `PUT /:id` - Update post (authenticated, owner only)
- `DELETE /:id` - Delete post (authenticated, owner/admin)
- `POST /:id/like` - Like/unlike post (authenticated)
- `POST /:id/comments` - Create comment (authenticated)
- `GET /:id/comments` - Get post comments (public with privacy)
- `POST /:id/share` - Share post (authenticated, rate limited)
- `POST /:id/report` - Report post (authenticated)

#### `routes/chatRoutes.js` - Chat and Messaging Routes
**Purpose**: Real-time messaging API endpoints

**Features**:
- Authentication required for all endpoints
- Rate limiting for message sending
- Input validation for message content
- Real-time integration with Socket.IO

**Endpoints**:
- `POST /messages` - Send message (rate limited)
- `GET /conversations` - Get conversations list
- `GET /conversations/:conversationId/messages` - Get conversation messages
- `GET /search` - Search messages (rate limited)
- `GET /unread-count` - Get unread message count
- `PUT /messages/:messageId/read` - Mark message as read
- `DELETE /messages/:messageId` - Delete message
- `POST /messages/:messageId/reactions` - Add reaction to message
- `DELETE /messages/:messageId/reactions/:emoji` - Remove reaction
- `POST /messages/:messageId/forward` - Forward message (rate limited)
- `GET /messages/:messageId/status` - Get message delivery status

#### `routes/friendRoutes.js` - Friend Management Routes
**Purpose**: Social connection management API endpoints

**Features**:
- Authentication required for all endpoints
- Rate limiting for friend requests
- User search with privacy controls
- Input validation and sanitization

**Endpoints**:
- `POST /request` - Send friend request (rate limited)
- `PUT /request/:friendId` - Respond to friend request
- `GET /` - Get friends list
- `GET /requests` - Get friend requests (received/sent)
- `GET /suggestions` - Get friend suggestions
- `GET /blocked` - Get blocked users
- `GET /search` - Search users (rate limited)
- `GET /:userId/mutual` - Get mutual friends
- `DELETE /:friendId` - Remove friend
- `POST /block` - Block user
- `POST /unblock` - Unblock user
- `PUT /:friendId/close-friend` - Toggle close friend status

#### `routes/notificationRoutes.js` - Notification Management Routes
**Purpose**: User notification system API endpoints

**Features**:
- Authentication required for all endpoints
- Input validation for notification settings
- Integration with push notification service
- Comprehensive notification management

**Endpoints**:
- `GET /` - Get user notifications with filtering
- `GET /counts` - Get notification counts by category
- `GET /settings` - Get notification preferences
- `GET /stats` - Get notification statistics
- `GET /:notificationId` - Get specific notification
- `PUT /settings` - Update notification preferences
- `PUT /:notificationId/read` - Mark notification as read
- `PUT /read-all` - Mark all notifications as read
- `PUT /:notificationId/clicked` - Mark notification as clicked
- `PUT /:notificationId/snooze` - Snooze notification
- `DELETE /:notificationId` - Delete notification
- `DELETE /all` - Delete all notifications
- `POST /test` - Send test notification

#### `routes/paymentRoutes.js` - Payment Processing Routes
**Purpose**: Payment system API endpoints for Chinese payment providers

**Features**:
- Authentication required for user endpoints
- Public callback endpoints for payment providers
- Input validation for payment data
- Security validation for callbacks
- Integration with WeChat Pay and Alipay

**Endpoints**:
- `POST /create-order` - Create payment order (authenticated)
- `POST /callback/wechat` - WeChat Pay callback (public)
- `POST /callback/alipay` - Alipay callback (public)
- `GET /query/:outTradeNo` - Query order status (authenticated)
- `POST /refund` - Process refund (authenticated)
- `GET /orders` - Get user payment orders (authenticated)

#### `routes/uploadRoutes.js` - File Upload Routes
**Purpose**: File upload and management API endpoints

**Features**:
- Authentication required for all endpoints
- Rate limiting for upload operations
- File type and size validation
- Multi-cloud storage support
- Presigned URL generation

**Endpoints**:
- `POST /avatar` - Upload user avatar
- `POST /cover` - Upload cover picture
- `POST /post-media` - Upload post media (multiple files)
- `POST /message-media` - Upload message media
- `POST /presigned-url` - Generate presigned URL for direct upload
- `DELETE /:key` - Delete uploaded file
- `GET /info/:key` - Get file information

#### `routes/pushRoutes.js` - Push Notification Routes
**Purpose**: Push notification management API endpoints

**Features**:
- Authentication required for all endpoints
- Role-based access for admin functions
- Multi-platform device token management
- Push notification testing and monitoring

**Endpoints**:
- `POST /register-token` - Register device token
- `DELETE /remove-token` - Remove device token
- `GET /tokens` - Get user's registered tokens
- `POST /send` - Send push notification (admin only)
- `POST /test` - Test push notification
- `GET /stats` - Get push service statistics
- `GET /health` - Check push service health

### Utilities

#### `utils/security.js` - Security Utilities
**Purpose**: Security-related helper functions and utilities

**Key Components**:
- **TokenManager**: JWT token generation, verification, and management
- **CryptoManager**: Encryption, decryption, and password hashing utilities
- **ValidationManager**: Input validation and sanitization functions
- **RateLimitManager**: Rate limiting utilities and key generation
- **SecurityHeaders**: Security header generation and CSRF protection

**TokenManager Features**:
- Access and refresh token generation
- Token verification with issuer/audience validation
- Token pair generation for authentication
- Token decoding for debugging

**CryptoManager Features**:
- AES-256-GCM encryption/decryption
- Password hashing with PBKDF2
- Secure key generation
- Timing-safe password verification

**ValidationManager Features**:
- HTML sanitization
- Username validation with reserved name checking
- Password strength validation with scoring
- Phone number validation and normalization
- Email validation and normalization

#### `utils/helpers.js` - Common Utilities
**Purpose**: General-purpose helper functions used throughout the application

**Key Functions**:
- **String Utilities**: Random string generation, slugification, capitalization
- **Validation**: Email, phone number, and data format validation
- **Data Manipulation**: Deep cloning, pagination, sensitive field removal
- **File Utilities**: File size formatting, extension extraction, type validation
- **Performance**: Function timing, debouncing, throttling
- **Security**: String sanitization, hash generation, token creation

**Utility Categories**:
- Random data generation (strings, codes, UUIDs, tokens)
- Data validation and normalization
- String manipulation and formatting
- Date and time utilities
- File handling utilities
- Performance optimization utilities

#### `utils/asyncHandler.js` - Async Error Handling
**Purpose**: Async function error handling and utility functions

**Key Features**:
- **Error Wrapping**: Automatic error catching for async route handlers
- **Retry Logic**: Exponential backoff retry mechanism
- **Timeout Handling**: Promise timeout wrapper
- **Parallel Execution**: Execute multiple async functions in parallel
- **Sequential Execution**: Execute async functions in sequence
- **Delay Utilities**: Promise-based delay functions

**Functions**:
- `asyncHandler` - Wrap async route handlers for error catching
- `catchAsync` - Generic async function wrapper
- `retryWithBackoff` - Retry failed operations with exponential backoff
- `parallelAsync` - Execute multiple async operations in parallel
- `sequentialAsync` - Execute async operations in sequence
- `withTimeout` - Add timeout to async operations

### Error Handling

#### `errors/AppError.js` - Custom Error Classes
**Purpose**: Standardized error definitions for consistent error handling

**Error Classes**:
- **AppError**: Base error class with status code and operational flag
- **ValidationError**: 400 - Input validation failures
- **AuthenticationError**: 401 - Authentication failures
- **AuthorizationError**: 403 - Authorization/permission failures
- **NotFoundError**: 404 - Resource not found
- **ConflictError**: 409 - Resource conflicts (duplicates)
- **RateLimitError**: 429 - Rate limit exceeded
- **InternalServerError**: 500 - Internal server errors

**Features**:
- Consistent error structure
- HTTP status code mapping
- Operational vs programming error distinction
- Stack trace capture

#### `errors/errorHandler.js` - Global Error Handler
**Purpose**: Centralized error processing and response formatting

**Key Features**:
- **Environment-specific Handling**: Different error responses for development and production
- **Database Error Handling**: Specific handling for Sequelize errors
- **JWT Error Handling**: Authentication error processing
- **Security-focused Responses**: Prevent information leakage in production
- **Comprehensive Logging**: Detailed error logging with context
- **Request ID Generation**: Unique request IDs for error tracking

**Error Types Handled**:
- Sequelize validation errors
- Sequelize unique constraint errors
- Sequelize foreign key constraint errors
- JWT authentication errors
- Multer file upload errors
- Database connection errors
- Redis connection errors
- Rate limiting errors

**Security Features**:
- Sensitive data redaction in production
- Generic error messages for security
- Detailed logging for debugging
- Request context tracking

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ 
- MySQL 8.0+
- Redis 6.0+
- China cloud service accounts (Tencent, Alibaba)

### Environment Variables
Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=silverapp
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Alibaba Cloud SMS
ALIBABA_ACCESS_KEY_ID=your_access_key
ALIBABA_ACCESS_KEY_SECRET=your_secret_key
ALIBABA_SMS_SIGN_NAME=your_sign_name
ALIBABA_SMS_TEMPLATE_CODE=your_template_code

# Tencent Cloud SMS
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_SMS_APP_ID=your_app_id
TENCENT_SMS_SIGN=your_sign
TENCENT_SMS_TEMPLATE_ID=your_template_id

# Tencent Cloud COS
TENCENT_COS_SECRET_ID=your_secret_id
TENCENT_COS_SECRET_KEY=your_secret_key
TENCENT_COS_BUCKET=your_bucket
TENCENT_COS_REGION=ap-beijing

# Alibaba Cloud OSS
ALIBABA_OSS_ACCESS_KEY_ID=your_access_key
ALIBABA_OSS_ACCESS_KEY_SECRET=your_secret_key
ALIBABA_OSS_BUCKET=your_bucket
ALIBABA_OSS_REGION=oss-cn-hangzhou

# WeChat Pay
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
WECHAT_MCH_ID=your_merchant_id
WECHAT_API_KEY=your_api_key

# Alipay
ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY_PATH=path_to_private_key
ALIPAY_PUBLIC_KEY_PATH=path_to_public_key

# Push Notifications
XIAOMI_PUSH_APP_SECRET=your_app_secret
XIAOMI_PUSH_PACKAGE_NAME=your_package_name
HUAWEI_PUSH_APP_ID=your_app_id
HUAWEI_PUSH_APP_SECRET=your_app_secret
OPPO_PUSH_APP_KEY=your_app_key
OPPO_PUSH_MASTER_SECRET=your_master_secret
VIVO_PUSH_APP_ID=your_app_id
VIVO_PUSH_APP_KEY=your_app_key
VIVO_PUSH_APP_SECRET=your_app_secret
APNS_KEY_PATH=path_to_p8_key
APNS_KEY_ID=your_key_id
APNS_TEAM_ID=your_team_id
APNS_BUNDLE_ID=your_bundle_id

# Analytics
BAIDU_ANALYTICS_SITE_ID=your_site_id
BAIDU_ANALYTICS_TOKEN=your_token
TENCENT_ANALYTICS_APP_ID=your_app_id
TENCENT_ANALYTICS_SECRET_KEY=your_secret_key
```

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd silverapp-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up database**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE silverapp;
```

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Start Redis server**
```bash
redis-server
```

6. **Run the application**
```bash
# Development
npm run dev

# Production
npm start
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Automatic token rotation every 24 hours
- Token blacklisting for logout
- Role-based access control
- Device-specific authentication
- Account locking after failed attempts

### Input Validation & Sanitization
- Joi-based request validation
- SQL injection protection with pattern detection
- XSS prevention
- Input sanitization
- File type validation
- Rate limiting on all endpoints

### Data Protection
- Password hashing with bcrypt
- Sensitive data encryption
- Secure secret management
- HTTPS enforcement
- CORS protection
- Security headers (Helmet)

### Monitoring & Logging
- Comprehensive security event logging
- Failed authentication tracking
- Rate limit monitoring
- Error tracking and alerting
- Performance monitoring

## 🚀 Deployment

### Production Considerations
1. **Environment Setup**
   - Use production-grade MySQL and Redis instances
   - Configure proper SSL certificates
   - Set up load balancing
   - Configure CDN for static assets

2. **Security Hardening**
   - Enable all security middleware
   - Configure proper CORS origins
   - Set up rate limiting
   - Enable request logging

3. **Monitoring**
   - Set up application monitoring
   - Configure error tracking
   - Enable performance monitoring
   - Set up alerting

4. **Scaling**
   - Use Redis for session storage
   - Configure database read replicas
   - Set up horizontal scaling
   - Optimize database queries

## 📊 Performance Optimization

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling
- Query optimization
- Read replicas for scaling

### Caching Strategy
- Redis for session storage
- API response caching
- Database query caching
- Static asset caching

### Real-time Performance
- Socket.IO optimization
- Connection management
- Room-based messaging
- Presence tracking optimization

## 🧪 Testing

### Available Scripts
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:unit     # Run unit tests only
npm run test:integration # Run integration tests only
```

### Test Structure
- Unit tests for individual functions
- Integration tests for API endpoints
- Database tests for model operations
- Security tests for authentication

## 📈 Monitoring & Analytics

### Application Metrics
- API response times
- Error rates
- User activity
- Database performance
- Cache hit rates

### Business Metrics
- User registration rates
- Message volume
- Post engagement
- Payment transactions
- Push notification delivery

### Chinese Analytics Integration
- Baidu Analytics for web tracking
- Tencent Analytics for mobile tracking
- Custom event tracking
- Performance monitoring

## 🔧 Development

### Code Style
- ESLint configuration
- Prettier formatting
- Consistent naming conventions
- Comprehensive commenting

### Git Workflow
- Feature branch development
- Pull request reviews
- Automated testing
- Continuous integration

### Development Tools
- Nodemon for auto-restart
- Winston for logging
- Jest for testing
- Sequelize CLI for migrations

## 📞 Support

### Documentation
- API documentation
- Code comments
- README files
- Deployment guides

### Troubleshooting
- Common issues and solutions
- Error code references
- Performance optimization guides
- Security best practices

## 🔄 Updates & Maintenance

### Regular Maintenance
- Security updates
- Dependency updates
- Performance optimization
- Bug fixes

### Feature Development
- New feature planning
- API versioning
- Backward compatibility
- Migration strategies

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📞 Contact

For questions, issues, or contributions, please contact the development team.