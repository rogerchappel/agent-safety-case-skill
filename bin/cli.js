#!/usr/bin/env node
import { buildSafetyCase, toMarkdown } from '../src/index.js';

const args = process.argv.slice(2);
const usage = 'Usage: agent-safety-case <file> [--format=markdown|json] [--json]';

let file;
let format = 'markdown';
let help = false;

for (const arg of args) {
  if (arg === '--help') {
    help = true;
  } else if (arg === '--json') {
    format = 'json';
  } else if (arg.startsWith('--format=')) {
    const value = arg.slice('--format='.length);
    if (!['markdown', 'json'].includes(value)) {
      console.error(`agent-safety-case: unsupported format '${value}'`);
      console.error('Supported formats: markdown, json');
      console.error(usage);
      process.exit(2);
    }
    format = value;
  } else if (arg.startsWith('--')) {
    console.error(`agent-safety-case: unknown option '${arg}'`);
    console.error(usage);
    process.exit(2);
  } else if (file) {
    console.error(`agent-safety-case: unexpected argument '${arg}'`);
    console.error(usage);
    process.exit(2);
  } else {
    file = arg;
  }
}

if (help) {
  if (file) {
    console.error(`agent-safety-case: unexpected argument '${file}'`);
    console.error(usage);
    process.exit(2);
  }
  console.log(usage);
  process.exit(0);
}

if (!file) {
  console.error(usage);
  process.exit(2);
}

try {
  const result = buildSafetyCase(file);
  console.log(format === 'json' ? JSON.stringify(result, null, 2) : toMarkdown(result));
} catch (error) {
  console.error('agent-safety-case: ' + error.message);
  process.exit(1);
}
