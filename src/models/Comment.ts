import mongoose, { Document, Model, Types } from "mongoose";

export interface IComment extends Document {
  bookmark: Types.ObjectId;
  user: Types.ObjectId;
  body: string;
}

const CommentSchema = new mongoose.Schema<IComment>(
  {
    bookmark: { type: mongoose.Schema.Types.ObjectId, ref: "Bookmark", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 700 },
  },
  {
    timestamps: true,
  }
);

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
