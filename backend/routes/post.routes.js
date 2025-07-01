import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.middleware.js";
import { createPost } from "../controllers/post.controller.js";

const router = Router();

router.post("/create", protectRoute, createPost);

export default router;
