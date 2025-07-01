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

const app = express();

// middlewares
app.use(express.json()); // to parse request body as JSON
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


app.listen(process.env.PORT || 5000, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
	connectMongoDB();
});
