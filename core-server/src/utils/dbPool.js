import pool from "../config/db.js";

const getDBConnection = async () => {
  try {
    const conn = await pool.connect();
    return conn;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

export default getDBConnection;
