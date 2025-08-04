//app/api/pricing/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { setStripeSubscription, createNotification, getUserById } from '@/db/queries';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' });

// Email sending function
async function sendEmail(emailData: any) {
  try {
    const response = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error(`Email API responded with ${response.status}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw - we don't want email failures to break webhooks
    return null;
  }
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });

  let event: Stripe.Event;
  let rawBody: Buffer;
  try {
    rawBody = Buffer.from(await req.arrayBuffer());
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${(err as Error).message}` }, { status: 400 });
  }

  try {
    async function updateUserFromMetadata(metadata: any, updates: Partial<{stripeCustomerId: string, stripeSubscriptionId: string, subscriptionStatus: string, plan: string}>, notification?: {title: string, description?: string, type?: string}) {
      const userId = metadata?.userId;
      if (!userId) return;
      
      console.log(`Updating user ${userId} with:`, updates); // Add logging
      
      await setStripeSubscription({
        userId,
        ...updates,
      });
      if (notification) {
        await createNotification({
          userId,
          ...notification,
        });
      }

      // Get user details for email
      const user = await getUserById(userId);
      return user;
    }

    // Helper function to extract plan from subscription
    async function getPlanFromSubscription(subscriptionId: string): Promise<string | undefined> {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, { 
          expand: ["items.data.price"] 
        });
        return (subscription.items.data[0].price.nickname as string) || undefined;
      } catch (error) {
        console.error('Error retrieving subscription plan:', error);
        return undefined;
      }
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const metadata = session.metadata;
        
        let plan: string | undefined = metadata?.plan; // First try metadata
        
        if (subscriptionId && !plan) {
          // Fallback to subscription lookup if not in metadata
          plan = await getPlanFromSubscription(subscriptionId);
        }
        
        const user = await updateUserFromMetadata(metadata, {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: 'active',
          plan,
        }, {
          title: 'Payment Successful',
          description: `Your payment was successful and your ${plan || ''} subscription is now active.`,
          type: 'payment',
        });

        // Send welcome email for new subscription
        if (user?.email) {
          await sendEmail({
            to: user.email,
            type: 'welcome',
            firstName: user.firstName,
            lastName: user.lastName,
            plan: plan || 'Pro',
          });
        }
        break;
      }
      
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const metadata = subscription.metadata;
        const plan = (subscription.items.data[0].price.nickname as string) || metadata?.plan || undefined;
        
        await updateUserFromMetadata(metadata, {
          subscriptionStatus: status,
          plan,
        }, {
          title: 'Subscription Created',
          description: `Your ${plan || ''} subscription has been created.`,
          type: 'subscription',
        });
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const metadata = subscription.metadata;
        console.log('Subscription updated metadata:', metadata); // Verify metadata
        const plan = (subscription.items.data[0].price.nickname as string) || metadata?.plan || undefined;
        
        // This is crucial for plan upgrades/downgrades
        await updateUserFromMetadata(metadata, {
          subscriptionStatus: status,
          plan, // Make sure plan is always updated
        }, {
          title: 'Subscription Updated',
          description: `Your subscription has been updated to ${plan || 'new plan'} with status: ${status}.`,
          type: 'subscription',
        });
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const metadata = subscription.metadata;
        
        await updateUserFromMetadata(metadata, {
          subscriptionStatus: status,
          plan: 'Free', // Reset to free plan when subscription is deleted
        }, {
          title: 'Subscription Canceled',
          description: 'Your subscription has been canceled and you have been moved to the Free plan.',
          type: 'subscription',
        });
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string | undefined;
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const metadata = subscription.metadata;
          const plan = (subscription.items.data[0].price.nickname as string) || undefined;
          
          const user = await updateUserFromMetadata(metadata, {
            subscriptionStatus: 'active',
            plan, // Update plan on successful payment too
          }, {
            title: 'Payment Received',
            description: `Your recurring payment was received and your ${plan || ''} subscription is active.`,
            type: 'payment',
          });

          // Send receipt email
          if (user?.email) {
            const now = new Date();
            const nextMonth = new Date(now);
            nextMonth.setMonth(now.getMonth() + 1);

            await sendEmail({
              to: user.email,
              type: 'subscription-receipt',
              firstName: user.firstName,
              lastName: user.lastName,
              plan: plan || 'Pro',
              amount: (invoice.amount_paid / 100).toString(),
              currency: invoice.currency.toUpperCase(),
              subscriptionId: subscriptionId,
              invoiceId: invoice.id,
              billingDate: now.toLocaleDateString(),
              nextBillingDate: nextMonth.toLocaleDateString(),
              paymentMethod: '•••• ••••',
            });
          }
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string | undefined;
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const metadata = subscription.metadata;
          const plan = (subscription.items.data[0].price.nickname as string) || undefined;
          
          await updateUserFromMetadata(metadata, {
            subscriptionStatus: 'past_due',
            plan, // Keep current plan even if payment failed
          }, {
            title: 'Payment Failed',
            description: 'A payment for your subscription failed. Please update your payment method.',
            type: 'payment',
          });
        }
        break;
      }
      
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata;
        const userId = metadata?.userId;
        if (userId) {
          await createNotification({
            userId,
            title: 'Trial Ending Soon',
            description: 'Your free trial will end soon. Please update your payment method to continue your subscription.',
            type: 'subscription',
          });
        }
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Optionally notify for one-time payments
        // No userId in metadata by default, so skip unless you add it
        break;
      }
      
      case 'customer.updated': {
        // Optionally sync customer profile changes
        // No notification by default
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }
    
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}