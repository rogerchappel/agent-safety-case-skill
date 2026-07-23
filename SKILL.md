# Agent Safety Case Skill

## When To Use

Use this skill before an agent asks for approval to send, publish, delete, write to an external system, or otherwise create side effects.

## Required Inputs

- A local Markdown, JSON, or text fixture.
- A clear intended output: Markdown report or JSON summary.
- Permission to read the local fixture.

## Side-Effect Boundaries

The CLI drafts an approval artifact only. It does not grant approval, call external tools, or perform the planned action.

## Approval Requirements

- No approval is needed for local fixture analysis.
- Human approval is required before copying generated material into public docs when the input may contain private context.
- Separate approval is required before any external send, publish, account write, or live connector call.

## Analyzer Boundary

- Supported fields are `Action`, `Target`, `Intent`, `Rollback`, and
  `Approval` in top-level JSON or line-oriented Markdown/text.
- Human-readable send actions such as `send email`, `send a message`, and
  snake-case variants produce a review warning.
- Warning matching is token-aware, so descriptive words such as `sender` or
  `writable` do not produce action warnings.
- Results are review prompts. The analyzer does not establish approval,
  interpret negation, or prove that a target is external.

## Workflow

1. Run `agent-safety-case <file>`.
2. Review warnings and missing fields.
3. Update the source fixture or plan if important evidence is absent.
4. Save or paste the report only after redaction review.
5. Run `npm test` and `npm run smoke` when changing the skill package.

## Examples

```bash
node bin/cli.js fixtures/send-plan.json
node bin/cli.js fixtures/send-plan.json --format=json
```

## Validation

- `npm test`
- `npm run check`
- `npm run smoke`
