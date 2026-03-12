import { NextResponse } from 'next/server';
import { getUser, updateUser } from '@/lib/db';

export async function POST(request: Request) {
  const { userId, wordId, score } = await request.json();

  const user = await getUser(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const newScores = { ...user.scores, [wordId]: score };
  const newStats = { 
    ...user.stats, 
    wordsPracticed: (user.stats.wordsPracticed || 0) + 1 
  };

  await updateUser(userId, { 
    scores: newScores,
    stats: newStats
  });

  return NextResponse.json({ success: true });
}
