# Constants Management System

A comprehensive cloud-hosted constants management system with TypeScript SDK, Express.js API, MongoDB/Redis data layer, and React dashboard for managing static-site constants dynamically.

## 🚀 Features

### Core Functionality
- **Multi-environment Support**: Manage constants across development, staging, and production environments
- **Real-time Updates**: WebSocket-based live updates for instant constant changes
- **Version Control**: Track changes with complete history and rollback capabilities
- **Role-based Access**: Admin, editor, and viewer roles with appropriate permissions
- **API Key Management**: Secure authentication with project-specific API keys

### Dashboard Features
- **Intuitive Interface**: Clean, responsive React dashboard with Tailwind CSS
- **Bulk Operations**: Import/export constants via JSON or CSV
- **Advanced Filtering**: Search by environment, tags, and custom criteria
- **Analytics Dashboard**: Usage metrics, performance monitoring, and insights
- **Collaborative Tools**: Team management and permission controls

### SDK Features
- **TypeScript Support**: Fully typed SDK with excellent developer experience
- **Multiple Formats**: ESM, CommonJS, and UMD builds
- **Client-side Caching**: Intelligent caching with configurable TTL
- **Retry Logic**: Built-in exponential backoff and error handling
- **Real-time Subscriptions**: Subscribe to constant changes for live updates

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
- **SDK**: TypeScript, Axios, WebSocket
- **DevOps**: Docker, Kubernetes, GitHub Actions
- **Monitoring**: Health checks, metrics collection

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- MongoDB and Redis (or use Docker setup)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/constants-management-system.git
   cd constants-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start with Docker Compose**
   ```bash
   npm run docker:up
   ```

4. **Or start services individually**
   ```bash
   # Start API server
   npm run dev:api

   # Start dashboard (in another terminal)
   npm run dev:dashboard
   ```

5. **Access the application**
   - Dashboard: http://localhost:3000
   - API: http://localhost:3001
   - Example client: Open `examples/client-integration/index.html`

### Demo Credentials

- **Admin**: admin@example.com / admin123
- **Editor**: editor@example.com / editor123
- **Viewer**: viewer@example.com / viewer123

## 📦 SDK Installation and Usage

### Install the SDK

```bash
npm install @constants-mgmt/sdk
```

### Basic Usage

```typescript
import { ConstantsManager } from '@constants-mgmt/sdk';

// Initialize the SDK
ConstantsManager.init({
  apiKey: 'your-api-key',
  environment: 'production',
  cacheTTL: 300000, // 5 minutes
  retryAttempts: 3
});

// Get a single constant
const result = await ConstantsManager.getConstant('SITE_TITLE');
if (result.success) {
  document.title = result.data;
}

// Get multiple constants
const constants = await ConstantsManager.getConstants(['SITE_TITLE', 'API_URL']);

// Subscribe to real-time updates
const unsubscribe = ConstantsManager.subscribe('SITE_TITLE', (key, newValue, oldValue) => {
  console.log(`${key} changed from ${oldValue} to ${newValue}`);
  document.title = newValue;
});

// Clean up when done
unsubscribe();
ConstantsManager.disconnect();
```

### HTML Integration

```html
<script src="https://unpkg.com/@constants-mgmt/sdk"></script>
<script>
  ConstantsSDK.init({ 
    apiKey: 'YOUR_API_KEY', 
    environment: 'production' 
  });
  
  ConstantsSDK.getConstant('SITE_TITLE').then(result => {
    if (result.success) {
      document.getElementById('site-title').textContent = result.data;
    }
  });
</script>
```

## 🏭 Production Deployment

### Docker Deployment

```bash
# Build and deploy with Docker Compose
npm run docker:build
npm run docker:up
```

### Kubernetes Deployment

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/
```

### Environment Variables

**API Server**:
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://admin:password@mongodb:27017/constants
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
CORS_ORIGIN=https://yourdomain.com
```

**Dashboard**:
```env
VITE_API_URL=https://api.yourdomain.com
```

## 🔧 API Documentation

### Authentication

All API requests require authentication via API key:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.constants.example.com/v1/constants
```

### Core Endpoints

- `GET /v1/constants` - List all constants
- `GET /v1/constants/:key` - Get specific constant
- `POST /v1/constants` - Create new constant
- `PUT /v1/constants/:id` - Update constant
- `DELETE /v1/constants/:id` - Delete constant
- `POST /v1/constants/batch` - Get multiple constants
- `GET /v1/constants/:id/history` - Get version history

### WebSocket Events

```javascript
// Connect to WebSocket
const ws = new WebSocket('wss://api.constants.example.com/ws');

// Listen for constant updates
ws.on('constant_updated', (data) => {
  console.log('Constant updated:', data);
});
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=packages/sdk

# Run integration tests
npm run test:integration
```

## 📊 Monitoring and Analytics

The system includes comprehensive monitoring:

- **Performance Metrics**: Response times, cache hit rates, error rates
- **Usage Analytics**: Most requested constants, API usage patterns
- **Health Checks**: Kubernetes-ready health endpoints
- **Real-time Dashboards**: Live metrics and system status

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions system
- **API Rate Limiting**: Prevent abuse and ensure fair usage
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Secure cross-origin resource sharing
- **Security Headers**: Helmet.js integration for enhanced security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.constants.example.com](https://docs.constants.example.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/constants-management-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/constants-management-system/discussions)
- **Email**: support@constants.example.com

## 🗺️ Roadmap

- [ ] GraphQL API support
- [ ] Multi-tenant architecture
- [ ] Advanced caching strategies
- [ ] Mobile app for iOS/Android
- [ ] Integration with popular CMS platforms
- [ ] Advanced analytics and reporting
- [ ] Automated testing for constants
- [ ] Git-based workflow integration

---

Built with ❤️ by the Constants Management Team