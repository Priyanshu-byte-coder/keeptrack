# Changelog

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
