# 原始数据审计与恢复记录

审计时间：2026-09-26。仅只读检查下载的 `source.zip`，未执行包内代码、联网采集新价格或修改源 ZIP。本文区分归档内容与已经实现的功能，不把包内说明文字当作新站指令。

## 恢复结论

原包保存 **1,936 条资产、50 个发行方、16 个网络、16 个分类**。现有 GROUND 最初只采用 11 条精选/研究资料，因而完整目录、来源层和发行方入口被缩掉。现已原样导入 `src/data/catalogue.json`，由 `src/lib/catalogue.ts` 提供保留原始字段、空值与网络语义的类型及纯函数。

原始资产目录没有 $GRAIL 项目本币行，也没有原项目推广 CA。其地址、社交和购买引导来自独立品牌组件，可移除而不删第三方资产地址、发行方官网、产品页或资料来源。Robinhood 在这份目录中是一个 **第三方发行方与观察网络**；其 14 条资产身份记录保留，不用于声称 GROUND 与它有关。

完整目录恢复的是 **日期明确的历史数据**。另行新增的 DEX Screener 市场参考价、Wallet Standard 连接和只读 SOL 余额与此历史数据层分开；实际交易尚未接入。原 `Stats.tsx` 的 GRAIL 平台成交量/费用/钱包数据不进入 GROUND 数据层。

## 归档完整性

| 项目 | 记录 |
| --- | --- |
| 数据快照时间 | 2026-09-23T13:00:28.464Z |
| 全局探测时间 | 2026-09-23T13:02:53.192Z |
| catalogue.json 原始大小 | 2,565,603 bytes |
| SHA-256 | 38260d846d8d00077e3d563106c3facebb13491cc64e8eae1733c1cf34bb6df1 |
| 资产条数 | 1936 |
| 唯一 slug | 1936 |
| 发行方 | 50 |
| 网络 | 16 |
| 分类 | 16 |
| 存在价格 | 1008 |
| 无保存价格 | 928 |
| 保存 curve/probe | 80 |
| OPEN / THIN / WATCH | 59 / 88 / 1,789 |
| 本次移除推广 URL | 0：原目录中没有需要移除的项目推广 URL |

分类计数、发行方计数和发行方 OPEN 计数全部与实际数组逐项一致。JSON 保留原始字节；导入后 SHA-256 与 ZIP 内文件相同。

## Schema

顶层字段：`snapshotAt`, `probedAt`, `rule`, `stats`, `categories`, `issuers`, `networks`, `assets`。

- `stats`: `assets`, `issuers`, `networks`, `open`, `thin`, `watch`；都是这次归档的目录计数。
- `categories`: `{id:string,label:string,count:number}[]`。
- `issuers`: `{name:string,site:string,count:number,categories:string[],open:number}[]`。
- `networks`: **string[]**，不是 `{id,label}` 对象数组；标签通过 `networkLabel` 解析。
- `rule`: `impactCap`, `openMinUsd`, `thinMinReservesUsd`, `quoteReserves`, `ladder`, `engineVersion`, `method`, `measuredAssets`，只保存原始规则说明。

### 资产字段覆盖

