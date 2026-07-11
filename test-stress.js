// ============================================================
// STRESS TEST — 120+ Simulated Quiz Takers
// ============================================================
// Simulates diverse personality profiles taking the quiz,
// validates all 5 frameworks return sensible results, and
// checks distribution + edge cases.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load questions.js into a sandbox (same pattern as other tests)
let code = fs.readFileSync(path.join(__dirname, 'js', 'questions.js'), 'utf-8');
code = code.replace(/^const /gm, 'var ').replace(/^let /gm, 'var ');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const QUESTIONS = sandbox.QUESTIONS;
const PERSONALITY_DATA = sandbox.PERSONALITY_DATA;
const calculateResults = sandbox.calculateResults;

// ============================================================
// HELPERS
// ============================================================

const VALID_MBTI = [
  'INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'
];
const VALID_ENNEAGRAM = [1,2,3,4,5,6,7,8,9];
const VALID_DISC = ['D','I','S','C'];
// Love Languages removed — 4 frameworks only
const VALID_BIG5 = ['O','C','E','A','N'];

function answerAsProfile(profile, noise = 0) {
  return QUESTIONS.map(q => {
    let alignment = 0;
    let totalWeight = 0;

    Object.entries(q.scoring).forEach(([dim, weight]) => {
      if (profile[dim] !== undefined) {
        const desiredDirection = Math.sign(profile[dim]) * Math.sign(weight);
        alignment += desiredDirection * Math.abs(profile[dim]) * Math.abs(weight);
        totalWeight += Math.abs(profile[dim]) * Math.abs(weight);
      }
    });

    let answer;
    if (totalWeight === 0) {
      answer = 3;
    } else {
      const normalised = alignment / totalWeight;
      answer = Math.round(3 + normalised * 2);
    }

    // Add noise
    if (noise > 0) {
      const jitter = Math.round((Math.random() - 0.5) * 2 * noise);
      answer += jitter;
    }

    return { questionId: q.id, score: Math.max(1, Math.min(5, answer)) };
  });
}

function fixedAnswers(score) {
  return QUESTIONS.map(q => ({ questionId: q.id, score }));
}

function alternatingAnswers() {
  return QUESTIONS.map((q, i) => ({ questionId: q.id, score: i % 2 === 0 ? 1 : 5 }));
}

function randomAnswers() {
  return QUESTIONS.map(q => ({ questionId: q.id, score: Math.floor(Math.random() * 5) + 1 }));
}

// ============================================================
// DEFINE ALL TEST PROFILES
// ============================================================

const testCases = [];

// --- 16 MBTI archetype profiles ---
const mbtiProfiles = {
  INTJ: { mbti_E: -2, mbti_N: 2, mbti_F: -2, mbti_J: 2 },
  INTP: { mbti_E: -2, mbti_N: 2, mbti_F: -2, mbti_J: -2 },
  ENTJ: { mbti_E: 2, mbti_N: 2, mbti_F: -2, mbti_J: 2 },
  ENTP: { mbti_E: 2, mbti_N: 2, mbti_F: -2, mbti_J: -2 },
  INFJ: { mbti_E: -2, mbti_N: 2, mbti_F: 2, mbti_J: 2 },
  INFP: { mbti_E: -2, mbti_N: 2, mbti_F: 2, mbti_J: -2 },
  ENFJ: { mbti_E: 2, mbti_N: 2, mbti_F: 2, mbti_J: 2 },
  ENFP: { mbti_E: 2, mbti_N: 2, mbti_F: 2, mbti_J: -2 },
  ISTJ: { mbti_E: -2, mbti_N: -2, mbti_F: -2, mbti_J: 2 },
  ISFJ: { mbti_E: -2, mbti_N: -2, mbti_F: 2, mbti_J: 2 },
  ESTJ: { mbti_E: 2, mbti_N: -2, mbti_F: -2, mbti_J: 2 },
  ESFJ: { mbti_E: 2, mbti_N: -2, mbti_F: 2, mbti_J: 2 },
  ISTP: { mbti_E: -2, mbti_N: -2, mbti_F: -2, mbti_J: -2 },
  ISFP: { mbti_E: -2, mbti_N: -2, mbti_F: 2, mbti_J: -2 },
  ESTP: { mbti_E: 2, mbti_N: -2, mbti_F: -2, mbti_J: -2 },
  ESFP: { mbti_E: 2, mbti_N: -2, mbti_F: 2, mbti_J: -2 },
};

