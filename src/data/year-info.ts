import {
  DATA_YEAR_MAX,
  DATA_YEAR_MIN,
  ENCODED_LUNAR_YEARS
} from './lunar-data';

const MONTH_BIT_MASK = (1 << 13) - 1;
const MS_PER_DAY = 86400000;

export interface LunarYearInfo {
  readonly year: number;
  readonly startMonth: number;
  readonly startDay: number;
  readonly hasLeapMonth: boolean;
  readonly leapMonthIndex: number | null;
  readonly monthBits: number;
}

const cache = new Map<number, LunarYearInfo>();

export function getYearInfo(year: number): LunarYearInfo {
  if (year < DATA_YEAR_MIN || year > DATA_YEAR_MAX) {
    throw new RangeError(`农历年仅支持 ${DATA_YEAR_MIN}-${DATA_YEAR_MAX}`);
  }

  if (cache.has(year)) {
    return cache.get(year)!;
  }

  const encoded = ENCODED_LUNAR_YEARS[year - DATA_YEAR_MIN];
  const hasLeapMonth = Boolean(encoded & (1 << 19));
  const info: LunarYearInfo = {
    year,
    startMonth: (encoded >> 18) & 1,
    startDay: (encoded >> 13) & 31,
    hasLeapMonth,
    leapMonthIndex: hasLeapMonth ? (encoded >> 20) & 15 : null,
    monthBits: encoded & MONTH_BIT_MASK
  };

  cache.set(year, info);
  return info;
}

export function getSegmentCount(info: LunarYearInfo): number {
  return 12 + (info.hasLeapMonth ? 1 : 0);
}

export function getSegmentDays(info: LunarYearInfo, segmentIndex: number): number {
  return info.monthBits & (1 << segmentIndex) ? 30 : 29;
}

export function getYearStartTimestamp(info: LunarYearInfo): number {
  return Date.UTC(info.year, info.startMonth, info.startDay);
}

export function diffDaysFromYearStart(date: Date, startTimestamp: number): number {
  return Math.floor((date.getTime() - startTimestamp) / MS_PER_DAY);
}

export function getAccumulatedDaysBeforeSegment(info: LunarYearInfo, segmentIndex: number): number {
  let total = 0;
  for (let i = 0; i < segmentIndex; i += 1) {
    total += getSegmentDays(info, i);
  }
  return total;
}
