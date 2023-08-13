import * as z from "zod";

export const DhaagaValidation = z.object({
	dhaaga: z
		.string()
		.nonempty()
		.min(3, { message: "Minimum 3 characters required" }),
	accountId: z.string(),
});

export const CommentValidation = z.object({
	dhaaga: z
		.string()
		.nonempty()
		.min(1, { message: "Minimum 1 character required" }),
});
