import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface KPIScore {
  kpiId: string;
  kpiName: string;
  score: number;
  maxScore: number;
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    const { scenarioPrompt, kpis, userResponse } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const scores: KPIScore[] = [];

    // Score each KPI
    for (const kpi of kpis) {
      const judgePrompt = `You are evaluating an AI agent's response against a specific KPI.

**Scenario Prompt:**
${scenarioPrompt}

**Agent's Response:**
${userResponse}

**KPI to Evaluate:** ${kpi.name}
**Maximum Score:** ${kpi.config.max_score || 5}

**Rubric:**
${kpi.config.rubric || 'Evaluate based on quality, relevance, and completeness.'}

**Instructions:**
1. Evaluate the response based on the rubric
2. Assign a score from 0 to ${kpi.config.max_score || 5}
3. Provide brief reasoning (2-3 sentences max)

Respond in JSON format:
{
  "score": <number>,
  "reasoning": "<brief explanation>"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a precise evaluator. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: judgePrompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');

      scores.push({
        kpiId: kpi.id,
        kpiName: kpi.name,
        score: result.score,
        maxScore: kpi.config.max_score || 5,
        reasoning: result.reasoning,
      });
    }

    // Calculate weighted average
    const totalWeight = kpis.reduce((sum: number, kpi: any) => sum + kpi.weight, 0);
    const weightedScore = scores.reduce((sum, score, idx) => {
      const normalizedScore = (score.score / score.maxScore) * 100;
      return sum + normalizedScore * kpis[idx].weight;
    }, 0) / totalWeight;

    return NextResponse.json({
      scores,
      overallScore: Math.round(weightedScore * 10) / 10,
    });
  } catch (error) {
    console.error('Scoring error:', error);
    return NextResponse.json(
      { error: 'Failed to score response' },
      { status: 500 }
    );
  }
}
