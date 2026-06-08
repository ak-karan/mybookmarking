import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id?: string;
      role?: "user" | "admin";
      authProvider?: "credentials" | "google";
    };
  }

  interface User {
    role?: "user" | "admin";
    authProvider?: "credentials" | "google";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "user" | "admin";
    authProvider?: "credentials" | "google";
  }
}
