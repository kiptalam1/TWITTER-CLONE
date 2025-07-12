import path from "path";
import express from "express";
import connectMongoDB from "./db/connectDB.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

// middlewares
app.use(express.json({ limit: "5mb" })); // to parse request body as JSON and limit to prevent DOS attacks;
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded data
app.use(cookieParser());

//cloudinary;
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// routes;
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
	// serve static files from the frontend build directory
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	// handle any requests that don't match the above routes
	app.get("/*", (req, res) => {
		res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(process.env.PORT || 5000, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
	connectMongoDB();
});
