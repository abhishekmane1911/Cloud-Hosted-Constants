import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on('connect', () => {
  console.log('Connecting to Redis...');
});

redisClient.on('ready', () => {
  console.log('Redis connected successfully and ready to use.');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisClient.on('end', () => {
  console.log('Redis connection ended.');
});

// The client needs to be explicitly connected in v4
const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await redisClient.quit();
  process.exit(0);
});

export { redisClient, connectRedis };
