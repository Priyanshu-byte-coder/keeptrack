/**
 * Source domain patterns → score.
 * Matched against download URL domain and referrer domain.
 * Takes highest matching score (not both) to avoid double-counting.
 */
export const DOMAIN_RULES = [
  // ── Financial — strong keep ──
  { pattern: /bank/i, score: 40, reason: 'Financial institution' },
  { pattern: /chase\.com/i, score: 40, reason: 'Chase Bank' },
  { pattern: /wellsfargo\.com/i, score: 40, reason: 'Wells Fargo' },
  { pattern: /capitalone\.com/i, score: 40, reason: 'Capital One' },
  { pattern: /amex\.com|americanexpress\.com/i, score: 40, reason: 'American Express' },
  { pattern: /paypal\.com/i, score: 35, reason: 'PayPal' },
  { pattern: /venmo\.com/i, score: 35, reason: 'Venmo' },
  { pattern: /wise\.com/i, score: 35, reason: 'Wise' },
  { pattern: /stripe\.com/i, score: 35, reason: 'Stripe' },
  { pattern: /razorpay\.com/i, score: 35, reason: 'Razorpay' },

  // ── Government — strong keep ──
  { pattern: /\.gov$/i, score: 40, reason: 'Government domain (.gov)' },
  { pattern: /\.gov\./i, score: 40, reason: 'Government domain' },

  // ── Education — moderate keep ──
  { pattern: /\.edu$/i, score: 20, reason: 'Educational institution (.edu)' },
  { pattern: /\.edu\./i, score: 20, reason: 'Educational institution' },
  { pattern: /\.ac\./i, score: 20, reason: 'Academic institution' },
  { pattern: /coursera\.com/i, score: 15, reason: 'Coursera' },
  { pattern: /udemy\.com/i, score: 15, reason: 'Udemy' },
  { pattern: /edx\.org/i, score: 15, reason: 'edX' },
  { pattern: /canvas/i, score: 15, reason: 'Canvas LMS' },

  // ── Email — moderate keep (attachments tend to be important) ──
  { pattern: /mail\.google\.com/i, score: 20, reason: 'Gmail attachment' },
  { pattern: /outlook\.live\.com|outlook\.office/i, score: 20, reason: 'Outlook attachment' },
  { pattern: /yahoo\.com\/mail/i, score: 15, reason: 'Yahoo Mail attachment' },

  // ── Cloud storage — moderate keep ──
  { pattern: /drive\.google\.com/i, score: 20, reason: 'Google Drive download' },
  { pattern: /dropbox\.com/i, score: 20, reason: 'Dropbox download' },
  { pattern: /onedrive\.live\.com/i, score: 20, reason: 'OneDrive download' },
  { pattern: /icloud\.com/i, score: 18, reason: 'iCloud download' },
  { pattern: /box\.com/i, score: 18, reason: 'Box download' },

  // ── Software distribution — strong temporary ──
  { pattern: /sourceforge\.net/i, score: -40, reason: 'Software download site (SourceForge)' },
  { pattern: /filehippo\.com/i, score: -40, reason: 'Software download site (FileHippo)' },
  { pattern: /softonic\.com/i, score: -40, reason: 'Software download site (Softonic)' },
  { pattern: /download\.cnet\.com/i, score: -35, reason: 'Software download site (CNET)' },
  { pattern: /ninite\.com/i, score: -30, reason: 'Installer aggregator (Ninite)' },
  { pattern: /filezilla-project\.org/i, score: -25, reason: 'Software project site' },

  // ── GitHub releases — moderate temporary ──
  { pattern: /github\.com.*\/releases/i, score: -25, reason: 'GitHub release download' },
  { pattern: /github\.com.*\.exe/i, score: -30, reason: 'GitHub executable download' },
  { pattern: /objects\.githubusercontent\.com/i, score: -15, reason: 'GitHub download' },

  // ── Package managers — moderate temporary ──
  { pattern: /npmjs\.com/i, score: -20, reason: 'npm package' },
  { pattern: /pypi\.org/i, score: -20, reason: 'PyPI package' },

  // ── CDN — neutral (no signal) ──
  { pattern: /cdn\./i, score: 0, reason: 'CDN (no signal)' },
  { pattern: /cloudfront\.net/i, score: 0, reason: 'CloudFront CDN' },
  { pattern: /akamai/i, score: 0, reason: 'Akamai CDN' },
  { pattern: /fastly/i, score: 0, reason: 'Fastly CDN' },
];

/**
 * Score a domain against all domain rules. Returns best (highest magnitude) match.
 * @param {string} domain
 * @returns {{ score: number, reason: string }|null}
 */
function scoreSingleDomain(domain) {
  if (!domain) return null;

  let bestMatch = null;
  let bestMagnitude = 0;

  for (const rule of DOMAIN_RULES) {
    if (rule.pattern.test(domain)) {
      const magnitude = Math.abs(rule.score);
      if (magnitude > bestMagnitude) {
        bestMagnitude = magnitude;
        bestMatch = { score: rule.score, reason: rule.reason };
      }
    }
  }

  return bestMatch;
}

/**
 * Score download URL and referrer domains. Takes the highest-magnitude match.
 * @param {string} urlDomain - domain from download URL
 * @param {string} referrerDomain - domain from referrer
 * @returns {{ score: number, reason: string }|null}
 */
export function scoreDomains(urlDomain, referrerDomain) {
  const urlResult = scoreSingleDomain(urlDomain);
  const refResult = scoreSingleDomain(referrerDomain);

  if (!urlResult && !refResult) return null;
  if (!urlResult) return refResult;
  if (!refResult) return urlResult;

  // Return highest magnitude match
  return Math.abs(urlResult.score) >= Math.abs(refResult.score) ? urlResult : refResult;
}
