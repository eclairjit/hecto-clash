import Redis from 'ioredis';

let redisClient;
let isRedisAvailable = false;

// Connect to Redis server - no mock implementation
console.log('Attempting to connect to Redis server...');
try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB) || 0,
    connectTimeout: 10000, // 10 seconds timeout
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 200, 2000);
      console.log(`Redis connection attempt ${times}, retrying in ${delay}ms...`);
      return delay;
    }
  });

  // Log connection status
  redisClient.on('connect', () => {
    console.log('Redis client connected successfully');
    isRedisAvailable = true;
  });

  redisClient.on('ready', () => {
    console.log('Redis client is ready to use');
  });

  redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
    isRedisAvailable = false;
  });

  // Test connection
  redisClient.ping().then(() => {
    console.log('Redis connection test successful (PING-PONG)');
  }).catch(err => {
    console.error('Redis connection test failed:', err);
    throw new Error('Failed to connect to Redis server: ' + err.message);
  });
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  throw new Error('Redis connection is required but failed to initialize: ' + error.message);
}

export { isRedisAvailable };
export default redisClient; 