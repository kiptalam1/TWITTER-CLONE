import { Router } from "express";
import {
	deleteNotifications,
	getNotifications,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/protectRoute.middleware.js";

const router = Router();

router.get("/", protectRoute, getNotifications);
router.delete("/", protectRoute, deleteNotifications);

export default router;
