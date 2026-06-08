import bcrypt from "bcrypt";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { isConfiguredAdmin } from "./admin";
import connectDB from "./mongodb";
import User from "../models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";

        if (!email || !password) {
          return null;
        }

        await connectDB();
        const user = await User.findOne({ email }).select("+passwordHash");

        if (
          !user?.passwordHash ||
          !user.emailVerified ||
          !(await bcrypt.compare(password, user.passwordHash))
        ) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: isConfiguredAdmin(user.email) ? "admin" : user.role,
          authProvider: user.authProvider,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error("Google OAuth environment variables are not set.");
        return false;
      }

      if (!user.email) {
        console.error("Google sign-in failed: missing email.");
        return false;
      }

      try {
        const email = user.email.toLowerCase();
        await connectDB();
        await User.findOneAndUpdate(
          { email },
          {
            $set: {
              name: user.name ?? "",
              image: user.image ?? "",
              authProvider: "google",
              emailVerified: new Date(),
            },
            $setOnInsert: {
              email,
              authProvider: "google",
              role: isConfiguredAdmin(email) ? "admin" : "user",
            },
          },
          { new: true, upsert: true }
        );

        return true;
      } catch (error) {
        console.error("Error during Google sign-in:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.authProvider = user.authProvider;
      }

      if (token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email.toLowerCase() })
            .select("_id role authProvider")
            .lean();

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = isConfiguredAdmin(token.email) ? "admin" : dbUser.role;
            token.authProvider = dbUser.authProvider;
          }
        } catch (error) {
          console.error("Error refreshing auth token:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.authProvider = token.authProvider;
      }

      if (!session.user?.email) {
        return session;
      }

      try {
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email.toLowerCase() })
          .select("_id name image role authProvider")
          .lean();

        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.name = dbUser.name ?? session.user.name;
          session.user.image = dbUser.image ?? session.user.image;
          session.user.role = isConfiguredAdmin(session.user.email)
            ? "admin"
            : dbUser.role;
          session.user.authProvider = dbUser.authProvider;
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function auth() {
  return getServerSession(authOptions);
}
