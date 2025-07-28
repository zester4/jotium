import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/app/(auth)/auth';
import { markAllNotificationsAsRead } from '@/db/queries';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await markAllNotificationsAsRead(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark all notifications as read' }, { status: 500 });
  }
}
