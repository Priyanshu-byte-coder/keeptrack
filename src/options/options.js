import { getSettings, saveSettings, getAllRecords, updateLabel } from '../storage/db.js';
import { formatDate } from '../shared/utils.js';

// ── DOM ──

const expiryDays = document.getElementById('expiry-days');
const archiveDays = document.getElementById('archive-days');
const notificationsEnabled = document.getElementById('notifications-enabled');
const weeklyReminder = document.getElementById('weekly-reminder');
const weeklyDay = document.getElementById('weekly-day');
const saveBtn = document.getElementById('save-btn');
const saveStatus = document.getElementById('save-status');
const rerunBtn = document.getElementById('rerun-btn');
const exportBtn = document.getElementById('export-btn');
const clearBtn = document.getElementById('clear-btn');

// Tag lists
const keepDomainsList = document.getElementById('keep-domains-list');
const keepExtensionsList = document.getElementById('keep-extensions-list');
const tempDomainsList = document.getElementById('temp-domains-list');
const tempExtensionsList = document.getElementById('temp-extensions-list');

// Add buttons
const addKeepDomain = document.getElementById('add-keep-domain');
const addKeepExt = document.getElementById('add-keep-ext');
const addTempDomain = document.getElementById('add-temp-domain');
const addTempExt = document.getElementById('add-temp-ext');

// Add inputs
const keepDomainInput = document.getElementById('keep-domain-input');
const keepExtInput = document.getElementById('keep-ext-input');
const tempDomainInput = document.getElementById('temp-domain-input');
const tempExtInput = document.getElementById('temp-ext-input');

// Current settings (mutable copy)
let current = {};

// ── Load ──

async function load() {
  current = await getSettings();

  expiryDays.value = String(current.expiryDays);
  archiveDays.value = String(current.archiveGraceDays);
  notificationsEnabled.checked = current.notificationsEnabled;
  weeklyReminder.checked = current.weeklyReminderEnabled;
  weeklyDay.value = String(current.weeklyReminderDay);

  renderTags(keepDomainsList, current.alwaysKeepDomains, 'alwaysKeepDomains');
  renderTags(keepExtensionsList, current.alwaysKeepExtensions, 'alwaysKeepExtensions');
  renderTags(tempDomainsList, current.alwaysTemporaryDomains, 'alwaysTemporaryDomains');
  renderTags(tempExtensionsList, current.alwaysTemporaryExtensions, 'alwaysTemporaryExtensions');
}

// ── Tags ──

function renderTags(container, list, settingKey) {
  container.innerHTML = '';
  for (const value of list) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${escapeHtml(value)} <span class="remove" data-key="${settingKey}" data-value="${escapeHtml(value)}">&times;</span>`;
    container.appendChild(tag);
  }

  // Attach remove handlers
  container.querySelectorAll('.remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const val = btn.dataset.value;
      current[key] = current[key].filter((v) => v !== val);
      renderTags(container, current[key], key);
    });
  });
}

function addTag(input, settingKey, container) {
  const value = input.value.trim().toLowerCase();
  if (!value) return;
  if (current[settingKey].includes(value)) {
    input.value = '';
    return;
  }
  current[settingKey].push(value);
  renderTags(container, current[settingKey], settingKey);
  input.value = '';
}

// ── Save ──

saveBtn.addEventListener('click', async () => {
  current.expiryDays = parseInt(expiryDays.value, 10);
  current.archiveGraceDays = parseInt(archiveDays.value, 10);
  current.notificationsEnabled = notificationsEnabled.checked;
  current.weeklyReminderEnabled = weeklyReminder.checked;
  current.weeklyReminderDay = parseInt(weeklyDay.value, 10);

  await saveSettings(current);
  saveStatus.textContent = 'Saved!';
  setTimeout(() => { saveStatus.textContent = ''; }, 2000);
});

// ── Add tag buttons ──

addKeepDomain.addEventListener('click', () => addTag(keepDomainInput, 'alwaysKeepDomains', keepDomainsList));
addKeepExt.addEventListener('click', () => addTag(keepExtInput, 'alwaysKeepExtensions', keepExtensionsList));
addTempDomain.addEventListener('click', () => addTag(tempDomainInput, 'alwaysTemporaryDomains', tempDomainsList));
addTempExt.addEventListener('click', () => addTag(tempExtInput, 'alwaysTemporaryExtensions', tempExtensionsList));

// Enter key on inputs
[keepDomainInput, keepExtInput, tempDomainInput, tempExtInput].forEach((input) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.nextElementSibling.click();
    }
  });
});

// ── Data Actions ──

rerunBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('src/onboarding/onboarding.html') });
});

exportBtn.addEventListener('click', async () => {
  const records = await getAllRecords();
  const settings = await getSettings();
  const exportData = { records, settings, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `keeptrack-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// ── Clean Up Now ──

const forceExpireBtn = document.getElementById('force-expire-btn');
forceExpireBtn.addEventListener('click', async () => {
  const records = await getAllRecords();
  const now = new Date();
  const pastExpiry = new Date(now.getTime() - 60000).toISOString();
  let count = 0;
  for (const [id, r] of Object.entries(records)) {
    if (r.label !== 'keep' && r.expiresAt) {
      const { updateRecord } = await import('../storage/db.js');
      await updateRecord(parseInt(id), { expiresAt: pastExpiry, status: 'expiring' });
      count++;
    }
  }
  saveStatus.textContent = `${count} file${count === 1 ? '' : 's'} ready to review in popup.`;
  setTimeout(() => { saveStatus.textContent = ''; }, 3000);

  if (count > 0) {
    chrome.notifications.create('keeptrack-cleanup', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
      title: 'KeepTrack: Clean Up Ready',
      message: `${count} file${count === 1 ? '' : 's'} ready to review. Click the KeepTrack icon in your toolbar.`,
      priority: 2,
    });
  }
});

