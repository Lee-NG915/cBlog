# 事件梳理模版

> 用于将三方平台（Klaviyo / GA4 / Meta Pixel 等）的 PRD 拆解为前端可消费的事件清单。
>
> **输出文件名**：`<platform>.events.md`（如 `klaviyo.events.md`），放置于本目录。

---

## 1. 前置准备

开始梳理前，必须先完成 **3 个输入**：

| 输入                                                    | 用途                                                    |
| ------------------------------------------------------- | ------------------------------------------------------- |
| PRD 文档                                                | 事件清单 + 字段定义的业务来源                           |
| 三方平台官方开发者文档                                  | 校准事件名大小写、字段标准；与 PRD 冲突时**以官方为准** |
| 前端事件名映射 `/events-name/<platform>-events-name.ts` | 决定事件归入「前端追踪事件」还是「待确认事件」          |

---

## 2. 文档结构

按以下顺序输出小节，缺一不可：

```
# <Platform> Trigger Activity Feed - Event List
> [头部引用 - 见 §3]

## ✅ 前端追踪事件         (主表 + 每事件 Schema 小节，见 §4 §5)
## ⚠️ 待确认事件           (PRD 有但前端未注册，单表，见 §6)
## 🚫 已废弃事件           (PRD 明确无需上报，单表，见 §7)
## 待确定事项 (Open Questions)  (开放问题列表，见 §8)
```

---

## 3. 文档头部（Blockquote 引用）

文档第一行 H1 标题，紧随其后用 blockquote (`>`) 列出 **4 项必备引用**：

```markdown
> **当前 PRD**: <PRD URL> > **官方开发者文档**: <三方平台开发者文档 URL，定位到对应章节锚点>
> **前端事件名映射**: `libs/.../events-name/<platform>-events-name.ts` > **生成规则**：
>
> - 🛠️ 有修改的字段；🆕 新增字段；💵 价格字段（含市场货币符号）
> - 通用字段（`$value`、`$event_id`、user info 等）按现有内容上报；表格只列各 trigger 特有字段
> - 每个事件用 **TS Schema (聚合类型)** + **Example** 描述
```

---

## 4. 「前端追踪事件」主表

**范围**：PRD ∪ `events-name/*.ts` 注册事件（**合并**为同一张表），分两类：

- **(A) PRD ∩ events-name**：从 PRD 提取 Schema
- **(B) events-name 已注册但 PRD 未涉及**：**Schema 必须从代码** (`triggers/<platform>-events.trigger.ts`) **总结产出**，不可标注 TBD / 「见其他 PRD」

**表格列**：

| 列          | 内容规范                                                                               |
| ----------- | -------------------------------------------------------------------------------------- |
| `#`         | 序号，从 1 递增                                                                        |
| 事件名      | 与官方文档一致，大小写敏感                                                             |
| 事件 Schema | 锚点链接，指向下方 Schema 小节，例：`[§ Schema: Added to Cart](#schema-added-to-cart)` |
| 触发场景    | PRD 描述摘要                                                                           |
| 关联模块    | 自动推断（Cart / Checkout / Product / Order / Payment / User 等，多模块用 `/` 分隔）   |
| 生效渠道    | `Web` / `POS` / `All`                                                                  |
| 备注        | N/A 或简短说明（如命名差异、(B) 类数据来源）                                           |

---

## 5. Schema 写法（每事件一个独立小节）

主表下方紧跟 `### Schemas`，每个事件一个 `#### Schema: <事件名>` 子小节。

每个小节包含两块代码：**TS Schema** + **Example**。

### 5.1 TS Schema

- **类型形式**：聚合类型，单一 `type`（或 `interface`），所有字段聚合于一个类型内
- **嵌套**：对象 / 数组元素 **inline 内联**写（`Array<{ ... }>` / `{ field: { ... } }`），**不抽出独立子 interface**
- **字段注释**：每个字段上方一行 JSDoc `/** ... */`，内容含字段含义 / 必填性 / 🛠️/🆕/💵 标记 / 单位
- **类型命名**：`<EventName>EventParameters`（例：`AddedToCartEventParameters`、`StartedCheckoutEventParameters`）
- **可选字段**：用 `?` 标记；**联合类型**：用 `|`
- **共享子结构**：仅当多个事件**真正共享**时才抽出公共子类型并 `&` intersection 聚合，否则一律 inline

**示例**：

````markdown
**TS Schema**

```ts
/** Added to Cart 事件参数（聚合类型，所有字段 inline） */
type AddedToCartEventParameters = {
  /** Klaviyo 标准字段。值 = `Added to Cart Value`，即购物车商品总价 💵 */
  $value: string;
  /** 加车后购物车商品列表 */
  Items: Array<{
    /** SPU 名称 */
    ProductName: string;
    /** 商品单价（含原价 + 销售价） 🛠️ 更新字段名称 */
    UnitPrice: {
      /** 原价；无划线价时为 null 💵 */
      OriginalPrice: string | null;
      /** 销售价 💵 */
      SalesPrice: string;
    };
    // ... 其他字段
  }>;
};
```
````

### 5.2 Example

紧随 TS Schema 后，提供 `const example: <TypeName> = { ... }` 真实形态示例对象。

- 必须覆盖 PRD 列举的**边界值 / 变体**（如 `OriginalPrice: null`、空数组等）
- 字段值使用真实业务样例（商品名、SKU、URL 等），不要纯占位符

### 5.3 数据来源（仅 (B) 类事件）

若 Schema 来自代码而非 PRD，在 `#### Schema: <事件名>` 标题下方加一行 blockquote 注明：

```markdown
> 数据来源：`libs/.../triggers/<platform>-events.trigger.ts` → `trackXxxEvent`
```

---

## 6. 「待确认事件」表

**范围**：PRD 中定义但 `events-name/*.ts` 未注册（多为后端触发 / 新增事件）。

**简化列**（不输出 Schema）：

| 列               | 内容规范                                |
| ---------------- | --------------------------------------- |
| `#`              | 序号                                    |
| 事件名           | 与 PRD 一致                             |
| PRD 触发场景概述 | 简短摘要                                |
| 关联模块         | 自动推断                                |
| 备注             | N/A 或关键问题（如「PRD schema 缺失」） |

表格上方需用一行说明：「该列表中事件，为 PRD 中定义事件，上报场景不在前端，请人工确认」。

---

## 7. 「已废弃事件」表

| 列     | 内容规范          |
| ------ | ----------------- |
| `#`    | 序号              |
| 事件名 | PRD 中的事件名    |
| 状态   | `已废弃`          |
| 备注   | 引用 PRD 原文说明 |

---

## 8. 「待确定事项」(Open Questions)

正文以下，列出需 PM / 后端 / 技术核对的开放问题（编号自增）。

- 每条以 `**关键词**` 开头加粗，再补一句详情
- 已解决项可保留并用 `~~删除线~~ ✅ 已确认` 标注

---

## 9. 通用约定

| 约定              | 规则                                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 事件名大小写      | 以**官方文档**为准；PRD 与官方冲突时记入 Open Questions                                                                                |
| `$value` 字段     | 值 = `[trigger name] Value`（如 Added to Cart 中 `$value = Added to Cart Value`）；TS Schema 字段名直接写 `$value`，注释里标业务字段名 |
| 多变体 / 多映射值 | 每个值占一行注释                                                                                                                       |
| 前端常量名        | **不入**主表；仅在头部 events-name 文件路径中体现                                                                                      |
| 表格序号列 `#`    | 所有表格首列统一为 `#`，各表独立从 1 开始                                                                                              |
