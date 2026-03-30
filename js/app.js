/**
 * One Times Good One — Quiz App Logic
 */

(function () {
  'use strict';


  // ===== STATE =====
  const state = {
    userName: '',
    firstName: '',
    lastName: '',
    questions: [],
    currentIndex: 0,
    highWaterMark: 0,  // #6: track furthest question for progress bar
    answers: [],
    results: null,
    summary: null,
    currentDeepDive: 0,
    goingBack: false,
    halfwayShown: false, // #9: only show nudge once
    inputLocked: false,  // #3: prevent double-tap
    milestonesShown: {}  // track which milestone toasts have been shown
  };

  const FRAMEWORK_ORDER = ['mbti', 'enneagram', 'disc', 'bigFive'];
  const FRAMEWORK_LABELS = {
    mbti: 'MBTI', enneagram: 'Enneagram', disc: 'DISC',
    bigFive: 'Big Five'
  };
  const CARD_COLOURS = ['card-blue', 'card-pink', 'card-green', 'card-purple'];
  const MBTI_GROUPS = {
    INTJ: 'analyst', INTP: 'analyst', ENTJ: 'analyst', ENTP: 'analyst',
    INFJ: 'diplomat', INFP: 'diplomat', ENFJ: 'diplomat', ENFP: 'diplomat',
    ISTJ: 'sentinel', ISFJ: 'sentinel', ESTJ: 'sentinel', ESFJ: 'sentinel',
    ISTP: 'explorer', ISFP: 'explorer', ESTP: 'explorer', ESFP: 'explorer'
  };

  const STORAGE_KEY = 'otgo_progress';
  const SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwpmyPKLinf0FH8JRKmqbkd7LZR2LJg9Ho6VxGHCXpgoHZLss_i90PG1gueEwOSDK2OgA/exec';

  // ===== FUNNEL ANALYTICS =====
  const SESSION_ID = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const trackedEvents = {};
  function trackEvent(event) {
    if (!SHEET_WEBHOOK_URL || trackedEvents[event]) return;
    trackedEvents[event] = true;
    try {
      const params = new URLSearchParams({
        analytics: '1',
        sessionId: SESSION_ID,
        event: event,
        name: state.userName || '',
        timestamp: new Date().toISOString()
      });
      const img = new Image();
      img.src = SHEET_WEBHOOK_URL + '?' + params.toString();
    } catch (e) {}
  }

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const screens = {
    landing: $('#landing'),
    quiz: $('#quiz'),
    results: $('#results'),
    guide: $('#guide'),
    deepdive: $('#deepdive'),
    explore: $('#explore')
  };

  trackEvent('landed');

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    window.scrollTo(0, 0);
  }

  // ===== #1: NAME VALIDATION WITH ERROR MESSAGE =====
  function showError(input, msg) {
    input.style.borderColor = '#e8567f';
    let errEl = input.parentNode.querySelector('.input-error');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'input-error';
      input.parentNode.appendChild(errEl);
    }
    errEl.textContent = msg;
  }

  function clearError(input) {
    input.style.borderColor = '';
    const errEl = input.parentNode.querySelector('.input-error');
    if (errEl) errEl.remove();
  }

  $('#start-btn').addEventListener('click', () => {
    const firstName = $('#first-name-input').value.trim();
    const lastName = $('#last-name-input').value.trim();

    clearError($('#first-name-input'));
    clearError($('#last-name-input'));

    if (!firstName) {
      showError($('#first-name-input'), 'Please enter your first name');
      $('#first-name-input').focus();
      return;
    }
    if (!lastName) {
      showError($('#last-name-input'), 'Please enter your last name');
      $('#last-name-input').focus();
      return;
    }

    state.userName = firstName + ' ' + lastName;
    state.firstName = firstName;
    state.lastName = lastName;
    startQuiz();
  });

  $('#first-name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#last-name-input').focus();
  });
  $('#last-name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#start-btn').click();
  });
  $('#first-name-input').addEventListener('input', () => clearError($('#first-name-input')));
  $('#last-name-input').addEventListener('input', () => clearError($('#last-name-input')));

  // ===== QUIZ =====
  function startQuiz() {
    trackEvent('started');
    state.questions = shuffleArray([...(typeof QUESTIONS !== 'undefined' ? QUESTIONS : [])]);
    state.currentIndex = 0;
    state.highWaterMark = 0;
    state.answers = [];
    state.halfwayShown = false;

    if (state.questions.length === 0) {
      alert('Quiz questions could not be loaded. Please refresh and try again.');
      return;
    }

    saveProgress(); // #2
    showScreen('quiz');
    loadQuestion();
  }

  function loadQuestion() {
    const q = state.questions[state.currentIndex];
    const total = state.questions.length;
    const num = state.currentIndex + 1;

    // #6: track high water mark
    if (num > state.highWaterMark) state.highWaterMark = num;

    // Counter shows current position
    $('#question-counter').textContent = `${num} / ${total}`;

    // #6: progress bar uses high water mark
    const pct = (state.highWaterMark / total) * 100;
    const bar = $('#progress-bar');
    bar.style.width = pct + '%';
    bar.style.background = progressColour(pct / 100);

    // Question text with animation
    const area = $('#question-area');
    area.classList.remove('slide-in-left', 'slide-in-right');
    void area.offsetWidth;
    area.classList.add(state.goingBack ? 'slide-in-left' : 'slide-in-right');
    $('#question-text').textContent = q.text;

    // Framework milestone toasts
    const milestones = {
      15: { text: 'Your personality type is taking shape...', colour: 'var(--blue)' },
      30: { text: 'Your core motivation is getting clearer...', colour: 'var(--pink)' },
      45: { text: 'Your working style is emerging...', colour: 'var(--green)' },
      60: { text: 'Almost there — your full picture is forming...', colour: 'var(--purple)' }
    };
    if (milestones[num] && !state.milestonesShown[num]) {
      state.milestonesShown[num] = true;
      showMilestoneToast(milestones[num].text, milestones[num].colour);
    }

    // Legacy halfway nudge — hide it (replaced by milestones)
    const nudge = $('#halfway-nudge');
    nudge.classList.remove('visible');

    // Reset answer buttons
    $$('.answer-btn').forEach(btn => btn.classList.remove('selected'));

    // Highlight previous answer when going back
    if (state.goingBack) {
      const prevAnswer = state.answers.find(a => a.questionId === q.id);
      if (prevAnswer) {
        const prevBtn = document.querySelector(`.answer-btn[data-value="${prevAnswer.score}"]`);
        if (prevBtn) prevBtn.classList.add('selected');
      }
      state.goingBack = false;
    }

    // Show/hide back button
    const backBtn = $('#btn-back-question');
    if (state.currentIndex === 0) {
      backBtn.classList.add('hidden');
    } else {
      backBtn.classList.remove('hidden');
    }

    maybeShowKeyboardHint();
  }

  function progressColour(t) {
    const blue = [74, 108, 247], purple = [124, 92, 191], coral = [232, 86, 127];
    let r, g, b;
    if (t <= 0.5) {
      const p = t / 0.5;
      r = Math.round(blue[0] + (purple[0] - blue[0]) * p);
      g = Math.round(blue[1] + (purple[1] - blue[1]) * p);
      b = Math.round(blue[2] + (purple[2] - blue[2]) * p);
    } else {
      const p = (t - 0.5) / 0.5;
      r = Math.round(purple[0] + (coral[0] - purple[0]) * p);
      g = Math.round(purple[1] + (coral[1] - purple[1]) * p);
      b = Math.round(purple[2] + (coral[2] - purple[2]) * p);
    }
    return `rgb(${r},${g},${b})`;
  }

  // ===== MILESTONE TOASTS =====
  function showMilestoneToast(text, colour) {
    // Remove any existing toast
    const existing = document.querySelector('.milestone-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'milestone-toast';
    toast.innerHTML = `<span class="milestone-dot" style="background:${colour}"></span><span class="milestone-text">${text}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('visible'));
    });

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }

  // ===== DYNAMIC BACKGROUND TINT =====
  const GROUP_TINTS = {
    analyst:  [74, 108, 247],   // blue
    diplomat: [232, 86, 127],   // coral
    sentinel: [45, 155, 110],   // green
    explorer: [212, 145, 42]    // amber
  };

  function updateBackgroundTint() {
    if (!state.answers.length || state.answers.length < 8) return;

    // Calculate running MBTI scores to determine group
    let E = 0, N = 0, F = 0, T = 0;
    const allQ = typeof QUESTIONS !== 'undefined' ? QUESTIONS : [];
    state.answers.forEach(a => {
      const q = allQ.find(q => q.id === a.questionId);
      if (!q) return;
      const centred = a.score - 3;
      if (q.scoring.mbti_E) E += centred * q.scoring.mbti_E;
      if (q.scoring.mbti_N) N += centred * q.scoring.mbti_N;
      if (q.scoring.mbti_F) F += centred * q.scoring.mbti_F;
    });

    // Determine trending MBTI group
    const type = (E >= 0 ? 'E' : 'I') + (N >= 0 ? 'N' : 'S') + (F >= 0 ? 'F' : 'T') + 'J';
    const groups = {
      INTJ:'analyst',INTP:'analyst',ENTJ:'analyst',ENTP:'analyst',
      INFJ:'diplomat',INFP:'diplomat',ENFJ:'diplomat',ENFP:'diplomat',
      ISTJ:'sentinel',ISFJ:'sentinel',ESTJ:'sentinel',ESFJ:'sentinel',
      ISTP:'explorer',ISFP:'explorer',ESTP:'explorer',ESFP:'explorer'
    };
    const group = groups[type] || 'analyst';
    const tint = GROUP_TINTS[group];

    // Blend amount: 0 at Q8, max ~0.06 at Q60
    const progress = Math.min(1, (state.answers.length - 8) / 52);
    const blend = progress * 0.06;

    const base = [240, 238, 233]; // #f0eee9
    const r = Math.round(base[0] + (tint[0] - base[0]) * blend);
    const g = Math.round(base[1] + (tint[1] - base[1]) * blend);
    const b = Math.round(base[2] + (tint[2] - base[2]) * blend);

    screens.quiz.style.background = `rgb(${r},${g},${b})`;
  }

  // ===== ANSWER HANDLING with #3: double-tap lockout =====
  let advanceTimeout = null;

  $$('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // #3: block input during advance
      if (state.inputLocked) return;

      if (advanceTimeout) {
        clearTimeout(advanceTimeout);
        advanceTimeout = null;
      }

      const value = parseInt(btn.dataset.value, 10);
      const q = state.questions[state.currentIndex];

      $$('.answer-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      state.answers = state.answers.filter(a => a.questionId !== q.id);
      state.answers.push({ questionId: q.id, score: value });

      saveProgress(); // #2
      updateBackgroundTint(); // #8: shift background to personality colour

      // #3: lock input, advance, then unlock after new question loads
      state.inputLocked = true;
      advanceTimeout = setTimeout(() => {
        advanceTimeout = null;
        $$('.answer-btn').forEach(b => b.classList.remove('selected'));
        state.currentIndex++;
        // Funnel analytics at milestones (every ~20%)
        if (state.currentIndex === 8) trackEvent('q8');
        if (state.currentIndex === 15) trackEvent('q15');
        if (state.currentIndex === 30) trackEvent('q30');
        if (state.currentIndex === 45) trackEvent('q45');
        if (state.currentIndex === 60) trackEvent('q60');
        if (state.currentIndex >= state.questions.length) {
          clearProgress(); // #2: clear saved progress on completion
          state.inputLocked = false;
          finishQuiz();
        } else {
          loadQuestion();
          // Unlock after a brief delay so the new question is visible first
          setTimeout(() => { state.inputLocked = false; }, 200);
        }
      }, 250);
    });
  });

  // ===== KEYBOARD SHORTCUTS (1–5 keys and arrow keys) =====
  let keyboardUsed = false;
  document.addEventListener('keydown', (e) => {
    // Only work on quiz screen
    if (!screens.quiz.classList.contains('active')) return;
    if (state.inputLocked) return;

    // Number keys 1-5 to select answer
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= 5) {
      const btn = document.querySelector(`.answer-btn[data-value="${num}"]`);
      if (btn) btn.click();
      keyboardUsed = true;
      // Hide the hint once they've used it
      const hint = $('#keyboard-hint');
      if (hint) hint.classList.remove('visible');
      return;
    }
  });

  // Show keyboard hint after a few questions on desktop (if not already using keyboard)
  function maybeShowKeyboardHint() {
    if (!keyboardUsed && !('ontouchstart' in window) && state.currentIndex >= 3) {
      const hint = $('#keyboard-hint');
      if (hint) hint.classList.add('visible');
    }
  }

  // ===== BACK BUTTON =====
  $('#btn-back-question').addEventListener('click', () => {
    if (state.inputLocked) return;
    if (state.currentIndex > 0) {
      state.currentIndex--;
      state.goingBack = true;
      loadQuestion();
    }
  });

  // ===== #2: LOCALSTORAGE SAVE/RESUME =====
  function saveProgress() {
    try {
      const data = {
        userName: state.userName,
        firstName: state.firstName,
        lastName: state.lastName,
        questionIds: state.questions.map(q => q.id),
        currentIndex: state.currentIndex,
        highWaterMark: state.highWaterMark,
        answers: state.answers,
        halfwayShown: state.halfwayShown,
        savedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* localStorage unavailable */ }
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Expire after 24 hours
      if (Date.now() - data.savedAt > 24 * 60 * 60 * 1000) {
        clearProgress();
        return null;
      }
      return data;
    } catch (e) { return null; }
  }

  function clearProgress() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function resumeQuiz(saved) {
    state.userName = saved.userName;
    state.firstName = saved.firstName;
    state.lastName = saved.lastName;
    state.answers = saved.answers;
    state.highWaterMark = saved.highWaterMark;
    state.halfwayShown = saved.halfwayShown;
    state.currentIndex = saved.currentIndex;

    // Rebuild shuffled question order from saved IDs
    const allQ = typeof QUESTIONS !== 'undefined' ? QUESTIONS : [];
    state.questions = saved.questionIds.map(id => allQ.find(q => q.id === id)).filter(Boolean);

    showScreen('quiz');
    loadQuestion();
  }

  // ===== FINISH QUIZ =====
  function finishQuiz() {
    trackEvent('completed');
    if (typeof calculateResults === 'function') {
      state.results = calculateResults(state.answers);
    }
    if (typeof generateSummary === 'function' && state.results) {
      state.summary = generateSummary(state.results);
    }
    if (state.results && state.results.mbti) {
      state.summary = state.summary || {};
      state.summary.mbtiGroup = MBTI_GROUPS[state.results.mbti.type] || 'analyst';
    }

    // Save results to Google Sheet (if webhook is configured)
    sendResultsToSheet();

    // Reset quiz background tint
    screens.quiz.style.background = '';

    // Step 1: Brief "All done" overlay (1.5s)
    const overlay = document.createElement('div');
    overlay.className = 'quiz-complete-overlay';
    overlay.innerHTML = `
      <div>
        <div class="complete-text">All done, ${state.firstName}!</div>
        <div class="complete-subtext">Crunching your personality...</div>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
      // Prepare results while overlay is still fully visible
      renderResults();
      encodeResultsToURL();
      window.scrollTo(0, 0);

      // Switch screen and start reveal behind the overlay
      Object.values(screens).forEach(s => s.classList.remove('active'));
      screens.results.classList.add('active');

      const card = $('#shareable-card');
      card.classList.add('results-reveal');
      $$('#result-cards .result-card').forEach((el, i) => {
        el.classList.add('reveal-card-' + (i + 1));
      });

      // Small delay so reveal animations get going, then fade overlay
      requestAnimationFrame(() => {
        overlay.style.transition = 'opacity 0.6s ease';
        overlay.style.opacity = '0';
      });

      setTimeout(() => {
        overlay.remove();
        setTimeout(() => card.classList.remove('results-reveal'), 2000);
      }, 700);
    }, 1800);
  }

  // ===== GOOGLE SHEETS DATABASE =====
  // Replace this URL with your Google Apps Script web app URL after setup
  // See database-setup.md for instructions
  function sendResultsToSheet() {
    if (!SHEET_WEBHOOK_URL || !state.results) return;
    try {
      const r = state.results;
      const b5 = r.bigFive ? `O:${r.bigFive.O.percentage}% C:${r.bigFive.C.percentage}% E:${r.bigFive.E.percentage}% A:${r.bigFive.A.percentage}% N:${r.bigFive.N.percentage}%` : '';
      const params = new URLSearchParams({
        timestamp: new Date().toISOString(),
        name: state.userName || '',
        mbtiType: r.mbti ? r.mbti.type : '',
        enneagramType: r.enneagram ? r.enneagram.type + 'w' + r.enneagram.wing : '',
        discType: r.disc ? (r.disc.combo || r.disc.primary) : '',
        bigFive: b5
      });
      // Use image beacon — most reliable cross-origin method
      const img = new Image();
      img.src = SHEET_WEBHOOK_URL + '?' + params.toString();
    } catch (e) {}
  }

  // ===== DISPLAY HELPERS =====
  function getDisplayResult(fw) {
    const r = state.results[fw];
    if (!r) return null;

    switch (fw) {
      case 'mbti':
        return { type: r.type, title: r.title, description: r.description,
          strengths: r.strengths || [], growthAreas: r.weaknesses || [], famousPeople: r.famousPeople || [],
          expandable: [
            r.atWork ? { label: 'At Work', content: r.atWork } : null,
            r.inRelationships ? { label: 'In Relationships', content: r.inRelationships } : null,
            r.underStress ? { label: 'Under Stress', content: r.underStress } : null
          ].filter(Boolean) };
      case 'enneagram':
        return { type: 'Type ' + r.type + 'w' + r.wing, title: r.title,
          description: r.description + (r.wingDescription ? ' ' + r.wingDescription : ''),
          strengths: r.strengths || [], growthAreas: r.weaknesses || [], famousPeople: r.famousPeople || [],
          expandable: [
            r.coreMotivation ? { label: 'Core Motivation', content: r.coreMotivation } : null,
            r.coreFear ? { label: 'Core Fear', content: r.coreFear } : null,
            r.growthPath ? { label: 'Growth Path', content: r.growthPath } : null
          ].filter(Boolean) };
      case 'disc': {
        const primaryDiscData = (typeof PERSONALITY_DATA !== 'undefined' && PERSONALITY_DATA.disc[r.primary]) ? PERSONALITY_DATA.disc[r.primary] : {};
        return { type: r.combo || r.primary, title: r.title, description: r.description,
          strengths: r.strengths || [], growthAreas: r.weaknesses || [],
          famousPeople: r.famousPeople || (primaryDiscData.famousPeople || []),
          expandable: [
            primaryDiscData.communicationStyle ? { label: 'Communication Style', content: primaryDiscData.communicationStyle } : null,
            primaryDiscData.idealEnvironment ? { label: 'Ideal Environment', content: primaryDiscData.idealEnvironment } : null
          ].filter(Boolean) };
      }
      case 'bigFive': {
        const traitNames = { O: 'Openness', C: 'Conscientiousness', E: 'Extraversion', A: 'Agreeableness', N: 'Neuroticism' };
        const labels = Object.entries(r).map(([k, v]) => v.label).join(' · ');
        const descriptions = Object.entries(r).map(([k, v]) => `${traitNames[k]} (${v.percentage}%): ${v.description}`);
        const b5Expandable = [];
        if (typeof PERSONALITY_DATA !== 'undefined') {
          Object.entries(r).forEach(([k, v]) => {
            const traitData = PERSONALITY_DATA.bigFive[k];
            if (!traitData) return;
            const level = v.percentage >= 50 ? 'high' : 'low';
            const levelData = traitData[level];
            if (levelData && levelData.detail) {
              b5Expandable.push({ label: traitNames[k] + ': ' + levelData.label, content: levelData.detail });
            }
          });
        }
        return { type: 'Your Big Five', title: labels,
          description: descriptions.join('\n'),
          strengths: Object.entries(r).filter(([k, v]) => v.percentage >= 60).map(([k, v]) => `High ${traitNames[k]}: ${v.label}`),
          growthAreas: Object.entries(r).filter(([k, v]) => v.percentage <= 40).map(([k, v]) => `Low ${traitNames[k]}: ${v.label}`),
          famousPeople: [],
          expandable: b5Expandable };
      }
      default:
        return { type: '?', title: '?', description: '', strengths: [], growthAreas: [], famousPeople: [] };
    }
  }

  // ===== RENDER RESULTS =====
  function renderResults() {
    const { summary, userName } = state;

    $('#results-name').textContent = userName;
    const header = $('#results-header');
    header.className = 'results-header';
    header.classList.add('header-' + (summary.mbtiGroup || 'analyst'));

    $('#summary-label').textContent = '';
    $('#summary-title').textContent = summary.title || '';

    const descEl = $('#summary-description');
    descEl.innerHTML = '';
    const sentences = (summary.description || '').split(/(?<=\.)\s+/);
    sentences.forEach(sentence => {
      if (sentence.trim()) {
        const span = document.createElement('span');
        span.className = 'summary-sentence';
        span.textContent = sentence.trim();
        descEl.appendChild(span);
      }
    });

    const pillsContainer = $('#trait-pills');
    pillsContainer.innerHTML = '';
    (summary.traits || []).forEach(trait => {
      const span = document.createElement('span');
      span.className = 'trait-pill';
      span.textContent = trait;
      pillsContainer.appendChild(span);
    });

    const cardsContainer = $('#result-cards');
    cardsContainer.innerHTML = '';

    FRAMEWORK_ORDER.forEach((fw, i) => {
      const display = getDisplayResult(fw);
      if (!display) return;

      const card = document.createElement('div');
      card.className = `result-card ${CARD_COLOURS[i]} fade-in fade-in-delay-${i + 1}`;

      card.innerHTML = `
        <span class="card-colour-dot"></span>
        <div class="card-content">
          <div class="card-framework">${FRAMEWORK_LABELS[fw]}</div>
          <div class="card-type">${fw === 'bigFive' ? display.title : display.type + ' — ' + display.title}</div>
        </div>
        <span class="card-arrow">&#8250;</span>
      `;

      card.addEventListener('click', () => openDeepDive(i));
      cardsContainer.appendChild(card);
    });

  }

  // Story card removed — Instagram/WhatsApp now share the results card directly
  function renderStoryCard() {
    const { results, summary, userName } = state;
    if (!results) return;

    const group = (summary && summary.mbtiGroup) || 'analyst';

    // Set gradient background on the card
    const card = $('#story-card');
    const gradients = {
      analyst:  'linear-gradient(160deg, #1a2340 0%, #2d4a7a 40%, #4a6cf7 100%)',
      diplomat: 'linear-gradient(160deg, #3d1a2a 0%, #7a2d4a 40%, #e8567f 100%)',
      sentinel: 'linear-gradient(160deg, #1a3d2a 0%, #2d7a4a 40%, #2d9b6e 100%)',
      explorer: 'linear-gradient(160deg, #3d2a1a 0%, #7a5a2d 40%, #d49128 100%)'
    };
    card.style.background = gradients[group] || gradients.analyst;

    // Name
    $('#story-name').textContent = userName;

    // Creative title
    const storyTitle = document.getElementById('story-title');
    if (storyTitle) {
      storyTitle.textContent = summary ? summary.title : '';
    }

    // Build result lines
    const lines = [];

    if (results.mbti) {
      lines.push({ label: 'MBTI', value: results.mbti.type });
    }
    if (results.enneagram) {
      lines.push({ label: 'Enneagram', value: results.enneagram.type + 'w' + results.enneagram.wing });
    }
    if (results.disc) {
      lines.push({ label: 'DISC', value: results.disc.combo || results.disc.primary });
    }

    const resultsContainer = $('#story-results');
    resultsContainer.innerHTML =
      '<div class="story-results-grid">' +
      lines.map(l =>
        `<div class="story-result-cell">
          <span class="story-result-value">${l.value}</span>
          <span class="story-result-label">${l.label}</span>
        </div>`
      ).join('') +
      '</div>';

    // Big Five bars
    const bigFiveContainer = $('#story-bigfive');
    bigFiveContainer.innerHTML = '';
    if (results.bigFive) {
      const traitNames = { O: 'Openness', C: 'Conscientiousness', E: 'Extraversion', A: 'Agreeableness', N: 'Neuroticism' };
      bigFiveContainer.innerHTML = '<span class="story-result-label" style="display:block; margin-bottom:20px;">Big Five</span>' +
        ['O', 'C', 'E', 'A', 'N'].map(k => {
          const pct = results.bigFive[k].percentage;
          return `<div class="story-b5-row">
            <span class="story-b5-label">${traitNames[k]}</span>
            <div class="story-b5-track"><div class="story-b5-fill" style="width:${pct}%"></div></div>
            <span class="story-b5-pct">${pct}%</span>
          </div>`;
        }).join('');
    }
  }

  // ===== BAR HELPERS (data-width for animated reveal) =====
  function mbtiBar(posLetter, negLetter, pref) {
    const isPos = pref.letter === posLetter;
    const pct = Math.max(10, Math.min(90, 50 + (isPos ? pref.strength / 2 : -pref.strength / 2)));
    const names = { E: 'Extraverted', I: 'Introverted', N: 'Intuitive', S: 'Sensing', F: 'Feeling', T: 'Thinking', J: 'Judging', P: 'Perceiving' };
    return `<div class="dim-row">
      <span class="dim-label-mbti ${isPos ? 'dim-active' : ''}">${names[posLetter]}</span>
      <div class="dim-track"><div class="dim-fill" data-width="${pct}"></div></div>
      <span class="dim-label-mbti ${!isPos ? 'dim-active' : ''}">${names[negLetter]}</span>
      <span class="dim-pct">${Math.round(isPos ? pct : 100 - pct)}%</span>
    </div>`;
  }

  function oceanBar(letter, percentage) {
    const names = { O: 'Openness', C: 'Conscientiousness', E: 'Extraversion', A: 'Agreeableness', N: 'Neuroticism' };
    return `<div class="dim-row"><span class="dim-label">${names[letter]}</span><div class="dim-track"><div class="dim-fill" data-width="${percentage}"></div></div><span class="dim-pct">${percentage}%</span></div>`;
  }

  function discBar(letter, score, maxScore) {
    const pct = Math.max(5, Math.round((score + maxScore) / (2 * maxScore) * 100));
    const names = { D: 'Dominance', I: 'Influence', S: 'Steadiness', C: 'Conscientiousness' };
    return `<div class="dim-row"><span class="dim-label">${names[letter]}</span><div class="dim-track"><div class="dim-fill" data-width="${pct}"></div></div><span class="dim-pct">${pct}%</span></div>`;
  }

  // Animate bars from 0 to their target width
  function animateBars(container) {
    const fills = container.querySelectorAll('.dim-fill[data-width]');
    fills.forEach((fill, idx) => {
      fill.style.width = '0%';
      setTimeout(() => {
        fill.style.width = fill.dataset.width + '%';
      }, 100 + idx * 80);
    });
  }

  // ===== DEEP DIVE =====
  const DEEPDIVE_COLOURS = ['deepdive-blue', 'deepdive-pink', 'deepdive-green', 'deepdive-purple'];
  const BAR_COLOURS = ['bars-blue', 'bars-pink', 'bars-green', 'bars-purple'];
  const DOT_ACCENT_COLOURS = ['var(--blue)', 'var(--pink)', 'var(--green)', 'var(--purple)'];

  function openDeepDive(frameworkIndex) {
    state.currentDeepDive = frameworkIndex;
    renderDeepDive();
    showScreen('deepdive');
  }

  const FRAMEWORK_EXPLAINERS = {
    mbti: 'How you perceive the world and make decisions — the most popular personality system worldwide.',
    enneagram: 'Your core motivation and deepest fear — what drives you beneath the surface.',
    disc: 'Your working and communication style — how you show up in teams and under pressure.',
    bigFive: 'The scientific gold standard — five traits measured on a spectrum, not as types.'
  };

  function renderDeepDive() {
    const i = state.currentDeepDive;
    const fw = FRAMEWORK_ORDER[i];
    const display = getDisplayResult(fw);

    // Coloured header
    const header = $('#deepdive-header');
    header.className = 'deepdive-header ' + DEEPDIVE_COLOURS[i];

    $('#deepdive-framework').textContent = FRAMEWORK_LABELS[fw];
    $('#deepdive-type').textContent = display.type;
    $('#deepdive-title').textContent = display.title;

    // Framework explainer
    const descEl = $('#deepdive-description');
    descEl.innerHTML = '';
    if (FRAMEWORK_EXPLAINERS[fw]) {
      const explainer = document.createElement('p');
      explainer.textContent = FRAMEWORK_EXPLAINERS[fw];
      explainer.style.cssText = 'font-style:italic; color:var(--text-muted); margin-bottom:16px; font-size:0.88rem;';
      descEl.appendChild(explainer);
    }

    // Split description into one sentence/section per line
    const rawDesc = display.description.replace(/\*\*/g, '');
    const blocks = rawDesc.split('\n').filter(b => b.trim());
    blocks.forEach(block => {
      const sentences = block.split(/(?<=\.)\s+/);
      sentences.forEach(sentence => {
        if (sentence.trim()) {
          const p = document.createElement('p');
          p.textContent = sentence.trim();
          p.style.marginBottom = '10px';
          descEl.appendChild(p);
        }
      });
    });

    const barsContainer = $('#deepdive-bars');
    barsContainer.className = 'deepdive-bars dimension-bars ' + BAR_COLOURS[i];
    barsContainer.innerHTML = '';
    let barsHTML = '';

    if (fw === 'mbti' && state.results.mbti.preferences) {
      const prefs = state.results.mbti.preferences;
      barsHTML = `${mbtiBar('E', 'I', prefs.EI)}${mbtiBar('N', 'S', prefs.NS)}${mbtiBar('F', 'T', prefs.FT)}${mbtiBar('J', 'P', prefs.JP)}`;
    } else if (fw === 'bigFive') {
      const r = state.results.bigFive;
      barsHTML = `${oceanBar('O', r.O.percentage)}${oceanBar('C', r.C.percentage)}${oceanBar('E', r.E.percentage)}${oceanBar('A', r.A.percentage)}${oceanBar('N', r.N.percentage)}`;
    } else if (fw === 'disc') {
      const scores = state.results.disc.allScores;
      const maxDisc = Math.max(Math.abs(scores.D), Math.abs(scores.I), Math.abs(scores.S), Math.abs(scores.C), 1);
      barsHTML = `${discBar('D', scores.D, maxDisc)}${discBar('I', scores.I, maxDisc)}${discBar('S', scores.S, maxDisc)}${discBar('C', scores.C, maxDisc)}`;
    } else if (fw === 'enneagram' && state.results.enneagram.allScores) {
      const ennNames = { 1: 'Reformer', 2: 'Helper', 3: 'Achiever', 4: 'Individualist', 5: 'Investigator', 6: 'Loyalist', 7: 'Enthusiast', 8: 'Challenger', 9: 'Peacemaker' };
      const top3 = state.results.enneagram.allScores.slice(0, 3);
      const maxE = Math.max(top3[0].score, 1);
      barsHTML = top3.map(t => { const pct = Math.max(5, Math.round(t.score / maxE * 100)); return `<div class="dim-row"><span class="dim-label">${t.type}: ${ennNames[t.type] || ''}</span><div class="dim-track"><div class="dim-fill" data-width="${pct}"></div></div><span class="dim-pct">${pct}%</span></div>`; }).join('');
    }

    barsContainer.innerHTML = barsHTML;
    animateBars(barsContainer);

    // Hide the static sections (now rendered as dropdowns)
    const staticSections = $$('.deepdive-section');
    staticSections.forEach(s => s.style.display = 'none');

    // Build all dropdown sections
    const expandableContainer = $('#deepdive-expandable');
    expandableContainer.innerHTML = '';

    const allSections = [];

    // Strengths
    if (display.strengths.length) {
      allSections.push({ label: 'Strengths', content: '<ul>' + display.strengths.map(s => `<li>${s}</li>`).join('') + '</ul>' });
    }

    // Growth Areas
    if (display.growthAreas.length) {
      allSections.push({ label: 'Growth Areas', content: '<ul>' + display.growthAreas.map(g => `<li>${g}</li>`).join('') + '</ul>' });
    }

    // Famous People
    if (display.famousPeople.length) {
      allSections.push({ label: 'Famous People Like You', content: '<ul>' + display.famousPeople.map(f => `<li>${f}</li>`).join('') + '</ul>' });
    }

    // Framework-specific expandable sections
    if (display.expandable && display.expandable.length) {
      display.expandable.forEach(section => {
        // Split content into one paragraph per sentence
        const sentences = section.content.split(/(?<=\.)\s+/).filter(s => s.trim());
        const html = sentences.map(s => `<p>${s.trim()}</p>`).join('');
        allSections.push({ label: section.label, content: html });
      });
    }

    allSections.forEach(section => {
      const dropdown = document.createElement('div');
      dropdown.className = 'deepdive-dropdown';
      dropdown.innerHTML = `
        <div class="deepdive-dropdown-header">
          <h3>${section.label}</h3>
          <span class="dropdown-arrow">\u25BE</span>
        </div>
        <div class="deepdive-dropdown-body">
          ${section.content}
        </div>
      `;
      dropdown.querySelector('.deepdive-dropdown-header').addEventListener('click', () => {
        dropdown.classList.toggle('open');
      });
      expandableContainer.appendChild(dropdown);
    });

    // Next framework teaser
    const teaserContainer = $('#deepdive-next-teaser');
    teaserContainer.innerHTML = '';
    if (i < FRAMEWORK_ORDER.length - 1) {
      const nextI = i + 1;
      const nextFw = FRAMEWORK_ORDER[nextI];
      const nextDisplay = getDisplayResult(nextFw);
      if (nextDisplay) {
        const teaser = document.createElement('div');
        teaser.className = 'deepdive-next-teaser';
        teaser.innerHTML = `
          <span class="teaser-dot" style="background:${DOT_ACCENT_COLOURS[nextI]}"></span>
          <div class="teaser-content">
            <div class="teaser-label">Next: ${FRAMEWORK_LABELS[nextFw]}</div>
            <div class="teaser-title">${nextDisplay.type}${nextDisplay.title ? ' — ' + nextDisplay.title : ''}</div>
          </div>
          <span class="teaser-arrow">&#8250;</span>
        `;
        teaser.addEventListener('click', () => {
          state.currentDeepDive = nextI;
          renderDeepDive();
          window.scrollTo(0, 0);
        });
        teaserContainer.appendChild(teaser);
      }
    }

    // Keep old nav buttons as hidden fallback
    $('#btn-prev-framework').style.visibility = i > 0 ? 'visible' : 'hidden';
    $('#btn-next-framework').style.visibility = i < FRAMEWORK_ORDER.length - 1 ? 'visible' : 'hidden';
  }

  $('#btn-prev-framework').addEventListener('click', () => {
    if (state.currentDeepDive > 0) { state.currentDeepDive--; renderDeepDive(); window.scrollTo(0, 0); }
  });
  $('#btn-next-framework').addEventListener('click', () => {
    if (state.currentDeepDive < FRAMEWORK_ORDER.length - 1) { state.currentDeepDive++; renderDeepDive(); window.scrollTo(0, 0); }
  });

  $('#btn-back-results').addEventListener('click', () => showScreen('results'));
  $('#btn-see-all-results').addEventListener('click', () => showScreen('results'));

  // ===== EXPLORE =====
  function renderExplore() {
    const container = $('#explore-sections');
    container.innerHTML = '';

    FRAMEWORK_ORDER.forEach((fw, i) => {
      const display = getDisplayResult(fw);
      if (!display) return;

      const section = document.createElement('div');
      section.className = 'explore-section';

      section.innerHTML = `
        <div class="explore-section-header">
          <span class="explore-dot dot-${['blue','pink','green','purple','amber'][i]}"></span>
          <div class="explore-section-info">
            <div class="explore-framework-name">${FRAMEWORK_LABELS[fw]}</div>
            <div class="explore-result-name">${display.type} — ${display.title}</div>
          </div>
          <span class="explore-toggle">&#9660;</span>
        </div>
        <div class="explore-section-body">
          <div class="explore-section-content">
            <p>${display.description.replace(/\*\*/g, '')}</p>
            <button class="explore-deepdive-btn" data-index="${i}">See full deep dive &rarr;</button>
          </div>
        </div>
      `;

      section.querySelector('.explore-section-header').addEventListener('click', () => section.classList.toggle('open'));
      section.querySelector('.explore-deepdive-btn').addEventListener('click', (e) => {
        e.stopPropagation(); openDeepDive(parseInt(e.target.dataset.index, 10));
      });

      container.appendChild(section);
    });
  }

  $('#btn-explore').addEventListener('click', () => { renderExplore(); showScreen('explore'); });
  $('#btn-back-results-explore').addEventListener('click', () => showScreen('results'));
  $('#btn-back-to-results-bottom').addEventListener('click', () => showScreen('results'));

  // ===== PERSONALITY GUIDE =====
  $('#btn-guide').addEventListener('click', () => { renderGuide(); showScreen('guide'); });
  $('#btn-back-guide').addEventListener('click', () => showScreen('results'));
  $('#btn-guide-to-results').addEventListener('click', () => showScreen('results'));

  function renderGuide() {
    const r = state.results;
    const s = state.summary;
    if (!r) return;

    const mbtiType = r.mbti.type;
    const ennType = r.enneagram.type;
    const ennWing = r.enneagram.wing;
    const discPrimary = r.disc.primary;
    const discCombo = r.disc.combo || r.disc.primary;
    const bf = r.bigFive;

    // Header
    const group = (s && s.mbtiGroup) || 'analyst';
    const header = $('#guide-header');
    header.className = 'guide-header header-' + group;
    $('#guide-title').textContent = s ? s.title : 'People Like You';

    // Combo line
    const highTraits = ['O','C','E','A','N'].filter(t => bf[t].percentage >= 55).map(t => bf[t].label);
    $('#guide-combo').textContent = mbtiType + ' \u00B7 Type ' + ennType + 'w' + ennWing + ' \u00B7 ' + discCombo + ' \u00B7 ' + highTraits.join(', ');

    // Build guide sections
    const sections = generatePersonalityGuide(mbtiType, ennType, ennWing, discPrimary, bf);
    const body = $('#guide-body');
    body.innerHTML = '';

    sections.forEach(section => {
      const el = document.createElement('div');
      el.className = 'guide-section';
      el.innerHTML = '<h2 class="guide-section-title">' + section.title + '</h2>' +
        section.paragraphs.map(p => '<p class="guide-section-text">' + p + '</p>').join('');
      body.appendChild(el);
    });
  }

  function generatePersonalityGuide(mbti, enn, wing, disc, bf) {
    const isE = mbti[0] === 'E';
    const isN = mbti[1] === 'N';
    const isF = mbti[2] === 'F';
    const isJ = mbti[3] === 'J';
    const highO = bf.O.percentage >= 55;
    const highC = bf.C.percentage >= 55;
    const highA = bf.A.percentage >= 55;
    const highN = bf.N.percentage >= 55;
    const lowA = bf.A.percentage < 45;
    const lowN = bf.N.percentage < 45;

    const sections = [];

    // === WHO YOU ARE ===
    const whoYouAre = [];
    if (isE && isF) {
      whoYouAre.push('You lead with warmth. People feel seen and valued around you because you genuinely care about their experience, and you have the social energy to act on it.');
    } else if (isE && !isF) {
      whoYouAre.push('You lead with confidence. People are drawn to your decisiveness and energy. You move fast, think clearly, and bring others along through sheer force of presence.');
    } else if (!isE && isF) {
      whoYouAre.push('You lead with depth. You may not be the loudest voice, but the people closest to you know you care more than most. Your emotional intelligence runs deep.');
    } else {
      whoYouAre.push('You lead with competence. You think before you speak, plan before you act, and deliver results that speak for themselves. People learn to trust your judgement.');
    }

    if (enn === 2 || enn === 9) {
      whoYouAre.push('At your core, you want harmony. Whether you achieve it by helping others (Type ' + enn + ') or by keeping the peace, your instinct is to make sure everyone is OK before you think about yourself.');
    } else if (enn === 3 || enn === 8) {
      whoYouAre.push('At your core, you want impact. You are not content to sit on the sidelines. Whether through achievement or sheer force of will, you need to leave a mark.');
    } else if (enn === 4 || enn === 5) {
      whoYouAre.push('At your core, you want understanding. The surface level is never enough for you. You dig deeper, think harder, and feel more than most people realise.');
    } else if (enn === 1) {
      whoYouAre.push('At your core, you want things to be right. Not just good enough \u2014 right. You hold yourself to standards that most people don\'t even notice exist, and that inner critic is both your superpower and your burden.');
    } else if (enn === 6) {
      whoYouAre.push('At your core, you want security. Not because you are afraid, but because you are the one who thinks three steps ahead. You are the person who asks "what if?" when everyone else is already celebrating.');
    } else {
      whoYouAre.push('At your core, you want freedom and possibility. Routine is your enemy. You chase new experiences, new ideas, new connections \u2014 and you bring infectious energy to everything you do.');
    }

    sections.push({ title: 'Who You Are', paragraphs: whoYouAre });

    // === AT YOUR BEST ===
    const atBest = [];
    if (isE && highA) {
      atBest.push('At your best, you are the glue that holds groups together. You create warmth wherever you go and make people feel like they belong. Your social energy combined with genuine care is a rare and powerful combination.');
    } else if (isE && lowA) {
      atBest.push('At your best, you are a force of nature. You walk into a room and things start happening. Your directness cuts through noise, and your energy is contagious. People follow you because you make the complex feel simple.');
    } else if (!isE && highO) {
      atBest.push('At your best, you see what others miss. Your rich inner world and openness to ideas means you connect dots that nobody else is looking at. When you share your insights, people are often stunned by the depth.');
    } else if (!isE && highC) {
      atBest.push('At your best, you are the person everyone relies on. You think things through, follow through on commitments, and produce work that is consistently excellent. Your quiet competence earns deep trust.');
    } else {
      atBest.push('At your best, you bring a balanced perspective that few people can match. You can see multiple sides of a situation, weigh them carefully, and arrive at a thoughtful conclusion.');
    }

    if (disc === 'D' || disc === 'I') {
      atBest.push('Your ' + (disc === 'D' ? 'Dominant' : 'Influential') + ' working style means you thrive when there is momentum. You push things forward and bring others along. Stagnation is your enemy \u2014 progress is your fuel.');
    } else {
      atBest.push('Your ' + (disc === 'S' ? 'Steady' : 'Conscientious') + ' working style means you bring reliability that others count on. You don\'t chase flashy wins \u2014 you build things that last.');
    }

    sections.push({ title: 'At Your Best', paragraphs: atBest });

    // === YOUR BLIND SPOTS ===
    const blindSpots = [];
    if (enn === 2) {
      blindSpots.push('You give so much that you forget to check if anyone is giving back. Your need to be needed can become a trap \u2014 you start keeping score, even if you won\'t admit it. The question you avoid asking is: "What do I actually need?"');
    } else if (enn === 1) {
      blindSpots.push('Your inner critic never sleeps. The standards you hold yourself to are often invisible to others, but they exhaust you. You can come across as rigid or judgemental when really you are just frustrated that the world does not meet the bar you set for yourself.');
    } else if (enn === 3) {
      blindSpots.push('You are so focused on achievement that you sometimes lose touch with what you actually want versus what looks impressive. Slowing down feels like falling behind. Your challenge is learning that your worth is not your resume.');
    } else if (enn === 4) {
      blindSpots.push('You feel things so deeply that ordinary life can feel flat. You chase intensity and authenticity, which is beautiful \u2014 but it can make you dismiss good things because they do not feel dramatic enough.');
    } else if (enn === 5) {
      blindSpots.push('You retreat into your mind when the world gets too much. Knowledge feels safer than vulnerability. Your challenge is stepping out of the observatory and into the arena \u2014 engaging with life, not just analysing it.');
    } else if (enn === 6) {
      blindSpots.push('You see threats that others miss, which makes you prepared \u2014 but also anxious. You can get stuck in worst-case thinking and mistake caution for wisdom. Sometimes the brave move is to trust that things will be OK.');
    } else if (enn === 7) {
      blindSpots.push('You are brilliant at starting things and terrible at sitting with discomfort. When things get boring, hard, or painful, your instinct is to pivot to something new. Real depth comes from staying, not sprinting.');
    } else if (enn === 8) {
      blindSpots.push('You equate vulnerability with weakness, so you armour up. People see your strength but rarely see the full you. Your challenge is letting people in \u2014 not just the ones you protect, but the ones who could protect you.');
    } else {
      blindSpots.push('You avoid conflict so well that people sometimes don\'t know what you actually think. You merge with others\' preferences to keep the peace, but over time you lose track of your own desires. Your voice matters \u2014 use it.');
    }

    if (isF && lowN) {
      blindSpots.push('You are emotionally attuned but rarely rattled. This makes you a calming presence, but it can also mean you underestimate how much something is affecting you until it builds up.');
    } else if (!isF && highN) {
      blindSpots.push('You think logically but feel intensely beneath the surface. Others may not realise how much stress you carry because you process it internally. Finding an outlet \u2014 exercise, journaling, a trusted friend \u2014 is essential.');
    }

    sections.push({ title: 'Your Blind Spots', paragraphs: blindSpots });

    // === AT WORK ===
    const atWork = [];
    if (disc === 'D') {
      atWork.push('You are results-driven and direct. In meetings, you are the one who says "OK, so what are we actually doing about this?" You have little patience for politics or process for its own sake.');
    } else if (disc === 'I') {
      atWork.push('You are the spark in any team. You motivate, persuade, and build momentum through enthusiasm. You are best in roles where you can influence, present, and connect with people.');
    } else if (disc === 'S') {
      atWork.push('You are the steady hand. You bring consistency, reliability, and calm to any team. You may not be the flashiest contributor, but things fall apart when you are not there.');
    } else {
      atWork.push('You are the quality control. You catch what others miss, set high standards, and take pride in getting things right. You are best in roles where precision and thoroughness are valued.');
    }

    if (isJ) {
      atWork.push('You prefer structure. Deadlines, clear expectations, and defined processes bring out your best work. Ambiguity drains you \u2014 clarity fuels you.');
    } else {
      atWork.push('You prefer flexibility. Too much structure feels suffocating. You do your best work when you have room to adapt, improvise, and follow your instincts.');
    }

    if (isN) {
      atWork.push('You think in big pictures and future possibilities. You are the one who sees where things are heading before others do. Strategy and vision are your natural strengths.');
    } else {
      atWork.push('You think in practical, concrete terms. You are the one who turns ideas into action. While others are still theorising, you are already building.');
    }

    sections.push({ title: 'At Work', paragraphs: atWork });

    // === IN RELATIONSHIPS ===
    const inRel = [];
    if (isE && isF) {
      inRel.push('You love openly and generously. Your friends and partner know exactly where they stand with you because you tell them \u2014 often. You show up for people with your whole self.');
    } else if (isE && !isF) {
      inRel.push('You show love through action, not words. You are fiercely loyal and will go to bat for the people you care about. But you can be impatient with emotional processing \u2014 you want to fix the problem, not sit with it.');
    } else if (!isE && isF) {
      inRel.push('You love deeply but quietly. The people closest to you get a version of you that the rest of the world never sees. You need a partner who earns that trust and respects your need for space.');
    } else {
      inRel.push('You show love through reliability and competence \u2014 showing up, keeping promises, building something solid together. You may not say "I love you" often, but your actions speak volumes.');
    }

    if (highA) {
      inRel.push('You are naturally warm and accommodating. You go out of your way to make people comfortable. The risk is over-accommodating \u2014 saying yes when you mean no, and building resentment quietly.');
    } else if (lowA) {
      inRel.push('You are honest and direct in relationships \u2014 sometimes uncomfortably so. You would rather have a hard conversation now than let things fester. Not everyone appreciates this, but the people who do become your closest allies.');
    }

    sections.push({ title: 'In Relationships', paragraphs: inRel });

    // === UNDER PRESSURE ===
    const pressure = [];
    if (highN) {
      pressure.push('Stress hits you hard. You feel the weight of things more than most people, and you can spiral into worry or self-doubt when the pressure is on. Your sensitivity is a strength in calm times and a vulnerability in storms.');
    } else if (lowN) {
      pressure.push('You are remarkably calm under fire. While others panic, you stay level-headed and focused. This makes you the person people turn to in a crisis \u2014 but it can also mean you suppress real stress until it catches up with you.');
    } else {
      pressure.push('Under pressure, you hold steady but feel the strain. You are neither unflappable nor easily overwhelmed \u2014 you have a realistic awareness of the stakes without letting them paralyse you.');
    }

    if (enn === 1 || enn === 6) {
      pressure.push('Your stress response is to tighten control. You make lists, double-check, prepare for every scenario. This is effective up to a point, but past that point it becomes anxiety wearing a productivity mask.');
    } else if (enn === 7 || enn === 3) {
      pressure.push('Your stress response is to speed up. You take on more, move faster, and keep busy. It feels productive but it is often avoidance in disguise \u2014 you are outrunning the discomfort instead of facing it.');
    } else if (enn === 2 || enn === 9) {
      pressure.push('Your stress response is to focus on others. When things get hard, you pour your energy into helping someone else \u2014 which feels selfless but is sometimes a way to avoid dealing with your own pain.');
    } else if (enn === 4 || enn === 5) {
      pressure.push('Your stress response is to withdraw. You pull inward, away from people and noise, to process what is happening. This protects your energy but can leave the people around you feeling shut out.');
    } else {
      pressure.push('Your stress response is to take charge. You become more forceful, more direct, and less patient. This gets things done in a crisis but can damage relationships if you are not careful.');
    }

    sections.push({ title: 'Under Pressure', paragraphs: pressure });

    // === WHAT MAKES YOUR COMBINATION RARE ===
    const rare = [];
    // Look for interesting combos
    if (isE && (enn === 5 || enn === 4)) {
      rare.push('Your combination is unusual. Most Type ' + enn + 's are introverted, but you bring an extroverted energy to a personality driven by depth and introspection. You are the rare person who can work a room AND have a existential conversation in the corner.');
    } else if (!isE && (enn === 3 || enn === 7 || enn === 8)) {
      rare.push('Your combination is uncommon. Type ' + enn + 's are typically high-energy and outward-facing, but you channel that drive inward. You are ambitious and driven, but you do not need an audience. Your intensity runs quiet.');
    } else if (isF && disc === 'D') {
      rare.push('You are a Feeling type with a Dominant working style \u2014 which means you push hard for results but genuinely care about the people involved. This gives you a leadership style that is both effective and human. People follow you because they trust you, not because they fear you.');
    } else if (!isF && highA) {
      rare.push('You think with logic but act with warmth. Your decisions are rational, but the way you treat people is generous and kind. This makes you unusually effective \u2014 people get the best of both worlds.');
    } else if (isJ && enn === 7) {
      rare.push('You crave structure AND adventure, which creates an interesting internal tension. You plan your spontaneity. You want freedom but also want to know the plan. This push-pull makes you adaptable in ways that pure J or pure 7 types cannot be.');
    } else {
      rare.push('Your specific combination of ' + mbti + ', Enneagram ' + enn + ', and ' + disc + ' working style creates a personality that does not fit neatly into one box. That is the point \u2014 you are multi-dimensional, and understanding all four frameworks gives you a fuller picture than any single test could.');
    }

    sections.push({ title: 'What Makes Your Combination Unique', paragraphs: rare });

    return sections;
  }

  // ===== LAZY LOAD html2canvas =====
  function loadHtml2Canvas() {
    if (typeof html2canvas !== 'undefined') return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // ===== SAVE AS IMAGE =====
  // Force all elements visible for html2canvas capture
  function forceCardsVisible() {
    const card = $('#shareable-card');
    card.classList.remove('results-reveal');
    const els = $$('#shareable-card *');
    els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.animation = 'none'; });
    return els;
  }
  function restoreCards(els) {
    els.forEach(el => { el.style.opacity = ''; el.style.transform = ''; el.style.animation = ''; });
  }

  $('#btn-save-image').addEventListener('click', async () => {
    try {
      await loadHtml2Canvas();
      const cards = forceCardsVisible();
      const canvas = await html2canvas($('#shareable-card'), { backgroundColor: '#f8f6f3', scale: 2, useCORS: true, logging: false });
      restoreCards(cards);
      const link = document.createElement('a');
      link.download = `one-times-good-one-${state.userName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      alert('Could not save image. Try taking a screenshot instead.');
    }
  });

  // ===== SHARE RESULTS WITH FRIENDS =====
  $('#btn-share-instagram').addEventListener('click', async () => {
    trackEvent('shared');
    try {
      await loadHtml2Canvas();
      const cards = forceCardsVisible();
      const shareCard = $('#shareable-card');
      // Force a fixed width so html2canvas renders consistently
      const origWidth = shareCard.style.width;
      shareCard.style.width = '440px';
      const canvas = await html2canvas(shareCard, { backgroundColor: '#f8f6f3', scale: 2, useCORS: true, logging: false, width: 440 });
      shareCard.style.width = origWidth;
      restoreCards(cards);
      const filename = `one-times-good-one-${state.userName.toLowerCase().replace(/\s+/g, '-')}.png`;

      // Try native share on mobile (lets user pick Instagram, TikTok, etc.)
      if (navigator.share && navigator.canShare) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          const siteURL = window.location.origin + window.location.pathname;
          await navigator.share({
            files: [file],
            title: 'My Personality Results',
            text: `I'm "${state.summary.title}". What about you?\n${siteURL}`
          });
          return;
        }
      }

      // Fallback: download the image
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      alert('Image saved! Open Instagram and share it to your story or feed.');
    } catch (err) {
      if (err.name !== 'AbortError') {
        alert('Could not save image. Try taking a screenshot and sharing it on Instagram.');
      }
    }
  });

  // ===== COPY LINK =====
  $('#btn-copy-link').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const btn = $('#btn-copy-link');
      const original = btn.innerHTML;
      btn.innerHTML = '<span class="btn-icon">&#10003;</span> Copied!';
      setTimeout(() => { btn.innerHTML = original; }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      alert('Link copied!');
    }
  });

  // ===== #4: RETAKE WITH CONFIRMATION =====
  $('#btn-retake').addEventListener('click', () => {
    if (!confirm('Start over? You\'ll lose your current results.')) return;
    state.answers = [];
    state.currentIndex = 0;
    state.results = null;
    state.summary = null;
    clearProgress();
    history.replaceState(null, '', window.location.pathname);
    showScreen('landing');
  });

  // ===== #5: SHORTER SHAREABLE URL — encode only answers =====
  function encodeResultsToURL() {
    try {
      // Encode just the name and answer scores (not full results)
      const answerMap = {};
      state.answers.forEach(a => { answerMap[a.questionId] = a.score; });
      const payload = {
        n: state.userName,
        a: answerMap // { questionId: score } — much smaller than full results
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      history.replaceState(null, '', '#r=' + encoded);
    } catch (e) {}
  }

  function decodeResultsFromURL() {
    const hash = window.location.hash;
    if (!hash.startsWith('#r=')) return false;

    try {
      const encoded = hash.slice(3);
      const json = decodeURIComponent(escape(atob(encoded)));
      const payload = JSON.parse(json);

      // New format: { n, a } — recalculate results from answers
      if (payload.a && payload.n) {
        state.userName = payload.n;
        state.answers = Object.entries(payload.a).map(([qId, score]) => ({
          questionId: parseInt(qId, 10), score: score
        }));

        if (typeof calculateResults === 'function') {
          state.results = calculateResults(state.answers);
        }
        if (typeof generateSummary === 'function' && state.results) {
          state.summary = generateSummary(state.results);
        }
        if (state.results && state.results.mbti) {
          state.summary = state.summary || {};
          state.summary.mbtiGroup = MBTI_GROUPS[state.results.mbti.type] || 'analyst';
        }
        renderResults();
        showScreen('results');
        return true;
      }

      // Legacy format: { results, summary, name }
      if (payload.results && payload.summary) {
        state.userName = payload.name || 'Friend';
        state.results = payload.results;
        state.summary = payload.summary;
        renderResults();
        showScreen('results');
        return true;
      }
    } catch (e) {}
    return false;
  }

  // ===== UTILITY =====
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ===== INIT =====
  // Check URL for shared results first
  if (decodeResultsFromURL()) return;

  // #2: Check for saved progress
  const saved = loadProgress();
  if (saved && saved.answers.length > 0) {
    const resumeDiv = document.createElement('div');
    resumeDiv.className = 'resume-banner';
    resumeDiv.innerHTML = `
      <p>Welcome back, ${saved.firstName}! You were on question ${saved.currentIndex + 1} of ${typeof QUESTIONS !== 'undefined' ? QUESTIONS.length : 75}.</p>
      <div class="resume-actions">
        <button class="btn btn-primary btn-resume" id="btn-resume">Continue</button>
        <button class="btn btn-secondary btn-start-fresh" id="btn-start-fresh">Start fresh</button>
      </div>
    `;
    const landing = $('#landing .landing-container');
    landing.insertBefore(resumeDiv, landing.firstChild);

    document.getElementById('btn-resume').addEventListener('click', () => {
      resumeDiv.remove();
      resumeQuiz(saved);
    });
    document.getElementById('btn-start-fresh').addEventListener('click', () => {
      clearProgress();
      resumeDiv.remove();
    });
  }

  showScreen('landing');

})();
