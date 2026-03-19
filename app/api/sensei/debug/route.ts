import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: 'No OPENAI_API_KEY env var' });
  
  try {
    const client = new OpenAI({ apiKey: key });
    const r = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'say hi in 3 words' }],
      max_tokens: 10,
    });
    return NextResponse.json({ ok: true, response: r.choices[0]?.message?.content });
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    return NextResponse.json({ error: msg });
  }
}
