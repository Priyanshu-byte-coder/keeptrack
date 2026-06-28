# Changelog

All notable changes to KeepTrack are documented here. Format based on [Keep a Changelog](https://keepachangelog.com/).

## [1.2.0] - 2026-06-27
### Added
- **Delete expired files** — delete individual files or bulk-delete all expired files from the popup using `chrome.downloads.removeFile()`
- **All Downloads list** in Settings — view every tracked download with search, filter by label, and one-click label toggle (Keep / Temporary / Ambiguous)
- **Clean Up Now notification** — shows a notification prompting you to open the popup after cleanup

### Changed
- Larger logo sizes across popup, options, and onboarding pages
- Updated download links and badges to v1.2.0

## [1.1.0] - 2026-06-27
### Added
- **Clean Up Now** — skip the wait and mark all temporary files as expiring instantly from Settings
- File existence checking — popup shows "(file moved or deleted)" for missing files
- Dismiss button for files that no longer exist on disk

### Fixed
- Export filename now uses `keeptrack-export` instead of old name
- Clear data confirmation text corrected

### Changed
- Removed debug logging from service worker
- Version bump to 1.1.0

## [1.0.0] - 2026-06-27
### Added
- Download capture via Chrome downloads API
- Heuristic classification engine (extension, keyword, domain rules)
- Ambiguous download notifications with Keep/Temporary buttons
- Weekly triage popup view
- First-run dry-run onboarding
- Options page with custom rules and settings
- Data export (JSON)

[1.2.0]: https://github.com/Priyanshu-byte-coder/keeptrack/releases/tag/v1.2.0
[1.1.0]: https://github.com/Priyanshu-byte-coder/keeptrack/releases/tag/v1.1.0
[1.0.0]: https://github.com/Priyanshu-byte-coder/keeptrack/releases/tag/v1.0.0
