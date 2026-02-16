import { describe, expect, it } from 'vitest';

import { formatLunar, formatLunarParts } from '../format';

describe('formatLunar', () => {
  it('returns default formatted string', () => {
    const formatted = formatLunar({ year: 2024, month: 1, day: 1 });
    expect(formatted).toBe('农历甲辰年正月初一');
  });

  it('supports options such as zodiac, custom prefix and leap marker', () => {
    const formatted = formatLunar(
      { year: 2023, month: 2, day: 1, isLeapMonth: true },
      { zodiac: true, prefix: 'Lunar ', stemBranch: false, leapMarker: '闰月' }
    );
    expect(formatted).toBe('Lunar 2023年（兔）闰月二月初一');
  });
});

describe('formatLunarParts', () => {
  it('provides structured parts for custom renderers', () => {
    const parts = formatLunarParts({ year: 2024, month: 1, day: 15 });
    expect(parts).toEqual([
      { type: 'prefix', value: '农历' },
      { type: 'yearStem', value: '甲' },
      { type: 'yearBranch', value: '辰' },
      { type: 'literal', value: '年' },
      { type: 'month', value: '正月' },
      { type: 'day', value: '十五' }
    ]);
  });
});
