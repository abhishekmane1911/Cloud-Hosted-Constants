# Constants Management System

A comprehensive cloud-hosted constants management system with TypeScript SDK, Express.js API, MongoDB/Redis data layer, and React dashboard for managing static-site constants dynamically.

## 🚀 Features

### Core Functionality
- [x] **Multi-environment Support**: Manage constants across development, staging, and production environments.
- [x] **Real-time Updates**: WebSocket-based live updates for instant constant changes.
- [x] **Version Control**: Track changes with complete history and rollback capabilities.
- [x] **Role-based Access**: Admin, editor, and viewer roles with appropriate permissions.
- [ ] **API Key Management**: Secure authentication with project-specific API keys. (User auth is complete, API keys for SDK are pending)

### Dashboard Features
- [ ] **Intuitive Interface**: Clean, responsive React dashboard with Tailwind CSS.
- [ ] **Bulk Operations**: Import/export constants via JSON or CSV.
- [ ] **Advanced Filtering**: Search by environment, tags, and custom criteria.
- [x] **Analytics Dashboard**: Backend support for usage metrics and performance monitoring.
- [ ] **Collaborative Tools**: Team management and permission controls.

### SDK Features
- [ ] **TypeScript Support**: Fully typed SDK with excellent developer experience.
- [ ] **Multiple Formats**: ESM, CommonJS, and UMD builds.
- [ ] **Client-side Caching**: Intelligent caching with configurable TTL.
- [ ] **Retry Logic**: Built-in exponential backoff and error handling.
- [x] **Real-time Subscriptions**: Backend support for subscribing to constant changes.

## 🏗️ Architecture

```
├── apps/
│   ├── dashboard/          # React + TypeScript dashboard
│   └── api/               # Express.js API server
├── packages/
│   └── sdk/               # TypeScript SDK package
├── examples/
│   └── client-integration/ # Sample HTML integration
├── k8s/                   # Kubernetes manifests
├── .github/workflows/     # CI/CD pipeline
└── docker-compose.yml     # Local development setup
```

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB (primary), Redis (caching)
- **SDK**: TypeScript, Axios, Socket.io-client
- **DevOps**: Docker, Kubernetes, GitHub Actions
- **Monitoring**: Health checks, metrics collection

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (recommended for local databases)

### Local Development

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-org/constants-management-system.git
    cd constants-management-system
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up environment variables**
    -   In `apps/api`, create a `.env` file (see `apps/api/README.md` for details).
    -   In `apps/dashboard`, create a `.env` file with `VITE_API_URL=http://localhost:3001`.

4.  **Start with Docker Compose** (for MongoDB and Redis)
    ```bash
    docker-compose up -d
    ```

5.  **Or start services individually**
    ```bash
    # Start API server
    npm run dev:api

    # Start dashboard (in another terminal)
    npm run dev:dashboard
    ```

6.  **Access the application**
    -   Dashboard: http://localhost:3000
    -   API: http://localhost:3001
    -   API Docs: http://localhost:3001/api-docs

### Demo Credentials

- **Admin**: admin@example.com / admin123
- **Editor**: editor@example.com / editor123
- **Viewer**: viewer@example.com / viewer123
(Note: You will need to register these users first via the API or a yet-to-be-built UI)

## 🔧 API Documentation

The full interactive API documentation is available via Swagger UI at the `/api-docs` endpoint of the running API server.

Example: `http://localhost:3001/api-docs`

### Authentication

The API uses JWT for user authentication (for dashboard access) and will use API keys for SDK access. For the dashboard, log in via the `/api/v1/auth/login` endpoint to get a bearer token, and include it in the `Authorization` header for protected requests.

### Core Endpoints

- `POST /api/v1/auth/register` - Register a new user.
- `POST /api/v1/auth/login` - Log in a user and get JWT tokens.
- `GET /api/v1/auth/me` - Get the current user's profile.
- `GET /api/v1/projects` - Get all projects for the current user.
- `POST /api/v1/projects` - Create a new project.
- `GET /api/v1/projects/{projectId}/constants` - Get all constants for a project.
- `POST /api/v1/projects/{projectId}/constants` - Create a new constant.
- `GET /api/v1/projects/{projectId}/constants/{constantId}` - Get a single constant.
- `PUT /api/v1/projects/{projectId}/constants/{constantId}` - Update a constant.
- `DELETE /api/v1/projects/{projectId}/constants/{constantId}` - Delete a constant.
- `GET /api/v1/projects/{projectId}/constants/{constantId}/history` - Get the version history of a constant.
- `POST /api/v1/projects/{projectId}/constants/{constantId}/rollback` - Rollback a constant to a previous version.
- `GET /api/v1/analytics` - Get analytics data.

### WebSocket Events

The API uses Socket.io for real-time updates. Clients can subscribe to project-specific rooms to receive events.

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // The URL of your API server

socket.on("connect", () => {
  console.log("Connected to WebSocket server!");
  
  // Join a project room to receive updates for that project
  const projectId = "your-project-id";
  socket.emit("joinProject", projectId);
});

socket.on("constant:created", (data) => {
  console.log("A new constant was created:", data);
});

socket.on("constant:updated", (data) => {
  console.log("A constant was updated:", data);
});

socket.on("constant:deleted", (data) => {
  console.log("A constant was deleted:", data); // { id: '...' }
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server.");
});
```

## 🧪 Testing

```bash
# Run all tests (not yet implemented for the API)
npm test

# Run tests for a specific package
npm test --workspace=packages/sdk
```

## 🗺️ Roadmap

- [ ] Implement remaining frontend features (dashboard UI).
- [ ] Implement the SDK package.
- [ ] Implement API key management for the SDK.
- [ ] Write comprehensive unit and integration tests for the API.
- [ ] Add advanced filtering and pagination to all `GET` endpoints.
- [ ] Complete the CI/CD pipeline for automated deployment.

---

Built with ❤️ by the Constants Management Team