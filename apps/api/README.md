# Constants Management API

This is the backend API for the Constants Management System. It is a Node.js application built with Express.js and TypeScript.

## Features

- RESTful API for managing projects, constants, and users.
- JWT-based authentication and role-based access control.
- Real-time updates via WebSockets (Socket.io).
- Caching with Redis for improved performance.
- Analytics and monitoring endpoints.
- Interactive API documentation with Swagger/OpenAPI.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB
- Redis

## Getting Started

### 1. Install Dependencies

From the root of the monorepo, run:
```bash
npm install
```
This will install dependencies for all workspaces, including the API.

### 2. Configure Environment Variables

Create a `.env` file in this directory (`apps/api`) and add the following variables:

```env
# The port the server will run on
PORT=3001

# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/constants-dev

# Redis connection URL
REDIS_URL=redis://localhost:6379

# JWT secrets (replace with long, random strings)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# The origin for CORS (the URL of your dashboard)
CORS_ORIGIN=http://localhost:3000
```

### 3. Run the Server

You can run the server in development mode, which will automatically restart on file changes.

```bash
# From the root of the monorepo
npm run dev:api
```

The server will be available at `http://localhost:3001`.

## API Documentation

The interactive API documentation, powered by Swagger, is available at `/api-docs` when the server is running.

Example: `http://localhost:3001/api-docs`

## Project Structure

- `src/`: Contains the main source code.
  - `config/`: Database, Redis, and other configurations.
  - `controllers/`: Express route handlers.
  - `middleware/`: Custom middleware (e.g., auth).
  - `models/`: Mongoose data models.
  - `routes/`: API route definitions.
  - `services/`: Business logic.
  - `socket/`: WebSocket (Socket.io) logic.
  - `utils/`: Utility functions.
- `openapi.yaml`: The OpenAPI 3.0 specification file.
- `tsconfig.json`: TypeScript compiler configuration.
- `package.json`: Project dependencies and scripts.
