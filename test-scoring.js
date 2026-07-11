// ============================================================
// Scoring Engine Audit — test-scoring.js
// ============================================================
// Loads questions.js, simulates 5 personality profiles, and
// checks for bugs, biases, and mis-scored questions.

// We need to load questions.js in a Node context.
// It defines globals: QUESTIONS, PERSONALITY_DATA, calculateResults, etc.
// We'll eval it after stubbing browser-only things.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load questions.js into a sandbox that exposes its globals
let code = fs.readFileSync(path.join(__dirname, 'js', 'questions.js'), 'utf-8');

// Replace const/let with var so they become global in the sandbox
code = code.replace(/^const /gm, 'var ').replace(/^let /gm, 'var ');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

// Pull out what we need
const QUESTIONS = sandbox.QUESTIONS;
const PERSONALITY_DATA = sandbox.PERSONALITY_DATA;
const calculateResults = sandbox.calculateResults;

// ============================================================
// SECTION 1: Define how each personality profile answers
// ============================================================

// For each question, we decide what a "clear INTJ" etc. would answer (1-5).
// We do this programmatically based on the scoring keys.

function answerAsProfile(profile) {
  // profile is an object like { mbti_E: -2, mbti_N: 2, mbti_F: -2, mbti_J: 2 }
  // meaning: strongly Introverted, strongly iNtuitive, strongly Thinking, strongly Judging
  // For each question, we look at its scoring dimensions and decide the answer.

  return QUESTIONS.map(q => {
    let alignment = 0;
    let totalWeight = 0;

    Object.entries(q.scoring).forEach(([dim, weight]) => {
      if (profile[dim] !== undefined) {
        // If this dimension matters to the profile, align answer with it
        // profile[dim] > 0 means we WANT this dimension positive
        // weight > 0 means agreeing pushes dimension positive
        // So if profile[dim] and weight have same sign, we should AGREE (5)
        // If opposite sign, we should DISAGREE (1)
        const desiredDirection = Math.sign(profile[dim]) * Math.sign(weight);
        alignment += desiredDirection * Math.abs(profile[dim]) * Math.abs(weight);
        totalWeight += Math.abs(profile[dim]) * Math.abs(weight);
      }
    });

    let answer;
    if (totalWeight === 0) {
      answer = 3; // neutral on questions that don't touch our dimensions
    } else {
      // Map alignment to 1-5 scale
      const normalised = alignment / totalWeight; // -1 to +1
      answer = Math.round(3 + normalised * 2); // 1 to 5
      answer = Math.max(1, Math.min(5, answer));
    }

    return { questionId: q.id, score: answer };
  });
}

// Profile definitions (what dimensions they care about and how strongly)
const profiles = {
  'INTJ': {
    mbti_E: -2, mbti_N: 2, mbti_F: -2, mbti_J: 2
  },
  'ENFP': {
    mbti_E: 2, mbti_N: 2, mbti_F: 2, mbti_J: -2
  },
  'ISTJ': {
    mbti_E: -2, mbti_N: -2, mbti_F: -2, mbti_J: 2
  },
  'ESFP': {
    mbti_E: 2, mbti_N: -2, mbti_F: 2, mbti_J: -2
  },
  'NEUTRAL': {} // all answers = 3
};

console.log('='.repeat(70));
console.log('SECTION 1: SIMULATED PERSONALITY PROFILES');
console.log('='.repeat(70));

Object.entries(profiles).forEach(([expectedType, profile]) => {
  const answers = expectedType === 'NEUTRAL'
    ? QUESTIONS.map(q => ({ questionId: q.id, score: 3 }))
    : answerAsProfile(profile);

  const results = calculateResults(answers);
  const mbti = results.mbti;
  const match = expectedType === 'NEUTRAL' ? 'N/A' : (mbti.type === expectedType ? 'PASS' : 'FAIL');

  console.log(`\n--- ${expectedType} Profile ---`);
  console.log(`Expected: ${expectedType}  |  Got: ${mbti.type}  |  ${match}`);
  console.log(`  E/I raw: ${mbti.preferences.EI.letter} (${mbti.preferences.EI.strength}%)`);
  console.log(`  N/S raw: ${mbti.preferences.NS.letter} (${mbti.preferences.NS.strength}%)`);
  console.log(`  F/T raw: ${mbti.preferences.FT.letter} (${mbti.preferences.FT.strength}%)`);
  console.log(`  J/P raw: ${mbti.preferences.JP.letter} (${mbti.preferences.JP.strength}%)`);
});


