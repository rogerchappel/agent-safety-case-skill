# Orchestration

## Inputs

- Local fixture path.
- Optional `--format=json` flag.

## Steps

1. Read the fixture from disk.
2. Extract known fields with deterministic patterns.
3. Classify each supported field as populated, missing, or blank.
4. Flag conservative review terms and derive risk from warnings and completeness.
5. Emit Markdown or JSON to stdout.

## Failure Modes

- Missing file: CLI exits non-zero.
- Missing fields: report uses `Not found`, lists the field as missing, and sets
  at least `review` risk.
- Blank fields: a present empty, whitespace-only, or JSON `null` value uses
  `Blank`, is listed separately, and sets at least `review` risk.
- Warning terms: report sets review/high risk but does not block output.

## Completeness Contract

`Action`, `Target`, `Intent`, `Rollback`, and `Approval` are all required for a
complete artifact. JSON exposes `completeness.complete`, `missingFields`, and
`blankFields` in that fixed field order. Markdown exposes the same state under
`## Completeness`. A complete artifact with no warning terms is `low` risk; one
or two warning families or any incomplete artifact is `review`; three or more
warning families is `high`.
