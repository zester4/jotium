import { and, eq, ilike, or, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

import { auth } from '@/app/(auth)/auth';
import { isUserAdminById } from '@/db/queries';
import { user } from '@/db/schema';

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
const db = drizzle(client);

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Admin check
    const isAdmin = await isUserAdminById(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get('pageSize') || '20', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const plan = searchParams.get('plan')?.trim() || '';
    const subscriptionStatus = searchParams.get('subscriptionStatus')?.trim() || '';
    const createdFrom = searchParams.get('createdFrom');
    const createdTo = searchParams.get('createdTo');

    // Build where clause
    let whereClause = undefined;
    const filters = [];
    if (search) {
      filters.push(
        or(
          ilike(user.email, `%${search}%`),
          ilike(user.firstName, `%${search}%`),
          ilike(user.lastName, `%${search}%`)
        )
      );
    }
    if (plan) {
      filters.push(eq(user.plan, plan));
    }
    if (subscriptionStatus) {
      filters.push(eq(user.subscriptionStatus, subscriptionStatus));
    }
    if (createdFrom) {
      filters.push(sql`${user.createdAt} >= ${createdFrom}`);
    }
    if (createdTo) {
      filters.push(sql`${user.createdAt} <= ${createdTo}`);
    }
    if (filters.length > 0) {
      whereClause = and(...filters);
    }

    // Get total count
    const totalResult = await db.select({ count: sql`count(*)::int` }).from(user).where(whereClause);
    const total = Number(totalResult[0]?.count) || 0;

    // Get paginated users
    const users = await db
      .select({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(whereClause)
      .orderBy(user.createdAt)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const mapped = users.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      plan: u.plan,
      subscriptionStatus: u.subscriptionStatus,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({
      users: mapped,
      total,
      page,
      pageSize,
      totalPages: total > 0 ? Math.ceil(total / pageSize) : 1,
    });
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 