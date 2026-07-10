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
  '.github/workflows/ci.yml'
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
