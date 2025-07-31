//app(auth)/auth.config.ts
import { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isOnRegister = nextUrl.pathname.startsWith("/register");

      if (!isLoggedIn && (isOnLogin || isOnRegister)) {
        return true; // Allow unauthenticated users to access login and register
      }
      if (!isLoggedIn) {
        // Redirect unauthenticated users to login
        return Response.redirect(new URL("/login", nextUrl));
      }
      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        // Redirect authenticated users away from login/register
        return Response.redirect(new URL("/", nextUrl));
      }
      return true; // Authenticated users can access all other routes
    },
    async session({ session, token, user }) {
      // Add id to session.user from user or token, but only if it's a string
      if (user && typeof user.id === "string") {
        session.user.id = user.id;
      } else if (token && typeof token.id === "string") {
        session.user.id = token.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add id to token from user
      if (user && typeof user.id === "string") {
        token.id = user.id;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
