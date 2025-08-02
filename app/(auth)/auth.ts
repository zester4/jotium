import { compare } from "bcrypt-ts";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { getUser, isUserAdminByEmail, createUser, getUserById } from "@/db/queries";

import { authConfig } from "./auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email"
        }
      }
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const users = await getUser(email);
          if (users.length === 0) return null;

          const user = users[0];
          if (!user.password) return null; // OAuth users don't have passwords

          const passwordsMatch = await compare(password, user.password);
          if (!passwordsMatch) return null;

          // Check admin status
          const isAdmin = await isUserAdminByEmail(email);
          
          return {
            id: String(user.id),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName} ${user.lastName}`.trim(),
            isAdmin,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Handle OAuth sign-ins (Google and GitHub)
        if (account?.provider === "google" || account?.provider === "github") {
          if (!user.email) {
            console.error("No email provided by OAuth provider");
            return false;
          }
          
          // Check if user already exists
          const existingUsers = await getUser(user.email);
          
          if (existingUsers.length === 0) {
            // Create new user for OAuth sign-in
            let firstName = "";
            let lastName = "";
            
            if (user.name) {
              const nameParts = user.name.split(" ");
              firstName = nameParts[0] || "";
              lastName = nameParts.slice(1).join(" ") || "";
            } else {
              // Fallback to email username if no name provided
              firstName = user.email.split("@")[0];
            }
            
            try {
              await createUser(
                user.email,
                null, // No password for OAuth users
                firstName,
                lastName
              );
              console.log(`Created new OAuth user: ${user.email}`);
            } catch (error) {
              console.error("Failed to create OAuth user:", error);
              return "/login?error=CreateUserFailed";
            }
          }
          
          return true;
        }
        
        // Default behavior for credentials
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return "/login?error=SignInError";
      }
    },
    
    async jwt({ token, user, account, trigger }) {
      try {
        // Initial sign in
        if (user) {
          token.id = user.id || "";
          token.firstName = user.firstName;
          token.lastName = user.lastName;
          token.isAdmin = user.isAdmin || false;
        }
        
        // For OAuth users, ensure we have the database user info
        if (account?.provider === "google" || account?.provider === "github") {
          if (token.email) {
            const users = await getUser(token.email);
            if (users.length > 0) {
              const dbUser = users[0];
              token.id = String(dbUser.id);
              token.firstName = dbUser.firstName || undefined;
              token.lastName = dbUser.lastName || undefined;
              token.isAdmin = await isUserAdminByEmail(token.email);
            }
          }
        }
        
        // Handle session updates
        if (trigger === "update" && token.email) {
          const users = await getUser(token.email);
          if (users.length > 0) {
            const dbUser = users[0];
            token.firstName = dbUser.firstName || undefined;
            token.lastName = dbUser.lastName || undefined;
            token.isAdmin = await isUserAdminByEmail(token.email);
          }
        }
        
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },
    
    async session({ session, token }) {
      try {
        // Add custom properties to session
        if (token && session.user) {
          session.user.id = token.id || "";
          session.user.firstName = token.firstName;
          session.user.lastName = token.lastName;
          session.user.isAdmin = token.isAdmin || false;
          
          // Ensure name is set
          if (session.user.firstName && session.user.lastName) {
            session.user.name = `${session.user.firstName} ${session.user.lastName}`.trim();
          }
        }
        
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
    
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // console.log(`User signed in: ${user.email} via ${account?.provider}`);
    },
    async signOut(params) {
      if ("token" in params && params.token) {
        console.log(`User signed out: ${params.token.email}`);
      } else if ("session" in params && params.session) {
        const user = await getUserById(params.session.userId);
        if (user) {
          // console.log(`User signed out: ${user.email}`);
        }
      }
    },
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`);
    },
  },
  // debug: process.env.NODE_ENV === "development",
});
