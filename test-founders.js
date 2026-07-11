// ============================================================
// FOUNDER SIMULATION TEST
// ============================================================
// Simulates the creators of each personality framework taking
// the quiz, and checks if all 5 results match their known types.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let code = fs.readFileSync(path.join(__dirname, 'js', 'questions.js'), 'utf-8');
code = code.replace(/^const /gm, 'var ').replace(/^let /gm, 'var ');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const QUESTIONS = sandbox.QUESTIONS;
const calculateResults = sandbox.calculateResults;

// ============================================================
// Answer simulation: each founder has preferences across ALL
// scoring dimensions, not just their own framework.
// ============================================================

function answerAsFounder(profile) {
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

    if (totalWeight === 0) return { questionId: q.id, score: 3 };

    const normalised = alignment / totalWeight;
    let answer = Math.round(3 + normalised * 2);
    answer = Math.max(1, Math.min(5, answer));
    return { questionId: q.id, score: answer };
  });
}

// ============================================================
// FOUNDER PROFILES — based on research of their known types
// ============================================================

const founders = {
  'Carl Jung (MBTI inspiration)': {
    // Expected: INFJ, Enneagram 5w4, DISC C, High O/C Low E
    profile: {
      mbti_E: -2, mbti_N: 2, mbti_F: 1, mbti_J: 1,
      enneagram_5: 2, enneagram_4: 1,
      disc_C: 2, disc_D: -1, disc_I: -1, disc_S: 0,
      ocean_O: 2, ocean_C: 2, ocean_E: -2, ocean_A: 0, ocean_N: 1
    },
    expected: {
      mbti: 'INFJ',
      enneagram: 5,
      disc: 'C',
      bigFiveHigh: ['O', 'C'],
      bigFiveLow: ['E']
    }
  },

  'William Marston (DISC creator)': {
    // Expected: ENFP, Enneagram 3w4, DISC D/I, High O/E
    profile: {
      mbti_E: 2, mbti_N: 2, mbti_F: 1, mbti_J: -2,
      enneagram_3: 2, enneagram_4: 1, enneagram_7: 1, enneagram_8: 1,
      disc_D: 2, disc_I: 2, disc_S: -1, disc_C: -1,
      ocean_O: 2, ocean_C: 0, ocean_E: 2, ocean_A: 0, ocean_N: -1
    },
    expected: {
      mbti: 'ENFP',
      enneagram: 3,
      disc: 'D',
      discAlt: 'I',
      bigFiveHigh: ['O', 'E'],
      bigFiveLow: []
    }
  },

  'Lewis Goldberg (Big Five / OCEAN)': {
    // Expected: ISTJ, Enneagram 5w6, DISC C, High C/O Low E
    profile: {
      mbti_E: -2, mbti_N: -1, mbti_F: -2, mbti_J: 2,
      enneagram_5: 2, enneagram_6: 1, enneagram_1: 1,
      disc_C: 2, disc_S: 1, disc_D: -1, disc_I: -2,
      ocean_O: 1, ocean_C: 2, ocean_E: -2, ocean_A: 0, ocean_N: -1
    },
    expected: {
      mbti: 'ISTJ',
      enneagram: 5,
      disc: 'C',
      bigFiveHigh: ['C'],
      bigFiveLow: ['E']
    }
  },

  'Gary Chapman (personality researcher)': {
    // Expected: ESFJ, Enneagram 2w1, DISC I/S, High E/A
    profile: {
      mbti_E: 2, mbti_N: -1, mbti_F: 2, mbti_J: 1,
      enneagram_2: 2, enneagram_1: 1, enneagram_9: 1,
      disc_I: 2, disc_S: 2, disc_D: -1, disc_C: 0,
      ocean_O: 0, ocean_C: 1, ocean_E: 2, ocean_A: 2, ocean_N: -1
    },
    expected: {
      mbti: 'ESFJ',
      enneagram: 2,
      disc: 'I',
      discAlt: 'S',
      bigFiveHigh: ['E', 'A'],
      bigFiveLow: []
    }
  },

  'Oscar Ichazo (Enneagram creator)': {
    // Expected: INTJ, Enneagram 5w6, DISC C, High O/C Low E/A
    profile: {
      mbti_E: -2, mbti_N: 2, mbti_F: -2, mbti_J: 2,
      enneagram_5: 2, enneagram_6: 1, enneagram_8: 1,
      disc_C: 2, disc_D: 1, disc_I: -2, disc_S: -1,
      ocean_O: 2, ocean_C: 2, ocean_E: -2, ocean_A: -2, ocean_N: 1
    },
    expected: {
      mbti: 'INTJ',
      enneagram: 5,
      disc: 'C',
      bigFiveHigh: ['O', 'C'],
      bigFiveLow: ['E', 'A']
    }
  }
};

