export const LABELS = {
  KEEP: 'keep',
  TEMPORARY: 'temporary',
  AMBIGUOUS: 'ambiguous',
};

export const STATUS = {
  ACTIVE: 'active',
  EXPIRING: 'expiring',
  ARCHIVED: 'archived',
};

export const STORAGE_KEYS = {
  RECORDS: 'keeptrack_records',
  SETTINGS: 'keeptrack_settings',
  FIRST_RUN: 'keeptrack_first_run_complete',
};

export const DEFAULTS = {
  expiryDays: 14,
  archiveGraceDays: 7,
  confidenceThreshold: 0.4,
  notificationsEnabled: true,
  weeklyReminderEnabled: true,
  weeklyReminderDay: 0, // Sunday
  alwaysKeepDomains: [],
  alwaysKeepExtensions: [],
  alwaysTemporaryDomains: [],
  alwaysTemporaryExtensions: [],
  dryRunMode: false,
};

export const ALARM_NAMES = {
  WEEKLY_TRIAGE: 'keeptrack-weekly',
};

export const INTERVALS = {
  WEEKLY_MINUTES: 10080, // 7 days in minutes
};
