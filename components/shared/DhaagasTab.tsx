import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import DhaagaCard from "../cards/DhaagaCard";

interface DhaagasTabProps {
	currentUserId: string;
	accountId: string;
	accountType: string;
}

const DhaagasTab = async ({
	currentUserId,
	accountId,
	accountType,
}: DhaagasTabProps) => {
	let result = await fetchUserPosts(accountId);

	if (!result) redirect("/");

	return (
		<section className="mt-9 flex flex-col gap-10">
			{result.dhaagas.map((dhaaga: any) => (
				<DhaagaCard
					key={dhaaga._id}
					id={dhaaga._id}
					currentUserId={currentUserId}
					parentId={dhaaga.parentId}
					content={dhaaga.text}
					author={
						accountType === "User"
							? { name: result.name, image: result.image, id: result.id }
							: {
									name: dhaaga.author.name,
									image: dhaaga.author.image,
									id: dhaaga.author.id,
							  }
					}
					community={dhaaga.community}
					createdAt={dhaaga.createdAt}
					comments={dhaaga.children}
				/>
			))}
		</section>
	);
};

export default DhaagasTab;
