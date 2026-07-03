# Agent Safety Case Skill

Draft reviewable safety cases before agent side effects.

This is a local-first agent skill package. It reads local fixtures, produces reviewable Markdown or JSON, and keeps all external side effects out of scope.

## Quickstart

```bash
npm install
npm test
npm run smoke
node bin/cli.js fixtures/send-plan.json --format=json
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
