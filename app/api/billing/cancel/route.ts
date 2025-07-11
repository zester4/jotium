import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { auth } from '@/app/(auth)/auth';
import { getStripeSubscription, setStripeSubscription } from '@/db/queries';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { stripeSubscriptionId } = await getStripeSubscription(session.user.id);
  if (!stripeSubscriptionId) return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
  const subscription = await stripe.subscriptions.update(stripeSubscriptionId, { cancel_at_period_end: true });
  await setStripeSubscription({ userId: session.user.id, subscriptionStatus: subscription.status });
  return NextResponse.json({ status: subscription.status, cancel_at_period_end: subscription.cancel_at_period_end });
} 