import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

import { auth } from '@/app/(auth)/auth';
import { isUserAdminById } from '@/db/queries';
import { user } from '@/db/schema';

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
const db = drizzle(client);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const isAdmin = await isUserAdminById(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const id = params.id;
    const body = await req.json();
    const { name, plan, isAdmin: newIsAdmin } = body;
    if (!name || !plan) {
      return NextResponse.json({ error: 'Name and plan are required.' }, { status: 400 });
    }
    const [firstName, ...lastNameArr] = name.split(' ');
    const lastName = lastNameArr.join(' ') || '';
    const updateResult = await db.update(user)
      .set({ firstName, lastName, plan, isAdmin: !!newIsAdmin })
      .where(eq(user.id, id))
      .returning();
    if (!updateResult.length) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ user: updateResult[0] });
  } catch (error) {
    console.error('Admin user edit API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 