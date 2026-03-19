import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Judge } from '@mondaycom/sensei-engine';
import type { JudgeConfig } from '@mondaycom/sensei-engine';

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: 'No OPENAI_API_KEY env var' });
  
  // Test 1: Direct OpenAI
  try {
    const client = new OpenAI({ apiKey: key });
    const r = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'say hi in 3 words' }],
      max_tokens: 10,
    });
    const directOk = r.choices[0]?.message?.content;
    
    // Test 2: Via Judge
    const judgeConfig: JudgeConfig = {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.3,
    };
    const judge = new Judge(judgeConfig);
    try {
      const verdict = await judge.evaluate({
        kpi: { id: 'test', name: 'Test', weight: 1, method: 'llm-judge' as const, config: { rubric: '5: good\n1: bad', max_score: 5 } },
        scenarioInput: { prompt: 'Say hello' },
        agentOutput: 'Hello there!',
      });
      return NextResponse.json({ directOk, judgeOk: true, verdict });
    } catch (judgeErr) {
      const msg = judgeErr instanceof Error ? `${judgeErr.name}: ${judgeErr.message}` : String(judgeErr);
      return NextResponse.json({ directOk, judgeError: msg });
    } finally {
      judge.dispose();
    }
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    return NextResponse.json({ error: msg });
  }
}
