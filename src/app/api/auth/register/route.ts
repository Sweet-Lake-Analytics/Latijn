import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/cognito';
import { saveUser } from '@/lib/db';
import { UserData } from '@/lib/types';

export async function POST(request: Request) {
  const { email, password, captcha, captchaAnswer } = await request.json();

  if (parseInt(captcha) !== captchaAnswer) {
    return NextResponse.json({ error: 'Invalid CAPTCHA' }, { status: 400 });
  }

  try {
    // 1. Register with Cognito
    // Cognito is configured for email-based login, username will be the email.
    const { sub: userId } = await registerUser(email, email, password);

    // 2. Initialize entry in DynamoDB
    const username = email.split('@')[0]; // Derivation of a friendly username from email
    const newUser: UserData = {
      userId,
      username,
      passwordHash: 'COGNITO_MANAGED',
      scores: {},
      stats: {
        wordsPracticed: 0,
        totalTimeSpent: 0
      }
    };

    await saveUser(newUser);

    return NextResponse.json({ success: true, username });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 400 });
  }
}
