import mongoose from "mongoose";

const dhaagaSchema = new mongoose.Schema({
	text: { type: String, required: true },
	author: { type: mongoose.Schema.Types.ObjectId, ref: "User", requried: true },
	community: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Community",
	},

	createdAt: { type: Date, default: Date.now },

	parentId: { type: String },

	children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dhaaga" }],
});

const Dhaaga = mongoose.models.Dhaaga || mongoose.model("Dhaaga", dhaagaSchema);
export default Dhaaga;
