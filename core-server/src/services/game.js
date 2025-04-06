import { createGame } from "../repositories/game.js";
import redisClient from "../config/redis.js";

// Generate numeric codes for room IDs
const generateNumericCodes = () => {
	const codes = new Set();

	// Generate 6-digit codes (100000 to 999999)
	while (codes.size < 1000) {
		// Generate a random number between 100000 and 999999 and convert it to a string
		const code = String(Math.floor(100000 + Math.random() * 900000));
		codes.add(code);
	}
	return codes;
};

// Initialize the code pool
const availableRoomCodes = generateNumericCodes();
const usedRoomCodes = new Set();

const createGameWithRoomId = async (userId) => {
	try {
		if (availableRoomCodes.size === 0) {
			throw new Error("No available room codes");
		}

		// Get a random code from the available codes (as a string)
		const roomId =
			Array.from(availableRoomCodes)[
				Math.floor(Math.random() * availableRoomCodes.size)
			];

		// Ensure roomId is treated as a string
		const result = await createGame(roomId);

		if (!result) {
			throw new Error("Failed to create game");
		}
		console.log("Result of game creation: ", result);
		// Store roomId as key and game_id as value in Redis
		const gameId = result.id; // or however the game_id is returned from createGame
		await redisClient.set(`room-${roomId}`, gameId);
		console.log(`Stored roomId:${roomId} with gameId:${gameId} in Redis`);

		// Remove the code from available and add to used
		availableRoomCodes.delete(roomId);
		usedRoomCodes.add(roomId);

		return roomId;
	} catch (err) {
		// Specific handling for Redis errors
		if (err.name === 'ReplyError' || err.message.includes('Redis')) {
			console.error('Redis error when creating game:', err);
			throw new Error(`Redis operation failed: ${err.message}`);
		}
		throw new Error(`Error creating game: ${err.message}`);
	}
};

const releaseRoomId = async (roomId) => {
	try {
		if (!usedRoomCodes.has(roomId)) {
			throw new Error(`Room ID ${roomId} is not in use`);
		}

		// Remove from Redis first
		await redisClient.del(roomId);
		console.log(`Removed roomId:${roomId} from Redis`);

		// Then update local sets
		usedRoomCodes.delete(roomId);
		availableRoomCodes.add(roomId);
	} catch (err) {
		console.error(`Error releasing room ID: ${err.message}`);
		throw err; // Re-throw to let caller handle
	}
};

// Get game ID by room ID
const getGameIdByRoomId = async (roomId) => {
	try {
		const gameId = await redisClient.get(roomId);
		if (!gameId) {
			throw new Error(`No game ID found for room ${roomId}`);
		}
		return gameId;
	} catch (err) {
		console.error(`Error getting game ID for room ${roomId}:`, err);
		throw err;
	}
};

// Check if a room exists
const roomExists = async (roomId) => {
	try {
		const exists = await redisClient.exists(roomId);
		return exists === 1;
	} catch (err) {
		console.error(`Error checking if room ${roomId} exists:`, err);
		throw err;
	}
};

export { createGameWithRoomId, releaseRoomId, getGameIdByRoomId, roomExists };
