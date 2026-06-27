/**
 * Extract file extension from filename, including compound extensions like .tar.gz
 * @param {string} filename
 * @returns {string} lowercase extension with dot, e.g. ".pdf", ".tar.gz"
 */
export function extractExtension(filename) {
  if (!filename) return '';
  const name = filename.split(/[/\\]/).pop();
  const compoundMatch = name.match(/(\.\w+\.\w+)$/);
  if (compoundMatch) {
    const compound = compoundMatch[1].toLowerCase();
    const knownCompound = ['.tar.gz', '.tar.bz2', '.tar.xz', '.tar.zst'];
    if (knownCompound.includes(compound)) return compound;
  }
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex <= 0) return '';
  return name.slice(dotIndex).toLowerCase();
}

/**
 * Extract domain from URL
 * @param {string} url
 * @returns {string} domain, e.g. "bank.com"
 */
export function extractDomain(url) {
  if (!url) return '';
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Extract just the filename from a full path
 * @param {string} fullPath
 * @returns {string}
 */
export function extractFilename(fullPath) {
  if (!fullPath) return '';
  return fullPath.split(/[/\\]/).pop();
}

/**
 * Format ISO date to short readable form
 * @param {string} isoDate
 * @returns {string} e.g. "Jun 27"
 */
export function formatDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Days between two dates (positive = future)
 * @param {string} isoDate
 * @returns {number}
 */
export function daysFromNow(isoDate) {
  if (!isoDate) return Infinity;
  const diff = new Date(isoDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
