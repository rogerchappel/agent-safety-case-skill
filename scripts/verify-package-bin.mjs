import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const bins = Object.entries(pkg.bin ?? {});

if (bins.length === 0) {
  throw new Error('package.json does not declare any CLI bin entries');
}

const missing = [];
for (const [name, target] of bins) {
  const path = new URL(`../${target}`, import.meta.url);
  try {
    await readFile(path);
  } catch {
    missing.push(`${name} -> ${target}`);
  }
}

if (missing.length > 0) {
  throw new Error(`package bin target(s) missing: ${missing.join(', ')}`);
}

const { stdout } = await execFileAsync('npm', ['pack', '--dry-run', '--json']);
const [pack] = JSON.parse(stdout);
const files = new Set(pack.files.map((file) => file.path));

const required = [
  'bin/cli.js',
  'src/index.js',
  'fixtures/send-plan.json',
  'examples/sample-output.md',
  'docs/RELEASE_CANDIDATE.md',
  'SKILL.md',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md'
];

const omitted = required.filter((file) => !files.has(file));
if (omitted.length > 0) {
  throw new Error(`package dry-run omitted release files: ${omitted.join(', ')}`);
}

console.log(`Verified ${bins.length} package bin target(s) and ${pack.files.length} packed files.`);
