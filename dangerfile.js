// dangerfile.js — PR conventions for otranslate-platform
// Runs in CI via `npx danger ci`
//
// Rules enforced:
//   1. PR description required (min 20 chars)
//   2. PR must link a spec artifact or Spec-Kit task ID
//   3. Warn if diff > 400 lines

/* global danger, warn, fail */

// ── Rule 1: PR description required ──────────────────────────────────────────
const body = (danger.github.pr.body || '').trim();
if (body.length < 20) {
  fail(
    '**PR description is required.**\n' +
      'Add a short summary of _what_ changed and _why_. Min 20 characters.',
  );
}

// ── Rule 2: Spec artifact link required ──────────────────────────────────────
const SPEC_PATTERNS = [
  /01_strategy\/website-rebuild\//i,
  /SPEC-\d+/i,
  /Build-Brief/i,
  /Master-Plan/i,
  /spec-kit/i,
];
const hasSpecLink = SPEC_PATTERNS.some((p) => p.test(body));
if (!hasSpecLink) {
  fail(
    '**Missing spec link.**\n' +
      'Every PR must reference a spec artifact. Add one of:\n' +
      '- A path under `01_strategy/website-rebuild/`\n' +
      '- A Spec-Kit task ID: `SPEC-123`\n' +
      '- A `Build-Brief` or `Master-Plan` reference',
  );
}

// ── Rule 3: Large diff warning ────────────────────────────────────────────────
const linesChanged = danger.github.pr.additions + danger.github.pr.deletions;
if (linesChanged > 400) {
  warn(`**Large PR:** ${linesChanged} lines changed. Consider splitting for focused review.`);
}
