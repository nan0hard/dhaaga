"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Dhaaga from "../models/dhaaga.model";

interface updateUserProps {
	userId: string;
	username: string;
	name: string;
	bio: string;
	image: string;
	path: string;
}

export async function updateUser({
	userId,
	username,
	name,
	bio,
	image,
	path,
}: updateUserProps): Promise<void> {
	connectToDB();

	try {
		await User.findOneAndUpdate(
			{ id: userId },
			{ username: username.toLowerCase(), name, bio, image, onboarded: true },
			{ upsert: true }
		);

		if (path === "/profile/edit") {
			revalidatePath(path);
		}
	} catch (error: any) {
		throw new Error(`Failed to create/update user: ${error.message}`);
	}
}

export async function fetchUser(userId: string) {
	try {
		connectToDB();

		return await User.findOne({ id: userId });
		// .populate();
	} catch (error: any) {
		throw new Error(`Failed to fetch User Details: ${error.message}`);
	}
}

export async function fetchUserPosts(userId: string) {
	try {
		connectToDB();

		// Find all Dhaagas created by user with the given userId

		const dhaagas = await User.findOne({ id: userId }).populate({
			path: "dhaagas",
			model: Dhaaga,
			populate: {
				path: "children",
				model: Dhaaga,
				populate: { path: "author", model: User, select: "name image id" },
			},
		});

		return dhaagas;
	} catch (error: any) {
		throw new Error(`Failed to fetch User posts: ${error.message}`);
	}
}
