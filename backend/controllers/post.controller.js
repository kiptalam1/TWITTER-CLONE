import { v2 as cloudinary } from "cloudinary";
// models;
import Notification from "../models/notification.model.js";
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

export async function commentOnPost(req, res) {
	try {
		const postId = req.params.id;
		const userId = req.user._id;
		const { text } = req.body;

		// fetch the post to comment on;
		const post = await Post.findById(postId);
		if (!post) return res.status(404).json({ error: "Post not found" });

		const comment = { user: userId, text };
		// append the comment to the post's array of comments;
		post.comments.push(comment);
		await post.save();
		res.status(200).json({ data: post });
	} catch (error) {
		console.error("Error commenting on post:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
}

export async function likeUnlikePost(req, res) {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		//find the post from the db;
		const post = await Post.findById(postId);
		if (!post) return res.status(404).json({ error: "Post not found" });

		//check if user has already liked the post;
		const hasLiked = post.likes.some(
			(like) => like.user.toString() === userId.toString()
		);
		if (hasLiked) {
			// unlike (remove user id from likes) if user has liked the post;
			await Post.updateOne(
				{ _id: postId },
				{ $pull: { likes: { user: userId } } }
			);
			return res.status(200).json({ message: "Post un-liked successfully" });
		} else {
			// like the post;
			post.likes.push({ user: userId });
			await post.save();
			// then send notification;
			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();
			return res.status(200).json({ message: "Post liked successfully" });
		}
	} catch (error) {
		console.error("Error on likeUnlikePost:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
}

export async function getAllPosts(req, res) {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({ path: "user", select: "-password" })
			.populate({ path: "comments.user", select: "-password" });

		if (posts.length === 0)
			return res.status(200).json({ message: "Not posts yet", data: [] });
		res.status(200).json({ data: posts });
	} catch (error) {
		console.error("Error fetching all posts", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
}