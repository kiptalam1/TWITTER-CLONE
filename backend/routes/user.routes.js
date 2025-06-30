import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.middleware.js";
import { getUserProfile } from "../controllers/user.controller.js";

const router = Router();

router.get("/profile/:username", protectRoute, getUserProfile);

export default router;
