import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { setStripeSubscription, createNotification } from '@/db/queries';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' });

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
    async function updateUserFromMetadata(metadata: any, updates: Partial<{stripeCustomerId: string, stripeSubscriptionId: string, subscriptionStatus: string}>, notification?: {title: string, description?: string, type?: string}) {
      const userId = metadata?.userId;
      if (!userId) return;
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
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const metadata = session.metadata;
        await updateUserFromMetadata(metadata, {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: 'active',
        }, {
          title: 'Payment Successful',
          description: 'Your payment was successful and your subscription is now active.',
          type: 'payment',
        });
        break;
      }
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const metadata = subscription.metadata;
        await updateUserFromMetadata(metadata, {
          subscriptionStatus: status,
        }, {
          title: 'Subscription Created',
          description: 'Your subscription has been created.',
          type: 'subscription',
        });
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const metadata = subscription.metadata;
        await updateUserFromMetadata(metadata, {
          subscriptionStatus: status,
        }, {
          title: 'Subscription Updated',
          description: `Your subscription status is now: ${status}.`,
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
        }, {
          title: 'Subscription Canceled',
          description: 'Your subscription has been canceled.',
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
          await updateUserFromMetadata(metadata, {
            subscriptionStatus: 'active',
          }, {
            title: 'Payment Received',
            description: 'Your recurring payment was received and your subscription is active.',
            type: 'payment',
          });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string | undefined;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const metadata = subscription.metadata;
          await updateUserFromMetadata(metadata, {
            subscriptionStatus: 'past_due',
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
        // Ignore other events
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
} 