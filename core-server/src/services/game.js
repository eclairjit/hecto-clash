import { createGame } from "../repositories/game.js";

// Generate numeric codes for room IDs
const generateNumericCodes = () => {
	const codes = new Set();

	// Generate 6-digit codes (100000 to 999999)
	while (codes.size < 1000) {
		// Adjust size as needed
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		codes.add(code);
	}
	return codes;
};

// Initialize the code pool
const availableRoomCodes = generateNumericCodes();
const usedRoomCodes = new Set();

const createGameWithRoomId = async (roomId) => {
	try {
		if (availableRoomCodes.size === 0) {
			throw new Error("No available room codes");
		}

		// Get a random code from the available codes
		const roomId =
			Array.from(availableRoomCodes)[
				Math.floor(Math.random() * availableRoomCodes.size)
			];

		const result = await createGame(roomId);

		if (!result) {
			throw new Error("Failed to create game");
		}

		// Remove the code from available and add to used
		availableRoomCodes.delete(roomId);
		usedRoomCodes.add(roomId);

		return roomId;
	} catch (err) {
		throw new Error(`Error creating game: ${err.message}`);
	}
};

const releaseRoomId = (roomId) => {
	try {
		if (!usedRoomCodes.has(roomId)) {
			throw new Error(`Room ID ${roomId} is not in use`);
		}

		usedRoomCodes.delete(roomId);
		availableRoomCodes.add(roomId);
	} catch (err) {
		throw new Error(`Error releasing room ID: ${err.message}`);
	}
};

export { createGameWithRoomId, releaseRoomId };
