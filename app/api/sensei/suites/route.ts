import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface KPI {
  id: string;
  name: string;
  weight: number;
  method: string;
  config: {
    max_score?: number;
    rubric?: string;
    threshold?: number;
    target?: number;
    acceptable_range?: number[];
  };
}

export interface Scenario {
  id: string;
  name: string;
  layer: 'execution' | 'reasoning' | 'self-improvement';
  description: string;
  input: {
    prompt: string;
    context?: Record<string, any>;
    fixtures?: Record<string, string>;
  };
  kpis: KPI[];
}

export interface Suite {
  id: string;
  name: string;
  description: string;
  scenarios: Scenario[];
}

const SUITE_MAPPING: Record<string, string> = {
  'sdr': 'sdr-qualification.yaml',
  'support': 'customer-support.yaml',
  'content': 'content-writer.yaml',
  'bartender': 'bartender.yaml',
  'dungeon-master': 'dungeon-master.yaml',
  'cat-interview': 'cat-interview.yaml',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const suiteId = searchParams.get('id');

  if (!suiteId || !SUITE_MAPPING[suiteId]) {
    return NextResponse.json({ error: 'Invalid suite ID' }, { status: 400 });
  }

  try {
    const suitePath = path.join(process.cwd(), 'data', 'suites', SUITE_MAPPING[suiteId]);
    const fileContents = fs.readFileSync(suitePath, 'utf8');
    const suiteData = yaml.load(fileContents) as any;

    const suite: Suite = {
      id: suiteData.id,
      name: suiteData.name,
      description: suiteData.description,
      scenarios: suiteData.scenarios,
    };

    return NextResponse.json(suite);
  } catch (error) {
    console.error('Error loading suite:', error);
    return NextResponse.json({ error: 'Failed to load suite' }, { status: 500 });
  }
}
