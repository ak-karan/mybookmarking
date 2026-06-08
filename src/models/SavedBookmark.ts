import mongoose, { Document, Model, Types } from "mongoose";

export interface ISavedBookmark extends Document {
  bookmark: Types.ObjectId;
  user: Types.ObjectId;
}

const SavedBookmarkSchema = new mongoose.Schema<ISavedBookmark>(
  {
    bookmark: { type: mongoose.Schema.Types.ObjectId, ref: "Bookmark", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

SavedBookmarkSchema.index({ bookmark: 1, user: 1 }, { unique: true });

const SavedBookmark: Model<ISavedBookmark> =
  mongoose.models.SavedBookmark ||
  mongoose.model<ISavedBookmark>("SavedBookmark", SavedBookmarkSchema);

export default SavedBookmark;
