import { classify } from '../rules/engine.js';
import { extractExtension, extractDomain, extractFilename } from '../shared/utils.js';
import { getSettings, markFirstRunComplete } from '../storage/db.js';
import { LABELS } from '../shared/constants.js';

const scanning = document.getElementById('scanning');
const resultsDiv = document.getElementById('results');
const resultsBody = document.getElementById('results-body');
const summary = document.getElementById('summary');
const activateBtn = document.getElementById('activate-btn');
const settingsBtn = document.getElementById('settings-btn');

async function runDryRun() {
  const settings = await getSettings();

  // Scan existing download history
  const items = await new Promise((resolve) => {
    chrome.downloads.search(
      { limit: 200, orderBy: ['-startTime'] },
      (results) => resolve(results || [])
    );
  });

  // Classify each
  let keepCount = 0;
  let tempCount = 0;
  let ambiguousCount = 0;
  const rows = [];

  for (const item of items) {
    if (!item.filename) continue;

    const filename = extractFilename(item.filename);
    const extension = extractExtension(item.filename);
    const download = {
      filename,
      extension,
      url: item.url || '',
      referrer: item.referrer || '',
      mime: item.mime || '',
    };

    const result = classify(download, settings);

    if (result.label === LABELS.KEEP) keepCount++;
    else if (result.label === LABELS.TEMPORARY) tempCount++;
    else ambiguousCount++;

    rows.push({ filename, result });
  }

  // Hide scanning, show results
  scanning.classList.add('hidden');
  resultsDiv.classList.remove('hidden');

  // Summary
  const total = items.length;
  summary.innerHTML = `
    Scanned <strong>${total}</strong> downloads:
    <span class="count keep">${keepCount} keep</span> ·
    <span class="count temporary">${tempCount} temporary</span> ·
    <span class="count ambiguous">${ambiguousCount} ambiguous</span>
  `;

  // Table rows
  for (const { filename, result } of rows) {
    const tr = document.createElement('tr');

    const labelIcon =
      result.label === LABELS.KEEP ? '&#10003;' :
      result.label === LABELS.TEMPORARY ? '&#128465;' : '&#9888;';

    tr.innerHTML = `
      <td class="filename-cell" title="${escapeHtml(filename)}">${escapeHtml(filename)}</td>
      <td class="label-cell label-${result.label}">${labelIcon} ${result.label}</td>
      <td class="confidence-cell">${Math.round(result.confidence * 100)}%</td>
      <td class="reasons-cell">${escapeHtml(result.reasons.slice(0, 2).join(', '))}</td>
    `;

    resultsBody.appendChild(tr);
  }

  if (rows.length === 0) {
    summary.innerHTML = 'No download history found. KeepTrack will start classifying new downloads once activated.';
  }
}

// ── Actions ──

activateBtn.addEventListener('click', async () => {
  await markFirstRunComplete();
  // Show confirmation briefly, then close
  activateBtn.textContent = 'Activated!';
  activateBtn.disabled = true;
  setTimeout(() => window.close(), 800);
});

settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// ── Helpers ──

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ── Init ──

runDryRun();
