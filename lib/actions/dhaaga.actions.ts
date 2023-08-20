"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import Dhaaga from "../models/dhaaga.model";
import User from "../models/user.model";
import Community from "../models/community.model";

interface createDhaagaProps {
	text: string;
	author: string;
	communityId: string | null;
	path: string;
}

export async function createDhaaga({
	text,
	author,
	communityId,
	path,
}: createDhaagaProps) {
	try {
		connectToDB();

		const communityIdObject = await Community.findOne(
			{ id: communityId },
			{ _id: 1 }
		);

		const createdDhaaga = await Dhaaga.create({
			text,
			author,
			community: communityIdObject,
		});

		// Update User Model
		await User.findByIdAndUpdate(author, {
			$push: { dhaagas: createdDhaaga._id },
		});

		if (communityIdObject) {
			// Update Community Model
			await Community.findByIdAndUpdate(communityIdObject, {
				$push: { dhaagas: createdDhaaga._id },
			});
		}

		revalidatePath(path);
	} catch (error: any) {
		throw new Error(`Error while creating Dhaaga: ${error.message}`);
	}
}

export async function fetchDhaagas(pageNumber = 1, pageSize = 20) {
	try {
		connectToDB();

		// Calculate the number of posts to skip
		const skipAmount = (pageNumber - 1) * pageSize;

		// Fetch the posts that have no parent (top level dhaaga) else it will fetch comments as well
		const postsQuery = Dhaaga.find({
			parentId: { $in: [null, undefined] },
		})
			.sort({ createdAt: "desc" })
			.skip(skipAmount)
			.limit(pageSize)
			.populate({ path: "author", model: User })
			.populate({ path: "community", model: Community })
			.populate({
				path: "children",
				populate: {
					path: "author",
					model: User,
					select: "_id name parentId image",
				},
			});

		const tolalPostsCount = await Dhaaga.countDocuments({
			parentId: { $in: [null, undefined] },
		});

		const posts = await postsQuery.exec();
		const isNext = tolalPostsCount > skipAmount + posts.length;

		return { posts, isNext };
	} catch (error: any) {
		throw new Error(`Unable to fetch Dhaagas: ${error.message}`);
	}
}

export async function fetchDhaagaById(id: string) {
	connectToDB();

	try {
		const dhaaga = await Dhaaga.findById(id)
			.populate({
				path: "author",
				model: User,
				select: "_id id name image",
			})
			.populate({
				path: "children",
				populate: [
					{
						path: "author",
						model: User,
						select: "_id id name parentId image",
					},
					{
						path: "children",
						mode: Dhaaga,
						populate: {
							path: "author",
							model: User,
							select: "_id id name parentId image",
						},
					},
				],
			})
			.exec();

		return dhaaga;
	} catch (error: any) {
		throw new Error(`Error while fetching Dhaaga By ID: ${error.message}`);
	}
}

export async function addCommentToDhaaga(
	dhaagaId: string,
	commentText: string,
	userId: string,
	path: string
) {
	connectToDB();

	try {
		// Find original dhaaga by it's id
		const originalDhaaga = await Dhaaga.findById(dhaagaId);

		if (!originalDhaaga) throw new Error(`Dhaaga not Found!`);

		// Now the originalDhaaga has been let's create a new Dhaaga with comment text
		const commmentDhaaga = new Dhaaga({
			text: commentText,
			author: userId,
			parentId: dhaagaId,
		});

		const savedCommmentDhaaga = await commmentDhaaga.save();

		// Update the original Dhaaga to include new comments
		originalDhaaga.children.push(savedCommmentDhaaga._id);

		// Save original Dhaaga
		await originalDhaaga.save();

		revalidatePath(path);
	} catch (error: any) {
		throw new Error(`Error adding comment to Dhaaga : ${error.message}`);
	}
}

async function fetchAllChildDhaagas(dhaagaId: string): Promise<any[]> {
	const childDhaagas = await Dhaaga.find({ parentId: dhaagaId });

	const descendantDhaagas = [];
	for (const childDhaaga of childDhaagas) {
		const descendants = await fetchAllChildDhaagas(childDhaaga._id);
		descendantDhaagas.push(childDhaaga, ...descendants);
	}

	return descendantDhaagas;
}

export async function deleteDhaaga(id: string, path: string): Promise<void> {
	try {
		connectToDB();

		// Find the dhaaga to be deleted (the main dhaaga)
		const mainDhaaga = await Dhaaga.findById(id).populate("author community");

		if (!mainDhaaga) {
			throw new Error("Dhaaga not found");
		}

		// Fetch all child dhaagas and their descendants recursively
		const descendantDhaagas = await fetchAllChildDhaagas(id);

		// Get all descendant dhaaga IDs including the main dhaaga ID and child dhaaga IDs
		const descendantDhaagaIds = [
			id,
			...descendantDhaagas.map((dhaaga) => dhaaga._id),
		];

		// Extract the authorIds and communityIds to update User and Community models respectively
		const uniqueAuthorIds = new Set(
			[
				...descendantDhaagas.map((dhaaga) => dhaaga.author?._id?.toString()), // Use optional chaining to handle possible undefined values
				mainDhaaga.author?._id?.toString(),
			].filter((id) => id !== undefined)
		);

		const uniqueCommunityIds = new Set(
			[
				...descendantDhaagas.map((dhaaga) => dhaaga.community?._id?.toString()), // Use optional chaining to handle possible undefined values
				mainDhaaga.community?._id?.toString(),
			].filter((id) => id !== undefined)
		);

		// Recursively delete child Dhaaga and their descendants
		await Dhaaga.deleteMany({ _id: { $in: descendantDhaagas } });

		// Update User model
		await User.updateMany(
			{ _id: { $in: Array.from(uniqueAuthorIds) } },
			{ $pull: { dhaaga: { $in: descendantDhaagas } } }
		);

		// Update Community model
		await Community.updateMany(
			{ _id: { $in: Array.from(uniqueCommunityIds) } },
			{ $pull: { dhaaga: { $in: descendantDhaagaIds } } }
		);

		revalidatePath(path);
	} catch (error: any) {
		throw new Error(`Failed to delete dhaaga: ${error.message}`);
	}
}
