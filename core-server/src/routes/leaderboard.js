/**
 * Leaderboard API Routes
 * 
 * Production API Endpoints:
 * 
 * 1. Update Ratings: (Requires Authentication)
 *    - POST http://localhost:3030/api/v1/leaderboard/update
 *    - Headers: Authorization: Bearer {token}
 *    - Body (raw JSON): 
 *      [
 *        {"id": "user1", "rating": 1000, "username": "Player1"},
 *        {"id": "user2", "rating": 800, "username": "Player2"},
 *        {"id": "user3", "rating": 600, "username": "GamerX"}
 *      ]
 * 
 * 2. Get Top Players:
 *    - GET http://localhost:3030/api/v1/leaderboard/top
 *    - Query params: limit=5 (optional)
 *    - Returns players with id, username, and rating
 * 
 * 3. Get Player Rank:
 *    - GET http://localhost:3030/api/v1/leaderboard/rank/user1
 *    - Returns player rank, username and rating
 * 
 * 4. Get Player Rating:
 *    - GET http://localhost:3030/api/v1/leaderboard/rating/user2
 *    - Returns player rating and username
 * 
 * 5. Get Paginated Leaderboard:
 *    - GET http://localhost:3030/api/v1/leaderboard/page?start=0&end=2
 *    - Returns players with id, username, rating and rank
 */

import {Router} from "express";
import { leaderboard } from "../controllers/leaderboard.js";
import { authorize } from "../middlewares/auth.js";

const router = Router();

// Public routes
router.get("/top", leaderboard.getTopPlayersList);
router.get("/rank/:id", leaderboard.getPlayerRankController);
router.get("/rating/:id", leaderboard.getPlayerRatingController);
router.get("/score/:id", leaderboard.getPlayerRatingController);
router.get("/page", leaderboard.getLeaderboardPage);

// Protected routes - require authentication
router.post("/update", authorize, leaderboard.updateRating);

export default router;