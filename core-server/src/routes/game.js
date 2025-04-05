import { Router } from "express";
import Game from "../controllers/game.js";
import { authorize } from "../middlewares/auth.js";

const router = Router();

router.route("/").post(authorize, Game.Create);

export default router;
