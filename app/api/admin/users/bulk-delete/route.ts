import { inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

import { auth } from '@/app/(auth)/auth';
import { isUserAdminById } from '@/db/queries';
import { user } from '@/db/schema';

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
const db = drizzle(client);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const isAdmin = await isUserAdminById(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No user IDs provided.' }, { status: 400 });
    }
    // Prevent deleting self
    const userId = session.user?.id;
    const filteredIds = userId ? ids.filter((id: string) => id !== userId) : ids;
    if (!userId || filteredIds.length === 0) {
      return NextResponse.json({ error: 'Cannot delete yourself.' }, { status: 400 });
    }
    const deleteResult = await db.delete(user).where(inArray(user.id, filteredIds)).returning();
    return NextResponse.json({ success: true, deleted: deleteResult.length });
  } catch (error) {
    console.error('Admin bulk delete API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 