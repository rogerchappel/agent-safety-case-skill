import fs from 'node:fs';

const ROWS = [
  [
    "Action",
    "\"?action\"?\\s*[:=]\\s*\"?([^\",\\n]+)",
    "i"
  ],
  [
    "Target",
    "\"?target\"?\\s*[:=]\\s*\"?([^\",\\n]+)",
    "i"
  ],
  [
    "Intent",
    "\"?intent\"?\\s*[:=]\\s*\"?([^\",\\n]+)",
    "i"
  ],
  [
    "Rollback",
    "\"?rollback\"?\\s*[:=]\\s*\"?([^\",\\n]+)",
    "i"
  ],
  [
    "Approval",
    "\"?approval\"?\\s*[:=]\\s*\"?([^\",\\n]+)",
    "i"
  ]
];
const WARNING_TERMS = [
  "delete",
  "publish",
  "send_",
  "write",
  "payment"
];

export function readInput(file) {
  return fs.readFileSync(file, 'utf8');
}

export function analyzeText(text) {
  const fields = {};
  for (const [label, source, flags] of ROWS) {
    const match = text.match(new RegExp(source, flags));
    fields[label] = match && match[1] ? clean(match[1]) : 'Not found';
  }
  const warnings = WARNING_TERMS.filter((term) => text.toLowerCase().includes(term.toLowerCase()));
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
  return String(value).replace(/[",]+$/g, '').trim();
}
