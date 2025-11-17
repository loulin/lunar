import { createLunarDate } from './lunar-date';
import type {
  FormatLunarOptions,
  FormatLunarPart,
  FormatLunarStyle,
  LunarDate,
  LunarDateInput
} from './types';

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIACS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

const MONTH_NAMES: Record<FormatLunarStyle, string[]> = {
  long: ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'],
  short: ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
};

const DAY_NAMES: Record<FormatLunarStyle, string[]> = {
  long: [
    '初一',
    '初二',
    '初三',
    '初四',
    '初五',
    '初六',
    '初七',
    '初八',
    '初九',
    '初十',
    '十一',
    '十二',
    '十三',
    '十四',
    '十五',
    '十六',
    '十七',
    '十八',
    '十九',
    '二十',
    '廿一',
    '廿二',
    '廿三',
    '廿四',
    '廿五',
    '廿六',
    '廿七',
    '廿八',
    '廿九',
    '三十'
  ],
  short: [
    '初一',
    '初二',
    '初三',
    '初四',
    '初五',
    '初六',
    '初七',
    '初八',
    '初九',
    '初十',
    '十一',
    '十二',
    '十三',
    '十四',
    '十五',
    '十六',
    '十七',
    '十八',
    '十九',
    '二十',
    '廿一',
    '廿二',
    '廿三',
    '廿四',
    '廿五',
    '廿六',
    '廿七',
    '廿八',
    '廿九',
    '三十'
  ]
};

const DEFAULT_PREFIX = '农历';
const DEFAULT_LEAP_MARKER = '闰';
const DEFAULT_STYLE: FormatLunarStyle = 'long';
const DEFAULT_LOCALE = 'zh-CN';

interface NormalizedFormatOptions {
  prefixText?: string;
  includeStemBranch: boolean;
  includeZodiac: boolean;
  leapMarker: string;
  style: FormatLunarStyle;
  locale: string;
}

export function formatLunar(
  input: LunarDateInput | LunarDate,
  options: FormatLunarOptions = {}
): string {
  return formatLunarParts(input, options).map((part) => part.value).join('');
}

export function formatLunarParts(
  input: LunarDateInput | LunarDate,
  options: FormatLunarOptions = {}
): FormatLunarPart[] {
  const lunar = createLunarDate(input);
  const normalized = normalizeOptions(options);
  const parts: FormatLunarPart[] = [];

  if (normalized.locale !== DEFAULT_LOCALE) {
    // 当前仅支持 zh-CN，其它 locale 暂时复用中文文案
  }

  if (normalized.prefixText) {
    parts.push({ type: 'prefix', value: normalized.prefixText });
  }

  if (normalized.includeStemBranch) {
    parts.push({ type: 'yearStem', value: getStem(lunar.year) });
    parts.push({ type: 'yearBranch', value: getBranch(lunar.year) });
  } else {
    parts.push({ type: 'yearNumber', value: String(lunar.year) });
  }

  parts.push({ type: 'literal', value: '年' });

  if (normalized.includeZodiac) {
    parts.push({ type: 'literal', value: '（' });
    parts.push({ type: 'yearZodiac', value: getZodiac(lunar.year) });
    parts.push({ type: 'literal', value: '）' });
  }

  const monthText = formatMonth(lunar, normalized);
  parts.push({ type: 'month', value: monthText });

  const dayText = formatDay(lunar, normalized);
  parts.push({ type: 'day', value: dayText });

  return parts;
}

function normalizeOptions(options: FormatLunarOptions): NormalizedFormatOptions {
  let prefixText: string | undefined;
  if (options.prefix === undefined || options.prefix === true) {
    prefixText = DEFAULT_PREFIX;
  } else if (options.prefix && typeof options.prefix === 'string') {
    prefixText = options.prefix;
  }

  const stemBranch = options.stemBranch ?? true;
  const includeStemBranch =
    stemBranch === true || stemBranch === 'year' || stemBranch === 'all';

  const includeZodiac = options.zodiac ?? false;
  const leapMarker =
    options.leapMarker ?? DEFAULT_LEAP_MARKER;
  const style = options.style ?? DEFAULT_STYLE;
  const locale = options.locale ?? DEFAULT_LOCALE;

  return {
    prefixText,
    includeStemBranch,
    includeZodiac,
    leapMarker,
    style,
    locale
  };
}

function getStem(year: number): string {
  const index = mod(year - 4, STEMS.length);
  return STEMS[index];
}

function getBranch(year: number): string {
  const index = mod(year - 4, BRANCHES.length);
  return BRANCHES[index];
}

function getZodiac(year: number): string {
  const index = mod(year - 4, ZODIACS.length);
  return ZODIACS[index];
}

function formatMonth(lunar: LunarDate, options: NormalizedFormatOptions): string {
  const monthNames = MONTH_NAMES[options.style];
  const base = monthNames[lunar.month - 1];
  return `${lunar.isLeapMonth ? options.leapMarker : ''}${base}`;
}

function formatDay(lunar: LunarDate, options: NormalizedFormatOptions): string {
  const dayNames = DAY_NAMES[options.style];
  return dayNames[lunar.day - 1];
}

function mod(n: number, base: number): number {
  return ((n % base) + base) % base;
}
