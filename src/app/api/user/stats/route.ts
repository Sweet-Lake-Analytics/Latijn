import { NextResponse } from 'next/server';
import { getUser, updateUser } from '@/lib/db';

export async function POST(request: Request) {
  const { userId, timeToAdd } = await request.json();

  const user = await getUser(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const newStats = { 
    ...user.stats, 
    totalTimeSpent: (user.stats.totalTimeSpent || 0) + timeToAdd 
  };

  await updateUser(userId, { stats: newStats });

  return NextResponse.json({ success: true });
}
