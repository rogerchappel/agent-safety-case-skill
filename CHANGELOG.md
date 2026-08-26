# Changelog

## [Unreleased]

- Distinguish missing and blank safety-case fields, expose deterministic
  completeness diagnostics in JSON and Markdown, and prevent incomplete
  artifacts from being reported as low risk.
- Validate every top-level JSON property: non-string values (objects, arrays,
  booleans, numbers) anywhere in a JSON object are reported as invalid fields,
  make the artifact incomplete, and cannot be low risk; the shipped fixture and
  sample output now follow the documented contract.
- Parse emphasized Markdown fields and recognize human-readable external send
  actions without matching benign substrings.
- Recognize imperative pull-request merge and public repository creation
  actions while excluding policy, noun, and completed-history prose.
- Add release-readiness checks for package metadata, pack contents, and CI verification.
## 0.1.0

- Initial public release candidate with local CLI, fixtures, tests, and skill documentation.
- Adds explicit release-readiness validation and stronger package dry-run
  contents checks for release review.
