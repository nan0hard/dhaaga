import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import DhaagaCard from "@/components/cards/DhaagaCard";
import { fetchUser } from "@/lib/actions/user.actions";
import { fetchDhaagaById } from "@/lib/actions/dhaaga.actions";
import Comment from "@/components/forms/Comment";

const Page = async ({ params }: { params: { id: string } }) => {
	if (!params.id) return null;

	const user = await currentUser();
	if (!user) return null;

	const userInfo = await fetchUser(user.id);
	if (!userInfo.onboarded) redirect("/onboarding");

	const dhaaga = await fetchDhaagaById(params.id);

	return (
		<section className="relative">
			<div>
				<DhaagaCard
					key={dhaaga._id}
					id={dhaaga._id}
					currentUserId={user?.id || ""}
					parentId={dhaaga.parentId}
					content={dhaaga.text}
					author={dhaaga.author}
					community={dhaaga.community}
					createdAt={dhaaga.createdAt}
					comments={dhaaga.children}
				/>
			</div>

			<div className="mt-7">
				<Comment
					dhaagaId={dhaaga.id}
					currentUserImg={userInfo.image}
					currentUserId={JSON.stringify(userInfo._id)}
				/>
			</div>

			<div className="mt-10">
				{dhaaga.children.map((childItem: any) => (
					<DhaagaCard
						key={childItem._id}
						id={childItem._id}
						currentUserId={user?.id || ""}
						parentId={childItem.parentId}
						content={childItem.text}
						author={childItem.author}
						community={childItem.community}
						createdAt={childItem.createdAt}
						comments={childItem.children}
						isComment
					/>
				))}
			</div>
		</section>
	);
};

export default Page;
