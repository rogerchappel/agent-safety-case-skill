import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
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
    'Target: local notes',
    'Context: publisher and sender metadata for undeleted drafts'
  ].join('\n'));

  assert.deepEqual(result.warnings, []);
  assert.equal(result.risk, 'low');
});

test('reviews common imperative external side effects in deterministic order', () => {
  const result = analyzeText([
    'Action: deploy_the_release, then upload-the-report',
    'Intent: post a message to Slack and email the customer'
  ].join('\n'));

  assert.deepEqual(result.warnings, ['email', 'post', 'upload', 'deploy']);
  assert.equal(result.risk, 'high');
});

test('reviews direct message actions and common verb inflections', () => {
  const examples = [
    ['Action: messaged the customer', 'message'],
    ['Action: emailing a client', 'email'],
    ['Action: posted the announcement', 'post'],
    ['Action: uploading the report', 'upload'],
    ['Action: deployed the release', 'deploy']
  ];

  for (const [input, expectedWarning] of examples) {
    const result = analyzeText(input);
    assert.deepEqual(result.warnings, [expectedWarning], input);
    assert.equal(result.risk, 'review', input);
  }
});

test('does not treat side-effect nouns or policy prose as actions', () => {
  const result = analyzeText([
    'Action: summarize the deployment guide',
    'Intent: compare email policy and message retention',
    'Target: upload limits and blog post metadata',
    'Context: the customer deployment was completed previously'
  ].join('\n'));

  assert.deepEqual(result.warnings, []);
  assert.equal(result.risk, 'low');
});

test('prints usage help', () => {
  const output = execFileSync('node', ['bin/cli.js', '--help'], { encoding: 'utf8' });
  assert.match(output, /Usage: agent-safety-case/);
  assert.match(output, /<file>/);
  assert.match(output, /--format=markdown\|json/);
});

test('CLI preserves Markdown and JSON output modes', () => {
  const markdown = spawnSync('node', ['bin/cli.js', 'fixtures/send-plan.json'], { encoding: 'utf8' });
  assert.equal(markdown.status, 0);
  assert.match(markdown.stdout, /^# Agent Safety Case/m);
  assert.equal(markdown.stderr, '');

  for (const option of ['--format=json', '--json']) {
    const json = spawnSync('node', ['bin/cli.js', 'fixtures/send-plan.json', option], { encoding: 'utf8' });
    assert.equal(json.status, 0);
    assert.equal(JSON.parse(json.stdout).title, 'Agent Safety Case');
    assert.equal(json.stderr, '');
  }
});

test('CLI rejects unsupported options with a usage error', () => {
  const result = spawnSync('node', ['bin/cli.js', 'fixtures/send-plan.json', '--verbose'], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^agent-safety-case: unknown option '--verbose'\n/);
  assert.match(result.stderr, /Usage: agent-safety-case/);
});

test('CLI rejects unsupported format values with a usage error', () => {
  const result = spawnSync('node', ['bin/cli.js', 'fixtures/send-plan.json', '--format=yaml'], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /^agent-safety-case: unsupported format 'yaml'\n/);
  assert.match(result.stderr, /Supported formats: markdown, json/);
});
