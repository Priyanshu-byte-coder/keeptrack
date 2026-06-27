# KeepTrack

A Chrome extension that captures your download intent at the moment you download — when you actually know whether it's a keeper or one-time-use.

## The Problem

Your Downloads folder is a graveyard. When you finally clean it up, you can't remember which files were important and which were one-time-use. The information you needed — "should I keep this?" — was obvious when you downloaded it and is gone by cleanup day.

## How It Works

KeepTrack classifies every download as **keep**, **temporary**, or **ambiguous** using smart rules based on:

- **File type** — `.exe`/`.dmg` → temporary, `.pdf` → depends on content
- **Filename keywords** — "invoice", "receipt", "certificate" → keep; "setup", "installer" → temporary
- **Source website** — bank sites → keep, software download sites → temporary

High-confidence decisions happen silently. Ambiguous ones get a quick notification. Once a week, review expiring files in 30 seconds.

**KeepTrack never deletes files.** It labels, reminds, and lets you decide.

---

## Use Cases

### Students
Lecture slides, assignment PDFs, and course materials auto-classified as keep. Random installers and one-off downloads flagged as temporary.

### Freelancers / Remote Workers
Invoices, contracts, and client files from email/drive automatically kept. Zoom installers, temp attachments flagged for cleanup.

### Developers
GitHub release binaries, IDE installers, SDK packages marked temporary. Documentation exports and data backups kept.

### Anyone with a messy Downloads folder
Stop spending 30 minutes every month guessing which files matter. KeepTrack remembers so you don't have to.

---

## Install

### From Source (Developer Mode)
1. Clone this repo
   ```bash
   git clone https://github.com/Priyanshu-byte-coder/keeptrack.git
   ```
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** → select the `keeptrack` folder
5. Done — KeepTrack starts working on your next download

---

## First Run

On install, KeepTrack opens a **dry-run preview** — it scans your existing download history and shows what it *would* classify each file as. Nothing is moved or deleted. Click **Activate** when you're satisfied.

## Privacy

- **Zero telemetry.** No data leaves your browser. Ever.
- **Zero network calls.** Fully offline.
- **All data in `chrome.storage.local`.** Stays on your machine.
- **Open source.** Read every line.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