| 字段 | 有字段的记录数 | 其中 null 数 | 实际 JSON 值类型（Python 名称） |
| --- | --- | --- | --- |
| address | 1936 | 871 | NoneType/str |
| backing | 1936 | 0 | str |
| category | 1936 | 0 | str |
| chain | 1936 | 0 | str |
| chains | 1936 | 0 | list |
| curve | 80 | 0 | list |
| desc | 1936 | 0 | str |
| dex | 1936 | 1881 | NoneType/str |
| fdv | 1936 | 1736 | NoneType/float/int |
| holders | 1815 | 805 | NoneType/int |
| imageUrl | 1936 | 123 | NoneType/str |
| issuer | 1936 | 0 | str |
| liquidityUsd | 1936 | 1786 | NoneType/float/int |
| marketCap | 1936 | 1736 | NoneType/float/int |
| name | 1936 | 0 | str |
| pairUrl | 1936 | 871 | NoneType/str |
| perOz | 1936 | 0 | bool |
| permalink | 805 | 0 | str |
| priceSource | 1936 | 928 | NoneType/str |
| priceUsd | 1936 | 928 | NoneType/float/int |
| probe | 80 | 0 | dict |
| quote | 1936 | 1881 | NoneType/str |
| quoteReservesUsd | 1936 | 1786 | NoneType/float |
| routes | 1936 | 0 | int |
| slug | 1936 | 0 | str |
| source | 1815 | 0 | str |
| stamp | 1936 | 0 | dict |
| symbol | 1936 | 0 | str |
| unit | 1936 | 0 | str |
| unitLabel | 1936 | 0 | str |

`holders/source/permalink` 是 JSON 中的实际字段，原 `data.ts` 的旧 interface 未覆盖它们；恢复类型已补齐。未出现的可选字段保持未出现，已有 null 保持 null，不填 0、不补造地址/价格。所有 1,936 条都有非空 name/symbol/backing/desc/unit/unitLabel。

### 子结构

```ts
curve?: { sizeUsd: number; impact: number | null; filled: boolean }[];
probe?: {
  engine: string; engineVersion: string; coverage: string;
  venue: string | null; hops: number | null; blockRef: number | string | null;
  probedAt: string; filledRungs: number; kneeUsd: number; atLeast: boolean;
};
stamp: {
  state: "OPEN" | "THIN" | "WATCH"; cleanToUsd: number | null; reason: string;
  quoteReservesUsd?: number; method?: string; atLeast?: boolean; partial?: boolean;
};
```

80 条记录有 probe，engine 全部为 `jupiter`；其中 coverage 78 条 `measured`、2 条 `partial`。3 条 probe 的 venue/hops/blockRef 是 null。`stamp.partial` 只存在于 `xs-orclx` 和 `xs-cscox`。

curve 的 impact 按原前端约定是 ratio：`Curve.tsx:20–21` 显示 `(100 * value)`，`catalogue-math.ts:4` 的 2% 阈值为 `0.02`。SPYx 的 $5m 点保存 `1.599911`，所以原站百分比也为 159.99%；本次不改原始值、不伪造曲线。

## 数据来源与展示语义

| priceSource 原值 | 条数 | 建议展示与入口 |
| --- | --- | --- |
| dex pair | 55 | 历史 DEX pair 观察；保留 network、dex、quote、pairUrl |
| jupiter price | 145 | Jupiter 保存价格；保留 token 索引链接，避免声称实时行情 |
| issuer price | 805 | RealT 发行方产品价格；保留对应 permalink |
| issuer NAV | 3 | 发行方声明 NAV；不是可执行市场报价 |
| null / unknown | 928 | 无保存价格；可看资产身份/发行方和已有来源字段 |

`source` 数据来源标记为：`jupiter` 1,010 条、`realt` 805 条；121 条基础目录记录无此可选字段。这与 priceSource 层不同：1,010 条 Jupiter 发现记录中只有 145 条保存价格，其余 865 条 priceUsd/priceSource 为 null。不能把它们全部标为“有 Jupiter 报价”。

1,065 个 pairUrl 的域名都是 `dexscreener.com`，但其中 **1,010 个 Jupiter 记录的 URL 最后一段等于 token address**，是 token 发现/索引入口，不证明存在独立交易池。其余 55 条价格来源才标记为 dex pair，dex/quote 有值。统一来源按钮宜称 Source link / DEX Screener index，而非把所有链接称为 Best route。

805 条 RealT 记录保留每套房产产品链接 `permalink`，价格来源为 issuer price；不能当作其代币二级市场成交价。3 条 issuer NAV 记录为 BUIDL (`buidl`), BENJI (`benji`), WTGXX (`wtgxx`)。发行方官网来自 `issuers[].site`，完整 50 条保留。

