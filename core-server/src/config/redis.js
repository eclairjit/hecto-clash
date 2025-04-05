import Redis from "ioredis";

/**
 * Simple in-memory Redis mock for development
 */
class RedisMock {
  constructor() {
    console.log("🔵 Using in-memory leaderboard (Redis mock)");
    this.store = {
      leaderboard: new Map(),
      cache: new Map()
    };
    
    // Add some sample data for testing
    if (process.env.NODE_ENV !== 'production') {
      // Populate with test data
      const testData = [
        { id: 'user1', score: 1000 },
        { id: 'user2', score: 850 },
        { id: 'user3', score: 720 },
        { id: 'user4', score: 500 },
        { id: 'user5', score: 350 }
      ];
      
      this.store.leaderboard = new Map(
        testData.map(item => [item.id, item.score])
      );
      
      console.log("✅ Added sample leaderboard data for testing");
    }
  }

  // Core Redis commands
  async zadd(key, score, member) {
    if (!this.store[key]) {
      this.store[key] = new Map();
    }
    this.store[key].set(member, Number(score));
    return 1;
  }

  async zrevrange(key, start, end, withScores) {
    if (!this.store[key]) return [];
    
    const entries = Array.from(this.store[key].entries())
      .sort((a, b) => b[1] - a[1])
      .slice(start, end + 1);
    
    if (withScores === 'WITHSCORES') {
      const result = [];
      entries.forEach(([member, score]) => {
        result.push(member);
        result.push(score.toString());
      });
      return result;
    }
    
    return entries.map(([member]) => member);
  }

  async zrevrank(key, member) {
    if (!this.store[key]) return null;
    
    const sorted = Array.from(this.store[key].entries())
      .sort((a, b) => b[1] - a[1]);
    
    const index = sorted.findIndex(([m]) => m === member);
    return index === -1 ? null : index;
  }

  async zscore(key, member) {
    if (!this.store[key] || !this.store[key].has(member)) return null;
    return this.store[key].get(member).toString();
  }

  async get(key) {
    return this.store.cache.get(key) || null;
  }

  async setex(key, seconds, value) {
    this.store.cache.set(key, value);
    // Auto-expire after seconds
    setTimeout(() => {
      this.store.cache.delete(key);
    }, seconds * 1000);
    return "OK";
  }

  async del(key) {
    return this.store.cache.delete(key) ? 1 : 0;
  }

  // Pipeline/transaction support
  multi() {
    const commands = [];
    const self = this;
    
    return {
      zadd(key, score, member) {
        commands.push(['zadd', key, score, member]);
        return this;
      },
      del(key) {
        commands.push(['del', key]);
        return this;
      },
      async exec() {
        const results = [];
        for (const [cmd, ...args] of commands) {
          try {
            const result = await self[cmd](...args);
            results.push([null, result]);
          } catch (err) {
            results.push([err, null]);
          }
        }
        return results;
      }
    };
  }

  on(event, callback) {
    if (event === 'connect') {
      // Simulate connect event immediately
      setTimeout(callback, 0);
    }
    return this;
  }

  async ping() {
    return "PONG";
  }
}

// Create Redis client with fallback
let redisClient;

// Skip trying to connect to Redis in dev mode for faster startup
const useRedisMock = process.env.USE_REDIS_MOCK === 'true';

if (useRedisMock) {
  console.log("🔵 Using Redis mock by configuration");
  redisClient = new RedisMock();
} else {
  try {
    console.log("⏳ Attempting to connect to Redis...");
    
    // Create a Redis client with timeout
    redisClient = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || "",
      connectTimeout: 3000, // 3 seconds timeout
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 1) {
          console.error("❌ Redis connection failed after retry attempt");
          return null; // Stop retrying
        }
        return 500; // Retry once after 500ms
      }
    });

    // Handle connection timeout
    const connectionTimeout = setTimeout(() => {
      console.error("❌ Redis connection timeout");
      
      // Check if quit method exists before calling it
      if (redisClient && typeof redisClient.quit === 'function') {
        redisClient.quit();
      } else {
        // If quit is not available, just disconnect the client
        try {
          // Safely close any existing connection
          if (redisClient.disconnect && typeof redisClient.disconnect === 'function') {
            redisClient.disconnect();
          }
        } catch (err) {
          // Ignore any errors in disconnection
          console.log("Note: Could not properly close Redis connection");
        }
      }
      
      // Replace with mock
      redisClient = new RedisMock();
    }, 3000);

    // Set up event handlers
    redisClient.on("connect", () => {
      clearTimeout(connectionTimeout);
      console.log("✅ Successfully connected to Redis");
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis Error:", err.message);
      
      // Switch to mock if not already using it
      if (!(redisClient instanceof RedisMock)) {
        console.log("🔄 Switching to in-memory leaderboard");
        
        // Safely close connection if possible
        try {
          if (typeof redisClient.quit === 'function') {
            redisClient.quit();
          } else if (typeof redisClient.disconnect === 'function') {
            redisClient.disconnect();
          }
        } catch (e) {
          // Ignore disconnection errors
        }
        
        redisClient = new RedisMock();
      }
    });
  } catch (error) {
    console.error("❌ Redis initialization error:", error.message);
    redisClient = new RedisMock();
  }
}

// Export Redis client
export default redisClient;