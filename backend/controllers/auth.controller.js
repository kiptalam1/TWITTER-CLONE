import User from "../models/user.model.js";
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
		// validate user email;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}
		// validate password;
		if (password.length < 6) {
			return res
				.status(400)
				.json({ error: "Password must be at least 6 characters long" });
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

export async function login(req, res) {
	try {
		const { username, password } = req.body;
		// check if user exists;
		const existingUser = await User.findOne({ username });
		if (!existingUser) {
			return res.status(400).json({ error: "Invalid username" });
		}
		// check if password is correct;
		const isPasswordCorrect = await bcrypt.compare(
			password,
			existingUser.password || ""
		);
		if (!isPasswordCorrect) {
			return res.status(400).json({ error: "Wrong password" });
		}
		// generate token and set cookie;
		generateTokenAndSetCookie(existingUser._id, res);
		res.status(200).json({
			message: "success",
			data: {
				_id: existingUser._id,
				username: existingUser.username,
				fullName: existingUser.fullName,
				email: existingUser.email,
				followers: existingUser.followers,
				following: existingUser.following,
				coverImage: existingUser.coverImage,
				profileImage: existingUser.profileImage,
			},
		});
	} catch (error) {
		console.error("Error during login:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
}
export function logout(req, res) {
	try {
		res.cookie("jwt", "", { maxAge: 0 }); // Clear the cookie
		res.status(200).json({
			message: "Logged out successfully",
		});
	} catch (error) {
		console.error("Error during logout:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
}
