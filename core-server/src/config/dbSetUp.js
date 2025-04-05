import getDBConnection from "../utils/dbPool.js";

const setUpDB = async () => {
  let client;
  try {
    client = await pool.connect(); // Get a connection from the pool

    if (!client) {
      throw new Error("Couldn't connect to the database.");
    }

    console.log("Database Connected Successfully!");

    // Create the database if it doesn't exist (Requires superuser privileges)
    await client.query(`CREATE DATABASE hecto_clash_db`);

    console.log("Database created or already exists!");

    return client;
  } catch (error) {
    console.error("Database setup error:", error);
  } finally {
    if (client) {
      client.release(); // Release the connection back to the pool
      console.log("DB Connection Released.");
    }
  }
};

export default setUpDB;
