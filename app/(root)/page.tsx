import DhaagaCard from "@/components/cards/DhaagaCard";
import { fetchDhaagas } from "@/lib/actions/dhaaga.actions";
import { currentUser } from "@clerk/nextjs";

const Home = async () => {
	const result = await fetchDhaagas(1, 30);
	console.log(result);

	const user = await currentUser();

	return (
		<>
			<h1 className="head-text text-left">Home</h1>

			<section className="mt-9 flex flex-col gap-10 ">
				{result.posts.length === 0 ? (
					<p className="no-result">No Dhaagas Found</p>
				) : (
					<>
						{result.posts.map((post) => (
							<DhaagaCard
								key={post._id}
								id={post._id}
								currentUserId={user?.id || ""}
								parentId={post.parentId}
								content={post.text}
								author={post.author}
								community={post.community}
								createdAt={post.createdAt}
								comments={post.children}
							/>
						))}
					</>
				)}
			</section>
		</>
	);
};

export default Home;
