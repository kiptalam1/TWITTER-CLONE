import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.middleware.js";
import {
	getUserProfile,
	followUnfollowUser,
	getSuggestedUsers,
	updateUser,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/update", protectRoute, updateUser);


export default router;
