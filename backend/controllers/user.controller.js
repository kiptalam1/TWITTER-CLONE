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
