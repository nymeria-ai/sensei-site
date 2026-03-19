import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildJudgePrompt, parseVerdict, Scorer } from '@mondaycom/sensei-engine';
import type { KPIDefinition, ScenarioInput } from '@mondaycom/sensei-engine';

export async function POST(request: NextRequest) {
  try {
    const { scenarioPrompt, kpis, userResponse } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Use direct OpenAI client (Vercel-compatible) with engine's prompt builder
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const scorer = new Scorer();

    const scenarioInput: ScenarioInput = { prompt: scenarioPrompt };

    const kpiResults = await Promise.all(
      kpis.map(async (kpi: KPIDefinition) => {
        // Use engine's prompt builder for consistent evaluation
        const prompt = buildJudgePrompt({
          kpi,
          task: scenarioInput.prompt,
          inputContext: '{}',
          agentOutput: userResponse,
        });

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          messages: [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
          ] as any,
        });

        const content = response.choices[0]?.message?.content ?? '';
        const verdict = parseVerdict(content);

        return {
          kpi_id: kpi.id,
          kpi_name: kpi.name,
          score: (verdict.score / verdict.max_score) * 100,
          raw_score: verdict.score,
          max_score: verdict.max_score,
          weight: kpi.weight,
          method: kpi.method,
          evidence: verdict.reasoning,
        };
      })
    );

    const overallScore = scorer.calculateScenarioScore(kpiResults);

    const scores = kpiResults.map((r) => ({
      kpiId: r.kpi_id,
      kpiName: r.kpi_name,
      score: r.raw_score,
      maxScore: r.max_score,
      reasoning: r.evidence,
    }));

    return NextResponse.json({
      scores,
      overallScore: Math.round(overallScore * 10) / 10,
    });
  } catch (error) {
    console.error('Scoring error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to score response', detail: message },
      { status: 500 }
    );
  }
}
