import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.middleware.js";
import {
	createPost,
	deletePost,
	commentOnPost,
} from "../controllers/post.controller.js";

const router = Router();

router.post("/create", protectRoute, createPost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);


export default router;
