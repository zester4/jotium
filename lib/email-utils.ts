// lib/email-utils.ts
import { Resend } from 'resend';

import { PasswordResetEmail } from '@/components/emails/password-reset-email';
import { SubscriptionReceiptEmail } from '@/components/emails/subscription-receipt-email';
import { WelcomeEmail } from '@/components/emails/welcome-email';

// Remove the import since we'll define the type here to avoid circular dependency
export type EmailType = 'welcome' | 'subscription-receipt' | 'password-reset';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const EMAIL_CONFIG = {
  from: `${process.env.COMPANY_NAME || 'Jotium'} <${process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com'}>`,
  replyTo: process.env.RESEND_REPLY_TO_EMAIL || 'support@yourdomain.com',
};

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
 * Send an email directly using Resend (no HTTP call)
 */
export async function sendEmail({ to, type, data = {} }: SendEmailOptions): Promise<EmailResponse> {
  try {
    console.log(`Attempting to send ${type} email to ${to}`);
    
    // Check if API key is available
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Validate email address format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error('Invalid email address format');
    }

    let emailComponent;
    let subject: string;

    // Get user agent and IP for security emails (if available in data)
    const userAgent = data.userAgent || 'Unknown browser';
    const ipAddress = data.ipAddress || 'Unknown IP';

    // Prepare email based on type
    switch (type) {
      case 'welcome':
        subject = `Welcome to Jotium!`;
        emailComponent = WelcomeEmail({
          to,
          firstName: data.firstName,
          lastName: data.lastName,
          plan: data.plan,
        });
        break;

      case 'subscription-receipt':
        const amount = data.amount || '0.00';
        const currency = data.currency || 'USD';
        const currencySymbol = currency === 'USD' ? '$' : currency;
        
        subject = `Payment Receipt - ${currencySymbol}${amount}`;
        emailComponent = SubscriptionReceiptEmail({
          to,
          firstName: data.firstName,
          lastName: data.lastName,
          plan: data.plan,
          amount: data.amount,
          currency: data.currency,
          subscriptionId: data.subscriptionId,
          invoiceId: data.invoiceId,
          billingDate: data.billingDate,
          nextBillingDate: data.nextBillingDate,
          paymentMethod: data.paymentMethod,
        });
        break;

      case 'password-reset':
        subject = `Reset your password - Jotium`;
        emailComponent = PasswordResetEmail({
          to,
          firstName: data.firstName,
          lastName: data.lastName,
          resetToken: data.resetToken,
          resetUrl: data.resetUrl,
          userAgent,
          ipAddress,
        });
        break;

      default:
        throw new Error('Invalid email type');
    }

    // Send email using Resend
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      replyTo: EMAIL_CONFIG.replyTo,
      subject,
      react: emailComponent,
      tags: [
        { name: 'type', value: type },
        { name: 'environment', value: process.env.NODE_ENV || 'development' },
      ],
    });

    console.log(`Email sent successfully:`, {
      id: result.data?.id,
      type,
      to,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      emailId: result.data?.id,
      message: `${type} email sent successfully`,
    };

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
  userAgent,
  ipAddress,
}: {
  to: string;
  firstName?: string;
  lastName?: string;
  resetToken: string;
  resetUrl?: string;
  userAgent?: string;
  ipAddress?: string;
}): Promise<EmailResponse> {
  const finalResetUrl = resetUrl || generatePasswordResetUrl(resetToken);
  
  return sendEmail({
    to,
    type: 'password-reset',
    data: {
      firstName,
      lastName,
      resetToken,
      resetUrl: finalResetUrl,
      userAgent,
      ipAddress,
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
