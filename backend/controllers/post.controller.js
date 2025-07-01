import { v2 as cloudinary } from "cloudinary";
import Post from "../models/post.model.js";

export async function createPost(req, res) {
	try {
		const { text } = req.body;
		let { image } = req.body;

		const userId = req.user.id.toString();
		if (!text && !image) {
			return res
				.status(400)
				.json({ error: "Post must contain text or an image" });
		}
		if (image) {
			const uploadResult = await cloudinary.uploader.upload(image);
			image = uploadResult.secure_url;
		}
		const newPost = new Post({
			text,
			image,
			user: userId,
		});
		await newPost.save();
		res.status(201).json({
			message: " success",
			post: newPost,
		});
	} catch (error) {
		console.error("Error creating post:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
}
