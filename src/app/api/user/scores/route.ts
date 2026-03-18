import { NextResponse } from 'next/server';
import { getUser, updateUser } from '@/lib/db';

export async function POST(request: Request) {
  const { userId, wordId, score } = await request.json();

  if (!userId || !wordId) {
    return NextResponse.json({ error: 'Missing userId or wordId' }, { status: 400 });
  }

  const user = await getUser(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const newScores = { ...user.scores, [wordId]: score };
  const newStats = { 
    ...user.stats, 
    wordsPracticed: (user.stats.wordsPracticed || 0) + 1 
  };

  // Cleanup old format scores if they exist to satisfy "DynamoDB table is not using the 'id'"
  // Old IDs had '-' (latin-dutch-chapter), new IDs have '_' (Method_001)
  const cleanedScores: { [key: string]: number } = {};
  Object.entries(newScores as Record<string, number>).forEach(([key, val]) => {
    if (!key.includes('-')) {
      cleanedScores[key] = val;
    }
  });

  await updateUser(userId, { 
    scores: cleanedScores,
    stats: newStats
  });

  return NextResponse.json({ success: true });
}
