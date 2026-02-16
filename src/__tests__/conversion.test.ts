import { describe, expect, it } from 'vitest';
import { toGregorian, toLunar } from '../conversion';
import { MAX_SUPPORTED_YEAR, MIN_SUPPORTED_YEAR } from '../types';
import { createLunarDate } from '../lunar-date';
import { InvalidGregorianDateError, InvalidLunarDateError } from '../errors';
import { getYearInfo, getYearStartTimestamp } from '../data/year-info';

const NON_LEAP_YEAR = (() => {
  for (let year = MIN_SUPPORTED_YEAR; year <= MAX_SUPPORTED_YEAR; year += 1) {
    if (!getYearInfo(year).hasLeapMonth) {
      return year;
    }
  }

  throw new Error('缺少非闰年数据');
})();

const isoDate = (input: string) => new Date(`${input}T00:00:00.000Z`);

describe('toLunar', () => {
  it('转换 README 示例日期', () => {
    const result = toLunar(isoDate('2014-10-24'));

    expect(result.lunar.year).toBe(2014);
    expect(result.lunar.month).toBe(9);
    expect(result.lunar.day).toBe(1);
    expect(result.lunar.isLeapMonth).toBe(true);
    expect(result.metadata.timezone).toBe('Asia/Shanghai');
  });

  it('覆盖边界日期', () => {
    const baseInfo = getYearInfo(MIN_SUPPORTED_YEAR);
    const earliest = toLunar(new Date(getYearStartTimestamp(baseInfo)));
    expect(earliest.lunar.year).toBe(1890);
    expect(earliest.lunar.month).toBe(1);
    expect(earliest.lunar.day).toBe(1);

    const latest = toLunar(isoDate('2100-12-31'));
    expect(latest.lunar.year).toBe(2100);
    expect(latest.lunar.month).toBe(12);
    expect(latest.lunar.day).toBe(1);
  });

  it('超出支持范围会报错', () => {
    expect(() => toLunar(isoDate('1889-12-31'))).toThrow(InvalidGregorianDateError);
    expect(() => toLunar(isoDate('2101-01-01'))).toThrow(InvalidGregorianDateError);
  });
});

describe('toGregorian', () => {
  it('转换 README 示例日期', () => {
    const { date } = toGregorian(createLunarDate({ year: 2014, month: 9, day: 1, isLeapMonth: true }));
    expect(date.toISOString()).toBe('2014-10-24T00:00:00.000Z');
  });

  it('闰月校验', () => {
    expect(() =>
      toGregorian(createLunarDate({ year: NON_LEAP_YEAR, month: 1, day: 1, isLeapMonth: true }))
    ).toThrow(InvalidLunarDateError);
  });
});

describe('往返一致性', () => {
  const cases = ['1890-01-31', '1900-01-30', '1949-10-01', '2000-02-05', '2014-10-24', '2100-12-31'];

  for (const iso of cases) {
    it(`公农历互转一致：${iso}`, () => {
      const solar = isoDate(iso);
      const lunarResult = toLunar(solar);
      const gregorian = toGregorian(lunarResult.lunar);

      expect(gregorian.date.toISOString()).toBe(solar.toISOString());
    });
  }

  it('支持自定义时区进行互转', () => {
    const timezone = 'America/Los_Angeles';
    const solar = new Date('2014-10-24T08:00:00.000Z');
    const lunarResult = toLunar(solar, { timezone });
    const gregorian = toGregorian(lunarResult.lunar, { timezone });
    const roundTrip = toLunar(gregorian.date, { timezone });

    expect(roundTrip.lunar).toMatchObject(lunarResult.lunar);
  });
});
