import { Client } from "pg";
import { DB_NAME } from "../src/constants";

const migrateUp = async () => {
  const conn = new Client({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
  });

  try {
    await conn.connect();
    await conn.query(`CREATE DATABASE ${process.env.DB_NAME};`);
    console.log("Database created successfully!");
    conn.end();

    // Connect to the new database
    const dbClient = new Client({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME,
    });
    await dbClient.connect();

    // Enable CITEXT extension
    await dbClient.query(`CREATE DATABASE IF NOT EXISTS citext ${DB_NAME};`);

    // Create users table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        profile_pic TEXT,
        email CITEXT UNIQUE NOT NULL,
        current_rating INT DEFAULT 400 CHECK (current_rating >= 0),
        age INT NOT NULL CHECK (age >= 0),
        created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    console.log("Tables created successfully!");
  } catch (err) {
    console.error("Error setting up the DB:", err);
  } finally {
    conn.end();
  }
};

migrateUp();