Object.entries(mbtiProfiles).forEach(([type, profile]) => {
  testCases.push({
    name: `MBTI-${type}`,
    category: 'mbti',
    expectedMBTI: type,
    answers: answerAsProfile(profile)
  });
});

// --- 9 Enneagram profiles ---
const enneagramProfiles = {
  1: { enneagram_1: 2, ocean_C: 2, mbti_J: 2, disc_C: 2 },
  2: { enneagram_2: 2, ocean_A: 2, mbti_F: 2, disc_S: 1 },
  3: { enneagram_3: 2, disc_D: 1, disc_I: 1, ocean_C: 1 },
  4: { enneagram_4: 2, ocean_O: 2, ocean_N: 1, mbti_F: 1, mbti_N: 1 },
  5: { enneagram_5: 2, mbti_E: -2, ocean_O: 1, disc_C: 1, mbti_F: -1 },
  6: { enneagram_6: 2, ocean_N: 1, disc_S: 1 },
  7: { enneagram_7: 2, mbti_E: 1, ocean_O: 1, mbti_J: -2, disc_I: 1 },
  8: { enneagram_8: 2, disc_D: 2, ocean_A: -2, mbti_F: -1 },
  9: { enneagram_9: 2, ocean_A: 2, disc_S: 2, mbti_F: 1 },
};

Object.entries(enneagramProfiles).forEach(([type, profile]) => {
  testCases.push({
    name: `Enneagram-${type}`,
    category: 'enneagram',
    expectedEnneagram: parseInt(type),
    answers: answerAsProfile(profile)
  });
});

// --- 4 DISC primary profiles ---
const discProfiles = {
  D: { disc_D: 2, disc_I: -1, disc_S: -1, disc_C: -1, enneagram_8: 1, mbti_F: -1 },
  I: { disc_I: 2, disc_D: -1, disc_S: 0, disc_C: -1, mbti_E: 2, enneagram_3: 1 },
  S: { disc_S: 2, disc_D: -1, disc_I: 0, disc_C: 0, ocean_A: 2, enneagram_9: 1 },
  C: { disc_C: 2, disc_D: -1, disc_I: -1, disc_S: 0, ocean_C: 2, enneagram_5: 1 },
};

Object.entries(discProfiles).forEach(([style, profile]) => {
  testCases.push({
    name: `DISC-${style}`,
    category: 'disc',
    expectedDISC: style,
    answers: answerAsProfile(profile)
  });
});

// --- Edge cases ---
testCases.push({
  name: 'Edge-all-1s',
  category: 'edge',
  answers: fixedAnswers(1)
});
testCases.push({
  name: 'Edge-all-5s',
  category: 'edge',
  answers: fixedAnswers(5)
});
testCases.push({
  name: 'Edge-all-3s',
  category: 'edge',
  answers: fixedAnswers(3)
});
testCases.push({
  name: 'Edge-alternating-1-5',
  category: 'edge',
  answers: alternatingAnswers()
});

