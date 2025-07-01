import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.middleware.js";
import { createPost, deletePost } from "../controllers/post.controller.js";

const router = Router();

router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);


export default router;
