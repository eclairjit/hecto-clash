import { asyncHandler, apiResponse, apiError } from "../utils/index.js";
import { createGameWithRoomId, releaseRoomId } from "../services/game.js";

/*
 * @desc    Create a new game
 * @route   POST /api/v1/game
 * @access  Public
 */

const Create = asyncHandler(async (req, res) => {
	try {
		const userId = req.body.id;
		
		if (!userId) {
			throw new apiError(400, "User ID is required");
		}
		
		console.log("Creating room with user ID:", userId);
		const roomId = await createGameWithRoomId(userId);

		if (!roomId) {
			throw new apiError(500, "Failed to create game room");
		}
		
		console.log("Room created successfully with ID:", roomId);
		return res
			.status(201)
			.json(new apiResponse(200, "Game created successfully", roomId));
	} catch (err) {
		console.error("Game creation error:", err);
		
		// If it's already an apiError, just throw it
		if (err instanceof apiError) {
			throw err;
		}
		
		// Otherwise wrap it in an apiError
		throw new apiError(500, `Error creating game: ${err.message}`);
	}
});

const Game = {
	Create,
};

export default Game;
