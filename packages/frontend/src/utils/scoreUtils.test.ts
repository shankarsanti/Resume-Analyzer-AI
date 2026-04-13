import { describe, it, expect } from 'vitest';
import {
  getScoreData,
  getScoreColorClasses,
  getScoreColor,
} from './scoreUtils';

describe('getScoreData', () => {
  it('should return excellent status for scores 71-100', () => {
    const score71 = getScoreData(71);
    expect(score71.status).toBe('excellent');
    expect(score71.color).toBe('green');
    expect(score71.message).toBe('Excellent Score!');
    expect(score71.textColorClass).toBe('text-green-600');

    const score100 = getScoreData(100);
    expect(score100.status).toBe('excellent');
    expect(score100.color).toBe('green');
  });

  it('should return good-progress status for scores 41-70', () => {
    const score41 = getScoreData(41);
    expect(score41.status).toBe('good-progress');
    expect(score41.color).toBe('yellow');
    expect(score41.message).toBe('Good Progress');
    expect(score41.textColorClass).toBe('text-yellow-600');

    const score70 = getScoreData(70);
    expect(score70.status).toBe('good-progress');
    expect(score70.color).toBe('yellow');
  });

  it('should return needs-improvement status for scores 0-40', () => {
    const score0 = getScoreData(0);
    expect(score0.status).toBe('needs-improvement');
    expect(score0.color).toBe('red');
    expect(score0.message).toBe('Needs Improvement');
    expect(score0.textColorClass).toBe('text-red-600');

    const score40 = getScoreData(40);
    expect(score40.status).toBe('needs-improvement');
    expect(score40.color).toBe('red');
  });

  it('should include correct color classes', () => {
    const excellentScore = getScoreData(85);
    expect(excellentScore.bgColorClass).toBe('bg-green-100');
    expect(excellentScore.colorClass).toBe('#22c55e');

    const goodScore = getScoreData(55);
    expect(goodScore.bgColorClass).toBe('bg-yellow-100');
    expect(goodScore.colorClass).toBe('#eab308');

    const poorScore = getScoreData(25);
    expect(poorScore.bgColorClass).toBe('bg-red-100');
    expect(poorScore.colorClass).toBe('#ef4444');
  });

  it('should preserve the score value', () => {
    const score = getScoreData(75);
    expect(score.value).toBe(75);
  });
});

describe('getScoreColorClasses', () => {
  it('should return green classes for scores 71-100', () => {
    const classes = getScoreColorClasses(85);
    expect(classes.bg).toBe('bg-green-100');
    expect(classes.text).toBe('text-green-600');
    expect(classes.border).toBe('border-green-200');
  });

  it('should return yellow classes for scores 41-70', () => {
    const classes = getScoreColorClasses(55);
    expect(classes.bg).toBe('bg-yellow-100');
    expect(classes.text).toBe('text-yellow-600');
    expect(classes.border).toBe('border-yellow-200');
  });

  it('should return red classes for scores 0-40', () => {
    const classes = getScoreColorClasses(25);
    expect(classes.bg).toBe('bg-red-100');
    expect(classes.text).toBe('text-red-600');
    expect(classes.border).toBe('border-red-200');
  });

  it('should handle boundary values correctly', () => {
    expect(getScoreColorClasses(71).text).toBe('text-green-600');
    expect(getScoreColorClasses(70).text).toBe('text-yellow-600');
    expect(getScoreColorClasses(41).text).toBe('text-yellow-600');
    expect(getScoreColorClasses(40).text).toBe('text-red-600');
  });
});

describe('getScoreColor', () => {
  it('should return green hex for scores 71-100', () => {
    expect(getScoreColor(71)).toBe('#22c55e');
    expect(getScoreColor(100)).toBe('#22c55e');
  });

  it('should return yellow hex for scores 41-70', () => {
    expect(getScoreColor(41)).toBe('#eab308');
    expect(getScoreColor(70)).toBe('#eab308');
  });

  it('should return red hex for scores 0-40', () => {
    expect(getScoreColor(0)).toBe('#ef4444');
    expect(getScoreColor(40)).toBe('#ef4444');
  });
});
