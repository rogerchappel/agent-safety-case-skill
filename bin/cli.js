#!/usr/bin/env node
import { buildSafetyCase, toMarkdown } from '../src/index.js';

const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Usage: agent-safety-case <file> [--format=json]');
  process.exit(0);
}

const file = args.find((arg) => !arg.startsWith('--'));
const format = args.includes('--format=json') || args.includes('--json') ? 'json' : 'markdown';

if (!file) {
  console.log('Usage: agent-safety-case <file> [--format=json]');
  process.exit(1);
}

try {
  const result = buildSafetyCase(file);
  console.log(format === 'json' ? JSON.stringify(result, null, 2) : toMarkdown(result));
} catch (error) {
  console.error('agent-safety-case: ' + error.message);
  process.exit(1);
}
