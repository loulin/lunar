# Lunar v2

> 全新农历 / 公历互转库，面向现代 JavaScript / TypeScript 生态。

## 愿景
- **准确互转**：覆盖 `1890-2100` 年区间，逐步扩展更广范围的公农历互转能力。
- **高性能**：查表 + 算术的纯函数实现，适配 Node.js、浏览器与边缘计算环境。
- **易扩展**：结构化 `LunarDate` 模型，保留生肖、天干地支、节气等挂载点。
- **TDD 驱动**：通过 Vitest +黄金用例驱动开发，确保接口稳定及回归可控。

更多目标与里程碑详见 [`docs/v2-plan.md`](./docs/v2-plan.md)。

## 当前状态
- `v2` 分支正在重构数据模型与工具链，核心 API 以 TDD 方式逐步补齐。
- `toLunar / toGregorian` 均已基于新版年表实现，可在 1890-2100 年范围内互转（含闰月）。
- `createLunarDate` 等工具函数可用于业务模型或测试基石，round-trip 测试会持续扩充。

## 环境要求
- 开发/构建：Node.js `>= 22`（建议搭配 pnpm 9 / npm 10 / Yarn 4）
- 运行/集成：Node.js `>= 16.20` 或任一支持 ES2020+ 的现代浏览器

> 发布包由 tsup 转译至 Node 16 目标，开发阶段依然推荐使用最新 LTS 以获取更快的构建 / 检查能力。

## 快速开始
```bash
# 安装依赖
yarn install   # 或 pnpm install / npm install

# 运行单元测试（TDD 推荐使用 --watch）
yarn test

# 监听模式，边写代码边跑测试
yarn test:watch

# 构建发布产物（tsup 生成 ESM + CJS + d.ts）
yarn build
```

### 用例示例
> `toLunar` / `toGregorian` 均返回结构化结果（含 metadata），示例如下：

```ts
import { toLunar, toGregorian, createLunarDate } from 'lunar';

const lunarBirth = createLunarDate({ year: 1991, month: 5, day: 18 });

const { date: solarBirthday } = toGregorian(lunarBirth);
const { lunar } = toLunar(new Date('2014-10-24'));

// 指定时区（默认 Asia/Shanghai），例如服务器以 UTC 存储时间
const timezone = 'UTC';
const utcResult = toLunar(new Date('2014-10-24T00:00:00Z'), { timezone });
const roundTrip = toGregorian(utcResult.lunar, { timezone });
```

## 时区与本地化策略
- 默认使用 `Asia/Shanghai` 解释 `Date` 输入/输出，确保与中国官方历法数据一致。
- 通过 `ConversionOptions.timezone` 可指定任意 IANA 时区，库会以该时区的“本地日期”做互转；适合在 UTC 存储/展示中消除偏差。
- 不涉及格式文本的本地化（如节气、生肖翻译），但 `docs/v2-plan.md` 中已为后续扩展预留挂点。

## 数据结构与输入约定
- `LunarDate`：  
  - `year`：范围 `1890-2100`；超出范围会抛出 `InvalidLunarDateError`。  
  - `month`：1-12，1 表示正月；闰月仍使用其对应的数字（例如闰八月）。  
  - `day`：1-30，根据具体月份大小校验。  
  - `isLeapMonth`：布尔值，指示该月是否为闰月。  
- `LunarDateInput`：既可以是 `{ year, month, day, isLeapMonth? }` 也可以是 `[year, month, day, isLeapMonth?]`。  
- `GregorianDateInput`：支持 `Date`、UTC 毫秒数或 `{ year, month, day }`（月份同样为 1-12）。  
- `ConversionOptions.timezone`：IANA 时区 ID（默认 `Asia/Shanghai`），用于在互转过程中解释本地日期。

## 项目结构
```
├── docs/              # 规划、算法说明
├── src/
│   ├── types.ts       # 数据结构定义 & 工厂函数
│   ├── conversion.ts  # 公农历互转核心（待实现）
│   ├── utils/         # 归一化与校验工具
│   └── __tests__/     # Vitest 用例（TDD）
├── tsup.config.ts     # 构建配置
├── vitest.config.ts   # 测试配置
└── eslint.config.mjs  # ESLint Flat config
```

## 现代工具链
- **TypeScript 5**：默认严格模式，全面暴露类型。
- **Tsup**：生成 ESM / CJS / `.d.ts`，默认开启 SourceMap。
- **Vitest**：单元测试 + 未来的黄金样本 / 属性测试。
- **ESLint 9 + typescript-eslint 8（Flat Config）**：保持现代编码规范。

## 开发约定（TDD）
1. 编写或更新测试用例（`src/__tests__`）。
2. 运行 `yarn test:watch` 观察失败情况。
3. 实现/重构功能直至测试通过。
4. 回顾并更新文档、示例与数据表。

CI 将在 `lint`、`test`、`build` 通过后才允许合并。

## 贡献指南
- 新增特性前请先查阅 [v2 规划](./docs/v2-plan.md)，或在 issue 中讨论需求与挑战。
- Pull Request 需附带对应测试与文档。
- 如涉及算法 / 数据更改，请在 PR 描述中提供来源与验证方式。

## 许可
[MIT](./LICENSE) （与 v1 保持一致）
