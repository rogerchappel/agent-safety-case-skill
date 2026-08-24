# Contributing

Keep changes local-first, fixture-backed, and explicit about side-effect boundaries.

## Checks

- `npm ci`
- npm test
- npm run check
- npm run smoke
- npm run release:check

Always install from the committed lockfile with `npm ci`. The release-readiness
check rejects a missing or stale root package entry in `package-lock.json`.
