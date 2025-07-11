import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/app/(auth)/auth';
import { markNotificationRead } from '@/db/queries';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { notificationId } = await req.json();
    if (!notificationId) return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
    await markNotificationRead({ notificationId });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
  }
} 