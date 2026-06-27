/**
 * Storage schema documentation and factory functions.
 *
 * Record shape (keyed by Chrome download ID as string):
 * {
 *   id:              number   - Chrome download ID
 *   url:             string   - Original download URL
 *   referrer:        string   - Referrer URL
 *   filename:        string   - Just the filename
 *   fullPath:        string   - Full filesystem path
 *   extension:       string   - File extension with dot
 *   mime:            string   - MIME type
 *   fileSize:        number   - Bytes
 *   downloadTime:    string   - ISO 8601
 *
 *   label:           string   - 'keep' | 'temporary' | 'ambiguous'
 *   confidence:      number   - 0.0 to 1.0
 *   reasons:         string[] - Human-readable classification reasons
 *   autoClassified:  boolean  - true if engine classified, false if user overrode
 *   userOverrideTime: string|null - ISO 8601 if user changed label
 *
 *   expiresAt:       string|null - ISO 8601, null for 'keep' items
 *   status:          string   - 'active' | 'expiring' | 'archived'
 * }
 */

import { LABELS, STATUS, DEFAULTS } from '../shared/constants.js';
import { extractExtension } from '../shared/utils.js';

/**
 * Create a download record from a Chrome DownloadItem
 * @param {chrome.downloads.DownloadItem} item
 * @param {Object} classification - { label, confidence, reasons }
 * @param {number} expiryDays
 * @returns {Object}
 */
export function createRecord(item, classification, expiryDays) {
  const now = new Date().toISOString();
  const filename = (item.filename || '').split(/[/\\]/).pop();

  let expiresAt = null;
  if (classification.label !== LABELS.KEEP) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiryDays);
    expiresAt = expiry.toISOString();
  }

  return {
    id: item.id,
    url: item.url || '',
    referrer: item.referrer || '',
    filename,
    fullPath: item.filename || '',
    extension: filename ? extractExtension(filename) : '',
    mime: item.mime || '',
    fileSize: item.fileSize || 0,
    downloadTime: item.startTime || now,

    label: classification.label,
    confidence: classification.confidence,
    reasons: classification.reasons,
    autoClassified: true,
    userOverrideTime: null,

    expiresAt,
    status: STATUS.ACTIVE,
  };
}
