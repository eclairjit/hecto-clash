import { asyncHandler, apiResponse, apiError } from "../utils/index.js";
import { createGameWithRoomId, releaseRoomId } from "../services/game.js";

/*
 * @desc    Create a new game
 * @route   POST /api/v1/game
 * @access  Public
 */

const Create = asyncHandler(async (req, res) => {
	const userId = req.user.id;

	const result = await createGameWithRoomId(userId);

	if (!result) {
		throw apiError(400, "Failed to create game");
	}

	return res
		.status(201)
		.json(apiResponse(200, "Game created successfully", result));
});

const Game = {
	Create,
};

export default Game;