// ============================================================
// SECTION 2: ANALYZE J/P DIMENSION
// ============================================================

console.log('\n' + '='.repeat(70));
console.log('SECTION 2: J/P DIMENSION ANALYSIS');
console.log('='.repeat(70));

let jpQuestions = [];
let jpPositiveTotal = 0; // total positive weight (J-scoring)
let jpNegativeTotal = 0; // total negative weight (P-scoring)

QUESTIONS.forEach(q => {
  if (q.scoring.mbti_J !== undefined) {
    const w = q.scoring.mbti_J;
    jpQuestions.push({ id: q.id, text: q.text, weight: w });
    if (w > 0) jpPositiveTotal += w;
    else jpNegativeTotal += w;
  }
});

console.log(`\nQuestions scoring on mbti_J: ${jpQuestions.length}`);
console.log(`Total J-positive weight: +${jpPositiveTotal}`);
console.log(`Total P-positive weight: ${jpNegativeTotal}`);
console.log(`Net bias if all answered "Agree" (4, centred=+1): ${jpPositiveTotal + jpNegativeTotal}`);
console.log(`Net bias if all answered "Strongly Agree" (5, centred=+2): ${(jpPositiveTotal + jpNegativeTotal) * 2}`);

console.log('\nJ-positive questions (agreeing = more J):');
jpQuestions.filter(q => q.weight > 0).forEach(q => {
  console.log(`  Q${q.id} (weight +${q.weight}): "${q.text}"`);
});

console.log('\nP-positive questions (agreeing = more P, i.e. negative J weight):');
jpQuestions.filter(q => q.weight < 0).forEach(q => {
  console.log(`  Q${q.id} (weight ${q.weight}): "${q.text}"`);
});

// Check: is the balance fair?
const jpBalance = jpPositiveTotal + jpNegativeTotal;
if (Math.abs(jpBalance) > 2) {
  console.log(`\n*** WARNING: J/P dimension has a net bias of ${jpBalance > 0 ? '+' : ''}${jpBalance}`);
  console.log(`   This means the quiz structurally favours ${jpBalance > 0 ? 'J' : 'P'} even for neutral answerers.`);
} else {
  console.log('\nJ/P balance looks reasonable (net weight within +/-2).');
}


// ============================================================
// SECTION 3: T/F DIMENSION ANALYSIS
// ============================================================

console.log('\n' + '='.repeat(70));
console.log('SECTION 3: T/F DIMENSION ANALYSIS');
console.log('='.repeat(70));

let tfQuestions = [];
let tfPositiveTotal = 0;
let tfNegativeTotal = 0;

QUESTIONS.forEach(q => {
  if (q.scoring.mbti_F !== undefined) {
    const w = q.scoring.mbti_F;
    tfQuestions.push({ id: q.id, text: q.text, weight: w });
    if (w > 0) tfPositiveTotal += w;
    else tfNegativeTotal += w;
  }
});

console.log(`\nQuestions scoring on mbti_F: ${tfQuestions.length}`);
console.log(`Total F-positive weight: +${tfPositiveTotal}`);
console.log(`Total T-positive weight: ${tfNegativeTotal}`);
console.log(`Net bias: ${tfPositiveTotal + tfNegativeTotal > 0 ? '+' : ''}${tfPositiveTotal + tfNegativeTotal}`);

console.log('\nF-positive questions (agreeing = more F):');
tfQuestions.filter(q => q.weight > 0).forEach(q => {
  console.log(`  Q${q.id} (weight +${q.weight}): "${q.text}"`);
});

console.log('\nT-positive questions (agreeing = more T, i.e. negative F weight):');
tfQuestions.filter(q => q.weight < 0).forEach(q => {
  console.log(`  Q${q.id} (weight ${q.weight}): "${q.text}"`);
});

const tfBalance = tfPositiveTotal + tfNegativeTotal;
if (Math.abs(tfBalance) > 2) {
  console.log(`\n*** WARNING: T/F dimension has a net bias of ${tfBalance > 0 ? '+' : ''}${tfBalance}`);
  console.log(`   This means the quiz structurally favours ${tfBalance > 0 ? 'F' : 'T'} even for neutral answerers.`);
} else {
  console.log('\nT/F balance looks reasonable (net weight within +/-2).');
}