图片只作为身份显示：原 imageUrl 中 1,008 个指向 `xstocks-metadata.backed.fi`，805 个指向 `realt.co`，123 条为 null；没有本地相对 imageUrl。身份图片已在后续恢复任务中从 ZIP 本地媒体解出，详见下节；原品牌图标和社媒素材仍不导入。`logos.json` 原映射覆盖 1,936 token keys / 50 issuer keys，`asset-map.json` 有 1,924 媒体映射项，可作为后续独立媒体恢复资料。

### 网络语义

| network id | 作为 chain 的观察记录数 |
| --- | --- |
| algorand | 2 |
| arbitrum | 4 |
| avalanche | 1 |
| base | 2 |
| bsc | 2 |
| celo | 0 |
| ethereum | 53 |
| gnosis | 806 |
| mantle | 0 |
| plume | 0 |
| polygon | 8 |
| robinhood | 14 |
| solana | 1042 |
| stellar | 1 |
| sui | 0 |
| xdc | 1 |

`chain` 是本条保存价格/路由观察的网络，`chains` 是记录的部署/支持网络列表。primary Solana 1,042 条，chains 包含 Solana 1,048 条。network union 恰为上表 16 项；部分网络在 chains 中出现但没有作为主要观察网络的条目。

例如 USDY 的旧价格 1.12 来自 Ethereum 观察，虽其 chains 包含 Solana，不能把旧观察重新标成 Solana 报价；XAUm 旧观察网络为 BNB Chain，也不能改标签。GROUND 的 11 条精选资料可作额外编辑层，但完整 archive 是原观察，不因新品牌选择 Solana 而改写历史网络。

## 重复与身份

- exact row / slug / case-folded symbol / `(chain,address)` 均无重复。
- name 和 `(issuer,name)` 只有一组重复：`News xStock`，分别为 `xs-nwsx` / `NWSx` 与 `xs-nwsax` / `NWSAx`，地址不同；这可能是不同股份类别，不能仅按名称合并。
- 本次保留 1,936 条，未以名称、分类或发行方去重删行。来自发行方/发现来源的身份并不等于本次已经独立验证每一条权利与合规资格。

## 原页面实际展示了什么

- `Home.tsx:22–39`：metals/treasuries/stocks/ETFs/ranking/curve/bonds/credit/estate/collectibles/resources 等资产入口。`Resources` 是碳/商品/基础设施类资产区，并非 Data sources 说明页。
- `Markets.tsx:130–137`：Asset / Category / Chain / Price / Clean to / Liquidity / Stamp 表格；`:163` 展示 symbol + issuer，`:177` 展示 priceSource。搜索包含资产、symbol、发行方、chain。
- `Issuers.tsx:7–10`：50 个发行方归档；`:40–64` 等卡展示发行方官网、资产数、分类和查资产入口。此文件大部分为静态展开卡片。
- `AssetDetail.tsx:32`：从 data.issuers 查官网；`:128–141` 显示地址和 DEX Screener 来源链接；`:187–192` 显示价格来源+日期；`:70–89` 显示 probe 的路由/区块/时间；`:223–227` 已明确保存探测结果并非新执行检查。
- `data.ts:1,75–76`：直接静态 import `catalogue.json`，无动态请求。旧 TypeScript 类型未完整涵盖 source/permalink/holders，不是原 JSON 没有这些数据。

## 动态 API 与平台指标边界

对 ZIP 内 src/scripts 的可执行源码扫描，没有 fetch/axios/XMLHttpRequest/WebSocket/EventSource 调用，也没有 `src/app/**/route.ts` API handler。`Docs.tsx:727` 和 `Thesis.tsx:1733–1773` 的 `/api/v1/assets`、probe、curve、stamp、scoreboard 仅为渲染说明字符串。ZIP 没有采集/probe 生成器；scripts 仅静态整理、静态预览、浏览器验证。不能由这些文案推断归档应用已经提供对应服务。

