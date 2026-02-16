import { InvalidLunarDateError } from './errors';
import type { LunarDate, LunarDateInput, LunarDateObject } from './types';
import { MAX_SUPPORTED_YEAR, MIN_SUPPORTED_YEAR } from './types';

export function createLunarDate(input: LunarDateInput): LunarDate {
  const normalized = normalizeInput(input);
  const { year, month, day } = normalized;
  validateYear(year);
  validateMonth(month);
  validateDay(day);

  const result: LunarDate = Object.freeze({
    year,
    month,
    day,
    isLeapMonth: normalized.isLeapMonth ?? false
  });

  return result;
}

function normalizeInput(input: LunarDateInput): LunarDateObject {
  if (Array.isArray(input)) {
    const [year, month, day, isLeapMonth] = input;
    return { year, month, day, isLeapMonth };
  }

  return input;
}

function validateYear(year: number): void {
  if (!Number.isInteger(year)) {
    throw new InvalidLunarDateError('农历年份必须是整数');
  }

  if (year < MIN_SUPPORTED_YEAR || year > MAX_SUPPORTED_YEAR) {
    throw new InvalidLunarDateError(
      `农历年份仅支持 ${MIN_SUPPORTED_YEAR}-${MAX_SUPPORTED_YEAR}`
    );
  }
}

function validateMonth(month: number): void {
  if (!Number.isInteger(month)) {
    throw new InvalidLunarDateError('农历月份必须是整数');
  }

  if (month < 1 || month > 12) {
    throw new InvalidLunarDateError('农历月份必须位于 1-12 之间');
  }
}

function validateDay(day: number): void {
  if (!Number.isInteger(day)) {
    throw new InvalidLunarDateError('农历日期必须是整数');
  }

  if (day < 1 || day > 30) {
    throw new InvalidLunarDateError('农历日期必须位于 1-30 之间');
  }
}
