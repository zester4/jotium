import { sql, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import Stripe from 'stripe';

import { auth } from '@/app/(auth)/auth';
import { user } from '@/db/schema';

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
const db = drizzle(client);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' });

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Total users
    const totalUsersResult = await db.select({ count: sql`count(*)::int` }).from(user);
    const totalUsers = Number(totalUsersResult[0]?.count) || 0;
    // Active subscriptions
    const activeSubsResult = await db.select({ count: sql`count(*)::int` }).from(user).where(eq(user.subscriptionStatus, 'active'));
    const activeSubs = Number(activeSubsResult[0]?.count) || 0;
    // Free users
    const freeUsersResult = await db.select({ count: sql`count(*)::int` }).from(user).where(eq(user.plan, 'Free'));
    const freeUsers = Number(freeUsersResult[0]?.count) || 0;

    // New users per month (last 12 months)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const usersPerMonth = await db.execute(sql`
      SELECT DATE_TRUNC('month', "createdAt") AS month, COUNT(*)::int AS count
      FROM "User"
      WHERE "createdAt" >= ${new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString()}
      GROUP BY month
      ORDER BY month ASC
    `);
    // Active subscriptions per month (last 12 months)
    const subsPerMonth = await db.execute(sql`
      SELECT DATE_TRUNC('month', "createdAt") AS month, COUNT(*)::int AS count
      FROM "User"
      WHERE "createdAt" >= ${new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString()} AND "subscriptionStatus" = 'active'
      GROUP BY month
      ORDER BY month ASC
    `);
    // Free users per month (last 12 months)
    const freeUsersPerMonth = await db.execute(sql`
      SELECT DATE_TRUNC('month', "createdAt") AS month, COUNT(*)::int AS count
      FROM "User"
      WHERE "createdAt" >= ${new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString()} AND "plan" = 'Free'
      GROUP BY month
      ORDER BY month ASC
    `);

    // Stripe: Total revenue (all-time) and revenue per month (last 12 months)
    let totalRevenue = 0;
    let revenuePerMonth: { month: string, amount: number }[] = [];
    try {
      let hasMore = true;
      let startingAfter: string | undefined = undefined;
      const charges: Stripe.Charge[] = [];
      // Paginate through all charges (Stripe API returns 100 at a time)
      while (hasMore) {
        const resp: Stripe.ApiList<Stripe.Charge> = await stripe.charges.list({ limit: 100, starting_after: startingAfter });
        charges.push(...resp.data.filter((c: Stripe.Charge) => c.paid && c.status === 'succeeded'));
        hasMore = resp.has_more;
        if (resp.data.length > 0) startingAfter = resp.data[resp.data.length - 1].id;
      }
      totalRevenue = charges.reduce((sum, c) => sum + (c.amount || 0), 0) / 100; // convert cents to dollars
      // Revenue per month
      const revenueMap: Record<string, number> = {};
      charges.forEach(c => {
        if (!c.created) return;
        const date = new Date(c.created * 1000);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        revenueMap[month] = (revenueMap[month] || 0) + (c.amount || 0);
      });
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        revenuePerMonth.push({ month: key, amount: (revenueMap[key] || 0) / 100 });
      }
    } catch (err) {
      console.error('Stripe revenue fetch error:', err);
    }

    return NextResponse.json({
      totalRevenue,
      totalUsers,
      activeSubs,
      freeUsers,
      revenuePerMonth,
      usersPerMonth: usersPerMonth.map((row: any) => ({ month: row.month, count: Number(row.count) })),
      subsPerMonth: subsPerMonth.map((row: any) => ({ month: row.month, count: Number(row.count) })),
      freeUsersPerMonth: freeUsersPerMonth.map((row: any) => ({ month: row.month, count: Number(row.count) })),
    });
  } catch (error) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 