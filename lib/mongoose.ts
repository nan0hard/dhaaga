import { error } from "console";
import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
	mongoose.set("strictQuery", true);

	if (!process.env.MONGODB_URL)
		return console.log("MONGODB_URL not found in .env");
	if (isConnected) return console.log("Already Connected to MONGODB");

	try {
		await mongoose.connect(process.env.MONGODB_URL);

		isConnected = true;
		console.log("Successfully connected to MONGODB!!");
	} catch (error) {
		console.log(error);
	}
};
