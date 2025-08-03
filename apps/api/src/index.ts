import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Constants Management API is running!');
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// API Routes
import routes from './routes';
app.use('/api/v1', routes);

// Swagger API Docs
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.error('Failed to load swagger documentation:', error);
}

import connectDB from './config/database';
import { connectRedis } from './config/redis';

import { createServer } from 'http';
import { initSocket } from './socket';

const startServer = async () => {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();

    const httpServer = createServer(app);
    const io = initSocket(httpServer);

    // Start listening for requests
    httpServer.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
