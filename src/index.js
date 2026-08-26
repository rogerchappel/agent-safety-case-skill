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
    'merge',
    /\b(?:merge|merges|merging)[ \t]+(?:(?:an?|the)[ \t]+)?(?:pull[ \t]+request|pr)\b(?:[ \t]+#?\d+)?/i
  ],
  [
    'repository creation',
    /\bcreat(?:e|es|ing)[ \t]+(?:(?:an?|the|new)[ \t]+)?public[ \t]+(?:repository|repo)\b/i
  ],
  [
    'send',
    /\bsend(?:s|ing)?(?:[ \t]+(?:an?|the))?(?:[ \t]+[a-z0-9]+){0,2}[ \t]+(?:email|message|notification|invite|file|report|request|data|payload)\b/i
  ],
  [
    'email',
    /\bemail(?:s|ed|ing)?[ \t]+(?:an?|the|our|your|their)?[ \t]*(?:customer|client|user|recipient|team|maintainer|vendor|owner|contact)s?\b/i
  ],
  [
    'message',
    /\bmessage(?:s|d|ing)?[ \t]+(?:an?|the|our|your|their)?[ \t]*(?:customer|client|user|recipient|team|maintainer|vendor|owner|contact)s?\b/i
  ],
  [
    'post',
    /\bpost(?:s|ed|ing)?[ \t]+(?:an?|the|our|your|their)?[ \t]*(?:message|announcement|update|comment|reply|notification|report|file|data|payload)\b/i
  ],
  [
    'upload',
    /\bupload(?:s|ed|ing)?[ \t]+(?:an?|the|our|your|their)?[ \t]*(?:report|file|document|artifact|attachment|image|video|data|payload|archive|package)\b/i
  ],
  [
    'deploy',
    /\bdeploy(?:s|ed|ing)?[ \t]+(?:an?|the|our|your|their)?[ \t]*(?:release|application|app|service|site|website|build|artifact|package|code|change|update)\b/i
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
  const { fields, invalidJsonFields } = extractFields(text);
  const completeness = assessCompleteness(fields, invalidJsonFields);
  const normalizedText = text.replace(/[_-]+/g, ' ');
  const warnings = WARNING_PATTERNS
    .filter(([, pattern]) => pattern.test(normalizedText))
    .map(([warning]) => warning);
  return {
    title: 'Agent Safety Case',
    fields,
    completeness,
    warnings,
    risk: warnings.length >= 3 ? 'high' : warnings.length > 0 || !completeness.complete ? 'review' : 'low',
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
  lines.push('', '## Completeness');
  lines.push('- Complete: ' + (result.completeness.complete ? 'yes' : 'no'));
  lines.push('- Missing fields: ' + formatFieldList(result.completeness.missingFields));
  lines.push('- Blank fields: ' + formatFieldList(result.completeness.blankFields));
  lines.push('- Invalid fields: ' + formatInvalidFields(result.completeness.invalidFields));
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
  if (value === null) return '';
  return String(value)
    .trim()
    .replace(/^(?:\*\*|__)\s*/, '')
    .replace(/^["']/, '')
    .replace(/["',]+$/g, '')
    .replace(/\s*(?:\*\*|__)$/, '')
    .trim();
}

function extractFields(text) {
  const jsonEntries = parseJsonObject(text);
  const jsonFields = new Map(
    (jsonEntries ?? []).map(([key, value]) => [key.toLowerCase(), value])
  );
  const fields = {};
  const invalidJsonFields = [];

  for (const [key, value] of jsonEntries ?? []) {
    if (value !== null && typeof value !== 'string') {
      invalidJsonFields.push({ field: key, type: jsonType(value) });
    }
  }

  for (const label of FIELD_LABELS) {
    const key = label.toLowerCase();
    const rawValue = jsonFields.has(key)
      ? jsonFields.get(key)
      : extractLineField(text, label);
    fields[label] = rawValue === undefined
      ? 'Not found'
      : invalidJsonType(rawValue)
        ? `Invalid type: ${jsonType(rawValue)}`
        : clean(rawValue) || 'Blank';
  }

  return { fields, invalidJsonFields };
}

function parseJsonObject(text) {
  try {
    const value = JSON.parse(text);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.entries(value);
    }
  } catch {
    // Non-JSON Markdown and text inputs are parsed line by line below.
  }
  return null;
}

function extractLineField(text, label) {
  const fieldPattern = new RegExp(
    `^\\s*(?:[-*+]\\s+)?(?:\\*\\*|__)?["']?${label}["']?(?:\\*\\*|__)?\\s*[:=]\\s*(?:\\*\\*|__)?\\s*(.*?)\\s*$`,
    'i'
  );

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(fieldPattern);
    if (match) return match[1];
  }
  return undefined;
}

function assessCompleteness(fields, invalidJsonFields = []) {
  const missingFields = FIELD_LABELS.filter((label) => fields[label] === 'Not found');
  const blankFields = FIELD_LABELS.filter((label) => fields[label] === 'Blank');
  const invalidFields = [...invalidJsonFields];
  return {
    complete: missingFields.length === 0 && blankFields.length === 0 && invalidFields.length === 0,
    missingFields,
    blankFields,
    invalidFields
  };
}

function invalidJsonType(value) {
  return value !== null && typeof value !== 'string';
}

function jsonType(value) {
  return Array.isArray(value) ? 'array' : typeof value;
}

function formatFieldList(fields) {
  return fields.length === 0 ? 'None' : fields.join(', ');
}

function formatInvalidFields(fields) {
  return fields.length === 0
    ? 'None'
    : fields.map(({ field, type }) => `${field} (${type})`).join(', ');
}
