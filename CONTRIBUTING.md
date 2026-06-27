# Contributing to KeepTrack

## Setup
1. Clone the repo
2. Open `chrome://extensions`, enable Developer Mode
3. Click "Load unpacked", select the repo root
4. Make changes — refresh the extension to reload

## Code Style
- Vanilla JS, ES2022+
- No build step, no bundler
- 2-space indentation
- `const` by default, descriptive names

## Adding Heuristic Rules
Rules live in `src/rules/`. To add a new rule:
1. Add to the appropriate file (`extension-rules.js`, `domain-rules.js`, or `keyword-rules.js`)
2. Add a test case in `tests/engine.test.html`
3. Test with "Load unpacked" in Chrome
4. Submit a PR explaining why this rule improves classification

## Filing Issues
Include:
- Chrome version
- A specific download that was misclassified
- What classification you expected vs what KeepTrack assigned

## Pull Requests
- One feature or fix per PR
- Keep it small and focused
- Update CHANGELOG.md
