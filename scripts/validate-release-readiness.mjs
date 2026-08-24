import { existsSync, readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const failures = [];

function requireField(condition, message) {
  if (!condition) failures.push(message);
}

requireField(pkg.name === 'agent-safety-case-skill', 'package name must remain agent-safety-case-skill');
requireField(pkg.version === '0.1.0', 'release candidate version must be 0.1.0');
requireField(pkg.license === 'MIT', 'package must declare the MIT license');
requireField(pkg.engines?.node === '>=20', 'Node engine must document the runtime baseline');
requireField(pkg.repository?.url === 'git+https://github.com/rogerchappel/agent-safety-case-skill.git', 'repository metadata must point at GitHub');
requireField(pkg.bugs?.url === 'https://github.com/rogerchappel/agent-safety-case-skill/issues', 'bugs URL must point at GitHub issues');
requireField(pkg.homepage === 'https://github.com/rogerchappel/agent-safety-case-skill#readme', 'homepage must point at the README');
requireField(pkg.bin?.['agent-safety-case'] === './bin/cli.js', 'CLI bin must point at ./bin/cli.js');
requireField(Array.isArray(pkg.files), 'package files allowlist is required');

let lock;
try {
  lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
} catch (error) {
  failures.push(`package-lock.json must be present and valid JSON (${error.code ?? error.message})`);
}

if (lock) {
  const root = lock.packages?.[''];
  requireField(lock.lockfileVersion === 3, 'package-lock.json must use lockfileVersion 3');
  requireField(Boolean(root), 'package-lock.json must describe the root package');
  for (const field of ['name', 'version', 'license']) {
    requireField(root?.[field] === pkg[field], `package-lock.json root ${field} must match package.json`);
  }
  for (const field of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies', 'engines']) {
    requireField(
      JSON.stringify(root?.[field] ?? {}) === JSON.stringify(pkg[field] ?? {}),
      `package-lock.json root ${field} must match package.json`
    );
  }
  const normalizedBin = Object.fromEntries(
    Object.entries(pkg.bin ?? {}).map(([name, target]) => [name, target.replace(/^\.\//, '')])
  );
  requireField(
    JSON.stringify(root?.bin ?? {}) === JSON.stringify(normalizedBin),
    'package-lock.json root bin must match package.json'
  );
}

for (const file of [
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'SKILL.md',
  'docs/RELEASE_CANDIDATE.md',
  'fixtures/send-plan.json',
  'examples/sample-output.md',
  '.github/workflows/ci.yml',
  'package-lock.json'
]) {
  requireField(existsSync(file), `${file} must be present for release review`);
}

for (const entry of ['bin', 'src', 'fixtures', 'examples', 'docs', 'SKILL.md', 'README.md', 'LICENSE', 'SECURITY.md', 'CONTRIBUTING.md', 'CHANGELOG.md']) {
  requireField(pkg.files.includes(entry), `package files allowlist must include ${entry}`);
}

if (failures.length) {
  console.error(`release readiness failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('release readiness ok');
