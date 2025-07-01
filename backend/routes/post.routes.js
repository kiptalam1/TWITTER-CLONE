import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.middleware.js";
import {
	createPost,
	deletePost,
	commentOnPost,
	likeUnlikePost,
	getAllPosts,
} from "../controllers/post.controller.js";

const router = Router();


router.get("/all", protectRoute, getAllPosts);
router.post("/create", protectRoute, createPost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.post("/:id", protectRoute, likeUnlikePost);
router.delete("/:id", protectRoute, deletePost);


export default router;