// --- Random diverse profiles to fill to 120+ ---
// Mixed MBTI + Enneagram + DISC + Big Five combos with noise
const diverseTemplates = [
  { mbti_E: 1, mbti_N: -1, mbti_F: 1, mbti_J: -1, enneagram_7: 1, disc_I: 1, ocean_O: 1 },
  { mbti_E: -1, mbti_N: 1, mbti_F: -1, mbti_J: 1, enneagram_1: 1, disc_C: 1, ocean_C: 2 },
  { mbti_E: 2, mbti_N: -1, mbti_F: 2, mbti_J: 1, enneagram_2: 2, disc_S: 1, ocean_A: 2 },
  { mbti_E: -2, mbti_N: 2, mbti_F: -1, mbti_J: -1, enneagram_5: 2, disc_C: 2, ocean_O: 2, ocean_E: -2 },
  { mbti_E: 1, mbti_N: 1, mbti_F: -1, mbti_J: 2, enneagram_3: 1, disc_D: 2, ocean_C: 1 },
  { mbti_E: -1, mbti_N: -1, mbti_F: 1, mbti_J: 1, enneagram_6: 1, disc_S: 2, ocean_N: 1 },
  { mbti_E: 2, mbti_N: 2, mbti_F: 1, mbti_J: -2, enneagram_7: 2, disc_I: 2, ocean_O: 2, ocean_E: 2 },
  { mbti_E: -2, mbti_N: -2, mbti_F: -2, mbti_J: 2, enneagram_1: 2, disc_C: 2, ocean_C: 2, ocean_A: -1 },
  { mbti_E: 1, mbti_N: -2, mbti_F: 2, mbti_J: -1, enneagram_9: 2, disc_S: 1, ocean_A: 2, ocean_N: -1 },
  { mbti_E: 2, mbti_N: 1, mbti_F: -2, mbti_J: 1, enneagram_8: 2, disc_D: 2, ocean_A: -2, ocean_E: 2 },
  { mbti_E: -1, mbti_N: 1, mbti_F: 2, mbti_J: -1, enneagram_4: 2, disc_I: -1, ocean_O: 2, ocean_N: 2 },
  { mbti_E: 1, mbti_N: -1, mbti_F: -1, mbti_J: -2, enneagram_7: 1, enneagram_8: 1, disc_D: 1, ocean_O: 1 },
  { mbti_E: -1, mbti_N: 2, mbti_F: 1, mbti_J: 2, enneagram_1: 1, enneagram_5: 1, disc_C: 1, ocean_C: 1 },
  { mbti_E: 2, mbti_N: -2, mbti_F: 1, mbti_J: 1, enneagram_2: 1, enneagram_6: 1, disc_S: 2, ocean_A: 1 },
  { mbti_E: -2, mbti_N: -1, mbti_F: -1, mbti_J: -1, enneagram_5: 1, enneagram_9: 1, disc_S: 1, ocean_E: -2 },
];

diverseTemplates.forEach((profile, i) => {
  // Run each template with 2 noise levels
  testCases.push({
    name: `Diverse-${i+1}-clean`,
    category: 'diverse',
    answers: answerAsProfile(profile)
  });
  testCases.push({
    name: `Diverse-${i+1}-noisy`,
    category: 'diverse',
    answers: answerAsProfile(profile, 0.8)
  });
});

// Add some fully random profiles
for (let i = 0; i < Math.max(0, 122 - testCases.length); i++) {
  testCases.push({
    name: `Random-${i+1}`,
    category: 'random',
    answers: randomAnswers()
  });
}


// ============================================================
// RUN ALL TESTS
// ============================================================

console.log('='.repeat(70));
console.log('PERSONALITY QUIZ STRESS TEST');
console.log(`Running ${testCases.length} simulated quiz takers...`);
console.log('='.repeat(70));

let totalTests = 0;
let passed = 0;
let failed = 0;
const failures = [];
const edgeResults = [];

// Distribution trackers
const mbtiDist = {};
const enneagramDist = {};
const discDist = {};
const bigFiveHighDist = {};  // which traits appear "high" (>=55)

VALID_MBTI.forEach(t => mbtiDist[t] = 0);
VALID_ENNEAGRAM.forEach(t => enneagramDist[t] = 0);
VALID_DISC.forEach(t => discDist[t] = 0);
VALID_BIG5.forEach(t => bigFiveHighDist[t] = 0);

