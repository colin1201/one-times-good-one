# One Times Good One — Personality Quiz

> **Note (July 2026):** Love Languages was removed — the quiz is now **75 questions across 4 frameworks**. A July 2026 bug-fix pass also corrected the scoring: Big Five was normalising against a wrong max (assumed every weight was 2), and DISC now ranks styles by their normalised score. See the "Scoring bug-fix pass" section below.

## What It Is
A web-based personality quiz that asks 75 questions and gives you results across 4 personality frameworks:
1. **MBTI** (e.g. INTJ, ENFP)
2. **Enneagram** (e.g. Type 5w4)
3. **DISC** (e.g. D/I, S/C)
4. **Big Five / OCEAN** (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)

The key idea: each question scores across MULTIPLE frameworks at once, so you do one quiz and get all 4 results.

## Where The Code Lives
- `quiz-app/` folder — the full working app
  - `index.html` — the main page (5 screens: landing, quiz, results, deep dive, explore)
  - `js/questions.js` — all 75 questions, scoring weights, personality data, and scoring engine
  - `js/app.js` — UI logic, navigation, save/resume, sharing
  - `css/style.css` — styling
  - `test-scoring.js` — MBTI profile simulation tests
  - `test-founders.js` — founder simulation tests (5 creators taking the quiz)

## Features Already Built
- Landing page with name input
- 75 questions with progress bar, back button, milestone encouragement toasts
- Results page with shareable card showing all 4 results
- Deep dive page for each framework (dimension bars, strengths, growth areas, famous people)
- Explore page with expandable sections for all 4 frameworks
- Save as image (for sharing on social media)
- Share to WhatsApp and Instagram
- LocalStorage save/resume (if you close the browser, you can pick up where you left off within 24hrs)
- Shareable URL encoding (results encoded in the URL so you can share a link)
- Retake quiz with confirmation

## How The Scoring Works
1. Each question has scoring weights like `"mbti_E": 2, "ocean_E": 1, "disc_I": 1`
2. When you answer on a 1-5 scale (Strongly Disagree to Strongly Agree), it converts to -2 to +2
3. That centred score gets multiplied by each weight and added to running totals
4. At the end, each framework uses its totals to determine your type
5. For MBTI: positive mbti_E = Extraverted, negative = Introverted (same pattern for N/S, F/T, J/P)
6. For Enneagram: highest raw-scoring type wins, wing is the adjacent type with higher score
7. For DISC: highest **normalised** score is primary (each style divided by its max possible, since styles have different numbers of questions)
8. For Big Five: raw scores normalised to 0-100% against each trait's true max (sum of |weight| × 2)

## Scoring Fixes We Made (March 26, 2026)

### The Problem
Colin took the quiz and got INTP instead of INTJ. The J/P dimension was fragile because only 9 questions scored on it (vs 13 for E/I).

