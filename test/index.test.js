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

test('parses Markdown fields and reviews a send email action', () => {
  const result = analyzeText([
    '## Plan',
    '- **Action:** send email',
    '- **Target:** customer',
    '- **Approval:** required'
  ].join('\n'));

  assert.equal(result.fields.Action, 'send email');
  assert.equal(result.fields.Target, 'customer');
  assert.equal(result.fields.Approval, 'required');
  assert.deepEqual(result.warnings, ['send']);
  assert.equal(result.risk, 'review');
});

test('reviews a human-readable send message action in plain text', () => {
  const result = analyzeText([
    'Action: send a message',
    'Target: release channel',
    'Approval: maintainer required'
  ].join('\n'));

  assert.equal(result.fields.Action, 'send a message');
  assert.deepEqual(result.warnings, ['send']);
  assert.equal(result.risk, 'review');
});

test('does not treat benign substrings as external actions', () => {
  const result = analyzeText([
    'Action: summarize newsletter content',
    'Intent: describe payment-free options and writable formats',
    'Target: local notes'
  ].join('\n'));

  assert.deepEqual(result.warnings, []);
  assert.equal(result.risk, 'low');
});

test('prints usage help', () => {
  const output = execFileSync('node', ['bin/cli.js', '--help'], { encoding: 'utf8' });
  assert.match(output, /Usage: agent-safety-case/);
  assert.match(output, /<file>/);
  assert.match(output, /--format=json/);
});
