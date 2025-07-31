//app(auth)/auth.ts
import { compare } from "bcrypt-ts";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getUser, isUserAdminByEmail } from "@/db/queries";

import { authConfig } from "./auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        let users = await getUser(email);
        if (users.length === 0) return null;
        let passwordsMatch = await compare(password, users[0].password!);
        if (passwordsMatch) {
          // Check admin status
          const isAdmin = await isUserAdminByEmail(email);
          // Return only the required fields, and ensure id is a string
          return {
            id: String(users[0].id),
            email: users[0].email,
            firstName: users[0].firstName,
            lastName: users[0].lastName,
            isAdmin,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: authConfig.callbacks,
});
