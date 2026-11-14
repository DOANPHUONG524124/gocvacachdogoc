import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStarReward,
  computeOverallProgressPercent,
  generateChallengeQuestions,
  INITIAL_PROGRESS,
} from './challengeGenerator';

test('generateChallengeQuestions returns 10 valid non-repeating questions per level', () => {
  for (const level of [1, 2, 3] as const) {
    const questions = generateChallengeQuestions(level);
    assert.equal(questions.length, 10);
    const ids = new Set(questions.map((q) => q.id));
    assert.equal(ids.size, 10);
    for (const q of questions) {
      assert.equal(q.level, level);
      assert.ok(q.angleDeg >= 0 && q.angleDeg <= 180);
      assert.ok(q.explanationVi.length > 5);
    }
  }
});

test('calculateStarReward awards 0..3 stars accurately', () => {
  assert.equal(calculateStarReward(10, 10), 3);
  assert.equal(calculateStarReward(9, 10), 3);
  assert.equal(calculateStarReward(8, 10), 2);
  assert.equal(calculateStarReward(7, 10), 2);
  assert.equal(calculateStarReward(5, 10), 1);
  assert.equal(calculateStarReward(4, 10), 0);
});

test('computeOverallProgressPercent tracks completed sections', () => {
  assert.equal(computeOverallProgressPercent(INITIAL_PROGRESS), 0);
  const full = {
    ...INITIAL_PROGRESS,
    completedSections: {
      explore: true,
      lab: true,
      tutorial: true,
      library: true,
      level1: true,
      level2: true,
      level3: true,
    },
  };
  assert.equal(computeOverallProgressPercent(full), 100);
});
