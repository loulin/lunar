const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

export interface ZonedDateParts {
  year: number;
  month: number;
  day: number;
}

const MS_PER_DAY = 86400000;

export function toTimeZoneDate(date: Date, timeZone: string): Date {
  const parts = getZonedDateParts(date, timeZone);
  return partsToUTC(parts);
}

export function alignDateToTimeZone(date: Date, timeZone: string): Date {
  const targetParts: ZonedDateParts = {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };

  let candidate = partsToUTC(targetParts);
  for (let i = 0; i < 3; i += 1) {
    const zonedParts = getZonedDateParts(candidate, timeZone);
    const diff = dayNumber(targetParts) - dayNumber(zonedParts);
    if (diff === 0) {
      return candidate;
    }
    candidate = new Date(candidate.getTime() + diff * MS_PER_DAY);
  }

  return candidate;
}

function getZonedDateParts(date: Date, timeZone: string): ZonedDateParts {
  const formatter = getDateFormatter(timeZone);
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((p) => p.type === 'year')?.value ?? NaN);
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? NaN);
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? NaN);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    throw new RangeError(`无法解析 ${timeZone} 的日期`);
  }

  return { year, month, day };
}

function getDateFormatter(timeZone: string): Intl.DateTimeFormat {
  if (!dateFormatterCache.has(timeZone)) {
    dateFormatterCache.set(
      timeZone,
      new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    );
  }

  return dateFormatterCache.get(timeZone)!;
}

function partsToUTC(parts: ZonedDateParts): Date {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function dayNumber(parts: ZonedDateParts): number {
  return Date.UTC(parts.year, parts.month - 1, parts.day) / MS_PER_DAY;
}
