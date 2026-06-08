import mongoose, { Document, Model, Types } from "mongoose";

export type VoteValue = -1 | 1;

export interface IVote extends Document {
  bookmark: Types.ObjectId;
  user: Types.ObjectId;
  value: VoteValue;
}

const VoteSchema = new mongoose.Schema<IVote>(
  {
    bookmark: { type: mongoose.Schema.Types.ObjectId, ref: "Bookmark", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    value: { type: Number, enum: [-1, 1], required: true },
  },
  {
    timestamps: true,
  }
);

VoteSchema.index({ bookmark: 1, user: 1 }, { unique: true });

const Vote: Model<IVote> = mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema);

export default Vote;
