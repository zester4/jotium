// lib/email-utils.ts
// Remove the import since we'll define the type here to avoid circular dependency
export type EmailType = 'welcome' | 'subscription-receipt' | 'password-reset';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

interface SendEmailOptions {
  to: string;
  type: EmailType;
  data?: Record<string, any>;
}

interface EmailResponse {
  success: boolean;
  emailId?: string;
  message?: string;
  error?: string;
}

/**
 * Send an email using the internal API
 */
export async function sendEmail({ to, type, data = {} }: SendEmailOptions): Promise<EmailResponse> {
  try {
    console.log(`Attempting to send ${type} email to ${to}`);
    console.log(`Using URL: ${BASE_URL}/api/email/send`);
    
    const response = await fetch(`${BASE_URL}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        type,
        ...data,
      }),
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

    // Get response text first to see what we're actually getting
    const responseText = await response.text();
    console.log(`Response text (first 200 chars):`, responseText.substring(0, 200));

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      return {
        success: false,
        error: `Invalid response format. Expected JSON, got: ${responseText.substring(0, 100)}...`,
      };
    }

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return result;
  } catch (error: any) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail({
  to,
  firstName,
  lastName,
  plan = 'Free',
}: {
  to: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
}): Promise<EmailResponse> {
  return sendEmail({
    to,
    type: 'welcome',
    data: {
      firstName,
      lastName,
      plan,
    },
  });
}

/**
 * Send subscription receipt email
 */
export async function sendSubscriptionReceiptEmail({
  to,
  firstName,
  lastName,
  plan,
  amount,
  currency = 'USD',
  subscriptionId,
  invoiceId,
  billingDate,
  nextBillingDate,
  paymentMethod,
}: {
  to: string;
  firstName?: string;
  lastName?: string;
  plan?: string;
  amount?: string;
  currency?: string;
  subscriptionId?: string;
  invoiceId?: string;
  billingDate?: string;
  nextBillingDate?: string;
  paymentMethod?: string;
}): Promise<EmailResponse> {
  return sendEmail({
    to,
    type: 'subscription-receipt',
    data: {
      firstName,
      lastName,
      plan,
      amount,
      currency,
      subscriptionId,
      invoiceId,
      billingDate,
      nextBillingDate,
      paymentMethod,
    },
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
  to,
  firstName,
  lastName,
  resetToken,
  resetUrl,
}: {
  to: string;
  firstName?: string;
  lastName?: string;
  resetToken: string;
  resetUrl?: string;
}): Promise<EmailResponse> {
  return sendEmail({
    to,
    type: 'password-reset',
    data: {
      firstName,
      lastName,
      resetToken,
      resetUrl,
    },
  });
}

/**
 * Generate password reset URL
 */
export function generatePasswordResetUrl(token: string): string {
  return `${BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;
}

/**
 * Generate a secure reset token (you might want to use a more sophisticated method)
 */
export function generateResetToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: string | number, currency = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (currency === 'USD') {
    return `$${num.toFixed(2)}`;
  }
  
  return `${currency} ${num.toFixed(2)}`;
}

/**
 * Format date for email display
 */
export function formatEmailDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}