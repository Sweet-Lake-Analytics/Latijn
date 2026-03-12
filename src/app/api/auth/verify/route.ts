import { NextResponse } from 'next/server';
import { confirmUser } from '@/lib/cognito';

export async function POST(request: Request) {
  const { email, code } = await request.json();

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
  }

  try {
    await confirmUser(email, code);
    return NextResponse.json({ success: true, message: 'Account verified successfully' });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 400 });
  }
}
