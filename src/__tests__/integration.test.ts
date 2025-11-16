import { describe, expect, it } from 'vitest';
import { toLunar, toGregorian } from '../conversion';
import { createLunarDate } from '../lunar-date';

/**
 * 集成测试 - 使用第三方权威数据验证农历转换准确性
 * 
 * 通过调用第三方API获取权威农历数据，并与本项目结果进行对比
 * 确保我们的农历转换功能与外部权威数据一致
 */
describe('农历转换集成测试', () => {
  // 第三方API验证结果（从API获取的真实数据）
  const thirdPartyTestData: [string, number, number, number, number, number, number, boolean][] = [
    // 格式：[描述, 公历年, 公历月, 公历日, 农历年, 农历月, 农历日, 是否闰月]
    ["2023年春节", 2023, 1, 22, 2023, 1, 1, false],
    ["README示例（闰九月）", 2014, 10, 24, 2014, 9, 1, true],
    ["2023年闰二月", 2023, 3, 22, 2023, 2, 1, true],
    ["2020年春节", 2020, 1, 25, 2020, 1, 1, false],
    ["2025年五月五", 2025, 5, 31, 2025, 5, 5, false],
    ["1998年冬月初一", 1998, 12, 19, 1998, 11, 1, false],
    ["1990年六月初二", 1990, 7, 23, 1990, 6, 2, false],
    ["2033年闰十一月", 2033, 12, 22, 2033, 11, 1, true],
    ["1890年边界日期", 1890, 1, 31, 1890, 1, 11, false],
    ["2100年边界日期", 2100, 12, 31, 2100, 12, 1, false],
    // 从网络获取的真实数据（经过验证）
    ["2024年龙年正月初一", 2024, 2, 10, 2024, 1, 1, false],
    ["2024年中秋节", 2024, 9, 17, 2024, 8, 15, false],
    ["2025年元旦", 2025, 1, 1, 2024, 12, 2, false],
    ["2025年情人节", 2025, 2, 14, 2025, 1, 17, false],
    ["2025年劳动节", 2025, 5, 1, 2025, 4, 4, false],
    ["2025年端午节", 2025, 5, 31, 2025, 5, 5, false],
    ["2025年儿童节", 2025, 6, 1, 2025, 5, 6, false],
    ["2025年国庆节", 2025, 10, 1, 2025, 8, 10, false],
    ["2026年元旦", 2026, 1, 1, 2025, 11, 13, false],
    ["2026年春节", 2026, 2, 17, 2026, 1, 1, false],
    ["1900年春节", 1900, 1, 31, 1900, 1, 1, false],
    ["1901年春节前一天", 1901, 2, 18, 1900, 12, 30, false]
  ];

  /**
   * 验证公历转农历的准确性
   */
  describe('公历转农历验证', () => {
    thirdPartyTestData.forEach(([description, solarYear, solarMonth, solarDay, lunarYear, lunarMonth, lunarDay, isLeap]) => {
      it(`应正确转换 ${description} (${solarYear}-${solarMonth}-${solarDay})`, () => {
        // 创建公历日期
        const date = new Date(Date.UTC(solarYear, solarMonth - 1, solarDay));
        
        // 使用我们的库进行转换
        const result = toLunar(date);
        
        // 验证结果
        expect(result.lunar.year).toBe(lunarYear);
        expect(result.lunar.month).toBe(lunarMonth);
        expect(result.lunar.day).toBe(lunarDay);
        expect(result.lunar.isLeapMonth).toBe(isLeap);
      });
    });
  });

  /**
   * 验证农历转公历的准确性（往返一致性）
   */
  describe('农历转公历验证（往返一致性）', () => {
    thirdPartyTestData.forEach(([description, solarYear, solarMonth, solarDay, lunarYear, lunarMonth, lunarDay, isLeap]) => {
      it(`应正确转换 ${description} (${lunarYear}-${lunarMonth}-${lunarDay}${isLeap ? ' 闰月' : ''})`, () => {
        // 创建公历日期
        const expectedDate = new Date(Date.UTC(solarYear, solarMonth - 1, solarDay));
        
        // 先转换为农历再转回公历
        const lunarDate = createLunarDate([lunarYear, lunarMonth, lunarDay, isLeap]);
        const { date: actualDate } = toGregorian(lunarDate);
        
        // 验证往返一致性
        expect(actualDate.getUTCFullYear()).toBe(expectedDate.getUTCFullYear());
        expect(actualDate.getUTCMonth()).toBe(expectedDate.getUTCMonth());
        expect(actualDate.getUTCDate()).toBe(expectedDate.getUTCDate());
      });
    });
  });

  describe('第三方库数据交叉验证（solarlunar）', () => {
    const remoteSamples = [
      '1901-02-18',
      '1949-10-01',
      '2014-10-24',
      '2020-01-25',
      '2023-03-22',
      '2024-02-10'
    ];

    let solarlunar: Solarlunar | undefined;

    beforeAll(async () => {
      solarlunar = await loadSolarlunar();
    });

    for (const isoDate of remoteSamples) {
      it(`应与 solarlunar 对齐：${isoDate}`, async () => {
        expect(solarlunar).toBeDefined();
        const [year, month, day] = isoDate.split('-').map((value) => Number(value));
        const thirdParty = solarlunar!.solar2lunar(year, month, day);

        const date = new Date(`${isoDate}T00:00:00.000Z`);
        const lunarResult = toLunar(date);
        expect(lunarResult.lunar.year).toBe(thirdParty.lYear);
        expect(lunarResult.lunar.month).toBe(thirdParty.lMonth);
        expect(lunarResult.lunar.day).toBe(thirdParty.lDay);
        expect(lunarResult.lunar.isLeapMonth).toBe(thirdParty.isLeap);

        const lunarDate = createLunarDate({
          year: thirdParty.lYear,
          month: thirdParty.lMonth,
          day: thirdParty.lDay,
          isLeapMonth: thirdParty.isLeap
        });
        const { date: solar } = toGregorian(lunarDate);
        expect(solar.toISOString().slice(0, 10)).toBe(isoDate);
      });
    }
  });
});

interface Solarlunar {
  solar2lunar(year: number, month: number, day: number): {
    lYear: number;
    lMonth: number;
    lDay: number;
    isLeap: boolean;
  };
  lunar2solar(
    year: number,
    month: number,
    day: number,
    isLeap?: boolean
  ): { cYear: number; cMonth: number; cDay: number } | -1;
}

async function loadSolarlunar(): Promise<Solarlunar> {
  const response = await fetch('https://unpkg.com/solarlunar@2.0.7/lib/solarlunar.min.js');
  if (!response.ok) {
    throw new Error(`无法获取 solarlunar：${response.status}`);
  }
  const code = await response.text();
  const module = { exports: {} as unknown };
  const exportsObject = module.exports;
  const factory = Function(
    'module',
    'exports',
    `
      ${code}
      return module.exports || globalThis.solarlunar;
    `
  );

  return factory(module, exportsObject) as Solarlunar;
}
