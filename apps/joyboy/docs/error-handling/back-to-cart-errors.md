# Back to Cart Error Codes

所有在 checkout 流程中，按钮文案为 "Back to cart" 的 error code 汇总。

数据来源：

- `packages/monorepo-i18n/src/lib/locales/error/en-CA.json`
- `libs/config/src/ec-error-codes.ts`

| Error Code | Enum Key                                                     | Title                                                | 按钮字段                      |
| ---------- | ------------------------------------------------------------ | ---------------------------------------------------- | ----------------------------- |
| `10702000` | `ErrCheckoutDeletedItem`                                     | Item is deleted                                      | `checkoutConfirm`             |
| `10702010` | `ErrCheckoutMultipleItemsDeletedItem`                        | Item is deleted                                      | `checkoutConfirm`             |
| `10702001` | `ErrCheckoutTerminalNotForSale`                              | Item is unavailable                                  | `checkoutConfirm`             |
| `10702012` | `ErrCheckoutMultipleItemsTerminalNotForSale`                 | Item is unavailable                                  | `checkoutConfirm`             |
| `10702002` | `ErrCheckoutItemNotEnabled`                                  | Item is disabled                                     | `checkoutConfirm`             |
| `10702011` | `ErrCheckoutMultipleItemsNotEnabled`                         | Item is disabled                                     | `checkoutConfirm`             |
| `10702003` | `ErrCheckoutLatestSalePriceNotEqualToCartPrice`              | Item price is outdated                               | `checkoutConfirm`             |
| `10702013` | `ErrCheckoutMultipleItemsLatestSalePriceNotEqualToCartPrice` | Item price is outdated                               | `checkoutConfirm`             |
| `10702004` | `ErrCheckoutSwatchMoreThanThree`                             | Exceeding purchase limit of swatch                   | `checkoutConfirm`             |
| `10702020` | `ErrCheckoutSwatchOneOrderInThePastTwoWeeks`                 | Exceeding purchase limit of swatch                   | `checkoutConfirm`             |
| `10702019` | `ErrCheckoutSingleSwatchMoreThanTwo`                         | Exceeding purchase limit of swatch                   | `checkoutConfirm`             |
| `10702005` | `ErrCheckoutMoreThanMaxSaleQty`                              | Quantity exceeds maximum purchase limit              | `checkoutConfirm`             |
| `10702014` | `ErrCheckoutMultipleItemsMoreThanMaxSaleQty`                 | Quantity exceeds maximum purchase limit              | `checkoutConfirm`             |
| `10702006` | `ErrCheckoutLessThanMinSaleQty`                              | Quantity not meet minimum purchase requirement       | `checkoutConfirm`             |
| `10702015` | `ErrCheckoutMultipleItemsLessThanMinSaleQty`                 | Quantity not meet minimum purchase requirement       | `checkoutConfirm`             |
| `10702007` | `ErrCheckoutUnequalQtyIncrements`                            | Quantity not meet the quantity increment requirement | `checkoutConfirm`             |
| `10702016` | `ErrCheckoutMultipleItemsUnequalQtyIncrements`               | Quantity not meet the quantity increment requirement | `checkoutConfirm`             |
| `10702008` | `ErrCheckoutItemOutOfStock`                                  | Item is out of stock                                 | `checkoutConfirm`             |
| `10702017` | `ErrCheckoutMultipleItemsOutOfStock`                         | Item is out of stock                                 | `checkoutConfirm`             |
| `10702041` | `ErrCheckoutCacheExpiration`                                 | Token expired                                        | `confirm` + `checkoutConfirm` |
| `10702035` | `ErrCheckoutCheckoutTokenExpired`                            | Token expired                                        | `confirm` + `checkoutConfirm` |
| `10703012` | `ErrOrderIMSNotEnoughInventory`                              | Item stock can't be reserved                         | `confirm`                     |
