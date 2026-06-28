/**
 * Filename keyword patterns → score.
 * Matched against lowercase filename. Scores stack if multiple match.
 */
export const KEYWORD_RULES = [
  // ── Strong keep: financial ──
  { pattern: /invoice/i, score: 45, reason: 'Financial document (invoice)' },
  { pattern: /receipt/i, score: 45, reason: 'Financial document (receipt)' },
  { pattern: /billing/i, score: 40, reason: 'Financial document (billing)' },
  { pattern: /payment/i, score: 35, reason: 'Financial document (payment)' },
  { pattern: /tax/i, score: 45, reason: 'Tax document' },
  { pattern: /w-?2/i, score: 45, reason: 'Tax form (W-2)' },
  { pattern: /1099/i, score: 45, reason: 'Tax form (1099)' },
  { pattern: /statement/i, score: 30, reason: 'Statement document' },

  // ── Strong keep: legal / identity ──
  { pattern: /contract/i, score: 45, reason: 'Legal document (contract)' },
  { pattern: /agreement/i, score: 40, reason: 'Legal document (agreement)' },
  { pattern: /\bnda\b/i, score: 45, reason: 'Legal document (NDA)' },
  { pattern: /passport/i, score: 45, reason: 'Identity document (passport)' },
  { pattern: /license/i, score: 30, reason: 'License document' },
  { pattern: /id[_-]?card/i, score: 40, reason: 'Identity document' },

  // ── Strong keep: credentials / career ──
  { pattern: /certificate/i, score: 45, reason: 'Certificate document' },
  { pattern: /diploma/i, score: 45, reason: 'Credential (diploma)' },
  { pattern: /degree/i, score: 40, reason: 'Credential (degree)' },
  { pattern: /resume/i, score: 40, reason: 'Career document (resume)' },
  { pattern: /\bcv\b/i, score: 40, reason: 'Career document (CV)' },
  { pattern: /cover[_-]?letter/i, score: 40, reason: 'Career document (cover letter)' },

  // ── Strong keep: travel ──
  { pattern: /ticket/i, score: 40, reason: 'Travel document (ticket)' },
  { pattern: /boarding/i, score: 40, reason: 'Travel document (boarding pass)' },
  { pattern: /itinerary/i, score: 40, reason: 'Travel document (itinerary)' },

  // ── Moderate keep ──
  { pattern: /backup/i, score: 25, reason: 'Backup file' },
  { pattern: /export/i, score: 20, reason: 'Data export' },
  { pattern: /report/i, score: 20, reason: 'Report document' },
  { pattern: /transcript/i, score: 30, reason: 'Transcript document' },
  { pattern: /signed/i, score: 35, reason: 'Signed document' },
  { pattern: /notarized/i, score: 40, reason: 'Notarized document' },
  { pattern: /certified/i, score: 35, reason: 'Certified document' },
  { pattern: /wallpaper/i, score: 15, reason: 'Wallpaper (intentional save)' },
  { pattern: /ebook|e-book/i, score: 25, reason: 'Ebook' },

  // ── Strong temporary ──
  { pattern: /setup/i, score: -40, reason: 'Installer (setup)' },
  { pattern: /install/i, score: -40, reason: 'Installer' },
  { pattern: /installer/i, score: -45, reason: 'Installer' },
  { pattern: /uninstall/i, score: -45, reason: 'Uninstaller' },
  { pattern: /update/i, score: -30, reason: 'Update/patch file' },
  { pattern: /patch/i, score: -30, reason: 'Patch file' },
  { pattern: /hotfix/i, score: -35, reason: 'Hotfix' },
  { pattern: /upgrade/i, score: -25, reason: 'Upgrade file' },

  // ── Moderate temporary ──
  { pattern: /trial/i, score: -25, reason: 'Trial software' },
  { pattern: /demo/i, score: -20, reason: 'Demo file' },
  { pattern: /sample/i, score: -15, reason: 'Sample file' },
  { pattern: /\btmp\b|\btemp\b/i, score: -30, reason: 'Temporary file' },
  { pattern: /cache/i, score: -25, reason: 'Cache file' },

  // ── Weak temporary ──
  { pattern: /screenshot/i, score: -10, reason: 'Screenshot (likely ephemeral)' },
  { pattern: /screen[_-]?capture/i, score: -10, reason: 'Screen capture' },
];

/**
 * Score a filename against all keyword rules
 * @param {string} filename
 * @returns {{ totalScore: number, matches: Array<{ score: number, reason: string }> }}
 */
export function scoreKeywords(filename) {
  if (!filename) return { totalScore: 0, matches: [] };

  const matches = [];
  let totalScore = 0;

  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(filename)) {
      matches.push({ score: rule.score, reason: rule.reason });
      totalScore += rule.score;
    }
  }

  return { totalScore, matches };
}
