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
      // This should ideally not happen if Cognito auth was successful, 
      // but might if user was deleted from DB but not from Cognito
      return NextResponse.json({ error: 'User data not found in database' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      userId: user.userId,
      username: user.username,
      scores: user.scores || {},
      stats: user.stats || { wordsPracticed: 0, totalTimeSpent: 0 }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 401 });
  }
}
