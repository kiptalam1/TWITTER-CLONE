import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export async function signup(req, res) {
	try {
		const { username, fullName, password, email } = req.body;
		// check if username or email already exists;
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ message: "Username already exists" });
		}
		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ message: "Email already exists" });
		}
		// hash password;
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		// create new user;
		const newUser = new User({
			username,
			fullName,
			email,
			password: hashedPassword,
		});

		if (newUser) {
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();
			res.status(201).json({
				message: "User created successfully",
				data: {
					_id: newUser._id,
					username: newUser.username,
					fullName: newUser.fullName,
					email: newUser.email,
					followers: newUser.followers,
					following: newUser.following,
					coverImage: newUser.coverImage,
					profileImage: newUser.profileImage,
				},
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.error("Error during signup:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
}

export function login(req, res) {
	// Handle user login logic here
	res.status(200).json({ message: "User logged in successfully" });
}
export function logout(req, res) {
	// Handle user logout logic here
	res.status(200).json({ message: "User logged out successfully" });
}
