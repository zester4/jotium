import { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", 
    verifyRequest: "/login",
    newUser: "/", // Redirect new OAuth users to home
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isOnRegister = nextUrl.pathname.startsWith("/register");
      const isOnAuth = nextUrl.pathname.startsWith("/api/auth");

      // Always allow access to auth API routes
      if (isOnAuth) {
        return true;
      }

      // Allow unauthenticated users to access login and register pages
      if (!isLoggedIn && (isOnLogin || isOnRegister)) {
        return true;
      }
      
      // Redirect unauthenticated users to login for protected routes
      if (!isLoggedIn && !isOnLogin && !isOnRegister) {
        return Response.redirect(new URL("/login", nextUrl));
      }
      
      // Redirect authenticated users away from login/register to home
      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL("/", nextUrl));
      }
      
      // Allow authenticated users to access all other routes
      return true;
    },
  },
  providers: [], // Providers are added in auth.ts
} satisfies NextAuthConfig;