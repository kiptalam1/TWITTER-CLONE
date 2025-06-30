import jwt from "jsonwebtoken";

export function generateTokenAndSetCookie(userId, res) {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "24h", // Token expires in 24 hours;
	});

	res.cookie("jwt", token, {
		httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
		secure: process.env.NODE_ENV !== "development", // Use secure cookies in production)
		sameSite: "Strict", // Helps prevent CSRF attacks
		maxAge: 24 * 60 * 60 * 1000, // Cookie expires in 24 hours
	});
}
