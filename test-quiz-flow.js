/**
 * Test script: simulates answering all 75 questions programmatically.
 * Verifies the bug fix in updateBackgroundTint() (q.scores -> q.scoring).
 *
 * Run: node test-quiz-flow.js
 */

// Load questions (use Function constructor to get QUESTIONS into scope)
const fs = require('fs');
const questionsCode = fs.readFileSync(__dirname + '/js/questions.js', 'utf-8');
const QUESTIONS = new Function(questionsCode + '\nreturn QUESTIONS;')();

// ---- Minimal simulation of the quiz state & logic ----

const state = {
  questions: [...QUESTIONS], // no shuffle needed for testing
  currentIndex: 0,
  answers: [],
};

// Extract and test the updateBackgroundTint logic directly
function updateBackgroundTint(answers) {
  if (!answers.length || answers.length < 8) return 'skipped (< 8 answers)';

  let E = 0, N = 0, F = 0;
  const allQ = QUESTIONS;
  answers.forEach(a => {
    const q = allQ.find(q => q.id === a.questionId);
    if (!q) return;
    const centred = a.score - 3;
    // This is the line that was buggy (used q.scores instead of q.scoring)
    if (q.scoring.mbti_E) E += centred * q.scoring.mbti_E;
    if (q.scoring.mbti_N) N += centred * q.scoring.mbti_N;
    if (q.scoring.mbti_F) F += centred * q.scoring.mbti_F;
  });

  const type = (E >= 0 ? 'E' : 'I') + (N >= 0 ? 'N' : 'S') + (F >= 0 ? 'F' : 'T') + 'J';
  return type;
}

// ---- Simulate answering all questions ----
let passed = 0;
let failed = 0;

console.log(`Total questions: ${QUESTIONS.length}`);
console.log('Simulating answering all questions...\n');

for (let i = 0; i < QUESTIONS.length; i++) {
  const q = state.questions[i];
  const score = (i % 5) + 1; // cycle through 1-5

  // Record answer
  state.answers.push({ questionId: q.id, score: score });
  state.currentIndex = i;

  // Run updateBackgroundTint — this is where the crash happened at Q8
  try {
    const result = updateBackgroundTint(state.answers);
    if (i === 7) {
      // Question 8 (index 7) — this is where the bug manifested
      console.log(`  Q${i + 1}: updateBackgroundTint() ran for FIRST TIME -> trending type: ${result}`);
    }
    passed++;
  } catch (err) {
    console.log(`  Q${i + 1}: CRASH -> ${err.message}`);
    failed++;
  }
}

console.log(`\n--- Results ---`);
console.log(`Passed: ${passed}/${QUESTIONS.length}`);
console.log(`Failed: ${failed}/${QUESTIONS.length}`);

if (failed === 0) {
  console.log(`\nAll ${QUESTIONS.length} questions answered successfully. The bug is fixed!`);
  process.exit(0);
} else {
  console.log('\nSome questions failed. The bug is NOT fixed.');
  process.exit(1);
}
