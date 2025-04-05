import { Client } from "pg";

env.DB_NAME = "hecto_clash_db";

const migrateDown = async () => {
  const conn = new Client({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME,
  });

  try {
    await conn.connect();
    
    await conn.query(`
      DROP TABLE IF EXISTS users;
    `);
    
    console.log("Tables dropped successfully!");
  } catch (err) {
    console.error("Error while rolling back the DB:", err);
  } finally {
    conn.end();
  }
};

migrateDown();