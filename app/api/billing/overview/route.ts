import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { auth } from '@/app/(auth)/auth';
import { getStripeSubscription } from '@/db/queries';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' });

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { stripeCustomerId, stripeSubscriptionId, subscriptionStatus } = await getStripeSubscription(session.user.id);
  let subscription: Stripe.Subscription | undefined, paymentMethod;
  if (stripeSubscriptionId) {
    subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ["default_payment_method", "items.data.price"],
    });
    if (subscription.default_payment_method) {
      paymentMethod = subscription.default_payment_method;
    }
  }
  return NextResponse.json({
    plan: (subscription as any)?.items?.data[0]?.price?.nickname,
    status: (subscription as any)?.status || subscriptionStatus,
    current_period_end: (subscription as any)?.current_period_end,
    cancel_at_period_end: (subscription as any)?.cancel_at_period_end,
    paymentMethod,
  });
}
