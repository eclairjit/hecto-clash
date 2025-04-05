import { Router } from "express";
import User from "../controllers/user.js";

const router = Router();

// User routes
// router.post("/signup", UserController.Signup);
// router.post("/login", UserController.Login);

router.post("/login", User.Login);

export default router;
