/*
    Configuration File

    This file contains the configuration settings for the application. 
    It retrieves values from environment variables or falls back to default values.

    Configuration Properties:
        port: number
            - The port on which the server will run.
            - Default: 3030 (if `process.env.PORT` is not set).

        dbHost: string
            - The hostname or IP address of the database server.
            - Default: "localhost" (if `process.env.DB_HOST` is not set).

        [add others]
 */
import {
	DB_NAME,
	DB_CONNECTION_LIMIT,
	DB_ACQUIRE_TIMEOUT,
	DB_IDLE_TIMEOUT,
	QUERY_TIMEOUT,
	defaultProfilePic,
} from "../constants.js";

const VERSION = "1.0.0";

const conf = {
	// Server settings
	version: VERSION,
	port: parseInt(process.env.PORT) || 3030,

	// Database settings
	dbHost: process.env.DB_HOST || "localhost",
	dbPort: parseInt(process.env.DB_PORT) || 5432,
	dbName: DB_NAME || "hectoclash",
	dbUser: process.env.DB_USER || "admin",
	dbPassword: process.env.DB_PASSWORD || "password",
	dbConnectionLimit: DB_CONNECTION_LIMIT || 10,
	dbIdleTimeout: DB_IDLE_TIMEOUT || 1800,
	dbAcquireTimeout: DB_ACQUIRE_TIMEOUT || 10000,
	queryTimeout: QUERY_TIMEOUT || 60000,

	// JWT settings
	jwtSecret: process.env.JWT_SECRET || "ayush_maholiya_22je0216_xyz_asdfghjkl",
	jwtExpiration: process.env.JWT_EXPIRATION || "2d",

	// Application settings
	defaultProfilePic,
};

export default conf;
