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
