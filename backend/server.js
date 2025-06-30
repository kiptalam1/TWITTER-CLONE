import express from "express";
import connectMongoDB from "./db/connectDB.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import authRoutes from "./routes/auth.route.js";

const app = express();

app.use("/api/auth", authRoutes);

app.listen(process.env.PORT || 5000, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
	connectMongoDB();
});
