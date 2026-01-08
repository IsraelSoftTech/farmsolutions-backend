# Environment Setup Guide

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
# Environment Configuration
NODE_ENV=production
PORT=5000

# Frontend URL
FRONTEND_URL=https://farmsolutionss.com

# Database Configuration (PostgreSQL)
DB_HOST=69.169.97.221
DB_PORT=5432
DB_NAME=farmsolutionss_db
DB_USER=farmsolutionss_user
DB_PASSWORD=farmsolutionss_2026
DB_CONNECTION_STRING=postgresql://farmsolutionss_user:farmsolutionss_2026@69.169.97.221:5432/farmsolutionss_db

# FTP Configuration
FTP_HOST=st69310.ispot.cc
FTP_USER=farmsolutionss
FTP_PASSWORD=farmsolutionss@2026
FTP_PORT=21
FTP_BASE_URL=https://st69310.ispot.cc/farmsolutionss/
FTP_UPLOAD_DIR=/uploads/

# JWT Secret (Change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# API Configuration
API_VERSION=v1
API_PREFIX=/api
```

## Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Create the `.env` file with the content above.

3. Start the server:
```bash
npm start
```
