import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { analyzeText, buildSafetyCase, toMarkdown } from '../src/index.js';

test('analyzes fixture into structured result', () => {
  const result = buildSafetyCase('fixtures/send-plan.json');
  assert.equal(result.title, 'Agent Safety Case');
  assert.ok(Object.keys(result.fields).length >= 3);
  assert.match(toMarkdown(result), /## Findings/);
});

test('flags configured review terms', () => {
  const result = analyzeText('Task: demo\nThis contains delete');
  assert.ok(result.warnings.includes('delete'));
});

test('prints usage help', () => {
  const output = execFileSync('node', ['bin/cli.js', '--help'], { encoding: 'utf8' });
  assert.match(output, /Usage: agent-safety-case/);
  assert.match(output, /<file>/);
  assert.match(output, /--format=json/);
});
