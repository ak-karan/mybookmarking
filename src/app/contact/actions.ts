"use server";

import { redirect } from "next/navigation";
import connectDB from "../../lib/mongodb";
import ContactQuery from "../../models/ContactQuery";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function submitContactQuery(formData: FormData) {
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const subject = text(formData, "subject");
  const message = text(formData, "message");

  if (name.length < 2 || name.length > 80) {
    throw new Error("Name must be between 2 and 80 characters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email.");
  }

  if (subject.length < 3 || subject.length > 160) {
    throw new Error("Subject must be between 3 and 160 characters.");
  }

  if (message.length < 10 || message.length > 1500) {
    throw new Error("Message must be between 10 and 1500 characters.");
  }

  await connectDB();
  await ContactQuery.create({ name, email, subject, message });
  redirect("/contact?sent=1");
}
