"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";

import { DhaagaValidation } from "@/lib/validations/dhaaga";
import { createDhaaga } from "@/lib/actions/dhaaga.actions";

const PostDhaaga = ({ userId }: { userId: string }) => {
	const router = useRouter();
	const pathname = usePathname();

	const form = useForm({
		resolver: zodResolver(DhaagaValidation),
		defaultValues: {
			dhaaga: "",
			accountId: userId,
		},
	});

	const onSubmit = async (values: z.infer<typeof DhaagaValidation>) => {
		await createDhaaga({
			text: values.dhaaga,
			author: userId,
			communityId: null,
			path: pathname,
		});

		router.push("/");
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col justify-start gap-10 mt-10"
			>
				<FormField
					control={form.control}
					name="dhaaga"
					render={({ field }) => (
						<FormItem className="flex flex-col w-full gap-3">
							<FormLabel className="text-base-semibold text-light-2">
								Content
							</FormLabel>
							<FormControl className="no-focus border-dark-4 bg-dark-3 text-light-1">
								<Textarea rows={10} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="bg-primary-500">
					Post Dhaaga
				</Button>
			</form>
		</Form>
	);
};

export default PostDhaaga;
