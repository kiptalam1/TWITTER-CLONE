import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.middleware.js";
import {
	getUserProfile,
	followUnfollowUser,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.post("/follow/:id", protectRoute, followUnfollowUser);

export default router;
