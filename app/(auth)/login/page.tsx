//app(auth)/login/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthForm } from "@/components/custom/auth-form";
import { SubmitButton } from "@/components/custom/submit-button";

import { login, LoginActionState } from "../actions";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: "idle",
    },
  );

  useEffect(() => {
    if (state.status === "failed") {
      toast.error("Invalid credentials!");
    } else if (state.status === "invalid_data") {
      toast.error("Failed validating your submission!");
    } else if (state.status === "success") {
      router.push("/"); // Redirect to chat page
    }
  }, [state.status, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Sign in to Jotium
          </p>
        </div>
        <AuthForm action={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-zinc-600 font-normal dark:text-zinc-400">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              className="bg-muted text-md md:text-sm border-none rounded-md px-3 py-2 w-full"
              type="email"
              placeholder="user@acme.com"
              autoComplete="email"
              required
              defaultValue={email}
            />
            <label htmlFor="password" className="text-zinc-600 font-normal dark:text-zinc-400">
              Password
            </label>
            <div className="relative flex items-center w-full">
              <input
                id="password"
                name="password"
                className="bg-muted text-md md:text-sm border-none rounded-md px-3 py-2 pr-14 w-full"
                type={showPassword ? "text" : "password"}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 dark:text-zinc-400 focus:outline-none"
                tabIndex={0}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <SubmitButton>Sign in</SubmitButton>
          <p className="text-center text-xs text-gray-500 mt-2 dark:text-zinc-400">
            By clicking continue, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-blue-600">Terms of Service</Link>{' '}and{' '}
            <Link href="/privacy" className="underline hover:text-blue-600">Privacy Policy</Link>.
          </p>
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
        </AuthForm>
      </div>
    </div>
  );
}
