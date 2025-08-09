//app/api/billing/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { auth } from '@/app/(auth)/auth';
import { getUserById } from '@/db/queries';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' });

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get fresh user data from database
    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Default response for free users
    const defaultResponse = {
      plan: user.plan || 'Free',
      status: 'active',
      paymentMethod: null,
      current_period_end: null,
      cancel_at_period_end: false,
    };

    // If user has no Stripe subscription, return free plan info
    if (!user.stripeSubscriptionId) {
      return NextResponse.json(defaultResponse);
    }

    try {
      // Fetch latest subscription data from Stripe
      const subscription: any = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
        expand: ['default_payment_method', 'items.data.price', 'latest_invoice.payment_intent']
      });

      // Extract plan from subscription
      const planFromStripe = subscription.items.data[0]?.price?.nickname;

      // Sync any discrepancies between database and Stripe
      if (planFromStripe && planFromStripe !== user.plan) {
        console.log(`Plan mismatch detected for user ${user.id}: DB has ${user.plan}, Stripe has ${planFromStripe}`);
        // You might want to update the database here
        // await setStripeSubscription({ userId: user.id, plan: planFromStripe });
      }

      // Fallbacks for payment method and next period end
      let defaultPaymentMethod: any = subscription.default_payment_method;
      if (!defaultPaymentMethod && subscription.latest_invoice?.payment_intent?.payment_method) {
        try {
          // Retrieve full payment method if only id available
          const pmId = subscription.latest_invoice.payment_intent.payment_method as string;
          defaultPaymentMethod = await stripe.paymentMethods.retrieve(pmId);
        } catch {}
      }

      let periodEnd: number | null = subscription.current_period_end || null;
      // If period end is missing, attempt to infer from a recent invoice
      if (!periodEnd && user.stripeCustomerId) {
        try {
          const invoices = await stripe.invoices.list({ customer: user.stripeCustomerId, limit: 1 });
          const inv = invoices.data[0];
          if (inv) {
            const line = inv.lines?.data?.[0];
            periodEnd = (line?.period?.end as number) || (inv.next_payment_attempt as number) || null;
            if (!defaultPaymentMethod && inv.default_payment_method) {
              defaultPaymentMethod = inv.default_payment_method;
            }
          }
        } catch {}
      }

      const response = {
        plan: planFromStripe || user.plan || 'Free',
        status: subscription.status,
        paymentMethod: defaultPaymentMethod,
        current_period_end: periodEnd, // unix seconds
        cancel_at_period_end: subscription.cancel_at_period_end || false,
      };

      return NextResponse.json(response);
    } catch (stripeError) {
      console.error('Error fetching Stripe subscription:', stripeError);
      // If Stripe call fails, fall back to database data
      return NextResponse.json({
        plan: user.plan || 'Free',
        status: user.subscriptionStatus || 'active',
        paymentMethod: null,
        current_period_end: null,
        cancel_at_period_end: false,
        error: 'Could not fetch latest subscription data from Stripe',
      });
    }
  } catch (error) {
    console.error('Billing overview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}