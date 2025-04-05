/*
    Application Initialization File

    This file sets up and configures the Express application instance. 
    It includes middleware, route declarations, and other configurations.

    Features:
        - Initializes an Express application.
        - Configures global middlewares:
            - `express.json()`: Parses incoming JSON requests.
            - `express.urlencoded()`: Parses URL-encoded data with extended query string support.
            - `cors()`: Enables Cross-Origin Resource Sharing (CORS).
            - [add others]
        - Provides a placeholder for importing and declaring routes.

    Exports:
        - The configured Express application instance (`app`).
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// global middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// importing routes
import healthRoutes from "./routes/health.js";
import userRoutes from "./routes/user.js";
import gameRoutes from "./routes/game.js";
//import leaderBoardRoutes from "./routes/leaderboard.js";

// declaring routes
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/game", gameRoutes);
//app.use("/api/v1/leaderboard", leaderBoardRoutes);

export default app;
