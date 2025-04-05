import { getDBConnection } from "../utils/index.js";

const createPlayer = async (gameId) => {
	let conn;

	try {
		conn = await getDBConnection();

		if (!conn) {
			throw new Error("Couldn't connect to the database");
		}

		const result = await conn.query(
			"INSERT INTO players (game_id) VALUES ($1)",
			[gameId]
		);

		return result.rows[0];
	} catch (err) {
		console.error(err);
	} finally {
		if (conn) {
			conn.release();
		}
	}
};

export { createPlayer };
