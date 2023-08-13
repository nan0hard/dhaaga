"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";

import { CommentValidation } from "@/lib/validations/dhaaga";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Image from "next/image";
import { addCommentToDhaaga } from "@/lib/actions/dhaaga.actions";

interface CommentProps {
	dhaagaId: string;
	currentUserImg: string;
	currentUserId: string;
}

const Comment = ({ dhaagaId, currentUserImg, currentUserId }: CommentProps) => {
	const router = useRouter();
	const pathname = usePathname();

	const form = useForm({
		resolver: zodResolver(CommentValidation),
		defaultValues: {
			dhaaga: "",
		},
	});

	const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
		await addCommentToDhaaga(
			dhaagaId,
			values.dhaaga,
			JSON.parse(currentUserId),
			pathname
		);

		form.reset();
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
				<FormField
					control={form.control}
					name="dhaaga"
					render={({ field }) => (
						<FormItem className="flex w-full items-center gap-3">
							<FormLabel>
								<Image
									src={currentUserImg}
									alt="Current User"
									width={48}
									height={48}
									className="rounded-full object-cover"
								/>
							</FormLabel>
							<FormControl className="border-none bg-transparent">
								<Input
									type="text"
									placeholder="Comment..."
									className="no-focus text-light-1 outline-none"
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<Button type="submit" className="comment-form_btn">
					Reply
				</Button>
			</form>
		</Form>
	);
};

export default Comment;