testCases.forEach(tc => {
  let testErrors = [];

  let results;
  try {
    results = calculateResults(tc.answers);
  } catch (err) {
    totalTests++;
    failed++;
    failures.push(`${tc.name}: CRASHED — ${err.message}`);
    return;
  }

  // --- Check 1: No crash (already passed if we got here) ---

  // --- Check 2: MBTI returns valid 4-letter type ---
  totalTests++;
  if (VALID_MBTI.includes(results.mbti.type)) {
    passed++;
  } else {
    failed++;
    testErrors.push(`MBTI type "${results.mbti.type}" is not a valid 4-letter type`);
  }

  // --- Check 3: MBTI has valid preferences ---
  totalTests++;
  const prefs = results.mbti.preferences;
  const prefsValid = prefs.EI && prefs.NS && prefs.FT && prefs.JP &&
    typeof prefs.EI.strength === 'number' && prefs.EI.strength >= 0 && prefs.EI.strength <= 100 &&
    typeof prefs.NS.strength === 'number' && prefs.NS.strength >= 0 && prefs.NS.strength <= 100 &&
    typeof prefs.FT.strength === 'number' && prefs.FT.strength >= 0 && prefs.FT.strength <= 100 &&
    typeof prefs.JP.strength === 'number' && prefs.JP.strength >= 0 && prefs.JP.strength <= 100;
  if (prefsValid) {
    passed++;
  } else {
    failed++;
    testErrors.push(`MBTI preference strengths out of range: EI=${prefs.EI?.strength} NS=${prefs.NS?.strength} FT=${prefs.FT?.strength} JP=${prefs.JP?.strength}`);
  }

  // --- Check 4: Enneagram returns valid type 1-9 with wing ---
  totalTests++;
  if (VALID_ENNEAGRAM.includes(results.enneagram.type) &&
      VALID_ENNEAGRAM.includes(results.enneagram.wing)) {
    passed++;
  } else {
    failed++;
    testErrors.push(`Enneagram type=${results.enneagram.type} wing=${results.enneagram.wing} invalid`);
  }

  // --- Check 5: Enneagram wing is adjacent ---
  totalTests++;
  const et = results.enneagram.type;
  const ew = results.enneagram.wing;
  const validWings = [
    et === 1 ? 9 : et - 1,
    et === 9 ? 1 : et + 1
  ];
  if (validWings.includes(ew)) {
    passed++;
  } else {
    failed++;
    testErrors.push(`Enneagram wing ${ew} is not adjacent to type ${et} (expected ${validWings.join(' or ')})`);
  }

  // --- Check 6: DISC returns valid style ---
  totalTests++;
  if (VALID_DISC.includes(results.disc.primary) && VALID_DISC.includes(results.disc.secondary)) {
    passed++;
  } else {
    failed++;
    testErrors.push(`DISC primary="${results.disc.primary}" secondary="${results.disc.secondary}" invalid`);
  }

  // --- Check 7: Big Five percentages 0-100 ---
  totalTests++;
  let bigFiveValid = true;
  VALID_BIG5.forEach(trait => {
    const pct = results.bigFive[trait]?.percentage;
    if (typeof pct !== 'number' || pct < 0 || pct > 100) {
      bigFiveValid = false;
    }
  });
  if (bigFiveValid) {
    passed++;
  } else {
    failed++;
    const pcts = VALID_BIG5.map(t => `${t}=${results.bigFive[t]?.percentage}`).join(' ');
    testErrors.push(`Big Five percentages out of 0-100 range: ${pcts}`);
  }

  // --- Check 8: Results have descriptions/titles (not empty) ---
  totalTests++;
  const hasDescriptions =
    results.mbti.title && results.mbti.title.length > 0 &&
    results.enneagram.title && results.enneagram.title.length > 0 &&
    results.disc.title && results.disc.title.length > 0;
  if (hasDescriptions) {
    passed++;
  } else {
    failed++;
    testErrors.push(`Missing titles: MBTI="${results.mbti.title}" Ennea="${results.enneagram.title}" DISC="${results.disc.title}"`);
  }

  // --- Check 10: Category-specific expected result checks ---
  if (tc.expectedMBTI) {
    totalTests++;
    if (results.mbti.type === tc.expectedMBTI) {
      passed++;
    } else {
      failed++;
      testErrors.push(`Expected MBTI ${tc.expectedMBTI}, got ${results.mbti.type}`);
    }
  }

  if (tc.expectedEnneagram) {
    totalTests++;
    if (results.enneagram.type === tc.expectedEnneagram) {
      passed++;
    } else {
      failed++;
      testErrors.push(`Expected Enneagram ${tc.expectedEnneagram}, got ${results.enneagram.type}`);
    }
  }

  if (tc.expectedDISC) {
    totalTests++;
    if (results.disc.primary === tc.expectedDISC) {
      passed++;
    } else {
      failed++;
      testErrors.push(`Expected DISC ${tc.expectedDISC}, got ${results.disc.primary}`);
    }
  }

  // Track distributions
  mbtiDist[results.mbti.type] = (mbtiDist[results.mbti.type] || 0) + 1;
  enneagramDist[results.enneagram.type] = (enneagramDist[results.enneagram.type] || 0) + 1;
  discDist[results.disc.primary] = (discDist[results.disc.primary] || 0) + 1;
  VALID_BIG5.forEach(t => {
    if (results.bigFive[t].percentage >= 55) bigFiveHighDist[t]++;
  });

  // Track edge case results
  if (tc.category === 'edge') {
    edgeResults.push({
      name: tc.name,
      mbti: results.mbti.type,
      enneagram: `${results.enneagram.type}w${results.enneagram.wing}`,
      disc: results.disc.combo,
      bigFive: VALID_BIG5.map(t => `${t}:${results.bigFive[t].percentage}%`).join(' ')
    });
  }

  // Collect failures
  if (testErrors.length > 0) {
    failures.push(`${tc.name}: ${testErrors.join('; ')}`);
  }
});


