
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/app/(auth)/auth';
import { getUserNotifications } from '@/db/queries';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const notifications = await getUserNotifications(session.user.id);
    return NextResponse.json({ notifications });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
} 