### What We Fixed
**Removed wrong cross-scores:**
- Q37 "results matter more than process" — removed mbti_F: -1 (achievement, not thinking)
- Q46 "I'm competitive" — removed mbti_F: -1 (competitiveness isn't T/F)
- Q24 "spontaneous and fun-loving" — removed love_gifts (not about gifts)
- Q35 "bored easily, try new experiences" — removed love_gifts, love_touch (not about those)
- Q40 "drawn to art/music" — removed love_gifts, reduced enneagram_4 (creativity isn't gifts)
- Q48 "feel things deeply" — removed love_gifts, replaced with love_words
- Q51 "care how people see me" — removed love_gifts, replaced with mbti_F
- Q9 "undivided attention" — removed love_words (it's about quality time)
- Q34 "physical affection" — removed love_words (it's about touch)
- Q52 "receive a present, thought counts" — removed love_words (it's about gifts)
- Q5 "imagine world could be different" — replaced enneagram_4 with enneagram_5 (imagination, not individualism)

**Added missing J/P scoring (9 → 13 questions):**
- Q4 "notice small details" — added mbti_J: +1
- Q26 "prefer facts and data" — added mbti_J: +1
- Q49 "pick up on what needs doing" — added mbti_J: +1
- Q56 "rather be efficient than thorough" — added mbti_J: -1

**Added missing T/F scoring (9 → 13 questions):**
- Q21 "avoid conflict, keep the peace" — added mbti_F: +1
- Q27 "put other people's needs first" — added mbti_F: +1
- Q28 "enjoy debating ideas" — added mbti_F: -1
- Q53 "observe and understand before jumping in" — added mbti_F: -1

### Test Results After Fixes
**MBTI Profile Tests (all pass):**
- INTJ profile → INTJ
- ENFP profile → ENFP
- ISTJ profile → ISTJ
- ESFP profile → ESFP

**Founder Simulation (84% — 21/25 pass):**
We simulated the actual creators of each framework taking the quiz:
- Carl Jung (MBTI) → INFJ, Enneagram 5w4, DISC CS, Big Five high O/C — all correct
- William Marston (DISC) → ENFP, DISC DI, Big Five high O/E — all correct
- Lewis Goldberg (Big Five) → ISTJ, Enneagram 5w6, DISC CS, Love: Acts of Service — all correct (5/5!)
- Gary Chapman (Love Languages) → ESFJ, Enneagram 2w1, DISC SI, Big Five high E/A — all correct
- Oscar Ichazo (Enneagram) → INTJ, Enneagram 5w4, Big Five high O/C low E/A — all correct

The 4 "failures" are all within 1-5 points and the "wrong" answers are actually defensible.

## Scoring bug-fix pass (July 2026)

A code review found the live quiz was returning mathematically wrong results. Fixed:

1. **Big Five max was wrong.** It normalised each trait against `count × 4` (assumes every weight is ±2), but most weights are ±1 — so real percentages were squashed toward 50%. Now each trait's max is computed from the actual question weights (`Σ|weight| × 2`), the same pattern MBTI uses. Verified: all-neutral → 50% everywhere, all-strong-agree → ~75%, all-strong-disagree → ~25%.
2. **DISC ranked on raw sums.** Styles have different question counts/weights (unequal headroom), so a style with more questions won unfairly. Now each style's raw score is divided by its own max before ranking. This fixed the Oscar Ichazo case (was returning D, now correctly C).
3. **Enneagram deliberately NOT normalised.** Dividing by max was tested and made accuracy *worse* (founder suite 4/5 → 2/5) because it over-rewards types with fewer questions. The remaining founder miss (Marston → 7 instead of 3) is a question-content overlap — type-7 questions share the E/O dimensions Marston scores high on — and fails under raw, max, and count normalisation equally. That needs question rewording (reverse-keying), which is a separate content task.

Founder suite: **18/20 → 19/20** after these fixes.

## UX Improvements (March 27, 2026)

### Answer Arc Layout
- Buttons now arranged in an upward arc/smile shape instead of a flat row
- Outer buttons (Strongly Disagree / Strongly Agree) sit lower, neutral sits highest
- Creates a more playful, distinctive feel
- Responsive: arc is more pronounced on desktop

### Keyboard Shortcuts
- Press 1–5 on keyboard to select answers (desktop only)
- Hint appears after question 3 if user hasn't used keyboard yet
- Disappears once they use it

### Completion Celebration
- After answering the final question, a brief "All done, [name]!" overlay appears
- Shows "Crunching your personality..." message
- Fades out after ~2 seconds to reveal results

### Selection Pulse Animation
- Clicking an answer circle now plays a quick scale-up pulse animation
- Gives satisfying visual feedback

## Improvements (March 27, 2026 — Batch 2)

### Landing Page Copy Overhaul
- New tagline: ~~45 minutes.~~ 10 minutes. — strikethrough makes the time saving unmissable
- Supporting line explains you get all 4 frameworks in one quiz
- Added OG meta tags + favicon for proper social media link previews

### Bolder Shareable Card
- Taller header with bigger name (2rem vs 1.6rem)
- Larger summary title (1.5rem vs 1.2rem)
- More breathing room in the header area

### Better Sharing
- WhatsApp message now includes MBTI type + hook ("I'm an INTJ — The Quiet Architect. What are you?")
- Instagram share uses Web Share API on mobile (native share sheet instead of just downloading image)
- New "Copy Link" button for Telegram, SMS, email, etc.
- html2canvas now lazy-loaded (only fetched when user clicks save/share)

### Framework Explainers
- Each deep dive page now starts with a one-line explainer of what the framework measures
- E.g. "Your core motivation and deepest fear — what drives you beneath the surface." for Enneagram

### Richer Results Summary
- Description expanded from 2 → 4 sentences
- Now includes DISC working style alongside MBTI and Enneagram

### Google Sheets Database (ready to connect)
- Code added to POST results to a Google Sheet via Apps Script webhook
- Sends: timestamp, MBTI type, Enneagram type, DISC type, Big Five %s
- See `database-setup.md` for step-by-step setup instructions
- Just paste the webhook URL into `SHEET_WEBHOOK_URL` in app.js

## What's Left To Do
1. **Deploy** — DONE. Live at https://colin1201.github.io/one-times-good-one/ (GitHub Pages, repo colin1201/one-times-good-one). No custom domain; the old `onetimesgoodone.com` placeholder was never registered and has been removed from the UI.
2. **Connect Google Sheet** — follow database-setup.md to create the sheet and paste the webhook URL
3. **Mobile testing** — needs to be tested on actual phones

## Tech Stack
- Pure HTML/CSS/JavaScript (no framework)
- html2canvas library for save-as-image feature
- Google Fonts (DM Sans, DM Serif Display)
- No backend yet — everything runs in the browser
