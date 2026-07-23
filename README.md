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

## Parsing and risk boundary

The analyzer extracts `Action`, `Target`, `Intent`, `Rollback`, and `Approval`
from top-level JSON properties or line-oriented text. Text labels may be plain
(`Action: send email`) or Markdown-emphasized
(`- **Action:** send email`). Extracted values are normalized by removing
field syntax, quotes, and Markdown emphasis.

Warnings use action-shaped, token-aware patterns. They recognize the existing
delete, publish, write, and payment-action families, plus human-readable send
actions such as `send email`, `send a message`, and `send_slack_message`.
Words that merely contain a warning term, such as `sender`, `publisher`,
`undeleted`, or `writable`, are not actions. One or two distinct warning
families produce `review` risk; three or more produce `high` risk.

## Limitations

- V1 uses deterministic parsing and does not infer intent, negation, approval,
  or whether a named target is actually external.
- It is designed for small local plans and run notes, not full transcript warehouses.
- Human review is still required before public reuse or external action.

## Release notes

Before tagging a release, confirm the smoke fixture still represents the intended workflow and summarize any changed output, limitations, or operator steps in the PR.
