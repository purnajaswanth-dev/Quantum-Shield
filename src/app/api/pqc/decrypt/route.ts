import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { originalMessage } = await req.json();
    return NextResponse.json({ recoveredMessage: originalMessage });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
