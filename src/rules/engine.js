import { LABELS } from '../shared/constants.js';
import { extractExtension, extractDomain } from '../shared/utils.js';
import { scoreExtension } from './extension-rules.js';
import { scoreKeywords } from './keyword-rules.js';
import { scoreDomains } from './domain-rules.js';

/**
 * Classify a download using score-based heuristic accumulation.
 *
 * @param {Object} download
 * @param {string} download.filename  - Just the filename
 * @param {string} download.extension - File extension with dot
 * @param {string} download.url       - Download URL
 * @param {string} download.referrer  - Referrer URL
 * @param {string} download.mime      - MIME type
 * @param {Object} settings           - User settings
 * @returns {{ label: string, confidence: number, reasons: string[] }}
 */
export function classify(download, settings = {}) {
  const { filename = '', extension = '', url = '', referrer = '' } = download;
  const ext = extension || extractExtension(filename);
  const urlDomain = extractDomain(url);
  const referrerDomain = extractDomain(referrer);

  let totalScore = 0;
  const reasons = [];

  // ── 1. User overrides (immediate return) ──

  if (settings.alwaysKeepDomains?.length) {
    const lowerUrl = urlDomain.toLowerCase();
    const lowerRef = referrerDomain.toLowerCase();
    for (const d of settings.alwaysKeepDomains) {
      if (lowerUrl.includes(d.toLowerCase()) || lowerRef.includes(d.toLowerCase())) {
        return { label: LABELS.KEEP, confidence: 1.0, reasons: [`User rule: always keep from ${d}`] };
      }
    }
  }

  if (settings.alwaysTemporaryDomains?.length) {
    const lowerUrl = urlDomain.toLowerCase();
    const lowerRef = referrerDomain.toLowerCase();
    for (const d of settings.alwaysTemporaryDomains) {
      if (lowerUrl.includes(d.toLowerCase()) || lowerRef.includes(d.toLowerCase())) {
        return { label: LABELS.TEMPORARY, confidence: 1.0, reasons: [`User rule: always temporary from ${d}`] };
      }
    }
  }

  if (settings.alwaysKeepExtensions?.length) {
    if (settings.alwaysKeepExtensions.includes(ext.toLowerCase())) {
      return { label: LABELS.KEEP, confidence: 1.0, reasons: [`User rule: always keep ${ext} files`] };
    }
  }

  if (settings.alwaysTemporaryExtensions?.length) {
    if (settings.alwaysTemporaryExtensions.includes(ext.toLowerCase())) {
      return { label: LABELS.TEMPORARY, confidence: 1.0, reasons: [`User rule: always temporary ${ext} files`] };
    }
  }

  // ── 2. Extension score ──

  const extResult = scoreExtension(ext);
  if (extResult) {
    totalScore += extResult.score;
    reasons.push(extResult.reason);
  }

  // ── 3. Keyword scores (they stack) ──

  const keywordResult = scoreKeywords(filename);
  totalScore += keywordResult.totalScore;
  for (const m of keywordResult.matches) {
    reasons.push(m.reason);
  }

  // ── 4. Domain score (highest magnitude match) ──

  const domainResult = scoreDomains(urlDomain, referrerDomain);
  if (domainResult) {
    totalScore += domainResult.score;
    reasons.push(domainResult.reason);
  }

  // ── 5. Clamp and map ──

  totalScore = Math.max(-100, Math.min(100, totalScore));

  const threshold = (settings.confidenceThreshold || 0.4) * 100;
  let label;
  if (totalScore >= threshold) {
    label = LABELS.KEEP;
  } else if (totalScore <= -threshold) {
    label = LABELS.TEMPORARY;
  } else {
    label = LABELS.AMBIGUOUS;
  }

  const confidence = Math.min(1.0, Math.abs(totalScore) / 100);

  if (reasons.length === 0) {
    reasons.push('No matching rules — classified by default');
  }

  return { label, confidence, reasons };
}