clearBtn.addEventListener('click', async () => {
  if (!confirm('This will delete all KeepTrack records and reset settings. Are you sure?')) return;
  await chrome.storage.local.clear();
  current = await getSettings(); // re-init with defaults
  await load();
  saveStatus.textContent = 'All data cleared.';
  setTimeout(() => { saveStatus.textContent = ''; }, 2000);
});

// ── Downloads List ──

const downloadsList = document.getElementById('downloads-list');
const noDownloads = document.getElementById('no-downloads');
const searchInput = document.getElementById('search-downloads');
const filterLabel = document.getElementById('filter-label');

let allDownloads = [];

async function loadDownloads() {
  const records = await getAllRecords();
  allDownloads = Object.entries(records)
    .map(([id, r]) => ({ ...r, id: parseInt(id) }))
    .filter((r) => r.status !== 'cancelled')
    .sort((a, b) => new Date(b.downloadTime) - new Date(a.downloadTime));
  renderDownloads();
}

function renderDownloads() {
  const query = searchInput.value.trim().toLowerCase();
  const filter = filterLabel.value;

  let filtered = allDownloads;
  if (query) {
    filtered = filtered.filter((r) => r.filename.toLowerCase().includes(query));
  }
  if (filter !== 'all') {
    filtered = filtered.filter((r) => r.label === filter);
  }

  downloadsList.innerHTML = '';
  if (filtered.length === 0) {
    noDownloads.classList.remove('hidden');
    noDownloads.textContent = allDownloads.length === 0 ? 'No downloads tracked yet.' : 'No matches found.';
    return;
  }
  noDownloads.classList.add('hidden');

  for (const record of filtered) {
    downloadsList.appendChild(createDownloadItem(record));
  }
}

function createDownloadItem(record) {
  const item = document.createElement('div');
  item.className = 'download-item';

  const domain = record.url ? extractDomainDisplay(record.url) : 'unknown';
  const date = record.downloadTime ? formatDate(record.downloadTime) : '';

  item.innerHTML = `
    <div class="download-info">
      <div class="download-name" title="${escapeHtml(record.filename)}">${escapeHtml(record.filename)}</div>
      <div class="download-meta">${escapeHtml(domain)} · ${date}</div>
    </div>
    <div class="label-toggle">
      <button data-label="keep" class="${record.label === 'keep' ? 'active-keep' : ''}">Keep</button>
      <button data-label="temporary" class="${record.label === 'temporary' ? 'active-temporary' : ''}">Temp</button>
      <button data-label="ambiguous" class="${record.label === 'ambiguous' ? 'active-ambiguous' : ''}">Ambiguous</button>
    </div>
  `;

  item.querySelector('.label-toggle').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-label]');
    if (!btn) return;
    const newLabel = btn.dataset.label;
    if (newLabel === record.label) return;

    await updateLabel(record.id, newLabel);
    record.label = newLabel;

    // Update toggle buttons
    item.querySelectorAll('.label-toggle button').forEach((b) => {
      b.className = b.dataset.label === newLabel ? `active-${newLabel}` : '';
    });
  });

  return item;
}

function extractDomainDisplay(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

searchInput.addEventListener('input', renderDownloads);
filterLabel.addEventListener('change', renderDownloads);

// ── Helpers ──

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Init ──

load();
loadDownloads();
