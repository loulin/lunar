# Lunar v2

> 高性能、公农历互转 + 标准农历文案输出库。覆盖 `1890-2100` 年，面向现代 TypeScript / JavaScript 生态。

## Features
- ✅ **准确互转**：内置官方年表，`toLunar` / `toGregorian` 公农历互转支持闰月与边界日期。
- 🚀 **跨平台纯函数**：无外部依赖，Node.js、浏览器、Edge Runtime、Web Worker 均可使用。
- 🧱 **严格数据模型**：`LunarDate` 不可变、可序列化，便于缓存和持久化。
- ✨ **标准文案**：`formatLunar`/`formatLunarParts` 直接输出“农历甲辰年正月初一”一类字符串，可选带生肖、天干地支。
- 🧪 **TDD 保障**：Vitest + 黄金样本回归，确保 round-trip 一致性。

更多里程碑与规划参见 [`docs/v2-plan.md`](./docs/v2-plan.md)。

---

## Installation
```bash
npm install lunar
# 或 yarn add lunar
# 或 pnpm add lunar
```

兼容 Node.js `>= 16.20` 以及任意 ES2020+ 环境。建议使用 Node.js 22+ 进行开发以获得更快的构建和类型检查体验。

---

## Quick Start
```ts
import { toLunar, toGregorian, formatLunar, createLunarDate } from 'lunar';

// 公历 -> 农历
const { lunar, metadata } = toLunar(new Date('2024-02-10T00:00:00+08:00'));
console.log(formatLunar(lunar)); // 农历甲辰年正月初一
console.log(metadata.timezone);  // Asia/Shanghai（默认）

// 农历 -> 公历
const festival = createLunarDate({ year: 2025, month: 5, day: 5 });
const { date } = toGregorian(festival); // 返回 UTC Date 对象

// 自定义时区（例：服务器全部存 UTC）
const timezone = 'UTC';
const utcResult = toLunar(new Date('2024-02-09T16:00:00Z'), { timezone });
const roundTrip = toGregorian(utcResult.lunar, { timezone });
```

---

## API Reference

### `toLunar(input, options?)`
- **input** (`GregorianDateInput`): `Date`、UTC 时间戳（毫秒）或 `{ year, month, day }` 对象。月份为 1-12。
- **options.timezone?** (`string`): IANA 时区 ID，决定如何理解输入的“本地日期”。默认 `Asia/Shanghai`。
- **returns**:  
  ```ts
  interface ToLunarResult {
    lunar: LunarDate;      // 归一化农历日期
    source: Date;          // 归一化后的公历 Date（UTC）
    metadata: { timezone: string };
  }
  ```

### `toGregorian(input, options?)`
- **input** (`LunarDateInput`): `LunarDate`、`{ year, month, day, isLeapMonth? }` 或 `[year, month, day, isLeapMonth?]`。
- **options.timezone?**：与 `toLunar` 一致，用于将结果对齐到指定时区的零点。
- **returns**:  
  ```ts
  interface ToGregorianResult {
    date: Date;            // UTC Date，表示当地零点
    source: LunarDate;     // 归一化农历输入
    metadata: { timezone: string };
  }
  ```

### `createLunarDate(input)`
将用户输入归一化为不可变 `LunarDate`。会校验年份（`1890-2100`）、月份（1-12）和日期（1-30），非法值会抛出 `InvalidLunarDateError`。

### `formatLunar(input, options?)`
把农历日期渲染为标准字符串，默认输出 `农历甲辰年正月初一`。

```ts
formatLunar(lunar, {
  zodiac: true,        // 农历甲辰年（龙）正月初一
  prefix: 'Lunar ',    // 自定义前缀；传 false 则不输出“农历”
  stemBranch: false,   // 禁用天干地支，用数字年份
  leapMarker: '闰月'   // 农历闰月前缀
});
```

### `formatLunarParts(input, options?)`
与 `formatLunar` 相同，但返回结构化片段，可用于自定义渲染或本地化：
```ts
[
  { type: 'prefix', value: '农历' },
  { type: 'yearStem', value: '甲' },
  { type: 'yearBranch', value: '辰' },
  { type: 'literal', value: '年' },
  { type: 'month', value: '正月' },
  { type: 'day', value: '初一' }
]
```

---

## Inputs & Outputs

| 名称 | 说明 | 取值/结构 |
| --- | --- | --- |
| `LunarDate` | 不可变农历对象 | `{ year: number; month: 1-12; day: 1-30; isLeapMonth: boolean }` |
| `LunarDateInput` | 任意可被归一化的农历输入 | `LunarDate`、对象或元组 `[year, month, day, isLeapMonth?]` |
| `GregorianDateInput` | 公历输入 | `Date`、UTC 毫秒数或 `{ year, month, day }`（1 基月） |
| `ConversionOptions` | 时区配置 | `{ timezone?: string }`，默认 `Asia/Shanghai` |
| `FormatLunarOptions` | 文案控制 | `prefix`, `stemBranch`, `zodiac`, `leapMarker`, `style`, `locale`（详见 `src/types.ts`） |

**年份范围**：`1890-2100`。超出范围会抛出 `InvalidGregorianDateError` 或 `InvalidLunarDateError`。  
**时区行为**：输入公历时先按指定时区转换为当地日期，再映射到农历；反向转换亦然，确保 round-trip 不受服务器/客户端本地时间影响。

---

## Formatting Guide

`FormatLunarOptions` 关键字段：
- `prefix` (`boolean | string`): 控制“农历”前缀，默认 `true`。传字符串代表自定义前缀，传 `false` 关闭。
- `stemBranch` (`boolean | 'year' | 'all'`): 是否输出天干地支。默认 `true`（仅年干支）。设为 `false` 时使用数字年份。
- `zodiac` (`boolean`): 是否在年份后附加 `（龙）` 等生肖信息。
- `leapMarker` (`string`): 闰月前缀，默认 `闰`（例如“闰八月”）。
- `style` (`'long' | 'short'`): 月份/日期文案风格，当前 long/short 输出一致，未来可扩展为“正/初一”或“正1/初1”。
- `locale` (`string`): 预留多语言支持，现阶段仅 `zh-CN`。

---

## Testing & Development
```bash
# 运行 Lint
npm run lint

# 运行测试
npm run test

# 构建产物（ESM + CJS + d.ts）
npm run build
```

开发规范与 TDD 流程请参考 [`docs/v2-plan.md`](./docs/v2-plan.md) 和 `CONTRIBUTING` 约定（若存在）。

---

## FAQ
**Q: 可以扩展到 1890 年以前或 2100 年以后吗？**  
A: 当前数据表仅覆盖 `1890-2100`。扩展范围需要官方年表或权威资料，规划请见 v2 计划。

**Q: 如何输出节气、传统节日？**  
A: v2 暂未内建，可利用 `LunarDate` + 自定义数据源组合。`formatLunarParts` 预留了挂载点，后续版本会补充。

**Q: 浏览器中如何使用？**  
A: 包为纯 TypeScript 输出，默认提供 ESM/CJS。通过 bundler（Vite、Webpack、Rollup）或直接 `import` 即可。

---

## License
[MIT](./LICENSE)