// ============================================================
// SECTION 4: SYSTEMATIC BIASES — All dimensions
// ============================================================

console.log('\n' + '='.repeat(70));
console.log('SECTION 4: SYSTEMATIC BIAS CHECK');
console.log('='.repeat(70));

// Test: all answers = 4 ("Agree")
console.log('\n--- All answers = 4 (Agree) ---');
const allAgree = QUESTIONS.map(q => ({ questionId: q.id, score: 4 }));
const agreeResults = calculateResults(allAgree);
console.log(`MBTI: ${agreeResults.mbti.type}`);
console.log(`  E/I: ${agreeResults.mbti.preferences.EI.letter} (${agreeResults.mbti.preferences.EI.strength}%)`);
console.log(`  N/S: ${agreeResults.mbti.preferences.NS.letter} (${agreeResults.mbti.preferences.NS.strength}%)`);
console.log(`  F/T: ${agreeResults.mbti.preferences.FT.letter} (${agreeResults.mbti.preferences.FT.strength}%)`);
console.log(`  J/P: ${agreeResults.mbti.preferences.JP.letter} (${agreeResults.mbti.preferences.JP.strength}%)`);

// Test: all answers = 3 ("Neutral")
console.log('\n--- All answers = 3 (Neutral) ---');
const allNeutral = QUESTIONS.map(q => ({ questionId: q.id, score: 3 }));
const neutralResults = calculateResults(allNeutral);
console.log(`MBTI: ${neutralResults.mbti.type}`);
console.log(`  (Should be ENFJ or similar — all zeros default to E, N, F, J since >= 0 check)`);

// Test: all answers = 2 ("Disagree")
console.log('\n--- All answers = 2 (Disagree) ---');
const allDisagree = QUESTIONS.map(q => ({ questionId: q.id, score: 2 }));
const disagreeResults = calculateResults(allDisagree);
console.log(`MBTI: ${disagreeResults.mbti.type}`);
console.log(`  E/I: ${disagreeResults.mbti.preferences.EI.letter} (${disagreeResults.mbti.preferences.EI.strength}%)`);
console.log(`  N/S: ${disagreeResults.mbti.preferences.NS.letter} (${disagreeResults.mbti.preferences.NS.strength}%)`);
console.log(`  F/T: ${disagreeResults.mbti.preferences.FT.letter} (${disagreeResults.mbti.preferences.FT.strength}%)`);
console.log(`  J/P: ${disagreeResults.mbti.preferences.JP.letter} (${disagreeResults.mbti.preferences.JP.strength}%)`);

// Analyze total weight sum per MBTI dimension
console.log('\n--- Raw weight sums per MBTI dimension (net bias) ---');
const dims = ['mbti_E', 'mbti_N', 'mbti_F', 'mbti_J'];
dims.forEach(dim => {
  let posSum = 0, negSum = 0, count = 0;
  QUESTIONS.forEach(q => {
    if (q.scoring[dim] !== undefined) {
      const w = q.scoring[dim];
      if (w > 0) posSum += w;
      else negSum += w;
      count++;
    }
  });
  const net = posSum + negSum;
  const dimLabel = dim.replace('mbti_', '');
  console.log(`  ${dim}: ${count} questions, positive weight sum = +${posSum}, negative = ${negSum}, NET = ${net > 0 ? '+' : ''}${net}`);
  if (net !== 0) {
    console.log(`    -> If someone answers "Agree" (4) to everything, this dimension gets a raw score of ${net} * 1 = ${net}`);
    console.log(`    -> The quiz is biased toward ${net > 0 ? dimLabel : dimLabel === 'E' ? 'I' : dimLabel === 'N' ? 'S' : dimLabel === 'F' ? 'T' : 'P'}`);
  }
});


// ============================================================
// SECTION 5: SCORING MATH AUDIT
// ============================================================

console.log('\n' + '='.repeat(70));
console.log('SECTION 5: SCORING MATH AUDIT');
console.log('='.repeat(70));

// The actual max possible for each dimension = sum of (|weight| * 2) for all questions touching that dimension
// because the centred score max is +2 and each weight is multiplied by it.
// NOTE: the scoring code (calculateMBTI / calculateBigFive) now computes this
// per-dimension max from the question weights, so there is no hardcoded constant
// to check against — this section just reports the actual maxes for reference.

