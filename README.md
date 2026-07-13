# Agent Safety Case Skill

Draft reviewable safety cases before agent side effects.

This is a local-first agent skill package. It reads local fixtures, produces reviewable Markdown or JSON, and keeps all external side effects out of scope.

## Quickstart

```bash
npm install
npm test
npm run smoke
node bin/cli.js --help
node bin/cli.js fixtures/send-plan.json --format=json
```

Run the full local release gate before opening a release PR:

```bash
npm run release:check
```

`npm run release:readiness` verifies package metadata, CLI bin metadata,
support docs, fixtures, examples, CI presence, and the npm files allowlist.
`npm run package:smoke` verifies the bin target and dry-run tarball contents.

## Verification

Run the same checks used for release-readiness before publishing or opening a release PR:

```bash
npm run check
npm test
npm run smoke
npm run release:check
npm pack --dry-run
```

## CLI

```bash
agent-safety-case <file> [--format=json]
```

## Examples

```bash
node bin/cli.js fixtures/send-plan.json
node bin/cli.js fixtures/send-plan.json --format=json
```

## Safety Notes

- Reads local files only.
- Does not call external services.
- Does not approve, publish, send, or write outside stdout.
- Treat warnings as review prompts, not perfect policy enforcement.

## Limitations

- V1 uses deterministic fixture parsing and conservative warning terms.
- It is designed for small local plans and run notes, not full transcript warehouses.
- Human review is still required before public reuse or external action.
