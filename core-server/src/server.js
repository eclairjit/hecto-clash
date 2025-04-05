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

const httpServer = app.listen(conf.port, () => {
	console.log(`Server is listening on port ${conf.port}.`);
});
