import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export async function protectRoute(req, res, next) {
	try {
		const token = req.cookies.jwt;

		if (!token) {
			return res
				.status(401)
				.json({ error: "Unauthorized access, token missing" });
		}
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			return res
				.status(401)
				.json({ error: "Unauthorized access, invalid token" });
		}
		const user = await User.findById(decoded.userId).select("-password");
		if (!user) {
			return res.status(401).json({ error: "User not found" });
		}
		req.user = user; // Attach user to request object
		next(); // Proceed to the next middleware or route handler
	} catch (error) {
		console.error("Error in protectRoute middleware:", error.message);
		return res.status(402).json({ error: "Internal server error" });
	}
}