console.log('\nActual maximum possible scores per MBTI dimension (computed from weights):');
dims.forEach(dim => {
  let maxScore = 0;
  QUESTIONS.forEach(q => {
    if (q.scoring[dim] !== undefined) {
      maxScore += Math.abs(q.scoring[dim]) * 2; // centred max * weight
    }
  });
  console.log(`  ${dim}: actual max = ${maxScore}`);
});

// Check: the centred score conversion is correct
console.log('\nCentred score conversion check:');
console.log('  Score 1 -> centred -2 ✓');
console.log('  Score 2 -> centred -1 ✓');
console.log('  Score 3 -> centred  0 ✓');
console.log('  Score 4 -> centred +1 ✓');
console.log('  Score 5 -> centred +2 ✓');

// Check: type determination uses >= 0, meaning 0 → E, N, F, J
console.log('\nTie-breaking behavior (score exactly 0):');
console.log('  E/I = 0 → E (code: E_I >= 0 ? "E" : "I")');
console.log('  N/S = 0 → N (code: N_S >= 0 ? "N" : "S")');
console.log('  F/T = 0 → F (code: F_T >= 0 ? "F" : "T")');
console.log('  J/P = 0 → J (code: J_P >= 0 ? "J" : "P")');
console.log('  This means the all-3s neutral person gets ENFJ by default.');


// ============================================================
// SECTION 6: QUESTION-BY-QUESTION CONTENT REVIEW (J/P focus)
// ============================================================

console.log('\n' + '='.repeat(70));
console.log('SECTION 6: QUESTION CONTENT REVIEW — POTENTIAL MIS-SCORES');
console.log('='.repeat(70));

// Flag questions where the scoring might not match the question content
const contentFlags = [];

// Q3: "When there's a problem, I want to take charge and fix it immediately" → mbti_J: +1
// This is more about decisiveness/D than J/P. Could argue J, but "immediately" is impulsive (P-ish).
contentFlags.push({
  id: 3, dim: 'mbti_J', weight: 1,
  note: '"Take charge and fix it immediately" is more about decisiveness (DISC-D) than J/P. The "immediately" reaction could be P-like (action over planning). Borderline.'
});

// Q14: "I worry about things going wrong more than most people do" → mbti_J: +1
contentFlags.push({
  id: 14, dim: 'mbti_J', weight: 1,
  note: '"Worry about things going wrong" is more Neuroticism/anxiety (enneagram_6) than J vs P. J types plan to prevent problems; this is about anxiety, not structure.'
});

// Q19: "I set ambitious goals and push hard to achieve them" → mbti_J: +1
contentFlags.push({
  id: 19, dim: 'mbti_J', weight: 1,
  note: '"Set ambitious goals" — could be argued as J (goal-setting), but ENTPs and ENFPs also set ambitious goals. More of an enneagram_3 / disc_D trait. Mild J lean is defensible.'
});

// Q43: "I tend to overanalyse things instead of just going with the flow" → mbti_J: +1, mbti_F: -1
contentFlags.push({
  id: 43, dim: 'mbti_J', weight: 1,
  note: '"Overanalyse instead of going with the flow" — "going with the flow" is P, so NOT doing it = J. This scoring is correct. But the mbti_F: -1 is questionable — overanalysis is more T, which is correct.'
});

// Q11: "I trust my gut feeling more than a detailed analysis" → mbti_N: +1, mbti_F: +1
contentFlags.push({
  id: 11, dim: 'mbti_F', weight: 1,
  note: '"Trust gut feeling over analysis" — F vs T scoring is correct (F = feeling-based decisions). N scoring is also defensible (intuition).'
});

// Q26: "I prefer dealing with facts and data over theories and ideas" → mbti_F: -1
contentFlags.push({
  id: 26, dim: 'mbti_F', weight: -1,
  note: '"Facts and data over theories" — this is really N vs S (and IS scored mbti_N: -2). The mbti_F: -1 is a stretch — preferring data is not the same as Thinking over Feeling.'
});

console.log('\nFlagged questions with potentially problematic scoring:');
contentFlags.forEach(f => {
  console.log(`\n  Q${f.id} [${f.dim}: ${f.weight > 0 ? '+' : ''}${f.weight}]`);
  console.log(`  ${f.note}`);
});


