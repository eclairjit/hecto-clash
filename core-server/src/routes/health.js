import { Router } from "express";
import conf from "../config/config.js";
import { apiResponse } from "../utils/index.js";

const router = Router();

const message = {
	status: "ok",
	version: conf.version,
	time: new Date().toISOString(),
};

// User routes
router.get("/", (_, res) => {
	res
		.status(200)
		.json(new apiResponse(200, message, "HectoClash Core Server is running"));
});

export default router;
