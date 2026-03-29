import { NextResponse } from 'next/server';

// In-memory store (will reset on server restart, but fine for hackathon)
let messages: any[] = [];

export async function POST(req: Request) {
  try {
    const { from, message, ciphertext } = await req.json();
    const newMessage = {
      id: messages.length + 1,
      from,
      plaintext: message,
      ciphertext,
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    messages.push(newMessage);
    return NextResponse.json(newMessage);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// Optional: GET to fetch messages if needed by the chat page
export async function GET() {
  return NextResponse.json(messages);
}
