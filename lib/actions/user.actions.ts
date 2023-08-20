"use server";

import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Dhaaga from "../models/dhaaga.model";
import Community from "../models/community.model";

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

		return await User.findOne({ id: userId }).populate({
			path: "communities",
			model: Community,
		});
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
			populate: [
				{
					path: "community",
					model: Community,
					select: "name id _id image", // Select name and _id from Community Model
				},
				{
					path: "children",
					model: Dhaaga,
					populate: {
						path: "author",
						model: User,
						select: "name image id", // Select name and id field from User model
					},
				},
			],
		});

		return dhaagas;
	} catch (error: any) {
		throw new Error(`Failed to fetch User posts: ${error.message}`);
	}
}

export async function fetchUsers({
	userId,
	searchString = "",
	pageNumber = 1,
	pageSize = 20,
	sortBy = "desc",
}: {
	userId: string;
	searchString?: string;
	pageNumber?: number;
	pageSize?: number;
	sortBy?: SortOrder;
}) {
	try {
		connectToDB();

		const skipAmount = (pageNumber - 1) * pageSize;
		const regex = new RegExp(searchString, "i");

		const query: FilterQuery<typeof User> = {
			id: { $ne: userId },
		};

		if (searchString.trim() !== "") {
			query.$or = [
				{ username: { $regex: regex } },
				{ name: { $regex: regex } },
			];
		}

		const sortOptions = { createdAt: sortBy };

		const usersQuery = User.find(query)
			.sort(sortOptions)
			.skip(skipAmount)
			.limit(pageSize);

		const totalUsersCount = await User.countDocuments(query);

		const users = await usersQuery.exec();

		const isNext = totalUsersCount > skipAmount + users.length;

		return { users, isNext };
	} catch (error: any) {
		throw new Error(`Failed to fetch users : ${error.message}`);
	}
}

export async function getActivity(userId: string) {
	try {
		connectToDB();

		// Find all Dhaagas created by user
		const userDhaagas = await Dhaaga.find({ author: userId });

		// Collect all the child dhaaga ids(replies) from the 'children' field
		const childDhaagaIds = userDhaagas.reduce((acc, userDhaaga) => {
			return acc.concat(userDhaaga.children);
		}, []);

		const replies = await Dhaaga.find({
			_id: { $in: childDhaagaIds },
			author: { $ne: userId },
		}).populate({
			path: "author",
			model: User,
			select: "name image _id",
		});

		return replies;
	} catch (error: any) {
		throw new Error(`Failed to fetch any Notifications: ${error.message}`);
	}
}
