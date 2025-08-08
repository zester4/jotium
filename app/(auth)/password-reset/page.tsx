"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AuthForm } from "@/components/custom/auth-form";
import { SubmitButton } from "@/components/custom/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { requestPasswordReset, resetPassword, RequestPasswordResetActionState, ResetPasswordActionState } from "../actions";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State for requesting password reset email
  const [requestState, requestAction] = useActionState<RequestPasswordResetActionState, FormData>(
    requestPasswordReset,
    { status: "idle" },
  );

  // State for actual password reset with token
  const [resetState, resetAction] = useActionState<ResetPasswordActionState, FormData>(
    resetPassword,
    { status: "idle" },
  );

  useEffect(() => {
    if (requestState.status === "success") {
      toast.success("Password reset link sent to your email!");
      setEmail(""); // Clear email field after successful request
    } else if (requestState.status === "failed") {
      toast.error(requestState.errors?.general?.[0] || "Failed to send reset link. Please try again.");
    } else if (requestState.status === "invalid_data") {
      toast.error("Please enter a valid email address.");
    }
  }, [requestState]);

  useEffect(() => {
    if (resetState.status === "success") {
      toast.success("Password reset successfully! You can now sign in with your new password.");
      router.push("/login"); // Redirect to login page
    } else if (resetState.status === "failed") {
      toast.error(resetState.errors?.general?.[0] || "Failed to reset password. Please try again.");
    } else if (resetState.status === "invalid_data") {
      toast.error("Please check your input and try again!");
    } else if (resetState.status === "invalid_token") {
      toast.error("Invalid or expired reset token. Please request a new one.");
      router.replace("/reset-password"); // Remove invalid token from URL
    }
  }, [resetState, router]);

  const handleRequestSubmit = (formData: FormData) => {
    requestAction(formData);
  };

  const handleResetSubmit = (formData: FormData) => {
    if (token) {
      formData.append("token", token);
      resetAction(formData);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background pt-16 pb-8">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            {token ? "Reset Password" : "Forgot Password?"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {token
              ? "Enter your new password below."
              : "Enter your email address to receive a password reset link."}
          </p>
        </div>

        <AuthForm action={token ? handleResetSubmit : handleRequestSubmit}>
          <div className="flex flex-col gap-2">
            {!token ? (
              <>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={requestState.status === "in_progress"}
                />
              </>
            ) : (
              <>
                <Label htmlFor="password" className="text-zinc-600 font-normal dark:text-zinc-400">
                  New Password
                </Label>
                <div className="relative flex items-center w-full">
                  <Input
                    id="password"
                    name="password"
                    className="bg-muted text-md md:text-sm border-none pr-14"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    required
                    disabled={resetState.status === "in_progress"}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 dark:text-zinc-400 focus:outline-none hover:text-zinc-700 dark:hover:text-zinc-300"
                    tabIndex={0}
                    disabled={resetState.status === "in_progress"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <Label htmlFor="confirmPassword" className="text-zinc-600 font-normal dark:text-zinc-400">
                  Confirm New Password
                </Label>
                <div className="relative flex items-center w-full">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    className="bg-muted text-md md:text-sm border-none pr-14"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    required
                    disabled={resetState.status === "in_progress"}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 dark:text-zinc-400 focus:outline-none hover:text-zinc-700 dark:hover:text-zinc-300"
                    tabIndex={0}
                    disabled={resetState.status === "in_progress"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </>
            )}
          </div>
          <SubmitButton>
            {token ? "Reset Password" : "Send Reset Link"}
          </SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Back to Sign In
            </Link>
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
