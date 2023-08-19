"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "../ui/button";

interface UserCardProps {
	id: string;
	name: string;
	username: string;
	imgUrl: string;
	personType: string;
}

const UserCard = ({
	id,
	name,
	username,
	imgUrl,
	personType,
}: UserCardProps) => {
	const router = useRouter();

	return (
		<article className="user-card">
			<div className="user-card_avatar">
				<Image
					src={imgUrl}
					alt="Profile Image"
					width={48}
					height={48}
					className="rounded-full"
				/>

				<div className="flex-1 text-ellipsis">
					<h4 className="text-base-semibold text-light-1">{name}</h4>
					<p className="text-small-medium text-gray-1">@{username}</p>
				</div>

				<Button
					className="user-card_btn"
					onClick={() => router.push(`/profile/${id}`)}
				>
					View
				</Button>
			</div>
		</article>
	);
};

export default UserCard;
