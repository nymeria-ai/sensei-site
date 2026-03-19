import { NextRequest, NextResponse } from 'next/server';
import { Judge, Scorer } from '@mondaycom/sensei-engine';
import type { KPIDefinition, ScenarioInput, JudgeConfig } from '@mondaycom/sensei-engine';

const judgeConfig: JudgeConfig = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.3,
};

export async function POST(request: NextRequest) {
  try {
    const { scenarioPrompt, kpis, userResponse } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const judge = new Judge(judgeConfig);
    const scorer = new Scorer();

    try {
      const scenarioInput: ScenarioInput = { prompt: scenarioPrompt };

      // Score each KPI using the engine's Judge
      const kpiResults = await Promise.all(
        kpis.map(async (kpi: KPIDefinition) => {
          const verdict = await judge.evaluate({
            kpi,
            scenarioInput,
            agentOutput: userResponse,
          });

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

      // Map to the response shape the modal expects
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
    } finally {
      judge.dispose();
    }
  } catch (error) {
    console.error('Scoring error:', error);
    return NextResponse.json(
      { error: 'Failed to score response' },
      { status: 500 }
    );
  }
}
