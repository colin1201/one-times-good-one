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
      12: { text: 'Your personality type is taking shape...', colour: 'var(--blue)' },
      24: { text: 'Your core motivation is getting clearer...', colour: 'var(--pink)' },
      36: { text: 'Your working style is emerging...', colour: 'var(--green)' },
      48: { text: 'Almost there — your full picture is forming...', colour: 'var(--purple)' }
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
        // Funnel analytics at milestones
        if (state.currentIndex === 15) trackEvent('q15');
        if (state.currentIndex === 30) trackEvent('q30');
        if (state.currentIndex === 45) trackEvent('q45');
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
      // Encode just the name and 60 answer scores (not full results)
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
      <p>Welcome back, ${saved.firstName}! You were on question ${saved.currentIndex + 1} of 60.</p>
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
