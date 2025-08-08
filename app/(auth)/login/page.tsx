"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthForm } from "@/components/custom/auth-form";
import { SubmitButton } from "@/components/custom/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { login, LoginActionState } from "../actions";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: "idle",
    },
  );

  useEffect(() => {
    // Handle OAuth errors from URL params
    if (error) {
      switch (error) {
        case "CredentialsSignin":
          toast.error("Invalid email or password.");
          break;
        case "CreateUserFailed":
          toast.error("Failed to create your account. Please try again.");
          break;
        case "SignInError":
          toast.error("Sign in failed. Please try again.");
          break;
        case "OAuthAccountNotLinked":
          toast.error("This email is already associated with another account.");
          break;
        case "AccessDenied":
          toast.error("Access denied. Please check your credentials.");
          break;
        case "Verification":
          toast.error("Verification failed. Please try again.");
          break;
        default:
          toast.error("An error occurred during authentication.");
      }
      // Clear the error from URL without affecting the callbackUrl
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [error, router]);

  useEffect(() => {
    if (state.status === "failed") {
      toast.error("Invalid email or password!");
    } else if (state.status === "invalid_data") {
      toast.error("Please check your input and try again!");
    } else if (state.status === "success") {
      toast.success("Signed in successfully!");
      // Force a hard refresh to update the session
      window.location.href = callbackUrl;
    }
  }, [state.status, callbackUrl]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await signIn(provider, { 
        callbackUrl,
        redirect: false 
      });
      
      if (result?.error) {
        console.error(`OAuth error with ${provider}:`, result.error);
        toast.error(`Failed to sign in with ${provider}. Please try again.`);
      } else if (result?.url) {
        // Successful authentication, redirect
        window.location.href = result.url;
        return; // Don't set loading to false as we're redirecting
      }
    } catch (error) {
      console.error(`OAuth error with ${provider}:`, error);
      toast.error(`Failed to sign in with ${provider}. Please try again.`);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background pt-16 pb-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Welcome back to Jotium
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="flex flex-col gap-3 px-4 sm:px-16">
          {/* <button
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading || state.status === "in_progress"}
            className="flex items-center justify-center gap-3 w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </button> */}
          
          {/* <button
            onClick={() => handleOAuthSignIn("github")}
            disabled={isLoading || state.status === "in_progress"}
            className="flex items-center justify-center gap-3 w-full bg-black dark:bg-white text-white dark:text-black rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            )}
            Continue with GitHub
          </button> */}
          
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-zinc-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-gray-500 dark:text-zinc-400">
                Or continue with email
              </span>
            </div>
          </div> */}
        </div>

        <AuthForm action={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-zinc-600 font-normal dark:text-zinc-400">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              className="bg-muted text-md md:text-sm border-none"
              type="email"
              placeholder="user@jotium.com"
              autoComplete="email"
              required
              defaultValue={email}
              disabled={state.status === "in_progress"}
            />
            <Label htmlFor="password" className="text-zinc-600 font-normal dark:text-zinc-400">
              Password
            </Label>
            <div className="relative flex items-center w-full">
              <Input
                id="password"
                name="password"
                className="bg-muted text-md md:text-sm border-none pr-14"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={state.status === "in_progress"}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 dark:text-zinc-400 focus:outline-none hover:text-zinc-700 dark:hover:text-zinc-300"
                tabIndex={0}
                disabled={state.status === "in_progress"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <Link
              href="/reset-password"
              className="text-sm text-gray-600 hover:underline dark:text-zinc-400 text-right mt-1"
            >
              Forgot password?
            </Link>
          </div>
          <SubmitButton>Sign in</SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign up
            </Link>
            {" for free."}
          </p>
          <p className="text-center text-xs text-gray-500 mt-2 dark:text-zinc-400">
            By clicking continue, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-blue-600">Terms of Service</Link>{' '}and{' '}
            <Link href="/privacy" className="underline hover:text-blue-600">Privacy Policy</Link>.
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
