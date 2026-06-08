import mongoose, { Document, Model } from "mongoose";

export interface IContactQuery extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const ContactQuerySchema = new mongoose.Schema<IContactQuery>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 1500 },
    status: {
      type: String,
      enum: ["new", "read", "closed"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

const ContactQuery: Model<IContactQuery> =
  mongoose.models.ContactQuery ||
  mongoose.model<IContactQuery>("ContactQuery", ContactQuerySchema);

export default ContactQuery;
