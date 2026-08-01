# Changelog

## [Unreleased]

- Parse emphasized Markdown fields and recognize human-readable external send
  actions without matching benign substrings.
- Recognize imperative pull-request merge and public repository creation
  actions while excluding policy, noun, and completed-history prose.
- Add release-readiness checks for package metadata, pack contents, and CI verification.
## 0.1.0

- Initial public release candidate with local CLI, fixtures, tests, and skill documentation.
- Adds explicit release-readiness validation and stronger package dry-run
  contents checks for release review.
