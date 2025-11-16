import { describe, expect, it } from 'vitest';
import { MIN_SUPPORTED_YEAR, MAX_SUPPORTED_YEAR } from '../types';
import { createLunarDate } from '../lunar-date';
import { InvalidLunarDateError } from '../errors';

describe('createLunarDate', () => {
  it('normalizes object input并冻结结果', () => {
    const lunar = createLunarDate({ year: 2024, month: 1, day: 15 });

    expect(lunar.year).toBe(2024);
    expect(lunar.isLeapMonth).toBe(false);
    expect(Object.isFrozen(lunar)).toBe(true);
  });

  it('支持数组输入并保留闰月标记', () => {
    const lunar = createLunarDate([2023, 8, 15, true]);

    expect(lunar.isLeapMonth).toBe(true);
  });

  it('超出范围会抛错', () => {
    expect(() => createLunarDate({ year: MIN_SUPPORTED_YEAR - 1, month: 1, day: 1 })).toThrow(
      InvalidLunarDateError
    );

    expect(() => createLunarDate({ year: MAX_SUPPORTED_YEAR + 1, month: 1, day: 1 })).toThrow(
      InvalidLunarDateError
    );

    expect(() => createLunarDate({ year: 2024, month: 13, day: 1 })).toThrow(InvalidLunarDateError);
    expect(() => createLunarDate({ year: 2024, month: 1, day: 0 })).toThrow(InvalidLunarDateError);
  });
});
