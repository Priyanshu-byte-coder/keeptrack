import { LABELS, STATUS } from '../shared/constants.js';
import { formatDate, daysFromNow } from '../shared/utils.js';
import { getAllRecords, updateLabel, deleteRecord, getSettings } from '../storage/db.js';

// ── DOM Elements ──

const expiringList = document.getElementById('expiring-list');
const noExpiring = document.getElementById('no-expiring');
const recentList = document.getElementById('recent-list');
const expiringCount = document.getElementById('expiring-count');
const keptCount = document.getElementById('kept-count');
const tempCount = document.getElementById('temp-count');
const settingsBtn = document.getElementById('settings-btn');
const recentToggle = document.getElementById('recent-toggle');
const dryRunBanner = document.getElementById('dry-run-banner');
const activateLink = document.getElementById('activate-link');
const viewAllLink = document.getElementById('view-all');

// ── Render ──

async function render() {
  const records = await getAllRecords();
  const settings = await getSettings();
  const all = Object.values(records).filter((r) => r.status !== 'cancelled');

  // Show dry run banner if active
  if (settings.dryRunMode) {
    dryRunBanner.classList.remove('hidden');
  }

  // Compute stats
  const kept = all.filter((r) => r.label === LABELS.KEEP);
  const temp = all.filter((r) => r.label === LABELS.TEMPORARY || r.label === LABELS.AMBIGUOUS);
  const expiring = all.filter((r) => {
    if (r.label === LABELS.KEEP || !r.expiresAt) return false;
    if (r.status === STATUS.ARCHIVED) return false;
    const days = daysFromNow(r.expiresAt);
    return days <= 7 && days >= -7; // include recently expired for review
  }).sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));

  expiringCount.textContent = `${expiring.length} expiring`;
  keptCount.textContent = `${kept.length} kept`;
  tempCount.textContent = `${temp.length} temporary`;

  // Check file existence for expiring files
  for (const record of expiring) {
    const [item] = await new Promise((resolve) =>
      chrome.downloads.search({ id: record.id }, (results) => resolve(results || []))
    );
    record._fileGone = !item || !item.exists;
  }

  // Render expiring files
  expiringList.innerHTML = '';
  if (expiring.length === 0) {
    noExpiring.classList.remove('hidden');
  } else {
    noExpiring.classList.add('hidden');
    for (const record of expiring.slice(0, 20)) {
      expiringList.appendChild(createFileCard(record));
    }
  }

  // Render recent decisions (last 10, sorted by download time)
  const recent = all
    .filter((r) => r.label === LABELS.KEEP || r.label === LABELS.TEMPORARY)
    .sort((a, b) => new Date(b.downloadTime) - new Date(a.downloadTime))
    .slice(0, 10);

  recentList.innerHTML = '';
  for (const record of recent) {
    recentList.appendChild(createRecentItem(record));
  }
}

function createFileCard(record) {
  const card = document.createElement('div');
  card.className = 'file-card';

  const days = daysFromNow(record.expiresAt);
  const expiryText = days > 0 ? `expires ${formatDate(record.expiresAt)}` : 'expired';
  const domain = record.url ? extractDomainDisplay(record.url) : 'unknown source';

  card.innerHTML = `
    <div class="filename">${escapeHtml(record.filename)}${record._fileGone ? ' <span class="file-gone">(file moved or deleted)</span>' : ''}</div>
    <div class="meta">from: ${escapeHtml(domain)} · ${formatDate(record.downloadTime)} · ${expiryText}</div>
    <div class="actions">
      <button class="btn btn-keep" data-id="${record.id}" data-action="keep">Keep</button>
      <button class="btn btn-expire" data-id="${record.id}" data-action="expire">Let Expire</button>
      ${record._fileGone
        ? '<button class="btn btn-folder" data-id="' + record.id + '" data-action="dismiss">Dismiss</button>'
        : '<button class="btn btn-folder" data-id="' + record.id + '" data-action="show">Show in Folder</button>'
      }
    </div>
  `;

  card.addEventListener('click', handleAction);
  return card;
}

function createRecentItem(record) {
  const item = document.createElement('div');
  item.className = 'recent-item';

  const labelClass = `label-${record.label}`;
  const labelText = record.label;

  item.innerHTML = `
    <span class="filename">${escapeHtml(record.filename)}</span>
    <span class="label-badge ${labelClass}">${labelText}</span>
  `;
  return item;
}

// ── Actions ──

async function handleAction(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const id = parseInt(btn.dataset.id, 10);
  const action = btn.dataset.action;

  if (action === 'keep') {
    await updateLabel(id, LABELS.KEEP);
    await render();
  } else if (action === 'expire') {
    await render();
  } else if (action === 'show') {
    // Check if file still exists before trying to show
    const [item] = await new Promise((resolve) =>
      chrome.downloads.search({ id }, (results) => resolve(results || []))
    );
    if (item && item.exists) {
      chrome.downloads.show(id);
    } else {
      btn.textContent = 'File not found';
      btn.disabled = true;
    }
  } else if (action === 'dismiss') {
    await deleteRecord(id);
    await render();
  }
}

// ── Event Listeners ──

settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

recentToggle.addEventListener('click', () => {
  const list = document.getElementById('recent-list');
  const isHidden = list.style.display === 'none';
  list.style.display = isHidden ? '' : 'none';
  recentToggle.textContent = isHidden ? 'Recent Decisions ▾' : 'Recent Decisions ▸';
});

activateLink?.addEventListener('click', async (e) => {
  e.preventDefault();
  const { markFirstRunComplete } = await import('../storage/db.js');
  await markFirstRunComplete();
  dryRunBanner.classList.add('hidden');
});

viewAllLink?.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL('src/options/options.html') });
});

// ── Helpers ──

function extractDomainDisplay(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Init ──

render();
