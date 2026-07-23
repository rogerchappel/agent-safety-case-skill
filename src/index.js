import fs from 'node:fs';

const FIELD_LABELS = [
  'Action',
  'Target',
  'Intent',
  'Rollback',
  'Approval'
];

const WARNING_PATTERNS = [
  ['delete', /\bdelete(?:s|d|ing)?\b/i],
  ['publish', /\bpublish(?:es|ed|ing)?\b/i],
  [
    'send',
    /\bsend(?:s|ing)?(?:[ \t]+(?:an?|the))?(?:[ \t]+[a-z0-9]+){0,2}[ \t]+(?:email|message|notification|invite|file|report|request|data|payload)\b/i
  ],
  ['write', /\b(?:write|writes|writing|written)\b/i],
  [
    'payment',
    /\b(?:make|makes|making|issue|issues|issuing|process|processes|processing|submit|submits|submitting|collect|collects|collecting|refund|refunds|refunding)[ \t]+(?:an?[ \t]+)?payment\b/i
  ]
];

export function readInput(file) {
  return fs.readFileSync(file, 'utf8');
}

export function analyzeText(text) {
  const fields = extractFields(text);
  const normalizedText = text.replace(/[_-]+/g, ' ');
  const warnings = WARNING_PATTERNS
    .filter(([, pattern]) => pattern.test(normalizedText))
    .map(([warning]) => warning);
  return {
    title: 'Agent Safety Case',
    fields,
    warnings,
    risk: warnings.length === 0 ? 'low' : warnings.length < 3 ? 'review' : 'high',
    nextSteps: [
      'Review warnings before reuse',
      'Confirm fixture coverage',
      'Keep external side effects behind approval'
    ]
  };
}

export function buildSafetyCase(file) {
  return analyzeText(readInput(file));
}

export function toMarkdown(result) {
  const lines = ['# ' + result.title, '', 'Risk: ' + result.risk, '', '## Findings'];
  for (const [key, value] of Object.entries(result.fields)) {
    lines.push('- ' + key + ': ' + value);
  }
  lines.push('', '## Warnings');
  if (result.warnings.length === 0) {
    lines.push('- None');
  } else {
    for (const warning of result.warnings) lines.push('- Review term: ' + warning);
  }
  lines.push('', '## Next Steps');
  for (const step of result.nextSteps) lines.push('- ' + step);
  return lines.join('\n') + '\n';
}

function clean(value) {
  return String(value)
    .trim()
    .replace(/^(?:\*\*|__)\s*/, '')
    .replace(/^["']/, '')
    .replace(/["',]+$/g, '')
    .replace(/\s*(?:\*\*|__)$/, '')
    .trim();
}

function extractFields(text) {
  const jsonFields = parseJsonFields(text);
  const fields = {};

  for (const label of FIELD_LABELS) {
    const jsonValue = jsonFields.get(label.toLowerCase());
    fields[label] = jsonValue === undefined
      ? extractLineField(text, label)
      : clean(jsonValue);
  }

  return fields;
}

function parseJsonFields(text) {
  try {
    const value = JSON.parse(text);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return new Map(
        Object.entries(value).map(([key, fieldValue]) => [key.toLowerCase(), fieldValue])
      );
    }
  } catch {
    // Non-JSON Markdown and text inputs are parsed line by line below.
  }
  return new Map();
}

function extractLineField(text, label) {
  const fieldPattern = new RegExp(
    `^\\s*(?:[-*+]\\s+)?(?:\\*\\*|__)?["']?${label}["']?(?:\\*\\*|__)?\\s*[:=]\\s*(?:\\*\\*|__)?\\s*(.+?)\\s*$`,
    'i'
  );

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(fieldPattern);
    if (match?.[1]) return clean(match[1]);
  }
  return 'Not found';
}
