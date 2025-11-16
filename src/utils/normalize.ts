import { InvalidGregorianDateError } from '../errors';
import type { GregorianDateFields, GregorianDateInput } from '../types';

export function normalizeGregorianInput(input: GregorianDateInput): Date {
  if (input instanceof Date) {
    return ensureValidDate(new Date(input.getTime()));
  }

  if (typeof input === 'number') {
    return ensureValidDate(new Date(input));
  }

  if (isPlainObject(input)) {
    return fromFields(input);
  }

  throw new InvalidGregorianDateError('无法识别的公历输入格式');
}

function ensureValidDate(date: Date): Date {
  if (Number.isNaN(date.getTime())) {
    throw new InvalidGregorianDateError('无效的时间值');
  }

  return date;
}

function fromFields({ year, month, day }: GregorianDateFields): Date {
  if (![year, month, day].every(Number.isInteger)) {
    throw new InvalidGregorianDateError('公历年月日需为整数');
  }

  if (month < 1 || month > 12) {
    throw new InvalidGregorianDateError('公历月份需位于 1-12 之间');
  }

  if (day < 1 || day > 31) {
    throw new InvalidGregorianDateError('公历日期需位于 1-31 之间');
  }

  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    throw new InvalidGregorianDateError('公历日期不存在');
  }

  return candidate;
}

function isPlainObject(value: unknown): value is GregorianDateFields {
  return Boolean(value) && typeof value === 'object';
}
