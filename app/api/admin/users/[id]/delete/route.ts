import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

import { auth } from '@/app/(auth)/auth';
import { isUserAdminById } from '@/db/queries';
import { user } from '@/db/schema';

const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
const db = drizzle(client);

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
    const deleteResult = await db.delete(user).where(eq(user.id, id)).returning();
    if (!deleteResult.length) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user delete API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 