// ============================================================
// SUMMARY REPORT
// ============================================================

console.log('\n' + '='.repeat(70));
console.log('SUMMARY REPORT');
console.log('='.repeat(70));

console.log(`\nTotal simulated people: ${testCases.length}`);
console.log(`Total individual checks: ${totalTests}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Pass rate: ${Math.round(passed / totalTests * 100)}%`);

// --- MBTI Distribution ---
console.log('\n' + '-'.repeat(50));
console.log('MBTI TYPE DISTRIBUTION');
console.log('-'.repeat(50));
const mbtiCovered = VALID_MBTI.filter(t => mbtiDist[t] > 0);
const mbtiMissing = VALID_MBTI.filter(t => !mbtiDist[t]);
VALID_MBTI.forEach(t => {
  const count = mbtiDist[t] || 0;
  const bar = '#'.repeat(count);
  console.log(`  ${t}: ${String(count).padStart(3)} ${bar}`);
});
console.log(`  Coverage: ${mbtiCovered.length}/16 types produced`);
if (mbtiMissing.length > 0) {
  console.log(`  MISSING TYPES: ${mbtiMissing.join(', ')}`);
}

// --- Enneagram Distribution ---
console.log('\n' + '-'.repeat(50));
console.log('ENNEAGRAM TYPE DISTRIBUTION');
console.log('-'.repeat(50));
const enneaCovered = VALID_ENNEAGRAM.filter(t => enneagramDist[t] > 0);
const enneaMissing = VALID_ENNEAGRAM.filter(t => !enneagramDist[t]);
VALID_ENNEAGRAM.forEach(t => {
  const count = enneagramDist[t] || 0;
  const bar = '#'.repeat(count);
  console.log(`  Type ${t}: ${String(count).padStart(3)} ${bar}`);
});
console.log(`  Coverage: ${enneaCovered.length}/9 types produced`);
if (enneaMissing.length > 0) {
  console.log(`  MISSING TYPES: ${enneaMissing.join(', ')}`);
}