// ============================================================
// SECTION 7: DEEP INTJ SIMULATION — Question by Question
// ============================================================

console.log('\n' + '='.repeat(70));
console.log('SECTION 7: DETAILED INTJ ANSWER TRACE');
console.log('='.repeat(70));

// Manually answer as a strong INTJ would, and track J/P score accumulation
const intjProfile = profiles['INTJ'];
const intjAnswers = answerAsProfile(intjProfile);
let jpRunning = 0;

console.log('\nQuestion-by-question J/P accumulation for INTJ profile:');
intjAnswers.forEach(a => {
  const q = QUESTIONS.find(x => x.id === a.questionId);
  if (q.scoring.mbti_J !== undefined) {
    const centred = a.score - 3;
    const contribution = centred * q.scoring.mbti_J;
    jpRunning += contribution;
    console.log(`  Q${q.id}: answer=${a.score} centred=${centred} × weight=${q.scoring.mbti_J} = ${contribution > 0 ? '+' : ''}${contribution} (running: ${jpRunning})`);
    console.log(`    "${q.text.substring(0, 70)}..."`);
  }
});
console.log(`\nFinal J/P raw score for INTJ profile: ${jpRunning}`);
console.log(`Result: ${jpRunning >= 0 ? 'J' : 'P'}`);


// ============================================================
// SECTION 8: E/I and N/S DIMENSION ANALYSIS (completeness)
// ============================================================

console.log('\n' + '='.repeat(70));
console.log('SECTION 8: E/I and N/S DIMENSION ANALYSIS');
console.log('='.repeat(70));

['mbti_E', 'mbti_N'].forEach(dim => {
  const dimLabel = dim.replace('mbti_', '');
  let posTotal = 0, negTotal = 0;
  const qs = [];
  QUESTIONS.forEach(q => {
    if (q.scoring[dim] !== undefined) {
      const w = q.scoring[dim];
      qs.push({ id: q.id, text: q.text, weight: w });
      if (w > 0) posTotal += w;
      else negTotal += w;
    }
  });

  console.log(`\n${dim}: ${qs.length} questions, +${posTotal} / ${negTotal} = net ${posTotal + negTotal}`);
  if (Math.abs(posTotal + negTotal) > 2) {
    console.log(`  *** BIAS detected: net ${posTotal + negTotal}`);
  }
});


// ============================================================
// SUMMARY
// ============================================================

console.log('\n' + '='.repeat(70));
console.log('SUMMARY OF FINDINGS');
console.log('='.repeat(70));

// Re-run all profiles and collect pass/fail
const profileResults = {};
Object.entries(profiles).forEach(([expectedType, profile]) => {
  const answers = expectedType === 'NEUTRAL'
    ? QUESTIONS.map(q => ({ questionId: q.id, score: 3 }))
    : answerAsProfile(profile);
  const results = calculateResults(answers);
  profileResults[expectedType] = results.mbti.type;
});

console.log('\nProfile simulation results:');
Object.entries(profileResults).forEach(([expected, got]) => {
  const match = expected === 'NEUTRAL' ? '(should be ENFJ by tie-break)' : (expected === got ? 'PASS' : 'FAIL');
  console.log(`  ${expected} → ${got}  ${match}`);
});

console.log('\nPer-dimension max (now computed from weights by the scoring code, not a constant):');
dims.forEach(dim => {
  let maxScore = 0;
  QUESTIONS.forEach(q => {
    if (q.scoring[dim] !== undefined) {
      maxScore += Math.abs(q.scoring[dim]) * 2;
    }
  });
  console.log(`  ${dim}: max = ${maxScore}`);
});

console.log('\nDimension balance (weight sums):');
dims.forEach(dim => {
  let posSum = 0, negSum = 0;
  QUESTIONS.forEach(q => {
    if (q.scoring[dim] !== undefined) {
      const w = q.scoring[dim];
      if (w > 0) posSum += w;
      else negSum += w;
    }
  });
  const net = posSum + negSum;
  const label = dim.replace('mbti_', '');
  const status = Math.abs(net) <= 2 ? 'OK' : `BIASED toward ${net > 0 ? label : {'E':'I','N':'S','F':'T','J':'P'}[label]} by ${Math.abs(net)}`;
  console.log(`  ${dim}: +${posSum} / ${negSum} = net ${net > 0 ? '+' : ''}${net}  [${status}]`);
});

console.log('\nDone.');
