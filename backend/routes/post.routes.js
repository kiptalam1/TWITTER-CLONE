import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.middleware.js";
import {
	createPost,
	deletePost,
	commentOnPost,
	likeUnlikePost,
	getAllPosts,
	getLikedPosts,
} from "../controllers/post.controller.js";

const router = Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.post("/create", protectRoute, createPost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.post("/:id", protectRoute, likeUnlikePost);
router.delete("/:id", protectRoute, deletePost);


export default router;
