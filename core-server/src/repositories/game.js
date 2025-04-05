import { getDBConnection } from "../utils/index.js";

const createGame = async (roomId) => {
	let conn;

	try {
		conn = await getDBConnection();

		if (!conn) {
			throw new Error("Couldn't connect to the database");
		}

		const result = await conn.query(
			"INSERT INTO games (room_id) VALUES ($1) RETURNING game_id",
			[roomId]
		);

		console.log("Result of game creation: ", result);

		return result.rows[0];
	} catch (err) {
		console.error(err);
	} finally {
		if (conn) {
			conn.release();
		}
	}
};

export { createGame };
