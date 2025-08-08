//app/(auth)/actions.ts
"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import { createUser, getUser, createPasswordResetToken } from "@/db/queries";
import { sendWelcomeEmail, sendPasswordResetEmail } from "@/lib/email-utils"; // ✅ Import the direct function

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

export interface RequestPasswordResetActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
  errors?: {
    email?: string[];
    general?: string[];
  };
}

export interface ResetPasswordActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data" | "invalid_token";
  errors?: {
    password?: string[];
    confirmPassword?: string[];
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

export const requestPasswordReset = async (
  _: RequestPasswordResetActionState,
  formData: FormData,
): Promise<RequestPasswordResetActionState> => {
  try {
    const result = loginFormSchema.pick({ email: true }).safeParse({
      email: formData.get("email"),
    });

    if (!result.success) {
      return {
        status: "invalid_data",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { email } = result.data;

    const token = await createPasswordResetToken(email);

    if (!token) {
      return {
        status: "failed",
        errors: {
          general: ["Failed to generate reset token or user not found."],
        },
      };
    }

    // Send email with reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    const emailResult = await sendPasswordResetEmail({
      to: email,
      resetToken: token,
      resetUrl: resetLink,
    });

    if (emailResult.success) {
      console.log('Password reset email sent successfully:', emailResult.emailId);
    } else {
      console.error('Failed to send password reset email:', emailResult.error);
      return {
        status: "failed",
        errors: {
          general: ["Failed to send reset email. Please try again."],
        },
      };
    }

    return { status: "success" };
  } catch (error) {
    console.error("Request password reset error:", error);
    return {
      status: "failed",
      errors: {
        general: ["An unexpected error occurred while requesting password reset."],
      },
    };
  }
};

export const resetPassword = async (
  _: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> => {
  try {
    const result = z.object({
      token: z.string().min(1, "Token is required"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
    }).superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ['confirmPassword']
        });
      }
    }).safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!result.success) {
      return {
        status: "invalid_data",
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { token, password } = result.data;

    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 400 && data.error === 'Invalid or expired reset token') {
        return {
          status: "invalid_token",
          errors: {
            general: ["Invalid or expired reset token."],
          },
        };
      }
      return {
        status: "failed",
        errors: {
          general: [data.error || "Failed to reset password."],
        },
      };
    }

    return { status: "success" };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      status: "failed",
      errors: {
        general: ["An unexpected error occurred while resetting password."],
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
