import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/cognito';
import { getUser } from '@/lib/db';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    // 1. Authenticate with Cognito (now using email)
    const { sub } = await authenticateUser(email, password);

    // 2. Fetch user data from DynamoDB using Cognito sub as userId
    const user = await getUser(sub);
    
    if (!user) {
      return NextResponse.json({ error: 'User data not found in database' }, { status: 404 });
    }

    // Cleanup and migration: if there are old format scores (that contain '-'),
    // we should ideally migrate them to the new IDs.
    // However, without the words list here, we can at least ensure we don't
    // keep old-format keys if we want the DB to be "clean".
    const cleanedScores: { [key: string]: number } = {};
    if (user.scores) {
      Object.entries(user.scores as Record<string, number>).forEach(([key, val]) => {
        if (!key.includes('-')) {
          cleanedScores[key] = val;
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      userId: user.userId,
      username: user.username,
      scores: cleanedScores,
      stats: user.stats || { wordsPracticed: 0, totalTimeSpent: 0 }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 401 });
  }
}
