import { NextResponse } from 'next/server';
import { Judge } from '@mondaycom/sensei-engine';
import type { JudgeConfig } from '@mondaycom/sensei-engine';

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: 'No OPENAI_API_KEY env var' });
  
  const judgeConfig: JudgeConfig = {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.3,
    api_key: key,
  };
  const judge = new Judge(judgeConfig);
  try {
    const verdict = await judge.evaluate({
      kpi: { id: 'test', name: 'Test', weight: 1, method: 'llm-judge' as const, config: { rubric: '5: good\n1: bad', max_score: 5 } },
      scenarioInput: { prompt: 'Say hello' },
      agentOutput: 'Hello there, friend!',
    });
    return NextResponse.json({ ok: true, verdict });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg });
  } finally {
    judge.dispose();
  }
}
