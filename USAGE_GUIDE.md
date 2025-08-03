# Constants Management System - Usage Guide

This guide provides detailed instructions for developers who want to self-host the system and for clients who will integrate the SDK into their websites.

---

## Part 1: For Developers (Self-Hosting)

This section is for developers who want to run, maintain, and deploy the entire Constants Management System.

### 1. Introduction

This system provides a complete solution for managing static constants for your websites and applications dynamically. It consists of a backend API (for managing data), a database (for storage), a cache (for performance), a dashboard (for management), and an SDK (for integration).

The architecture is a modern monorepo containing the following key services:
-   **API (`apps/api`)**: An Express.js server that handles all business logic.
-   **Dashboard (`apps/dashboard`)**: A React application for managing projects and constants.
-   **SDK (`packages/sdk`)**: A TypeScript library for integrating with your client-side applications.

### 2. System Requirements

-   Node.js v18 or higher
-   npm v9 or higher
-   Docker and Docker Compose (for running dependent services like databases)

### 3. Local Setup

Follow these steps to get the entire system running on your local machine.

**Step 1: Clone the Repository**
```bash
git clone https://github.com/your-org/constants-management-system.git
cd constants-management-system
```

**Step 2: Install Dependencies**
This command installs dependencies for all services from the root of the monorepo.
```bash
npm install
```

**Step 3: Configure Environment Variables**

You need to create `.env` files for both the API and the dashboard.

**For the API (`apps/api/.env`):**
```env
# The port the server will run on
PORT=3001

# MongoDB connection string for local Docker instance
MONGODB_URI=mongodb://localhost:27017/constants-dev

# Redis connection URL for local Docker instance
REDIS_URL=redis://localhost:6379

# Use long, random strings for JWT secrets in production
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# The URL of your dashboard for CORS
CORS_ORIGIN=http://localhost:3000
```

**For the Dashboard (`apps/dashboard/.env`):**
```env
# The URL of the backend API
VITE_API_URL=http://localhost:3001
```

**Step 4: Start Databases with Docker**
The easiest way to run MongoDB and Redis locally is with the provided Docker Compose file.
```bash
docker-compose up -d
```
This will start MongoDB and Redis in the background.

**Step 5: Run the Services**
You need to run the API and the dashboard in separate terminals.

**Terminal 1: Start the API**
```bash
# From the root of the project
npm run dev:api
```

**Terminal 2: Start the Dashboard**
```bash
# From the root of the project
npm run dev:dashboard
```

**Step 6: Access the Application**
-   **Dashboard**: Open your browser to `http://localhost:3000`
-   **API Server**: Is running at `http://localhost:3001`
-   **API Documentation**: Interactive docs are at `http://localhost:3001/api-docs`

### 4. Deployment

The application is designed to be deployed using Docker containers.

**Docker Compose (for simple deployments):**
You can build and run the entire application stack with Docker Compose.
```bash
# Build the images for all services
npm run docker:build

# Start all services in detached mode
npm run docker:up
```

**Kubernetes (for scalable deployments):**
The `k8s/` directory contains example Kubernetes manifests for deploying the system to a cluster. You will need to configure secrets management and ingress controllers according to your cluster's setup.
```bash
# Apply the manifests to your cluster
kubectl apply -f k8s/
```

---

## Part 2: For Clients (Using the SDK)

This section is for developers who want to use the Constants Management SDK to fetch constants in their websites or applications.

### 1. Introduction

The SDK provides a simple and efficient way to fetch and manage your constants at runtime. It handles caching, retries, and real-time updates automatically, so you can focus on building your application.

### 2. Installation

You can install the SDK in two ways:

**A) Using npm (for projects with a build step):**
```bash
npm install @constants-mgmt/sdk
```

**B) Using a `<script>` tag (for simple HTML pages):**
```html
<script src="https://unpkg.com/@constants-mgmt/sdk@latest/dist/index.umd.js"></script>
```
When using the script tag, the SDK is available on the global `ConstantsSDK` object.

### 3. Initialization

Before you can use the SDK, you must initialize it with your project's API key and environment.

```javascript
import { ConstantsManager } from '@constants-mgmt/sdk'; // or use ConstantsSDK from script tag

ConstantsManager.init({
  apiKey: 'YOUR_PROJECT_API_KEY', // Get this from the dashboard
  environment: 'production', // 'development', 'staging', or 'production'
  cacheTTL: 300000, // Optional: client-side cache time in ms (default: 5 minutes)
});
```

### 4. Fetching Constants

**Fetching a Single Constant: `getConstant(key)`**
This function retrieves the value of a single constant.

```javascript
async function displaySiteTitle() {
  try {
    const siteTitle = await ConstantsManager.getConstant('SITE_TITLE');
    document.getElementById('site-title').textContent = siteTitle;
  } catch (error) {
    console.error('Failed to fetch SITE_TITLE:', error);
    // Use a fallback value
    document.getElementById('site-title').textContent = 'My Awesome Site';
  }
}
displaySiteTitle();
```

**Fetching Multiple Constants: `getConstants(keys)`**
This function retrieves multiple constants in a single network request.

```javascript
async function setupConfig() {
  try {
    const config = await ConstantsManager.getConstants(['API_URL', 'THEME_COLOR']);
    // config is an object like { API_URL: '...', THEME_COLOR: '...' }
    initializeApp(config);
  } catch (error) {
    console.error('Failed to fetch config:', error);
  }
}
```

### 5. Real-Time Updates

You can subscribe to changes for all constants in your project. The SDK uses WebSockets to receive live updates from the server.

**Subscribing to Changes: `subscribe(callback)`**
The callback function is called whenever a constant is created, updated, or deleted.

```javascript
const unsubscribe = ConstantsManager.subscribe((event) => {
  console.log(`Received event: ${event.type}`);
  // event is an object like:
  // { type: 'constant:updated', payload: { _id: '...', key: '...', value: '...' } }
  // { type: 'constant:deleted', payload: { id: '...' } }

  if (event.type === 'constant:updated' && event.payload.key === 'SITE_TITLE') {
    document.getElementById('site-title').textContent = event.payload.value;
  }
});

// To stop listening for updates, call the returned function
// unsubscribe();
```

### 6. Disconnecting

When your application is shutting down, you should disconnect the SDK to clean up WebSocket connections.

```javascript
ConstantsManager.disconnect();
```
