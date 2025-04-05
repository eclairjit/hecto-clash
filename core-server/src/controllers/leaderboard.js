import { updatePlayerRating, getTopPlayer, getPlayerRank, getPlayerRating, getPlayersByRankRange } from "../services/leaderboard.js";
import { asyncHandler, apiResponse, apiError } from "../utils/index.js";

/**
 * Controller for updating multiple player ratings.
 */
const updateRating = asyncHandler(async (req, res) => {
  const players = req.body;

  // Strict validation for production
  if (!players) {
    throw new apiError(400, "Request body is required");
  }

  if (!Array.isArray(players)) {
    throw new apiError(400, "Request body must be an array of player objects");
  }
  
  if (players.length === 0) {
    throw new apiError(400, "At least one player rating is required");
  }

  // Validate player objects
  for (const player of players) {
    if (!player.id) {
      throw new apiError(400, "Each player must have an id");
    }
    
    // Check for rating (or score for backward compatibility)
    const hasRating = player.rating !== undefined && player.rating !== null;
    const hasScore = player.score !== undefined && player.score !== null;
    
    if (!hasRating && !hasScore) {
      throw new apiError(400, `Player ${player.id} must have a rating`);
    }
    
    // Parse rating to ensure it's a number (prioritize rating over score)
    const ratingValue = hasRating ? player.rating : player.score;
    const ratingNum = parseInt(ratingValue);
    
    if (isNaN(ratingNum)) {
      throw new apiError(400, `Invalid rating value for player ${player.id}`);
    }
    
    // Update player object with parsed rating
    player.rating = ratingNum;
    
    // Remove score property if it exists to avoid confusion
    if (hasScore) {
      delete player.score;
    }
  }

  try {
    await updatePlayerRating(players);
    return res.status(200).json(new apiResponse(200, "Players' ratings updated successfully"));
  } catch (error) {
    console.error("Error updating ratings:", error);
    throw new apiError(500, `Error updating ratings: ${error.message}`);
  }
});

/**
 * Controller for getting top players.
 */
const getTopPlayersList = asyncHandler(async (req, res) => {
  let { limit } = req.query;
  
  // Parse and validate limit
  limit = parseInt(limit) || 10;
  
  // Enforce reasonable limits
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;
  
  try {
    const leaderboard = await getTopPlayer(limit);
    return res.status(200).json(new apiResponse(200, "Leaderboard fetched successfully", { leaderboard }));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw new apiError(500, `Error fetching leaderboard: ${error.message}`);
  }
});

/**
 * Controller for getting a player's rank.
 */
const getPlayerRankController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(400, "Player ID is required");
  }

  try {
    const rank = await getPlayerRank(id);
    
    // Get player rating and username
    const rating = await getPlayerRating(id);
    const userData = await (async () => {
      try {
        // Dynamic import to avoid circular dependency
        const { findUserById } = await import('../repositories/user.js');
        return await findUserById(id);
      } catch (err) {
        console.warn("Could not fetch user details:", err.message);
        return null;
      }
    })();
    
    return res.status(200).json(new apiResponse(200, "Player rank fetched successfully", { 
      id, 
      username: userData?.username || "Unknown Player", 
      rank,
      rating: rating || 0
    }));
  } catch (error) {
    console.error("Error fetching player rank:", error);
    throw new apiError(500, `Error fetching player rank: ${error.message}`);
  }
});

/**
 * Controller for getting a player's rating.
 */
const getPlayerRatingController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(400, "Player ID is required");
  }

  try {
    const rating = await getPlayerRating(id);
    
    if (rating === null) {
      return res.status(404).json(new apiResponse(404, "Player not found in leaderboard"));
    }
    
    // Get username
    const userData = await (async () => {
      try {
        // Dynamic import to avoid circular dependency
        const { findUserById } = await import('../repositories/user.js');
        return await findUserById(id);
      } catch (err) {
        console.warn("Could not fetch user details:", err.message);
        return null;
      }
    })();
    
    return res.status(200).json(new apiResponse(200, "Player rating fetched successfully", { 
      id, 
      username: userData?.username || "Unknown Player", 
      rating
    }));
  } catch (error) {
    console.error("Error fetching player rating:", error);
    throw new apiError(500, `Error fetching player rating: ${error.message}`);
  }
});

/**
 * Controller for getting paginated leaderboard.
 */
const getLeaderboardPage = asyncHandler(async (req, res) => {
  let { start, end } = req.query;
  
  // Parse and validate params
  start = parseInt(start) || 0;
  if (start < 0) start = 0;
  
  end = parseInt(end) || start + 9;
  if (end < start) end = start + 9;
  
  // Limit page size for performance
  if (end - start > 100) {
    end = start + 100;
  }
  
  try {
    const players = await getPlayersByRankRange(start, end);
    return res.status(200).json(new apiResponse(200, "Leaderboard page fetched successfully", { 
      players,
      pagination: {
        start,
        end,
        count: players.length
      }
    }));
  } catch (error) {
    console.error("Error fetching leaderboard page:", error);
    throw new apiError(500, `Error fetching leaderboard page: ${error.message}`);
  }
});

export const leaderboard = {
  updateRating,
  getTopPlayersList,
  getPlayerRankController,
  getPlayerRatingController,
  getLeaderboardPage
};
