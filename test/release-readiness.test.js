import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

function readinessFixture() {
  const directory = mkdtempSync(join(tmpdir(), 'agent-safety-readiness-'));
  for (const path of ['package.json', 'package-lock.json', 'scripts', 'README.md', 'LICENSE', 'SECURITY.md', 'CONTRIBUTING.md', 'CHANGELOG.md', 'SKILL.md', 'docs', 'fixtures', 'examples', '.github']) {
    cpSync(path, join(directory, path), { recursive: true });
  }
  return directory;
}

function runReadiness(cwd) {
  return spawnSync(process.execPath, ['scripts/validate-release-readiness.mjs'], { cwd, encoding: 'utf8' });
}

test('release readiness rejects a missing lockfile', (t) => {
  const cwd = readinessFixture();
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  rmSync(join(cwd, 'package-lock.json'));

  const result = runReadiness(cwd);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /package-lock\.json must be present/);
});

test('release readiness rejects a CI Node matrix that omits a supported major line', (t) => {
  const cwd = readinessFixture();
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const workflowPath = join(cwd, '.github/workflows/ci.yml');
  const workflow = readFileSync(workflowPath, 'utf8');
  writeFileSync(workflowPath, workflow.replace('node-version: [20, 21, 22, 23, 24, 25, 26]', 'node-version: [20, 22, 24, 26]'));

  const result = runReadiness(cwd);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /CI Node matrix must match the supported Node.js major versions/);
});

test('release readiness rejects a stale lockfile root', (t) => {
  const cwd = readinessFixture();
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const lockPath = join(cwd, 'package-lock.json');
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  lock.packages[''].engines.node = '>=18';
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

  const result = runReadiness(cwd);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /root engines must match package\.json/);
});
