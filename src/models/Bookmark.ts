import mongoose, { Document, Model, Types } from "mongoose";

export interface IBookmark extends Document {
  title: string;
  url: string;
  description?: string;
  tags: string[];
  categories: string[];
  user: Types.ObjectId;
  score: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  savedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new mongoose.Schema<IBookmark>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    url: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 500 },
    tags: [{ type: String, trim: true, lowercase: true }],
    categories: [{ type: String, trim: true, lowercase: true }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    score: { type: Number, default: 0, index: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    savedCount: { type: Number, default: 0, index: true },
  },
  {
    timestamps: true,
  }
);

BookmarkSchema.index({ title: "text", description: "text", url: "text", tags: "text", categories: "text" });
BookmarkSchema.index({ url: 1, user: 1 }, { unique: true });

const Bookmark: Model<IBookmark> =
  mongoose.models.Bookmark || mongoose.model<IBookmark>("Bookmark", BookmarkSchema);

export default Bookmark;
