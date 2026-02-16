import { InvalidGregorianDateError, InvalidLunarDateError } from './errors';
import type {
  ConversionOptions,
  GregorianDateInput,
  LunarDateInput,
  ToGregorianResult,
  ToLunarResult
} from './types';
import { createLunarDate } from './lunar-date';
import { normalizeGregorianInput } from './utils/normalize';
import {
  diffDaysFromYearStart,
  getAccumulatedDaysBeforeSegment,
  getSegmentCount,
  getSegmentDays,
  getYearInfo,
  getYearStartTimestamp
} from './data/year-info';
import { DATA_YEAR_MAX, DATA_YEAR_MIN } from './data/lunar-data';
import { alignDateToTimeZone, toTimeZoneDate } from './utils/timezone';

const DEFAULT_TIMEZONE = 'Asia/Shanghai';
const MS_PER_DAY = 86400000;

export function toLunar(
  input: GregorianDateInput,
  options: ConversionOptions = {}
): ToLunarResult {
  const source = normalizeGregorianInput(input);
  const timezone = options.timezone ?? DEFAULT_TIMEZONE;

  const localDate = toTimeZoneDate(source, timezone);
  const { year, info, firstDayTimestamp } = resolveLunarYear(localDate);
  const diffDays = diffDaysFromYearStart(localDate, firstDayTimestamp);

  let accumulatedDays = 0;
  let monthIndex = 0;
  let monthLength = 0;
  const totalSegments = getSegmentCount(info);

  while (monthIndex < totalSegments) {
    monthLength = getSegmentDays(info, monthIndex);
    accumulatedDays += monthLength;
    if (diffDays < accumulatedDays) {
      break;
    }
    monthIndex += 1;
  }

  if (monthIndex === totalSegments) {
    throw new InvalidGregorianDateError('无法匹配对应的农历日期');
  }

  const day = monthLength - (accumulatedDays - diffDays) + 1;
  const { isLeap, displayMonthIndex } = resolveLeapMonth(info, monthIndex);
  const month = displayMonthIndex + 1;

  return {
    lunar: createLunarDate({ year, month, day, isLeapMonth: isLeap }),
    source,
    metadata: { timezone }
  };
}

export function toGregorian(
  input: LunarDateInput,
  options: ConversionOptions = {}
): ToGregorianResult {
  const lunar = createLunarDate(input);
  const timezone = options.timezone ?? DEFAULT_TIMEZONE;

  const info = getYearInfo(lunar.year);
  const { segmentIndex, monthLength } = resolveSegmentIndex(info, lunar.month, lunar.isLeapMonth);

  if (lunar.day > monthLength) {
    throw new InvalidLunarDateError('农历日期超出当月天数');
  }

  const offsetDays = getAccumulatedDaysBeforeSegment(info, segmentIndex) + (lunar.day - 1);
  const timestamp = getYearStartTimestamp(info) + offsetDays * MS_PER_DAY;
  const date = alignDateToTimeZone(new Date(timestamp), timezone);

  return {
    date,
    source: lunar,
    metadata: { timezone }
  };
}

function resolveLunarYear(date: Date) {
  let targetYear = date.getUTCFullYear();
  if (targetYear < DATA_YEAR_MIN || targetYear > DATA_YEAR_MAX) {
    throw new InvalidGregorianDateError(`仅支持公历 ${DATA_YEAR_MIN}-${DATA_YEAR_MAX} 年范围内的日期`);
  }

  let info = getYearInfo(targetYear);
  let firstDayTimestamp = getYearStartTimestamp(info);

  if (date.getTime() < firstDayTimestamp) {
    targetYear -= 1;
    if (targetYear < DATA_YEAR_MIN) {
      throw new InvalidGregorianDateError(`仅支持公历 ${DATA_YEAR_MIN}-${DATA_YEAR_MAX} 年范围内的日期`);
    }
    info = getYearInfo(targetYear);
    firstDayTimestamp = getYearStartTimestamp(info);
  }

  return { year: targetYear, info, firstDayTimestamp };
}

function resolveLeapMonth(info: ReturnType<typeof getYearInfo>, monthIndex: number) {
  let displayMonthIndex = monthIndex;
  let isLeap = false;

  if (info.hasLeapMonth && info.leapMonthIndex !== null) {
    if (monthIndex === info.leapMonthIndex + 1) {
      isLeap = true;
    }
    if (monthIndex > info.leapMonthIndex) {
      displayMonthIndex -= 1;
    }
  }

  return { isLeap, displayMonthIndex };
}

function resolveSegmentIndex(
  info: ReturnType<typeof getYearInfo>,
  month: number,
  isLeap: boolean
) {
  const zeroBasedMonth = month - 1;
  if (zeroBasedMonth < 0 || zeroBasedMonth > 11) {
    throw new InvalidLunarDateError('农历月份必须位于 1-12 之间');
  }

  if (isLeap) {
    if (!info.hasLeapMonth || info.leapMonthIndex === null) {
      throw new InvalidLunarDateError('该年份无闰月');
    }
    if (zeroBasedMonth !== info.leapMonthIndex) {
      throw new InvalidLunarDateError('闰月编号与当年数据不匹配');
    }
    const segmentIndex = info.leapMonthIndex + 1;
    return {
      segmentIndex,
      monthLength: getSegmentDays(info, segmentIndex)
    };
  }

  let segmentIndex = zeroBasedMonth;
  if (info.hasLeapMonth && info.leapMonthIndex !== null && zeroBasedMonth > info.leapMonthIndex) {
    segmentIndex += 1;
  }

  const totalSegments = getSegmentCount(info);
  if (segmentIndex >= totalSegments) {
    throw new InvalidLunarDateError('农历月份与年表不匹配');
  }

  return {
    segmentIndex,
    monthLength: getSegmentDays(info, segmentIndex)
  };
}
