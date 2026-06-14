# Klaviyo Events Audit

> 校准范围：前端追踪事件（`klaviyo-events-name.ts` 中定义的事件）
> 参考文档：[Klaviyo trigger activity feed](https://castlery.atlassian.net/wiki/spaces/PM/pages/3719364730/Klaviyo+trigger+activity+feed)

---

## 事件清单

| 事件名                  | 常量 key                   | Confluence 规范        |
| ----------------------- | -------------------------- | ---------------------- |
| `identify`              | `KL_IDENTIFY`              | 无（Klaviyo SDK 标准） |
| `Viewed Product`        | `KL_VIEWED_PRODUCT`        | 无（Klaviyo SDK 标准） |
| `Recently Viewed Items` | `KL_RECENTLY_VIEWED_ITEMS` | 无（Klaviyo SDK 标准） |
| `Added to Cart`         | `KL_ADDED_TO_CART`         | 有，见下               |
| `Started Checkout`      | `KL_STARTED_CHECKOUT`      | 有，见下               |

---

## Added to Cart

**上报范围**：加车后，购物车中每个**可售卖**商品（排除 SKU/SPU disabled、当前 channel unavailable 的商品）

| 字段                   | 说明                                                        | 标注          |
| ---------------------- | ----------------------------------------------------------- | ------------- |
| `$value`               | = Added to Cart Value，购物车商品总价格（含刚加车的商品）   |               |
| `Items`                | 购物车商品列表                                              |               |
| `Items.ProductName`    | 商品 SPU 名称                                               |               |
| `Items.Quantity`       | 商品数量                                                    |               |
| `Items.ImageURL`       | 商品图片，取 img list 中的 mini                             |               |
| `Items.ProductURL`     | 商品 PDP URL                                                |               |
| `Items.UnitPrice`      | 商品单价，含原价和销售价；无划线价时 `OriginalPrice: null`  | 🛠️ 字段名更新 |
| `Items.RowTotal`       | line item 价格 = 销售价单价 × 数量                          | 🛠️ 字段名更新 |
| `Items.SKU`            | 商品 SKU code                                               |               |
| `Items.Categories`     | 商品后台类目，如 `['Living Room Sets', 'Living Room Sets']` | 🛠️ 字段名更新 |
| `Items.CollectionName` | 商品 Collection Name，如 `'Dawson Collection'`              | 🆕 新增       |
| `Items.OptionsText`    | option type + value，如 `['Size: 160cm', 'Color: blue']`    | 🆕 新增       |

**`UnitPrice` 结构示例**：

```json
"UnitPrice": {
  "OriginalPrice": null,
  "SalesPrice": "$2,298.00"
}
```

> 所有价格字段默认带当前市场货币符号。

---

## Started Checkout

**上报范围**：发起结算时，购物车中每个**可售卖**商品（排除 SKU/SPU disabled、当前 channel unavailable 的商品）

| 字段                   | 说明                                                        | 标注          |
| ---------------------- | ----------------------------------------------------------- | ------------- |
| `$value`               | = Started Checkout Value，发起结算时商品总价格              |               |
| `Items`                | 购物车商品列表                                              |               |
| `Items.ProductName`    | 商品 SPU 名称                                               |               |
| `Items.Quantity`       | 商品数量                                                    |               |
| `Items.ImageURL`       | 商品图片，取 img list 中的 mini                             |               |
| `Items.ProductURL`     | 商品 PDP URL                                                |               |
| `Items.UnitPrice`      | 商品单价，含原价和销售价；无划线价时 `OriginalPrice: null`  | 🛠️ 字段名更新 |
| `Items.RowTotal`       | line item 价格 = 单价 × 数量                                | 🛠️ 字段名更新 |
| `Items.SKU`            | 商品 SKU code                                               |               |
| `Items.Categories`     | 商品后台类目，如 `['Living Room Sets', 'Living Room Sets']` | 🛠️ 字段名更新 |
| `Items.CollectionName` | 商品 Collection Name                                        | 🆕 新增       |
| `Items.OptionsText`    | option type + value，如 `['Size: 160cm', 'Color: blue']`    | 🆕 新增       |

---

## 图例

| 标注 | 含义                 |
| ---- | -------------------- |
| 🛠️   | 字段名有变更，需更新 |
| 🆕   | 新增字段，需补充上报 |

## Todos

- 1. started checkout 是否需要跟踪 gift 商品，目前仅追踪了普通商品
- 2.
