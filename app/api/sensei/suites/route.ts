import { NextResponse } from 'next/server';
import path from 'path';
import { SuiteLoader } from '@mondaycom/sensei-engine';

const SUITE_MAPPING: Record<string, string> = {
  'sdr': 'sdr-qualification.yaml',
  'support': 'customer-support.yaml',
  'content': 'content-writer.yaml',
  'bartender': 'bartender.yaml',
  'dungeon-master': 'dungeon-master.yaml',
  'cat-interview': 'cat-interview.yaml',
};

const loader = new SuiteLoader();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const suiteId = searchParams.get('id');

  if (!suiteId || !SUITE_MAPPING[suiteId]) {
    return NextResponse.json({ error: 'Invalid suite ID' }, { status: 400 });
  }

  try {
    const suitePath = path.join(process.cwd(), 'data', 'suites', SUITE_MAPPING[suiteId]);
    const suite = await loader.loadFile(suitePath);

    return NextResponse.json({
      id: suite.id,
      name: suite.name,
      description: suite.description ?? '',
      scenarios: suite.scenarios,
    });
  } catch (error) {
    console.error('Error loading suite:', error);
    return NextResponse.json({ error: 'Failed to load suite' }, { status: 500 });
  }
}
