/** 最早支持的农历年份（含农历 1890 年正月初一） */
export const MIN_SUPPORTED_YEAR = 1890;
/** 最晚支持的农历年份（含农历 2100 年腊月） */
export const MAX_SUPPORTED_YEAR = 2100;

/** 归一化后的农历日期结构，所有字段均不可变 */
export interface LunarDate {
  /** 农历年份，范围为 MIN_SUPPORTED_YEAR - MAX_SUPPORTED_YEAR */
  readonly year: number;
  /** 农历月份，1 表示正月，12 表示腊月 */
  readonly month: number;
  /** 农历日期，1 表示初一，最大为 30 */
  readonly day: number;
  /** 是否为闰月（仅当年份存在闰月且该月为闰月时为 true） */
  readonly isLeapMonth: boolean;
}

/** 数组形式的农历日期输入：[year, month, day, isLeapMonth?] */
export type LunarDateTuple = [number, number, number, boolean?];

/** 对象形式的农历日期输入，month/day 与 LunarDate 相同（1 基） */
export interface LunarDateObject {
  /** 农历年份 */
  year: number;
  /** 农历月份，取值 1-12 */
  month: number;
  /** 农历日期，取值 1-30 */
  day: number;
  /** 可选闰月标记 */
  isLeapMonth?: boolean;
}

/** 支持对象或数组输入 */
export type LunarDateInput = LunarDateObject | LunarDateTuple;

/** 以对象方式提供的公历日期字段（全部采用公历常见的 1 基月份） */
export interface GregorianDateFields {
  /** 公历年，例如 2024 */
  year: number;
  /** 公历月，1-12 */
  month: number;
  /** 公历日，1-31（会按实际月份校验） */
  day: number;
}

/** 支持 Date、时间戳（毫秒）或对象字段 */
export type GregorianDateInput = Date | number | GregorianDateFields;

/** 转换选项 */
export interface ConversionOptions {
  /** IANA 时区 ID（默认 Asia/Shanghai），用于解释/输出 “本地” 日期 */
  timezone?: string;
}

/** 附加在结果上的元数据 */
export interface ConversionMetadata {
  /** 实际使用的时区 ID */
  timezone: string;
}

export interface ToLunarResult {
  /** 转换后的农历日期 */
  lunar: LunarDate;
  /** 归一化后的原始公历输入 */
  source: Date;
  /** 与转换相关的上下文信息 */
  metadata: ConversionMetadata;
}

export interface ToGregorianResult {
  /** 转换后的公历日期（永远是 UTC 时间） */
  date: Date;
  /** 归一化后的农历输入 */
  source: LunarDate;
  /** 与转换相关的上下文信息 */
  metadata: ConversionMetadata;
}
