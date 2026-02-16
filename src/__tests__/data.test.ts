import { describe, expect, it } from 'vitest';
import {
  DATA_YEAR_MIN,
  DATA_YEAR_MAX,
  ENCODED_LUNAR_YEARS,
  LUNAR_DAY_NAMES,
  LUNAR_MONTH_NAMES,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ZODIAC_ANIMALS,
  SOLAR_TERMS,
  SOLAR_TERM_DEGREES
} from '../data/lunar-data';

describe('lunar data constants', () => {
  it('覆盖年份区间并保持顺序', () => {
    expect(ENCODED_LUNAR_YEARS.length).toBe(DATA_YEAR_MAX - DATA_YEAR_MIN + 1);
    expect(ENCODED_LUNAR_YEARS[0]).toBe(1750378);
    expect(ENCODED_LUNAR_YEARS.at(-1)).toBe(337067);
  });

  it('常量数组长度符合预期', () => {
    expect(LUNAR_MONTH_NAMES).toHaveLength(12);
    expect(LUNAR_DAY_NAMES).toHaveLength(31);
    expect(HEAVENLY_STEMS).toHaveLength(10);
    expect(EARTHLY_BRANCHES).toHaveLength(12);
    expect(ZODIAC_ANIMALS).toHaveLength(12);
    expect(SOLAR_TERMS).toHaveLength(24);
    expect(SOLAR_TERM_DEGREES).toHaveLength(24);
  });
});