`Stats.tsx` 渲染硬编码的 GRAIL/Robinhood 平台指标（例如 `:25` 的 $205 成交量，:38 的 18 次购买，:51 的 11 个钱包）与已展开日期/交易链接。尽管文字写“live”“Updated every minute”，包内没有更新这些数据的实际调用。本次不导入到 GROUND 活跃交易统计，新的目录统计应从 archive 计算并标记快照日期。

`Contract.tsx` 只负责原 $GRAIL 合约、购买与桥接引导。扫描完整 catalogue.json：没有任何行包含 grail 文本，也没有原推广 CA；删除项目推广无需删除第三方数据。

## 恢复方案

1. 完整 catalogue 放在单独归档层，保留全部 16 分类 / 50 发行方 / 16 网络；现有 11 条精选数据继续作为首页策展或补充官方权利资料。
2. 新资产目录使用现有黑绿 UI、搜索、分类/网络/来源/归档状态筛选、分页或渐进展示；用户按需浏览全部 1,936 条，而无需首页堆满原分类条。
3. 恢复发行方、资料来源和目录统计入口；统计只反映已保存数据覆盖率，不导入原项目的成交量/买家/费用。
4. 详情保持 name/symbol/backing/desc/chain/chains/address/source/permalink/pairUrl 和已保存的 price/curve/probe，并清晰分开来源类型、价格日期、观察网络、空值与交易连接状态。
5. 既保留第三方资料链接，也移除原品牌推广、原 CA 和购买 redirect。未来若接实时源，另做有明确 provider/update/failure 状态的服务，不能将归档假装 live。

## 实现文件与复现

- `src/data/catalogue.json`：原始完整归档，2,565,603 bytes。
- `src/lib/catalogue.ts`：导出完整接口、catalogue、archiveAssets/categories/issuers/networks、slug 查找、标签与价格格式化、5 个来源组。
- `scripts/import-catalogue.py`：只读取 ZIP 内 JSON；保留全部条目/空值，若发现原推广 URL 才移除；当前 0 个命中。

```sh
python3 scripts/import-catalogue.py path/to/source.zip
```

## 现成身份图片恢复（2026-09-26）

按用户要求恢复原包资产/发行方图片，不生成新图、不改图片内容。`logos.json` 的实际结构为 `{tokens:{[assetSlug]:imagePath},issuers:{[issuerName]:imagePath}}`；key 是 slug/name，没有 `token:` 前缀。通过 `asset-map.json` 将 `/logos/tokens/` 和 `/logos/issuers/` 路径对应到 ZIP 内 `public/sites/...` 现成媒体。

- 原映射全部可用：1,936 个资产、50 个发行方。
- 去重恢复 1,909 张 PNG/WebP，16,579,284 bytes，到 `public/catalogue-media/`。
- 77 条资产在原映射中使用发行方图标作为身份 fallback，继续沿用已有映射，没有自行补图。
- 本次不恢复原 GRAIL 品牌图、社交图片、art 大图、favicon 或字体；只提取 identity 路径对应的文件。
- 每个本地图片均验证与 ZIP 原字节完全一致，全部映射路径都是 `/catalogue-media/...`，不保留原项目域名。
- `src/data/catalogue-media-map.json` 只保存身份到本地图片路径的映射；`src/lib/catalogue-media.ts` 的 ArchivedAsset 采用 type-only import，客户端不会为找图片而引入完整价格目录。
- `assetMediaUrl(asset)` 按唯一 slug 返回本地路径；`issuerMediaUrl(name)` 按原发行方名查找。未知身份返回 null，不猜图、不返回外部地址。

复现：

```sh
python3 scripts/import-catalogue-media.py path/to/source.zip
```
