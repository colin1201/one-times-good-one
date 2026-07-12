# Personality Quiz — "One Times Good One"

Static web app: 75 questions scored across 4 frameworks at once (MBTI, Enneagram, DISC, Big Five). Live and still being tweaked (last edits Jul 2026). Full history + scoring rules in `what-we-built.md`; deployment/testing rules in `../CLAUDE.md`.

- **Live:** https://colin1201.github.io/one-times-good-one/
- **Repo:** `colin1201/one-times-good-one` (personal account — correct)
- **Results logging:** each completed quiz + analytics events hit a Google Apps Script GET webhook (URL in `js/app.js`) that appends to a Google Sheet

## Files

- `index.html` — the app shell (landing, quiz, results, deep dive, explore screens)
- `js/questions.js` — all 75 questions, scoring weights, personality data, scoring engine (`calculateResults`)
- `js/app.js` — UI logic, navigation, localStorage save/resume, sharing, webhook calls
- `css/style.css` — all styling
- `google-sheets-webhook.js` — Apps Script source for the results/analytics webhook. NOT run locally — pasted into the Sheet's Apps Script editor (setup steps in `database-setup.md`)
- `test-scoring.js` / `test-founders.js` / `test-stress.js` / `test-quiz-flow.js` — Node test suites (profile simulations, framework founders, 120+ stress profiles, full quiz-flow run). All local-only, no live writes
- `what-we-built.md` — project history, feature list, scoring bug-fix log
- `session-info.md` — stale notes from the original Mar 2026 build session (old paths)
- `compare-versions.html`, `preview-screens.html`, `results-card.html`, `wrapped-*.html`, `test-preview.html` — design previews/mockups, not part of the live app
- `og-image.png`, `favicon.svg` — assets

## How to run

- Tests: `node test-scoring.js`, `node test-founders.js`, `node test-stress.js`, `node test-quiz-flow.js` (run from this folder) — safe, read-only
- Local preview: serve over localhost (Playwright MCP blocks `file://` — see `../CLAUDE.md` for the one-liner server)
- Deploy: `git push` to `colin1201/one-times-good-one` master → GitHub Pages rebuilds (1-2 min). Bump `?v=N` cache-busters on script/link tags. This IS the live-write path — a push goes public

## Credentials

- None. The Apps Script webhook URL in `js/app.js` is a public "Access: Anyone" endpoint by design, not a secret. Everything runs under Colin's PERSONAL accounts
