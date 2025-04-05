import { getDBConnection } from "../utils/index.js";

const createGame = async (roomId) => {
	let conn;

	try {
		conn = await getDBConnection();

		if (!conn) {
			throw new Error("Couldn't connect to the database");
		}
         console.log()
		const result = await conn.query(
			"INSERT INTO games (roomId) VALUES ($1) RETURNING id",
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
