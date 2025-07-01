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

export async function deletePost(req, res) {
	try {
		const id = req.params.id;
		const userId = req.user._id;

		//fetch post from mongo;
		const post = await Post.findById(id);
		if (!post) return res.status(404).json({ error: "Post not found" });

		// prevent user from deleting another user's post;
		if (userId.toString() !== post.user.toString())
			return res
				.status(400)
				.json({ error: "You cannot delete another user's posts" });

		// if post has an image;
		if (post.image) {
			// delete from cloudinary;
			const imageId = post.image.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imageId);
		}

		// finally delete post from mongo;
		await Post.findByIdAndDelete(id);
		return res.status(200).json({ message: "Post was deleted successfully" });
	} catch (error) {
		console.error("Error deleting post", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
}