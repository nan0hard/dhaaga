import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
	id: { type: String, required: true },
	username: { type: String, required: true },
	name: { type: String, required: true },
	image: String,
	bio: String,
	createdBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	dhaagas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dhaaga" }],
	members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Community =
	mongoose.models.Community || mongoose.model("Community", communitySchema);

export default Community;
