# Farmer's Solution Backend API

Backend server for the Farmer's Solution application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (already created) with:
```
PORT=5000
NODE_ENV=development
```

3. Start the server:
```bash
npm start
```

Or for development:
```bash
npm run dev
```

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

## Technologies

- Express.js - Web framework
- CORS - Cross-origin resource sharing
- dotenv - Environment variables
