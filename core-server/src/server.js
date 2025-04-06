/*
    Server Initialization File

    This file is responsible for starting the HTTP server and WebSocket server.

    Features:
        - Imports the configured Express application instance (`app`) from `app.js`.
        - Imports configuration settings (`conf`) from `config.js`.
        - Starts an HTTP server on the specified port (`conf.port`).
        - Initializes a WebSocket server (`wss`) using the HTTP server.

    Exports:
        - None (this file is the entry point for starting the server).

    Logs:
        - Logs a message to the console when the server starts successfully.
 */

import app from "./app.js";
import conf from "./config/config.js";
import { isRedisAvailable } from "./config/redis.js";

// Check if Redis is available - it's mandatory for the server to work
setTimeout(() => {
	if (!isRedisAvailable) {
		console.error("ERROR: Redis connection not established. Server cannot function without Redis.");
		console.error("Please ensure Redis is running on localhost:6379 or configure environment variables.");
		process.exit(1);
	} else {
		console.log("Redis connection verified. Server is ready to use.");
	}
}, 5000); // Give Redis 5 seconds to connect

const httpServer = app.listen(conf.port, () => {
	console.log(`Server is listening on port ${conf.port}.`);
});
