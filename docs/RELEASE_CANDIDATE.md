# Release Candidate Notes

## Classification

ship

## Verification

- `npm test`
- `npm run check`
- `npm run smoke`

## 2026-07-06 Verification Result

- `npm run release:check`: passed locally, including lint/check, 3 node:test cases, CLI help/fixture smoke, bin-target verification, and npm pack dry run.
- Added a GitHub Actions release gate for pull requests and pushes to `main` on Node.js 20 and 22.

## Known Limits

- Deterministic parser only.
- Conservative warning terms.
- Local fixtures only.

## RC Review Delta

- Opened for release-candidate review on 2026-07-04 after main bootstrap push.
