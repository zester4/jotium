//app/(auth)/actions.ts
"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import { createUser, getUser } from "@/db/queries";
import { sendWelcomeEmail } from "@/lib/email-utils"; // ✅ Import the direct function

import { signIn } from "./auth";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be less than 100 characters"),
  firstName: z.string().min(1, "First name is required").max(32, "First name must be less than 32 characters").trim(),
  lastName: z.string().min(1, "Last name is required").max(32, "Last name must be less than 32 characters").trim(),
});

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
  errors?: {
    email?: string[];
    password?: string[];
    general?: string[];
  };
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    // Validate form data
    const result = loginFormSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.success) {
      return {
        status: "invalid_data",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { email, password } = result.data;

    // Attempt to sign in
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    console.error("Login error:", error);
    
    // Handle NextAuth errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            status: "failed",
            errors: {
              general: ["Invalid email or password"],
            },
          };
        case "CallbackRouteError":
          return {
            status: "failed",
            errors: {
              general: ["Authentication failed. Please try again."],
            },
          };
        default:
          return {
            status: "failed",
            errors: {
              general: ["An error occurred during sign in"],
            },
          };
      }
    }

    return {
      status: "failed",
      errors: {
        general: ["An unexpected error occurred"],
      },
    };
  }
};

export interface RegisterActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
  errors?: {
    email?: string[];
    password?: string[];
    firstName?: string[];
    lastName?: string[];
    general?: string[];
  };
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    // Validate form data
    const result = registerFormSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
    });

    if (!result.success) {
      return {
        status: "invalid_data",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { email, password, firstName, lastName } = result.data;

    // Check if user already exists
    const existingUsers = await getUser(email);
    if (existingUsers.length > 0) {
      return {
        status: "user_exists",
        errors: {
          email: ["An account with this email already exists"],
        },
      };
    }

    // Create new user
    try {
      const createdUsers = await createUser(email, password, firstName, lastName);
      const newUser = createdUsers[0]; // Get the first user from the array
      
      // ✅ Send welcome email using direct function call (no HTTP)
      if (newUser) {
        const emailResult = await sendWelcomeEmail({
          to: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          plan: newUser.plan || 'Free', // New users start with Free plan
        });
        
        if (emailResult.success) {
          console.log('Welcome email sent successfully:', emailResult.emailId);
        } else {
          console.error('Failed to send welcome email:', emailResult.error);
          // Don't fail registration if email fails
        }
      }
      
    } catch (createError) {
      console.error("User creation error:", createError);
      return {
        status: "failed",
        errors: {
          general: ["Failed to create account. Please try again."],
        },
      };
    }

    // Auto sign in the new user
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch (signInError) {
      console.error("Auto sign-in error after registration:", signInError);
      // User was created but auto sign-in failed
      // Still return success as the account was created
      return {
        status: "success",
        errors: {
          general: ["Account created successfully. Please sign in."],
        },
      };
    }

    return { status: "success" };
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle NextAuth errors
    if (error instanceof AuthError) {
      return {
        status: "failed",
        errors: {
          general: ["Authentication failed during registration"],
        },
      };
    }

    return {
      status: "failed",
      errors: {
        general: ["An unexpected error occurred during registration"],
      },
    };
  }
};
