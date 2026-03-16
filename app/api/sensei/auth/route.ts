import { NextRequest, NextResponse } from 'next/server';

const CORRECT_PASSWORD = 'sensei2026';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (password === CORRECT_PASSWORD) {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