// ============================================================
// RUN THE SIMULATION
// ============================================================

console.log('='.repeat(70));
console.log('FOUNDER SIMULATION — Do the creators get their own types?');
console.log('='.repeat(70));

let totalChecks = 0;
let passed = 0;
let failed = 0;
const failures = [];

Object.entries(founders).forEach(([name, { profile, expected }]) => {
  const answers = answerAsFounder(profile);
  const results = calculateResults(answers);

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${name}`);
  console.log(`${'─'.repeat(60)}`);

  // --- MBTI ---
  const mbtiPass = results.mbti.type === expected.mbti;
  totalChecks++;
  if (mbtiPass) passed++; else { failed++; failures.push(`${name}: MBTI expected ${expected.mbti}, got ${results.mbti.type}`); }
  console.log(`  MBTI:      ${results.mbti.type} (expected ${expected.mbti}) ${mbtiPass ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`             E/I: ${results.mbti.preferences.EI.letter} (${results.mbti.preferences.EI.strength}%)  N/S: ${results.mbti.preferences.NS.letter} (${results.mbti.preferences.NS.strength}%)  F/T: ${results.mbti.preferences.FT.letter} (${results.mbti.preferences.FT.strength}%)  J/P: ${results.mbti.preferences.JP.letter} (${results.mbti.preferences.JP.strength}%)`);

  // --- Enneagram ---
  const enneaPass = results.enneagram.type === expected.enneagram;
  totalChecks++;
  if (enneaPass) passed++; else { failed++; failures.push(`${name}: Enneagram expected ${expected.enneagram}, got ${results.enneagram.type}`); }
  console.log(`  Enneagram: Type ${results.enneagram.type}w${results.enneagram.wing} (expected Type ${expected.enneagram}) ${enneaPass ? '✓ PASS' : '✗ FAIL'}`);
  const top3 = results.enneagram.allScores.slice(0, 3);
  console.log(`             Top 3: ${top3.map(t => `Type ${t.type} (${t.score})`).join(', ')}`);

  // --- DISC ---
  const discPass = results.disc.primary === expected.disc || results.disc.primary === expected.discAlt;
  totalChecks++;
  if (discPass) passed++; else { failed++; failures.push(`${name}: DISC expected ${expected.disc}${expected.discAlt ? '/' + expected.discAlt : ''}, got ${results.disc.primary}`); }
  console.log(`  DISC:      ${results.disc.combo} (expected ${expected.disc}${expected.discAlt ? ' or ' + expected.discAlt : ''} primary) ${discPass ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`             D:${results.disc.allScores.D} I:${results.disc.allScores.I} S:${results.disc.allScores.S} C:${results.disc.allScores.C}`);

  // --- Big Five ---
  let bigFivePass = true;
  const b5 = results.bigFive;
  const highTraits = ['O', 'C', 'E', 'A', 'N'].filter(t => b5[t].percentage >= 55);
  const lowTraits = ['O', 'C', 'E', 'A', 'N'].filter(t => b5[t].percentage <= 45);

  expected.bigFiveHigh.forEach(t => {
    if (b5[t].percentage < 55) {
      bigFivePass = false;
      failures.push(`${name}: Big Five expected high ${t}, got ${b5[t].percentage}%`);
    }
  });
  expected.bigFiveLow.forEach(t => {
    if (b5[t].percentage > 45) {
      bigFivePass = false;
      failures.push(`${name}: Big Five expected low ${t}, got ${b5[t].percentage}%`);
    }
  });
  totalChecks++;
  if (bigFivePass) passed++; else failed++;

  console.log(`  Big Five:  O:${b5.O.percentage}% C:${b5.C.percentage}% E:${b5.E.percentage}% A:${b5.A.percentage}% N:${b5.N.percentage}% ${bigFivePass ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`             High: [${highTraits.join(', ')}]  Low: [${lowTraits.join(', ')}]`);
  if (expected.bigFiveHigh.length) console.log(`             Expected high: [${expected.bigFiveHigh.join(', ')}]  Expected low: [${expected.bigFiveLow.join(', ')}]`);

  // Love Language removed — now 4 frameworks only
});

// ============================================================
// FINAL SCORECARD
// ============================================================

console.log(`\n${'='.repeat(70)}`);
console.log('SCORECARD');
console.log('='.repeat(70));
console.log(`\n  Total checks: ${totalChecks}`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Score: ${Math.round(passed / totalChecks * 100)}%`);

if (failures.length > 0) {
  console.log(`\n  FAILURES:`);
  failures.forEach(f => console.log(`    ✗ ${f}`));
}

console.log(`\n  ${failed === 0 ? '🎉 ALL FOUNDERS GOT THEIR OWN TYPES!' : '⚠️  Some results need attention.'}`);
