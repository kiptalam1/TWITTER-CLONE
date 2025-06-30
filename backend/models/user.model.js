import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		fullName: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6, // Minimum length for password
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		followers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User", // Reference to User model for followers
				default: [],
			},
		],
		following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User", // Reference to User model for following
				default: [],
			},
		],
		profileImage: {
			type: String,
			default: "",
		},
		coverImage: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "",
		},
		links: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
