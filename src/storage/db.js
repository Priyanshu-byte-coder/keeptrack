import { STORAGE_KEYS, LABELS, STATUS, DEFAULTS } from '../shared/constants.js';

// --- Records ---

export async function saveRecord(record) {
  const data = await chrome.storage.local.get(STORAGE_KEYS.RECORDS);
  const records = data[STORAGE_KEYS.RECORDS] || {};
  records[String(record.id)] = record;
  await chrome.storage.local.set({ [STORAGE_KEYS.RECORDS]: records });
}

export async function getRecord(id) {
  const data = await chrome.storage.local.get(STORAGE_KEYS.RECORDS);
  const records = data[STORAGE_KEYS.RECORDS] || {};
  return records[String(id)] || null;
}

export async function getAllRecords() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.RECORDS);
  return data[STORAGE_KEYS.RECORDS] || {};
}

export async function updateRecord(id, updates) {
  const data = await chrome.storage.local.get(STORAGE_KEYS.RECORDS);
  const records = data[STORAGE_KEYS.RECORDS] || {};
  const key = String(id);
  if (!records[key]) return null;
  records[key] = { ...records[key], ...updates };
  await chrome.storage.local.set({ [STORAGE_KEYS.RECORDS]: records });
  return records[key];
}

export async function deleteRecord(id) {
  const data = await chrome.storage.local.get(STORAGE_KEYS.RECORDS);
  const records = data[STORAGE_KEYS.RECORDS] || {};
  delete records[String(id)];
  await chrome.storage.local.set({ [STORAGE_KEYS.RECORDS]: records });
}

export async function updateLabel(id, newLabel) {
  const updates = {
    label: newLabel,
    autoClassified: false,
    userOverrideTime: new Date().toISOString(),
  };
  if (newLabel === LABELS.KEEP) {
    updates.expiresAt = null;
    updates.status = STATUS.ACTIVE;
  }
  return updateRecord(id, updates);
}

/**
 * Get records expiring within N days
 */
export async function getExpiringRecords(withinDays = 7) {
  const records = await getAllRecords();
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);

  return Object.values(records).filter((r) => {
    if (r.label === LABELS.KEEP) return false;
    if (!r.expiresAt) return false;
    const expiry = new Date(r.expiresAt);
    return expiry <= cutoff && expiry >= now && r.status !== STATUS.ARCHIVED;
  });
}

/**
 * Transition records: active→expiring→archived based on dates
 * Returns count of expiring records for badge
 */
export async function refreshStatuses() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.RECORDS);
  const records = data[STORAGE_KEYS.RECORDS] || {};
  const settings = await getSettings();
  const now = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  let expiringCount = 0;
  let changed = false;

  for (const key of Object.keys(records)) {
    const r = records[key];
    if (r.label === LABELS.KEEP || !r.expiresAt) continue;

    const expiry = new Date(r.expiresAt);
    const archiveDate = new Date(r.expiresAt);
    archiveDate.setDate(archiveDate.getDate() + settings.archiveGraceDays);

    if (now >= archiveDate && r.status !== STATUS.ARCHIVED) {
      records[key].status = STATUS.ARCHIVED;
      changed = true;
    } else if (expiry <= weekFromNow && now < archiveDate && r.status !== STATUS.EXPIRING) {
      records[key].status = STATUS.EXPIRING;
      changed = true;
    }

    if (r.status === STATUS.EXPIRING || (expiry <= weekFromNow && now < archiveDate)) {
      expiringCount++;
    }
  }

  if (changed) {
    await chrome.storage.local.set({ [STORAGE_KEYS.RECORDS]: records });
  }
  return expiringCount;
}

/**
 * Remove records archived for more than 90 days
 */
export async function pruneOldRecords() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.RECORDS);
  const records = data[STORAGE_KEYS.RECORDS] || {};
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  let changed = false;

  for (const key of Object.keys(records)) {
    const r = records[key];
    if (r.status === STATUS.ARCHIVED && r.expiresAt && new Date(r.expiresAt) < cutoff) {
      delete records[key];
      changed = true;
    }
  }

  if (changed) {
    await chrome.storage.local.set({ [STORAGE_KEYS.RECORDS]: records });
  }
}

// --- Settings ---

export async function getSettings() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULTS, ...(data[STORAGE_KEYS.SETTINGS] || {}) };
}

export async function saveSettings(settings) {
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

// --- First Run ---

export async function isFirstRun() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.FIRST_RUN);
  return !data[STORAGE_KEYS.FIRST_RUN];
}

export async function markFirstRunComplete() {
  await chrome.storage.local.set({ [STORAGE_KEYS.FIRST_RUN]: true });
  const settings = await getSettings();
  settings.dryRunMode = false;
  await saveSettings(settings);
}