// --- DISC Distribution ---
console.log('\n' + '-'.repeat(50));
console.log('DISC STYLE DISTRIBUTION');
console.log('-'.repeat(50));
const discCovered = VALID_DISC.filter(t => discDist[t] > 0);
const discMissing = VALID_DISC.filter(t => !discDist[t]);
VALID_DISC.forEach(t => {
  const count = discDist[t] || 0;
  const bar = '#'.repeat(count);
  console.log(`  ${t}: ${String(count).padStart(3)} ${bar}`);
});
console.log(`  Coverage: ${discCovered.length}/4 styles produced`);
if (discMissing.length > 0) {
  console.log(`  MISSING STYLES: ${discMissing.join(', ')}`);
}

// --- Big Five High Trait Distribution ---
console.log('\n' + '-'.repeat(50));
console.log('BIG FIVE — How often each trait scored "high" (>=55%)');
console.log('-'.repeat(50));
VALID_BIG5.forEach(t => {
  const count = bigFiveHighDist[t] || 0;
  const pct = Math.round(count / testCases.length * 100);
  const bar = '#'.repeat(Math.round(count / 2));
  console.log(`  ${t}: ${String(count).padStart(3)}/${testCases.length} (${pct}%) ${bar}`);
});

// --- Edge Case Results ---
console.log('\n' + '-'.repeat(50));
console.log('EDGE CASE RESULTS');
console.log('-'.repeat(50));
edgeResults.forEach(e => {
  console.log(`\n  ${e.name}:`);
  console.log(`    MBTI: ${e.mbti}`);
  console.log(`    Enneagram: ${e.enneagram}`);
  console.log(`    DISC: ${e.disc}`);
  console.log(`    Big Five: ${e.bigFive}`);
});

// --- Anomalies ---
console.log('\n' + '-'.repeat(50));
console.log('ANOMALY CHECK');
console.log('-'.repeat(50));

let anomalies = [];

// Check if any MBTI type dominates (>40% of results)
const maxMBTI = Math.max(...Object.values(mbtiDist));
const maxMBTIType = Object.entries(mbtiDist).find(([k,v]) => v === maxMBTI)?.[0];
if (maxMBTI > testCases.length * 0.4) {
  anomalies.push(`MBTI type ${maxMBTIType} appears ${maxMBTI} times (${Math.round(maxMBTI/testCases.length*100)}%) — possible over-representation`);
}

// Check if any Enneagram type never appears
if (enneaMissing.length > 0) {
  anomalies.push(`Enneagram types never produced: ${enneaMissing.join(', ')}`);
}

// Check if any DISC style never appears
if (discMissing.length > 0) {
  anomalies.push(`DISC styles never produced: ${discMissing.join(', ')}`);
}

// Check Big Five — any trait almost always high or always low?
VALID_BIG5.forEach(t => {
  const pct = Math.round((bigFiveHighDist[t] || 0) / testCases.length * 100);
  if (pct > 85) anomalies.push(`Big Five "${t}" is high in ${pct}% of tests — possible bias`);
  if (pct < 15) anomalies.push(`Big Five "${t}" is high in only ${pct}% of tests — possible bias`);
});

if (anomalies.length === 0) {
  console.log('  No anomalies detected.');
} else {
  anomalies.forEach(a => console.log(`  *** ${a}`));
}

// --- Failures Detail ---
if (failures.length > 0) {
  console.log('\n' + '-'.repeat(50));
  console.log(`FAILURES (${failures.length})`);
  console.log('-'.repeat(50));
  failures.forEach(f => console.log(`  FAIL: ${f}`));
}

// --- Final Verdict ---
console.log('\n' + '='.repeat(70));
if (failed === 0) {
  console.log('ALL CHECKS PASSED! The scoring engine handled all 120+ profiles without issues.');
} else {
  console.log(`${failed} checks failed out of ${totalTests}. See failures above for details.`);
}
console.log('='.repeat(70));
