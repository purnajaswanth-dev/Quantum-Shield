import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const toBase64 = (str: string) => Buffer.from(str).toString('base64');
    const encoded = toBase64(message || '');
    const noise = crypto.randomBytes(8).toString('hex');
    const latticeTransform = crypto.randomBytes(16).toString('hex');
    const ciphertext = `KYBER768::${latticeTransform}${encoded.split('').reverse().join('')}${noise}==`;
    
    const noisedVector = Array.from({ length: 6 }, () =>
      `[${Array.from({ length: 4 }, () => Math.floor(Math.random() * 3329)).join(', ')}]`
    ).join('\n');

    return NextResponse.json({ ciphertext, noisedVector });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
