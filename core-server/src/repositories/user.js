import getDBConnection from "../utils/dbPool.js";

// Create User
const createUser = async (username, email, profilePic) => {
	let conn;

	try {
		conn = await getDBConnection();
		if (!conn) {
			throw new Error(`Couldn't connect to the database.`);
		}

		const result = await conn.query(
			`INSERT INTO users (username, email, profile_pic) 
       VALUES ($1, $2, $3) RETURNING id, profile_pic, current_rating`,
			[username, email, profilePic]
		);

		return {
			id: result.rows[0].id,
			email,
			username,
			profile_pic: result.rows[0].profile_pic,
			current_rating: result.rows[0].current_rating,
		};
	} catch (err) {
		console.error(err);
		throw err;
	} finally {
		if (conn) {
			conn.release();
		}
	}
};

// Find User by Email
const findUserByEmail = async (email) => {
	let conn;

	try {
		conn = await getDBConnection();
		if (!conn) {
			throw new Error(`Couldn't connect to the database.`);
		}

		const result = await conn.query("SELECT * FROM users WHERE email = $1", [
			email,
		]);

		return result.rows[0] || null;
	} catch (err) {
		console.error(err);
		return null;
	} finally {
		if (conn) {
			conn.release();
		}
	}
};

// Find User by ID
const findUserById = async (id) => {
	let conn;

	try {
		conn = await getDBConnection();
		if (!conn) {
			throw new Error(`Couldn't connect to the database.`);
		}

		const result = await conn.query(
			"SELECT id, email, username, profile_pic, current_rating FROM users WHERE id = $1",
			[id]
		);

		return result.rows[0];
	} catch (err) {
		console.error(err);
		return null;
	} finally {
		if (conn) {
			conn.release();
		}
	}
};

const storeToken = async (id, token) => {
	let conn;

	try {
		conn = await getDBConnection();

		if (!conn) {
			throw new Error(`Couldn't connect to the database.`);
		}

		const result = await conn.query(
			"UPDATE users SET token = ($1) WHERE id = ($2)",
			[token, id]
		);

		return result.rows[0];
	} catch (err) {
		console.error("Error storing token:", err);
		return null;
	} finally {
		if (conn) {
			conn.release();
		}
	}
};

const deleteToken = async (id) => {
	let conn;

	try {
		conn = await getDBConnection();

		if (!conn) {
			throw new Error(`Couldn't connect to the database.`);
		}

		const result = await conn.query(
			"UPDATE users SET token = NULL WHERE id = ($1)",
			[id]
		);

		return result.rows[0];
	} catch (err) {
		console.error(err);
		return null;
	} finally {
		if (conn) {
			conn.release();
		}
	}
};

export { createUser, findUserByEmail, findUserById, storeToken, deleteToken };
