import Notification from "../models/notification.model.js";

export async function getNotifications(req, res) {
	try {
		const userId = req.user._id;

		const notifications = await Notification.find({ to: userId })
			.populate("from", "username profileImg")
			.sort({ createdAt: -1 });
		
		await Notification.updateMany({ to: userId }, { read: true });
		res.status(200).json({ data: notifications });
	} catch (error) {
		console.error("Error fetching user notifications: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
}

export async function deleteNotifications(req, res) {
	try {
		const userId = req.user._id;

		await Notification.deleteMany({ to: userId });
		res.status(200).json({ message: "Notifications deleted successfully" });
	} catch (error) {
		console.error("Error deleting user notifications: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
}
