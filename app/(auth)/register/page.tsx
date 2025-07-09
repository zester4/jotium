"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthForm } from "@/components/custom/auth-form";
import { SubmitButton } from "@/components/custom/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { register, RegisterActionState } from "../actions";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: "idle",
    },
  );

  useEffect(() => {
    if (state.status === "user_exists") {
      toast.error("Account already exists");
    } else if (state.status === "failed") {
      toast.error("Failed to create account");
    } else if (state.status === "invalid_data") {
      toast.error("Failed validating your submission!");
    } else if (state.status === "success") {
      toast.success("Account created successfully");
      router.push("/chat"); // Redirect to chat page
    }
  }, [state, router]);

  const handleSubmit = (formData: FormData) => {
    setFirstName(formData.get("firstName") as string);
    setLastName(formData.get("lastName") as string);
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create an account with your Jotium
          </p>
        </div>
        <AuthForm action={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="firstName"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              First Name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              className="bg-muted text-md md:text-sm border-none"
              type="text"
              placeholder="Jane"
              required
              defaultValue={firstName}
            />
            <Label
              htmlFor="lastName"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              Last Name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              className="bg-muted text-md md:text-sm border-none"
              type="text"
              placeholder="Smith"
              required
              defaultValue={lastName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="email"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
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
            />

            <Label
              htmlFor="password"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              Password
            </Label>

            <div className="relative flex items-center">
              <Input
                id="password"
                name="password"
                className="bg-muted text-md md:text-sm border-none pr-10"
                type={showPassword ? "text" : "password"}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500 dark:text-zinc-400 focus:outline-none"
                tabIndex={0}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <SubmitButton>Sign Up</SubmitButton>
          <p className="text-center text-xs text-gray-500 mt-2 dark:text-zinc-400">
            By clicking continue, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-blue-600">Terms of Service</Link>{' '}and{' '}
            <Link href="/privacy" className="underline hover:text-blue-600">Privacy Policy</Link>.
          </p>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"Already have an account? "}
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign in
            </Link>
            {" instead."}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
