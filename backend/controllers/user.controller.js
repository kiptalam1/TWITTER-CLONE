import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// models;
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export async function getUserProfile(req, res) {
	try {
		const { username } = req.params;
		const user = await User.findOne({ username }).select("-password");
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		res.status(200).json({ data: user });
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
}

export async function followUnfollowUser(req, res) {
	try {
		const { id } = req.params;
		const currentUserId = req.user._id;

		const userToModify = await User.findById(id);
		if (!userToModify) {
			return res.status(404).json({ error: "User not found" });
		}

		if (id === currentUserId.toString()) {
			return res
				.status(400)
				.json({ error: "You cannot follow/unfollow yourself" });
		}

		const currentUser = await User.findById(currentUserId);
		if (!currentUser) {
			return res.status(404).json({ error: "Current user not found" });
		}

		const isFollowing = currentUser.following.includes(id);
		if (isFollowing) {
			// Unfollow the user by removing their ID from the following array in the mongo document;
			await User.findByIdAndUpdate(currentUserId, {
				$pull: { following: id },
			});
			// Remove the current user's ID from the followers array of the user being unfollowed
			await User.findByIdAndUpdate(id, {
				$pull: { followers: currentUserId },
			});
			// TODO: return the id of the user as response;

			return res.status(200).json({ message: "Unfollowed successfully" });
		} else {
			// follower the user by adding their ID to the following array in the mongo document;
			await User.findByIdAndUpdate(currentUserId, { $push: { following: id } });
			// Add the current user's ID to the followers array of the user being followed
			await User.findByIdAndUpdate(id, {
				$push: { followers: currentUserId },
			});
			// send notification to the user being followed;
			const newNotification = new Notification({
				from: currentUserId,
				to: userToModify._id,
				type: "follow",
			});
			await newNotification.save();
			// TODO: return the id of the user as response;
			return res.status(200).json({ message: "Followed successfully" });
		}
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
}

export async function getSuggestedUsers(req, res) {
	try {
		const currentUserId = req.user._id;
		// get users whom I already follow;
		const usersFollowedByMe = await User.findById(currentUserId).select(
			"following"
		);
		// get 10 users in the database;
		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: currentUserId },
				},
			},
			{
				$sample: { size: 10 },
			},
		]);
		// exclude users that I follow;
		const filteredUsers = users.filter(
			(user) => !usersFollowedByMe.following.includes(user._id.toString())
		);
		const suggestedUsers = filteredUsers.slice(0, 4);
		suggestedUsers.forEach((user) => (user.password = null));
		res.json({ data: suggestedUsers });
	} catch (error) {
		console.error("Error fetching suggested users:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
}

export async function updateUser(req, res) {
	const {
		username,
		fullName,
		currentPassword,
		newPassword,
		email,
		bio,
		links,
	} = req.body;
	let { coverImage, profileImage } = req.body;

	try {
		const user = await User.findById(req.user._id);
		if (!user) return res.status(404).json({ error: "User not found" });

		// ✅ Only run password logic if one or both password fields are present
		if (currentPassword || newPassword) {
			// ✅ Prevent partial updates that would corrupt password state
			if (!currentPassword || !newPassword) {
				return res.status(400).json({
					error: "Provide both current and new passwords",
				});
			}

			// ✅ Enforce password length validation only if newPassword is provided
			if (newPassword.length < 6) {
				return res.status(400).json({
					error: "Password must be at least 6 characters long",
				});
			}

			// ✅ Check if current password is correct
			const isCorrectPassword = await bcrypt.compare(
				currentPassword,
				user.password
			);
			if (!isCorrectPassword) {
				return res.status(400).json({ error: "Current password is wrong" });
			}

			// ✅ Hash the new password correctly (previously it was re-hashing currentPassword by mistake)
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		// ✅ Upload and replace cover image if provided
		if (coverImage) {
			if (user.coverImage) {
				await cloudinary.uploader.destroy(
					user.coverImage.split("/").pop().split(".")[0]
				);
			}
			const uploadResponse = await cloudinary.uploader.upload(coverImage);
			coverImage = uploadResponse.secure_url;
		}

		// ✅ Upload and replace profile image if provided
		if (profileImage) {
			if (user.profileImage) {
				await cloudinary.uploader.destroy(
					user.profileImage.split("/").pop().split(".")[0]
				);
			}
			const uploadResponse = await cloudinary.uploader.upload(profileImage);
			profileImage = uploadResponse.secure_url;
		}

		// ✅ Update all allowed fields
		user.username = username || user.username;
		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.bio = bio || user.bio;
		user.links = links || user.links;
		user.coverImage = coverImage || user.coverImage;
		user.profileImage = profileImage || user.profileImage;

		await user.save();
		user.password = null; // ✅ Sanitize response payload

		return res.status(200).json({ message: "success", data: user });
	} catch (error) {
		console.error("Error updating user:", error); // ✅ Fix log message typo
		return res.status(500).json({ error: error.message });
	}
}
