# Agent Safety Case Skill Sample Output

`npm run smoke` runs the CLI against `fixtures/send-plan.json`; the Markdown
report below is the current output for that fixture:

```markdown
# Agent Safety Case

Risk: review

## Findings
- Action: send_slack_message
- Target: release-channel
- Intent: notify maintainers about a release candidate
- Rollback: post a correction and close the PR if needed
- Approval: human approval required before sending

## Completeness
- Complete: yes
- Missing fields: None
- Blank fields: None
- Invalid fields: None

## Warnings
- Review term: send

## Next Steps
- Review warnings before reuse
- Confirm fixture coverage
- Keep external side effects behind approval
```

The fixture is complete because every top-level JSON value is a string. Any
top-level JSON field whose value is not a string or `null` is invalid
evidence: it is listed under Invalid fields (and in JSON
`completeness.invalidFields`), makes the report incomplete, and prevents
`low` risk. For example, JSON input with `"evidence": ["tests passed", 42]`
produces:

```json
{
  "title": "Agent Safety Case",
  "fields": {
    "Action": "inspect configuration",
    "Target": "local fixture",
    "Intent": "verify deterministic output",
    "Rollback": "discard local notes",
    "Approval": "not required for local read"
  },
  "completeness": {
    "complete": false,
    "missingFields": [],
    "blankFields": [],
    "invalidFields": [
      {
        "field": "evidence",
        "type": "array"
      }
    ]
  },
  "warnings": [],
  "risk": "review",
  "nextSteps": [
    "Review warnings before reuse",
    "Confirm fixture coverage",
    "Keep external side effects behind approval"
  ]
}
```

Extra top-level JSON fields whose values are strings (such as
`"branch": "feature/x"`) are allowed and do not affect completeness.