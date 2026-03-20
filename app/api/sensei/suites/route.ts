import { NextResponse } from 'next/server';
import path from 'path';
import { SuiteLoader } from '@mondaycom/sensei-engine';
import yaml from 'js-yaml';
import { supabaseAdmin } from '@/lib/db';

const SUITE_MAPPING: Record<string, string> = {
  'sdr': 'sdr-qualification.yaml',
  'support': 'customer-support.yaml',
  'content': 'content-writer.yaml',
  'bartender': 'bartender.yaml',
  'dungeon-master': 'dungeon-master.yaml',
  'cat-interview': 'cat-interview.yaml',
  // Marketplace slugs (alias to same files)
  'sdr-qualification': 'sdr-qualification.yaml',
  'customer-support': 'customer-support.yaml',
  'content-writer': 'content-writer.yaml',
};

const loader = new SuiteLoader();

// Parse YAML from marketplace suite into the same format as SuiteLoader
function parseMarketplaceYaml(yamlContent: string) {
  const parsed = yaml.load(yamlContent) as Record<string, unknown>;
  return {
    id: parsed.id as string || 'marketplace-suite',
    name: parsed.name as string || 'Untitled Suite',
    description: parsed.description as string || '',
    scenarios: (parsed.scenarios as Array<Record<string, unknown>> || []).map((s) => ({
      id: s.id as string,
      name: s.name as string,
      layer: s.layer as string || 'execution',
      description: s.description as string || '',
      input: s.input as { prompt: string; feedback?: string },
      kpis: (s.kpis as Array<Record<string, unknown>> || []).map((k) => ({
        id: k.id as string,
        name: k.name as string,
        weight: k.weight as number,
        method: k.method as string,
        config: k.config as Record<string, unknown>,
      })),
      depends_on: s.depends_on as string | undefined,
    })),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const suiteId = searchParams.get('id');

  if (!suiteId) {
    return NextResponse.json({ error: 'Missing suite ID' }, { status: 400 });
  }

  // 1. Try local YAML files first
  if (SUITE_MAPPING[suiteId]) {
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
      console.error('Error loading local suite:', error);
      // Fall through to marketplace lookup
    }
  }

  // 2. Fallback: try loading from marketplace DB
  try {
    const { data, error } = await supabaseAdmin
      .from('suites')
      .select('slug, name, yaml_content')
      .eq('slug', suiteId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Suite not found' }, { status: 404 });
    }

    const suite = parseMarketplaceYaml(data.yaml_content);
    return NextResponse.json(suite);
  } catch (error) {
    console.error('Error loading marketplace suite:', error);
    return NextResponse.json({ error: 'Failed to load suite' }, { status: 500 });
  }
}
