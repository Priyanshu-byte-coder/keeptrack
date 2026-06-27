<p align="center">
  <img src="icons/logo.png" alt="KeepTrack" width="180">
</p>

<h1 align="center">KeepTrack</h1>

<p align="center">
  <strong>You download. We remember.</strong>
</p>

<p align="center">
  <img src="https://komarev.com/ghpvc/?username=Priyanshu-byte-coder&repo=keeptrack&label=views&color=43A047&style=flat-square" alt="Views">
  <img src="https://img.shields.io/github/downloads/Priyanshu-byte-coder/keeptrack/total?color=E53935&style=flat-square&label=downloads" alt="Downloads">
  <img src="https://img.shields.io/github/v/release/Priyanshu-byte-coder/keeptrack?color=43A047&style=flat-square" alt="Release">
  <img src="https://img.shields.io/github/license/Priyanshu-byte-coder/keeptrack?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/chrome-extension-yellow?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/telemetry-zero-brightgreen?style=flat-square" alt="Zero Telemetry">
</p>

<br>

<div align="center">
<table>
<tr>
<td align="center">
<br>
<a href="https://github.com/Priyanshu-byte-coder/keeptrack/releases/download/v1.1.0/keeptrack-v1.1.0.zip">
<img src="https://img.shields.io/badge/%E2%AC%87%EF%B8%8F_Download_KeepTrack-v1.1.0-E53935?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Download" height="45">
</a>
<br>
<br>
<sub><b>3 steps:</b> Download → Unzip → Load in Chrome. That's it.</sub>
<br>
<br>
</td>
</tr>
</table>
</div>

<br>

---

Every file you download makes sense in the moment. Two weeks later, your Downloads folder is 200 files deep and you can't remember which ones matter. **KeepTrack captures that "keep or toss" decision at the exact moment you download — when you actually know the answer.**

---

## How It Works

KeepTrack silently classifies every download as **keep**, **temporary**, or **ambiguous**:

| Signal | Keep | Temporary |
|--------|------|-----------|
| **File type** | `.pdf`, `.docx`, `.xlsx` | `.exe`, `.msi`, `.dmg`, `.torrent` |
| **Filename** | "invoice", "receipt", "contract", "resume" | "setup", "installer", "update", "patch" |
| **Source** | Bank sites, `.gov`, Gmail, Google Drive | Softonic, SourceForge, GitHub releases |

- **High confidence** → silent, no interruption
- **Ambiguous** → quick notification: tap "Keep" or "Temporary"
- **Once a week** → 30-second review of expiring files in the popup

**KeepTrack never deletes your files.** It labels, reminds, and lets you decide.

---

## Install

### Option 1: Direct Download (Recommended)

<a href="https://github.com/Priyanshu-byte-coder/keeptrack/releases/download/v1.1.0/keeptrack-v1.1.0.zip">
  <img src="https://img.shields.io/badge/%E2%AC%87%EF%B8%8F_Download_ZIP-E53935?style=for-the-badge" alt="Download ZIP" height="30">
</a>

1. **Download** the zip from the button above
2. **Unzip** to any folder
3. Open `chrome://extensions` → enable **Developer Mode**
4. Click **Load unpacked** → select the unzipped folder
5. Done!

### Option 2: Clone from Source

```bash
git clone https://github.com/Priyanshu-byte-coder/keeptrack.git
```
Then load unpacked from `chrome://extensions`.

---

## First Run

On install, KeepTrack opens a **dry-run preview** — it scans your existing download history and shows what it *would* classify each file as.

**Nothing is moved. Nothing is deleted. Nothing is touched.**

Click **Activate** when you're satisfied with the classifications.

---

## Who Is This For?

**Students** — Lecture slides and assignment PDFs auto-kept. Random installers flagged as temporary.

**Freelancers** — Invoices, contracts, and client files from email auto-kept. Zoom installers and temp attachments flagged for cleanup.

**Developers** — GitHub release binaries and IDE installers marked temporary. Documentation exports and data backups kept.

**Anyone with a messy Downloads folder** — Stop spending 30 minutes every month guessing which files matter.

---

## Privacy

- **Zero telemetry.** No data leaves your browser.
- **Zero network calls.** Works fully offline.
- **All data stays local.** Stored in `chrome.storage.local` on your machine.
- **Open source.** Read every line of code.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
