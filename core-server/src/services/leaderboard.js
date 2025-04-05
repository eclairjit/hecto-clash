import redis from "../config/redis.js";
import { findUserById } from "../repositories/user.js";

// Cache configuration
const CACHE_DURATION = 3600; // Cache for 1 hour in production
const LEADERBOARD_KEY = "leaderboard";
const TOP_PLAYERS_CACHE_KEY = "leaderboard:top";
const PLAYER_RANK_CACHE_PREFIX = "leaderboard:rank:";
const USER_DETAILS_CACHE_PREFIX = "user:details:";

// Get user details from DB or cache
const getUserDetails = async (userId) => {
  if (!userId) return null;
  
  try {
    // Try to get from cache first
    const cachedDetails = await redis.get(`${USER_DETAILS_CACHE_PREFIX}${userId}`);
    if (cachedDetails) {
      return JSON.parse(cachedDetails);
    }
    
    // If not in cache, get from database
    const userDetails = await findUserById(userId);
    if (userDetails) {
      // Cache the result
      await redis.setex(
        `${USER_DETAILS_CACHE_PREFIX}${userId}`, 
        CACHE_DURATION, 
        JSON.stringify(userDetails)
      );
      return userDetails;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting user details for ${userId}:`, error);
    return null;
  }
};

/**
 * Batch update player ratings in Redis leaderboard using multi-exec.
 * @param {Array} players - Array of player objects with id and rating
 * @returns {Promise<boolean>} - Success status
 */
export const updatePlayerRating = async (players) => {
  if (!players || !Array.isArray(players) || players.length === 0) {
    throw new Error("Invalid player data. Expected non-empty array of players.");
  }

  try {
    const pipeline = redis.multi(); // Batch processing

    players.forEach(({ id, rating }) => {
      // Ensure we have valid id and rating
      if (!id) {
        throw new Error("Player ID is required");
      }
      
      // Use rating parameter or fall back to score for backward compatibility
      const ratingValue = rating !== undefined ? rating : players.score;
      
      // Convert rating to number if it's not already
      const ratingNum = typeof ratingValue === 'number' ? ratingValue : parseInt(ratingValue);
      
      if (isNaN(ratingNum)) {
        throw new Error(`Invalid rating value for player ${id}: rating must be a number`);
      }

      pipeline.zadd(LEADERBOARD_KEY, ratingNum, id);
      
      // Invalidate individual player rank cache
      pipeline.del(`${PLAYER_RANK_CACHE_PREFIX}${id}`);
    });

    // Invalidate top players cache when ratings are updated
    pipeline.del(TOP_PLAYERS_CACHE_KEY);
    
    await pipeline.exec(); // Execute all commands in batch
    return true;
  } catch (error) {
    console.error("Error updating player ratings:", error);
    throw new Error(`Failed to update player ratings: ${error.message}`);
  }
};

/**
 * Get the top players from the leaderboard with their user details.
 * @param {number} limit - Number of top players to return (default: 10)
 * @returns {Promise<Array>} - Array of player objects with id, username, and rating
 */
export const getTopPlayer = async (limit = 10) => {
  try {
    // Check for valid limit
    limit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    
    // Try to get cached result
    try {
      const cached = await redis.get(TOP_PLAYERS_CACHE_KEY);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        // Return subset if requested limit is smaller than cached data
        return parsedCache.slice(0, limit);
      }
    } catch (cacheError) {
      console.warn("Cache retrieval failed:", cacheError.message);
      // Continue execution if cache fails
    }
    
    // Get players from leaderboard
    const players = await redis.zrevrange(LEADERBOARD_KEY, 0, limit - 1, "WITHSCORES");
    
    if (!players || players.length === 0) {
      return [];
    }
    
    // Format player data and fetch user details
    const formatted = [];
    for (let i = 0; i < players.length; i += 2) {
      const userId = players[i];
      const rating = parseInt(players[i + 1]);
      
      // Get user details including username
      const userDetails = await getUserDetails(userId);
      
      formatted.push({ 
        id: userId,
        username: userDetails?.username || "Unknown Player",
        rating: rating
      });
    }
    
    // Cache the result (with a larger limit)
    try {
      await redis.setex(TOP_PLAYERS_CACHE_KEY, CACHE_DURATION, JSON.stringify(formatted));
    } catch (cacheError) {
      console.warn("Cache storage failed:", cacheError.message);
      // Continue execution if cache fails
    }
    
    // Return the requested subset
    return formatted.slice(0, limit);
  } catch (error) {
    console.error("Error fetching top players:", error);
    throw new Error(`Failed to fetch top players: ${error.message}`);
  }
};

/**
 * Get rank of a player.
 * @param {string} id - Player ID
 * @returns {Promise<number|string>} - Rank of player (1-based) or "Not ranked"
 */
export const getPlayerRank = async (id) => {
  if (!id) {
    throw new Error("Player ID is required");
  }
  
  try {
    // Check cache first
    try {
      const cacheKey = `${PLAYER_RANK_CACHE_PREFIX}${id}`;
      const cachedRank = await redis.get(cacheKey);
      
      if (cachedRank !== null) {
        return cachedRank === "null" ? "Not ranked" : parseInt(cachedRank);
      }
    } catch (cacheError) {
      console.warn("Cache retrieval failed:", cacheError.message);
      // Continue execution if cache fails
    }

    // Get player rank from Redis
    const rank = await redis.zrevrank(LEADERBOARD_KEY, id);
    const result = rank !== null ? rank + 1 : "Not ranked";
    
    // Cache the result (stringify if not a number to avoid parsing issues)
    try {
      const valueToCache = result === "Not ranked" ? "null" : result.toString();
      await redis.setex(`${PLAYER_RANK_CACHE_PREFIX}${id}`, CACHE_DURATION, valueToCache);
    } catch (cacheError) {
      console.warn("Cache storage failed:", cacheError.message);
      // Continue execution if cache fails
    }
    
    return result;
  } catch (error) {
    console.error(`Error fetching rank for player ${id}:`, error);
    throw new Error(`Failed to fetch rank for player ${id}: ${error.message}`);
  }
};

/**
 * Get player rating from leaderboard
 * @param {string} id - Player ID 
 * @returns {Promise<number|null>} - Player rating or null if not ranked
 */
export const getPlayerRating = async (id) => {
  if (!id) {
    throw new Error("Player ID is required");
  }
  
  try {
    const rating = await redis.zscore(LEADERBOARD_KEY, id);
    return rating !== null ? parseInt(rating) : null;
  } catch (error) {
    console.error(`Error fetching rating for player ${id}:`, error);
    throw new Error(`Failed to fetch rating for player ${id}: ${error.message}`);
  }
};

/**
 * Get multiple players by rank range (useful for pagination)
 * @param {number} start - Start rank (0-based, inclusive)
 * @param {number} end - End rank (0-based, inclusive)
 * @returns {Promise<Array>} - Array of player objects with id, username, rating and rank
 */
export const getPlayersByRankRange = async (start = 0, end = 9) => {
  try {
    // Validate inputs
    start = Math.max(parseInt(start) || 0, 0);
    end = Math.max(parseInt(end) || 9, start);
    
    // Limit range size to prevent huge responses
    if (end - start > 100) {
      end = start + 100;
    }
    
    const players = await redis.zrevrange(LEADERBOARD_KEY, start, end, "WITHSCORES");
    
    if (!players || players.length === 0) {
      return [];
    }
    
    // Format player data and fetch user details
    const formatted = [];
    for (let i = 0; i < players.length; i += 2) {
      const userId = players[i];
      const rating = parseInt(players[i + 1]);
      const rank = start + (i / 2) + 1;  // Calculate rank based on position
      
      // Get user details including username
      const userDetails = await getUserDetails(userId);
      
      formatted.push({ 
        id: userId,
        username: userDetails?.username || "Unknown Player",
        rating: rating,
        rank: rank
      });
    }
    
    return formatted;
  } catch (error) {
    console.error(`Error fetching players by rank range:`, error);
    throw new Error(`Failed to fetch players by rank range: ${error.message}`);
  }
};
