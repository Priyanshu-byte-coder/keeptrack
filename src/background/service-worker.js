import { LABELS, DEFAULTS, ALARM_NAMES, STORAGE_KEYS } from '../shared/constants.js';
import { extractExtension, extractDomain, extractFilename } from '../shared/utils.js';
import { createRecord } from '../storage/schema.js';
import { saveRecord, getRecord, updateRecord, updateLabel, getSettings, saveSettings, refreshStatuses, pruneOldRecords } from '../storage/db.js';
import { classify } from '../rules/engine.js';

// ── Install / Startup ──────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({
      [STORAGE_KEYS.SETTINGS]: { ...DEFAULTS, dryRunMode: true },
      [STORAGE_KEYS.FIRST_RUN]: false,
      [STORAGE_KEYS.RECORDS]: {},
    });

    chrome.alarms.create(ALARM_NAMES.WEEKLY_TRIAGE, {
      periodInMinutes: 10080,
    });

    chrome.tabs.create({ url: chrome.runtime.getURL('src/onboarding/onboarding.html') });
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const alarm = await chrome.alarms.get(ALARM_NAMES.WEEKLY_TRIAGE);
  if (!alarm) {
    chrome.alarms.create(ALARM_NAMES.WEEKLY_TRIAGE, { periodInMinutes: 10080 });
  }
  await updateBadge();
});

// ── Download Capture ────────────────────────────────────────────────

// onCreated: store a preliminary record with whatever info we have.
// Filename is often empty at this point, so we do a preliminary classify
// but the real classification happens in onChanged when download completes.
chrome.downloads.onCreated.addListener(async (item) => {
  const settings = await getSettings();

  const download = {
    filename: extractFilename(item.filename),
    extension: extractExtension(item.filename),
    url: item.url || '',
    referrer: item.referrer || '',
    mime: item.mime || '',
  };

  const result = classify(download, settings);
  const record = createRecord(item, result, settings.expiryDays);
  record._needsReclassify = true; // flag: re-classify when filename is final
  await saveRecord(record);
});

chrome.downloads.onChanged.addListener(async (delta) => {
  // Handle failed/cancelled downloads
  if (delta.state && delta.state.current === 'interrupted') {
    const record = await getRecord(delta.id);
    if (record) {
      await updateRecord(delta.id, { status: 'cancelled' });
    }
    return;
  }

  // Update filename if it changed
  if (delta.filename) {
    await updateRecord(delta.id, {
      filename: extractFilename(delta.filename.current),
      fullPath: delta.filename.current,
      extension: extractExtension(delta.filename.current),
    });
  }

  // When download completes: do the real classification with final filename
  if (delta.state && delta.state.current === 'complete') {
    const record = await getRecord(delta.id);
    if (!record) return;
    if (!record.autoClassified) return; // user already overrode

    // Get the finalized download info from Chrome
    const [item] = await chrome.downloads.search({ id: delta.id });
    if (!item) return;

    const settings = await getSettings();
    const finalFilename = extractFilename(item.filename);
    const finalExtension = extractExtension(item.filename);

    const download = {
      filename: finalFilename,
      extension: finalExtension,
      url: item.url || record.url,
      referrer: item.referrer || record.referrer,
      mime: item.mime || record.mime,
    };

    const result = classify(download, settings);
    console.log(`[KeepTrack] Classified "${finalFilename}" as ${result.label} (${Math.round(result.confidence * 100)}%) | reasons: ${result.reasons.join(', ')} | dryRun: ${settings.dryRunMode} | notif: ${settings.notificationsEnabled}`);

    let expiresAt = null;
    if (result.label !== LABELS.KEEP) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + settings.expiryDays);
      expiresAt = expiry.toISOString();
    }

    await updateRecord(delta.id, {
      filename: finalFilename,
      fullPath: item.filename,
      extension: finalExtension,
      fileSize: item.fileSize || 0,
      label: result.label,
      confidence: result.confidence,
      reasons: result.reasons,
      expiresAt,
      _needsReclassify: false,
    });

    // Notify for ambiguous downloads
    if (result.label === LABELS.AMBIGUOUS && settings.notificationsEnabled && !settings.dryRunMode) {
      console.log(`[KeepTrack] Sending notification for "${finalFilename}"`);
      const updated = await getRecord(delta.id);
      showClassificationNotification(updated);
    } else {
      console.log(`[KeepTrack] No notification: label=${result.label}, notifEnabled=${settings.notificationsEnabled}, dryRun=${settings.dryRunMode}`);
    }

    await updateBadge();
  }
});

// ── Notifications ───────────────────────────────────────────────────

function showClassificationNotification(record) {
  const confidencePercent = Math.round(record.confidence * 100);

  // Chrome on Windows may not support buttons — use requireInteraction instead
  chrome.notifications.create(`keeptrack-${record.id}`, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
    title: 'KeepTrack: New Download',
    message: `"${record.filename}" — ${record.label} (${confidencePercent}% sure). ${record.reasons.slice(0, 2).join(', ')}`,
    buttons: [
      { title: 'Keep Forever' },
      { title: 'Temporary' },
    ],
    priority: 2,
    requireInteraction: true,
  }, (notificationId) => {
    // If notification creation fails (buttons not supported), retry without buttons
    if (chrome.runtime.lastError) {
      console.log('Notification with buttons failed, retrying without:', chrome.runtime.lastError.message);
      chrome.notifications.create(`keeptrack-${record.id}`, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
        title: `KeepTrack: "${record.filename}"`,
        message: `Classified as ${record.label} (${confidencePercent}% sure). Open KeepTrack popup to change.`,
        priority: 2,
      });
    }
  });
}

chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (!notificationId.startsWith('keeptrack-')) return;
  const downloadId = parseInt(notificationId.replace('keeptrack-', ''), 10);

  if (buttonIndex === 0) {
    await updateLabel(downloadId, LABELS.KEEP);
  } else {
    await updateLabel(downloadId, LABELS.TEMPORARY);
  }

  chrome.notifications.clear(notificationId);
  await updateBadge();
});

// Also handle notification click (for button-less notifications on Windows)
chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (!notificationId.startsWith('keeptrack-')) return;
  // Open popup by focusing the browser — user can then use popup to decide
  chrome.notifications.clear(notificationId);
});

// ── Weekly Alarm ────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAMES.WEEKLY_TRIAGE) return;

  await pruneOldRecords();
  const expiringCount = await refreshStatuses();
  await updateBadge();

  if (expiringCount > 0) {
    chrome.notifications.create('keeptrack-weekly', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
      title: 'KeepTrack: Weekly Review',
      message: `${expiringCount} file${expiringCount === 1 ? '' : 's'} expiring soon. Click the Triage icon to review.`,
    });
  }
});

// ── Badge ───────────────────────────────────────────────────────────

async function updateBadge() {
  const count = await refreshStatuses();
  chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
  chrome.action.setBadgeBackgroundColor({ color: count > 0 ? '#e74c3c' : '#888' });
}

console.log('KeepTrack service worker loaded.');
