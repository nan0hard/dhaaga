"use server";

import { connectToDB } from "../mongoose";

import Dhaaga from "../models/dhaaga.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

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

		const createdDhaaga = await Dhaaga.create({
			text,
			author,
			communityId: null,
		});

		// Update User Model
		await User.findByIdAndUpdate(author, {
			$push: { dhaagas: createdDhaaga._id },
		});

		revalidatePath(path);
	} catch (error: any) {
		throw new Error(`Message while creating Dhaaga: ${error.message}`);
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
