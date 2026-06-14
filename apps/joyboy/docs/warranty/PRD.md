Warranty 简介

Warranty：即商品的保险，基于商品绑定，一种商品可以选择一种时间长度的 Warranty

Mulberry：商品可以购买不同时间长度的保险（按年），不同年限价格不同。每个商品的不同年限的 warranty 都对应着单独的 Warranty offer id（由 Mul 生成返回）；offer id 可用于保险信息的查询，保险单生成、取消等。

Guardsman：商品可以购买不同时间长度的保险（按年），不同年限价格不同，可在 Prosuro 后台配置。每个商品的不同年限的 warranty 都对应着单独的 planId（由 Guardsman 返回）；

目前 GuardsmanUS 和 CA 市场的技术供应商为 Prosuro，技术联系人 email：neill@prosuro.com

保险数据来源

数据来源

涉及的 API/SDK

Mulberry（现网）

前端通过 Mulberry 的 SDK 获得：PDP inline buttons, Cart interstitial comparison modal, 主题配置

Create Offer：创建 offer，获取 offerid（offerid 可用于生成保险单，获取保险选项价格，取消保险等）

Fetch Offer：获取 offer 信息，价格、月份等，可批量查询

Checkout：创建正式保险单接口

Retrieving Orders：获取保险单信息

Cancel Orders：取消保险单

Order status：更新订单的配送状态

Guardsman（新增）

CA&US：

通过 Guardsman Headless API 集成获得：

可配置主题的 plan selection modal

商品可购买的 warranty-月份，价格，offerid 等

通过 Guardsman Server-to-service API 可以：

正式创建保险订单

取消保险订单

验证 offer 的有效性/价格变化

完整文档：https://connect-dev.prosuro.com/documentation

访问方式：使用 Castlery 邮箱注册，Public Key: j97d8s9sfsd94v6g44dg5h3h6n7s50az

市场范围

订单重构 Phase 1 的 Warranty 服务仅用于 US、CA 市场， 其中：

CA 上线时，5 月，需要支持 Mulberry，同时也支持在 6 月切换成 Guardsman。

US 上线时，直接支持 Guardsman

预计 Guardsman 上线在 Mulberry 合同结束前 1 周-US 也同步在此时间点上线。

其他市场的集成方式可能会不同，在后续阶段扩张保险市场时，会对接不同的接入方案。

保险下单主流程 （Guardsman-Prosuro 集成）

时序图

sequenceDiagram
autonumber
actor C as Customer (用户)
participant FE as FE (前端 Widget/JS)
participant P as Prosuro API (Cart/S2S)
participant CB as Cart Backend (购物车 BE)
participant OB as Order Backend (订单 BE)
participant NS as NetSuite

    Note over C, OB: === 阶段一：购物车初始化与自我修复 (Init & Self-Healing) ===

    C->>FE: 进入购物车页面 (Lands on Cart)
    activate FE
    FE->>P: 1. 加载 Widget 脚本 & 初始化
    FE->>CB: 2. 获取购物车内商品行 (Get Cart Lines)

    Note right of FE: 批量获取 Offer
    FE->>P: 3. 调用 Prosuro Cart API (批量传入所有lineItemCode,SKUs)
    P-->>FE: 返回{lineItem {offerId, plan[{planId, term, price}]}}

    loop 遍历购物车中的每个商品行 (Line item)
     FE->>FE: 4. 检查 Prosuro Cart API返回的offerId & Term & Price,
        alt [情况A] 该商品行之前**已加购**保险 (Warranty Added Before?)
            Note right of FE: 使用/api/cart-validation校验已购保险有效性
            alt [A-1] 保险方案依然有效 (Available?)
                FE->>CB: (priceUpdated?)更新最新价格 & offerId & planId
                FE->>C: 显示 已加购保险的月份 & 最新价格
                Note over FE: 显示 "Remove plan" CTA
            else [A-2] 保险方案已失效 - 无offerId(验证offerId返回失败)
                FE->>CB: 5. 调用 API 移除该保险 (Remove warranty from cart)
                CB-->>FE: 移除成功
                FE->>C: 无已添加的保险，无"Add Extended Warranty" CTA
            else [A-3] 保险方案已失效 - 无选择的term(验证offerId返回失败)
                FE->>CB: 6. 调用 API 移除该保险 (Remove warranty from cart)
                CB-->>FE: 移除成功
                FE->>C: 无已添加的保险,展示"Add Extended Warranty" CTA
            end

        else [情况B] 未加购保险 (No Warranty)
            alt [B-1] Cart API 返回了该 SKU 的 offerId
                FE->>C: 显示 "Add Extended Warranty" CTA
            else [B-2] 无 offerId
                FE->>C: 不显示"Add Extended Warranty" CTA
            end
        end
    end
    deactivate FE

    Note over C, OB: === 阶段二：用户加购交互 (Add Warranty Flow) ===

    C->>FE: 点击 "Add Extended Warranty"
    activate FE
    FE->>P: 7. 调用 Prosuro提供的plan modal (为商品选择plans的弹窗)
    P-->>FE: 返回 Plan Modal (可配置的theme，弹窗中包含可选的plans terms&price)
    FE->>C: 弹出弹窗 (Modal Pop-up)

    C->>FE: 选择Term(年限)并确认 (Select & Confirm)
    FE->>FE: 监听modal event获得plan的term, price, providerSku，
    FE->>CB: 8. 调用 API 将plan info写入购物车 (Store Warranty)
    CB-->>FE: 写入成功
    FE->>C: 关闭弹窗，UI更新显示已加购保险的月份和价格
    deactivate FE

    Note over C, OB: === 阶段三：下单前最终校验 (Pre-Order Validation) ===

    C->>FE: 进入 Checkout 并点击 "Place Order"
    activate FE
    Note right of FE: 校验已选保险
        FE->>P: 9. 调用/api/validate-offer (Check Availability)
        P-->>FE: 返回每个offerId是否有效和对应最新的price, term，providerSku

    loop 检查订单中每一个保险计划
    alt [异常1] 保险方案已失效 (Unavailable)
        FE->>C: 弹窗提示：方案失效，是否继续下单？
        C->>FE: 确认
        FE->>CB: 移除失效保险
        FE->>OB: 创建无失效保险的订单 (Create Order)
    else [异常2] 价格发生变动 (Price Changed)
        FE->>C: 弹窗提示：价格变动，是否继续下单？
        C->>FE: 接受新价格
        FE->>OB: 更新保险价格，创建订单 (Create Order)
    else [正常] 方案有效且价格一致
        FE->>OB: 10. 创建含保险的订单 (Create Order)
    end
    end
    deactivate FE

    Note over C, OB: === 阶段四：后端注册与同步 (Post-Order Processing) ===

    activate OB
    OB->>FE: 订单创建成功 (Pending Payment)
    OB-->>OB: 锁定价格、优惠、库存等
    FE->>C: 跳转支付平台/验证Credit card信息
    C->>OB:用户支付成功
    OB-->>C: 跳转订单完成页面
    OB->>OB:更新订单状态、支付状态


    opt 订单包含保险 (Has Warranty?)
    Note right of OB: 创建保险
        OB->>P: 11. S2S 调用: register-policy
        P-->>OB: 返回 { policyId: "POL-123", status: "active" }
        OB->>OB: 保存 PolicyID, status 到订单warranty字段
    end

    OB->>NS: 12. 同步订单至 NetSuite (Sync to NS)

    deactivate OB

\*未包含异常状态，异常在下放需求详情中有描述

泳道图

Cart 中添加保险

目前保险选择途径有 2 中：

可以在 PDP 选择，加车时同步加入购物车：调用加车接口时，传入 warranty 的信息

或者在购物中为商品选择保险

Cart 中存储的保险信息

warranty 会归属于某个 line item，所以 cart_line_item.warranty 字段下存储保险的 JSON 信息 - 可以根据不同品牌、不同市场储存不同的保险字段

Mulberry

Guardsman【新增】

{
"durationMonths": "string",
"warrantyOfferId": "string",
"warrantyOfferPrice": "string",
"warrantyOfferCost": "string"
"warrantyVendor": "string"
}

{
"durationMonths": "string",
"warrantyOfferId": "string",
"warrantyPlanId": "string",
"warrantyOfferPrice": "string",
"warrantyOfferCost": "string"
"warrantyVendor": "string",
"warrantyProviderSku":"string"
}

durationMonths: 用户为商品选择的保险月份

warrantyOfferId：Mulberry 返回的 offer id

warrantyOfferPrice：Mulberry 返回的 warranty plan 单价

warrantyOfferCost：plan 总价=单价\*line item 的商品数量

[新增]warrantyVendor：保险供应商，值为 Mulberry。数据迁移时，需要为旧 cart 里的保险全部赋值为 Mulberry

durationMonths: 用户为商品选择的保险年份\*12

warrantyOfferId：Guardsman offer id，代表该商品行有可以提供的保险服务。如果商品价格更新，保险的价格也会有更新，offerId 也会更新。

warrantyPlanId：Guardsman plan id，具体某个 plan 对应的 id，例如 1 年的保险计划对应的 id

warrantyOfferPrice：Guardsman 返回的 warranty plan 单价

warrantyOfferCost：plan 总价=单价\*line item 的商品数量

warrantyVendor：保险供应商，赋值为 Guardsman

warrantyProviderSku：Guardsman 返回的 providerSku 字段

warrantyDiscount：如果有 warranty 的 promotion/coupon，将折扣值赋值此字段。

后端判断要不要加这个字段。此字段值为 Promotion 接口算出，可以在生成订单的时候通过 Promotion 的返回值赋给 Order 的对应字段，可存可不存。

Cart warranty 操作

操作

Mulberry 说明

Guardsman 说明

UI

前提

前端集成 Mulberry SDK

初始化 Mulberry，获得相关配置

前端引入 Prosuro widget JS 脚本

初始化 widget ：Basic Initialization without product

-

进入/刷新购物车/mini cart 弹出

(不包含浏览器前进、后退进入购物车）

调用 create_offer API 获取可选择保险的 line item：如果购物车中有非 service 和 swatch 商品，需要使用它们商品信息请求 create_offer 接口，为用户获取到所有商品对应的可选的保险信息。service 和 swatch 商品无需请求 warranty 信息。

请求信息包含：SKU，images，Price，SKU name，PDPurl，面包屑（category & url）

Price：有销售价则传销售价，没有销售价则使用原价

Mulberry 会返回新创建的 warranty_offer_id，此时无需储存在 cart 中

同样会返回所有商品的保险可选的月份、价格等信息

验证已选保险的可用性：

如果购物车中有商品已经选择了保险，用存储的 offer_id 调用 fetch offer 接口，重新获取月份、价格的信息，并更新 cart 中存储的保险信息

如果已选的保险在 fetch offer 时，保险信息为空，则表示保险已经无效，需要将此保险自动从购物车中移除。

调用 Cart API 获取可选择保险的 line item：请求包含购物车中所有的商品 SKU，cart_line_item.unique_code，price

price：商品单价，有销售价则传销售价，没有销售价则使用原价（和手动改价的价格无关，不传手动改价之后的价格）

Guardsman 会返回每个 line item 对应的 offerId, planId, price, term

offerId 用来表示 line item 是否有可用的 protection plan，如果商品价格变化，offerId 也会变化

一个商品可能会对应多个 plans，每个 plans 会有对应的 planId, price 和 term(按年返回)

调用/api/cart-validation 验证已选保险的可用性 availability：

验证商品是否还支持选择 plan/term：如果已选的保险对应的 offerId 返回失败/status=invalid，则表示已选的 plan/term 不可用，自动从购物车中移除该 warranty。

验证已选 term 对应的 price 是否有更新：返回 success=true & status= valid，但是 offers 中的 price 有更新，不移除 plan，但购物车需更新 price，offerId 和 planId（通常这种情况 offerId 会和之前的不一样）。

-

添加保险入口

Add extended warranty

入口展示逻辑：swatch，service 商品不展示添加入口，如果其他商品调用 create offer 时，接口返回为空，也不展示入口（例如灯具）。create offer 接口有正常返回数据的，都展示添加入口。

点击 Add extended warranty 后，根据进入购物车时已经获取的数据，渲染出弹窗，无需重新获取信息。

若在本次页面访问中，已经获取过商品的保险，则不会再次请求，使用缓存信息。

如果缓存中没有 warranty 信息，则需要使用 create offer 接口，获取 offer id 和可选的保险信息。

入口展示逻辑：swatch，service 商品不展示添加入口，返回 offerId 为空的 line item 不展示入口。

点击 Add extended warranty 后，前端使用 offerId 调用 Prosuro 提供的内置 modal，弹出弹窗，弹窗中展示该 line item 可以选择的 plan

缓存逻辑：若在本次页面的访问中，有对应 line item 保险的信息的缓存，则不会再次请求，可使用缓存。

Web：

POS:

弹窗中选择保险

弹窗中的样式、内容都由 Mulberry 决定

用户可选择不同年限的保险，并在点击“Add to Cart”后，确认将保险加入购物车：

使用 offerId 请求 fetch_offer 接口获取价格和月份，同时需向将对应字段值储存于购物车中：

warranty_offer_id → warrantyOfferId

duration_months->durationMonths

Promotion/coupon warranty discount → warrantyDiscount

customer_cost-> warrantyOfferPrice

customer_cost \* quantity → warrantyOfferCost

Mulberry ->warrantyVendor

加购 loading 时“Add to Cart”按钮呈 loading 状态，成功加入购物车后关闭弹窗，

若中途关闭弹窗，不会中断加购进程

弹窗中的样式、内容都由 Prosuro 提供

用户可选择不同年限的保险，并在点击“Add to Cart”后，确认将保险加入购物车，通过监听事件获取到 plan 相关信息：

将 offerId，plans {planId、term、price、providerSku}和保险供应商类型等存入 cart 中：

OfferId → warrantyOfferId

plans.id → warrantyPlanId

plans.terms\*12->durationMonths

Promotion/coupon warranty discount → warrantyDiscount

plans.price-> warrantyOfferPrice

plans.price \* quantity → warrantyOfferCost

Guardsman ->warrantyVendor

plan.providerSku-> warrantyProviderSku

加购 loading 时“Add to Cart”按钮呈 loading 状态，成功加入购物车后关闭弹窗

若中途关闭弹窗，不会中断加购进程

Mulberry:

Guardsman:

待定，大致的样式

移除保险

Remove plan

若已为商品选择保险，则出现 Remove plan 的操作

点击后，将该 line item 下的所有保险信息从购物车中删除，同时前端也不再展示保险信息，操作恢复为“Add extended warranty”

不需要二次确认

Remove 后，再点击 add warranty，需要重新调用 create offer 接口获取 offer id 和保险信息。

若已为商品选择保险，则出现 Remove plan 的操作

点击后，将该 line item 下的所有保险信息从购物车中删除，同时前端也不再展示保险信息，操作恢复为“Add extended warranty”

不需要二次确认

Remove 后，再点击 add warranty，需要重新调用 Prosuro 提供的内置 modal，弹出弹窗

Web:

POS:

其他影响购物车保险的操作

增加/减少商品数量

保险的数量和其所属商品的数量是一致的，例如购物车中商品 A 有 2 个，则选择的保险也为 2 份

购物车中商品增加/减少时，若已经添加了保险，保险的数量、总金额也需要随着商品数量的调整而调整

删除商品

若商品已经选择了保险，在用户 Remove 商品后，商品所选保险同步从购物车中移除

恢复删除商品

Undo

若商品已经选择了保险，在用户 Remove 商品，再点击 Undo 后（撤销删除），已选择的保险也会同步恢复。

\*浏览器的前进、后退不会重新获取数据。

Cart 添加完保险后的信息展示

展示的信息

UI

类型

说明

Web:

Extended warranty: X months / [currency]Y

POS:

Extended warranty: X months +[currency]Y

WEB:

POS: 商品点击展开的时候才可看到 warranty 信息，非展开时，不展示 warranty

文字说明

X months：用户在弹窗选择的保险月份，Guardsman 返回的为年份，需要\*12。

[currency]Y：展示[货币符号]保险金额单价\*商品数量，单价金额数据由 mulberry/guardsman 提供。

例如：1 个商品的保险 60 个月$138.99，若我选择了 2 个商品，则 WEB 展示为：Extended warranty: 60 months / $277.98

Checkout - warranty plan

在 Phase 1， checkout 中，不可以添加保险。plan 数据来源：Cart 中的数据

Checkout 保险信息展示

展示区域

展示规则

Summary

和 Cart 相同

WEB:

POS:

Checkout 保险有效性验证

场景

Mulberry

Guardsman

checkout 3 pages 的流程中

不再调用 fetch offer 获取保险价格，以进入 checkout 时的 warranty 价格为准。（在保险价格修改频率极低的情况下，认为 Castlery 可以承担边际情况的价格误差。）

不再重新调用 API 验证/获取保险价格，以进入 checkout 时的价格为准。

确认下单：用户在 Payment 点击 Place Order 时

重新请求 Prosuro/api/validate-offer 获取 offerId 最新的 terms 和 price，验证所有已选保险的可用性（和进入购物车时的验证内容相同）

若全部 offer 未发生变化，plan 数据不用更新，正常下单

若有 offer 发生了变动，可能存在以下两种情况 - [变动原因]

line item 未返回 offerId - Unavailable

已选的 term 不存在 - Unavailable

已选 terms 存在，但价格有更新 - Price updated to XXX

异常聚合：将所有异常的 plan 全部收集，统一通知用户：

Title：Warranty changed

subtitle: Oops, your selected warranty plan has changed.

item list: [有变化的 warranty plan 对应的商品的 SKU name] - [durationMonths] months: [变动原因]，例如：

Dawson Sofa 2-seat - 24 months: Unavailable

Dawson Sofa 2-seat - 24 months: Price updated to $30

Button: Back to cart, Continue checkout

Back to cart：返回购物车

Continue checkout：接受变化，继续结账。

生成订单：

offer 无变化 → 使用 checkout 缓存的 warranty plan 结账 → 订单生成

offer 有变化 → 提示用户 → 用户接受变化-> 移除 Unavailable 的 plan+更新 price updated 的 plan 的价格+无变化部分 → 订单生成。

Edge case：如果/api/validate-offer 报错，不提示用户，跳过验证可用性的步骤，就用 checkout 中缓存的保险数据进行下单。

API 报错 → 使用 checkout 缓存的 warranty plan 结账 → 订单生成

Order - warranty plan

Order 中保险信息的存储

保险信息储存在 order_line_items.warranty 字段下，会存储一段 JSON

生成订单时及支付订单后，购买保险信息会储存在订单、订单快照中。存储的信息有：

Mulberry

{
"line_tax": "2.4",
"duration_months": "24",
"warranty_discount": "0.0",
"warranty_offer_id": "fe215d44-6759-49fb-a12c-923040866732",
"warranty_offer_price": "79.99",
"warranty_line_item_id": "2ab208b7ed88407c87079ab444cb6266"
"warrantyVendor": "Mulberry" //新增字段，固定值
}
//按照现有数据库里的内容直接迁移过来

Guardsman

{
"lineTax": "2.4",taxjar 返回的保险的税费
"durationMonths": "24",//Prosuro 返回的 term(年) * 12
"warrantyDiscount": "0.0",//Promotion 或者 coupon 带来的 warranty 折扣
"warrantyOfferid": "string", //Prosuro 返回的，用于正式创建 warranty
"warrantyPolicyid": "string", //Prosuro 返回的正式保险单号，支付订单后才会生成。未支付时为空
"warrantyProviderSku": "string", //Prosuro 返回的，用于正式创建 warranty
"warrantyUnitPrice": "79.99", //单价
"warrantyPolicyCost": "179.99",//总价=单价*商品数量
"warrantyLineItemId": "string", //EC 的 line item id，可用于取消保险
"warrantyVendor": "Guardsman", //固定值
“warrantyRefundPrice”: “string”,//保险已经取消了的的金额(可以部分取消)
"warrantyStatus": "string" //pending，processing, active, canceled,failed
}

其中，有部分新增字段，具体说明见下。

Order 新增保险相关字段

字段

说明

warrantyVendor

在订单中，需要为 warranty 增加 warranty vendor: 表示保险的供应商，以区分新旧保险供应商的品牌。旧订单的 warranty vendor 全都赋值为“Mulberry”。

CA 订单重构上线后，Guardsman 上线之前，订单中购买保险的 warranty vendor=Mulberry

CA 的 Guardsman 上线之后，订单中购买保险的 warranty vendor=Guardsman

其他市场上线时，直接上线 Guardsman。所以新订单的 warranty type=Guardsman。

warrantyPolicyId

Guardsman 带来的新增字段，代表注册保险成功后的保险单号

warrantyProviderSku

Prosuro modal atc 的 event 返回的 plan 中的信息，用于创建保险单

warrantyUnitPrice

warranty 单价，Prosuro 返回的 plan price

warrantyPolicyCost

warranty 总价=warrantyUnitPrice\*商品数量

warrantyRefundPrice

warranty 已经取消的价格。warrantyUnitPrice*取消的个数。每次调用取消保险接口后叠加金额。例如:保险 5 个共 100 块(warrantyPolicyCost=100)，第一次取消 3 个，则 warrantyRefundPrice=$20*3=$60。第二次取消 2 个，则 warrantyRefundPrice=$60 + $20\*2 = $100.

warrantyStatus

warranty 的状态，会影响 C 端页面的展示

pending：订单创建但未支付时。

processing：订单已支付但 Prosuro 还未返回 status,

active：保险单创建成功，Prosuro 返回 active,

canceled：

订单/保险在 EC/NS/PSS 取消，取消成功

Case1-订单支付后取消 policyCanceled：

若 line item 里所有保险都取消(warrantyRefundPrice = warrantyPolicyCost)，Prosuro 返回 status=canceled 后，更新 warrantyStatus 为 policyCanceled

若 line item 里的保险部分取消(warrantyRefundPrice < warrantyPolicyCost)，则不更新保险状态

Case2-订单未支付取消 unpaidCanceled：

订单状态转为 canceled 后，更新 warrantyStatus 为 unpaidCanceled

保险在 Guardsman portal 取消 ：没有这个功能

failed：Prosuro 的 register-policy 接口返回失败

保险订单的创建和取消

将使用 Prosuro 的 Server-to-Server API 进行保险订单的创建和取消，所有 API 请求都需要使用您的商户私钥进行身份验证。

Timing

Mulberry

Guardsman

订单的 Order status 转为 Pending fulfillment：即用户成功支付订单后

如果用户选择了 warranty，

生成正式保险订单：使用顾客 email，order_id，phone，line_items[{warranty_offer_id，SKU，quantity，月份，保险开始时间（当天）}]，账单地址，配送地址，商户 id 等，请求 Mulberry 的 checkout 接口，确认购买保险。

API 文档：here

同步保险订单至 NS：

使用 external_id = orderReferenceNumber 请求 retrieve order 接口获得保险订单的信息，

将保险订单信息通过 oms 接口传给 NS，其中部分字段赋值：

itemCode: Mulberry Warranty

warrantyAttributes.serviceCode: mulberry_warranty

warrantyAttributes.mbCategory:SKU 后台类目

warrantyAttributes.mbDurationMonth: Mulberry 返回的 term_months

warrantyAttributes.mbServiceType:Mulberry 返回的 warranty_type

warrantyAttributes.mbWarrantyOfferId: Mulberry 返回的 warranties.line_items.id

如果用户选择了 warranty，

订单生成，订单中储存对应的 warranty 字段

生成正式保险订单：

使用/register-policies 接口进行正式保险单的生成（注册），可批量请求

请求字段：offer id, 顾客信息，订单信息。其中特别注明的是：

providerSku: 在 cart 添加 warranty 后，Prosuro 返回的字段，会存储在 Cart 中并带入 checkout

trasactionId: order reference number (NS 生成的订单号）

transactionLineId: cartLineItem.uniqueCode

orderDate：订单支付完成时间

如果生成保险单失败，需要后端进行重试，重试机制可由技术定义。如果重试多次仍然失败，则需要在告警平台进行告警并通知，再告知业务进行手动创建。

保险单的生成失败会 Block 订单同步至 NS，因为不成功会导致没有 policyId 字段，所以业务手动创建保险单后，需要通知 EC 进行手动的订单同步

同步保险订单至 NS：

订单成功支付后，EC 将商品信息 + /register-policyies 接口返回的保险信息同步至 NS，warranty 同样作为一个订单 item 返回。其中需要赋值的部分

itemCode: Guardsman Warranty

itemName：Guardsman Warranty

quantity：购买的保险的数量，和 line item 数量相等

lineTax: 由 taxjar 返回的 warranty 税费

lineDiscount: 由针对 warranty 的优惠活动/券分摊到 warranty 上的折扣（目前只有全免）

lineItemId: order 的 lineItemId

unitPrice: warranty plan 单价 - warrantyOfferPrice

isCashAndCarry: false

warrantyAttributes 中的字段由 NS 定义:

{
"warrantyAttributes": {
"warrantyOfferId": "",//Prosuro 返回
"warrantyDurationMonth": 24, //12 \* TermYears
"warrantyCategory": "provided by guardsman", //Prosuro 返回的 planType
"warrantyServiceType": "repair_replace", //固定值
"serviceCode":"guardsman_warranty",//固定值
"warrantyPolicyId" : "",//Prosuro 返回
"warrantyTermYears": 2,
"warrantyProviderSku":""//Prosuro 返回
}
}

订单的 Order status 转为 Canceled 时

（包含所有场景的取消）

如果订单中选购了 warranty，

取消保险订单：需要使用保险订单的 order_id, 和 cancel_date（取消当天时间）, 调用 Mulberry 的 cancel order 接口。。

省略了入参 line_item 数组，表示整个 warranty 订单将被取消。所以订单 cancel 时，可以省略

line_item 数组来取消 warranty。（目前 EC 侧没有部分取消）

API 文档：here

如果订单中选购了 warranty，

取消保险订单：需要使用订单中储存的 referenceId，warrantyLineItemId 请求/cancel-policies 接口批量取消保险单。

reason：“Order cancelation”

因为整单取消，所以需要将订单中所有的 warrantyLineItemId 对应的保险都取消。

同时需要将保险取消接口提供给 PSS 和 NS，在他们平台取消订单的时候，也同步取消 warranty

单独取消保险：PSS 平台上可以在不取消订单的情况下，单独取消订单中的某行保险。需要提供相应接口至 PSS。

定时任务

任务时间

Mulberry

Guardsman 调用接口

说明

定时任务，每日凌晨 01:00

调用接口 Retrieve Order：

external_id=orderReferenceNumber

查询所有近 30 天内已支付订单中，有购买 warranty 订单的保险订单。

关注 response 字段：warranties.status

以获得已购买的 plan 的状态

Guardsman 不会同步：Guardsman 没有 portal 进行保险取消。

原因：若业务在 Mulberry 或者 Guardsman portal 主动取消 plan，他们均不会主动同步取消状态至 EC，所以需要 EC 主动获取 warranty 的状态。

Order 保险信息展示

数据来源：Order 中存储的信息

展示区域

展示规则

Order history - Item list

和 Cart 相同

WEB:

POS:

无

Order details - Item list

Order Details 新增展示内容：

当 warrantyStatus 为 policyCanceled 时，将取消状态展示给顾客。其他状态都不展示

其余和 order history page 一样

WEB：

POS：

valid warranty plan

canceled warranty plan

已取消订单的 add to cart 时：

加车不加保险信息

Order details - Summary

warrantyStatus 不影响 Summary 的内容

Order 配送状态的同步

业务场景

Mulberry

Guardsman

保险正式激活由商品送达时间开始计算，保期的过期时间=开始时间+购买的期限。

调用接口 order_status 更新订单配送状态

当订单状态转为 Completed 时，将订单已送达的状态同步给 Mulberry，status 传”delivered”

Guardsman 不需要同步，由 Guardsman 的人员，在用户申报时，手动处理问询。

Mulberry migration

迁移内容：旧订单 data 字段中的保险信息迁移到新订单 warranty 字段下

迁移方式：将旧订单 data 字段中 "warranty_items"里的 JSON 数据存储到新 Order 表 warranty 字段中。

新旧保险切换相关场景和处理：

Scenario

Cart

Order

在迁移到 Cart 的旧订单中，如果添加了 warranty plan 的

按照 Mulberry 新的字段格式一一对应迁移。其中：

warrantyDiscount 字段不需要迁移

给 WarrantyVendor 字段统一赋值为 Mulberry

--

已支付的旧订单中，如果购买了 warranty plan

-

如果旧 Order data 字段下有"warranty_items"的内容，迁移到新订单 warranty 字段中。其中：

给 WarrantyVendor 字段统一赋值为 Mulberry

如果用户正在访问 Mulberry 的 PDP，此时切换到新 Guardsman 保险，用户再点击加车

访问 PDP → 新保险上线 -> 调用加车接口 -> 提示用户

此时由于新老保险的传参不一致，会报错。如果发现只传了 offerId，错误提示用户：

Title: “Warranty plan updated“

“Oops, the extended warranty plan you selected changed. Please choose your plan again.“

Button: okay

点击 okay 后自动刷新 PDP

--

如果用户在 Cart 中有添加过 Mulberry warranty plan，切换到新 Guardsman 保险后，用户再次访问/刷新购物车

mulberry 加车 → 新保险上线 -> 再次获取购物车数据 -> 提示用户

新保险上线后，如果在获取购物车数据时，发现购物车中有添加 warrantyVendor=Mulberry 的 plan，则自动将旧保险数据清除，提示用户：

Title: “Warranty plan updated“

“Oops, the extended warranty plan you selected changed. Please choose your plan again.“

Button: okay

点击按钮后自动刷新购物车商品

--

如果用户在 Cart 中有添加过 Mulberry warranty plan，切换到新 Guardsman 保险后，进行购物车操作例如增减商品，应用优惠券，zipcode 切换等

不检查 vendor

--

如果用户在 Cart 中添加了过 Mulberry warranty plan，此时切换到新 Guardsman 保险，用户还一直在 Cart 页面未刷新，此时用户点击 checkout 按钮

mulberry 加车 → 新保险上线 -> 一直停留在 Cart，点击 checkout 按钮 -> 提示用户

新保险上线后，如果在进行发起结算验证时，发现购物车中有添加 warrantyVendor=Mulberry 的 plan，则自动将旧保险数据清除，提示用户：

Title: “Warranty plan updated“

“Oops, the extended warranty plan you selected changed. Please choose your plan again.“

Button: okay

点击按钮后自动刷新购物车商品

--

如果用户结算流程中，且添加了 Mulberry warranty plan，此时切换到新 Guardsman 保险，当用户点击 Place Order 按钮时

--

checkout 流程(包含 Mulberry)-> 新保险上线 → 点击 place Order->提示用户

新保险上线后，如果在结算流程中点击 Place Order 确认下单，需要检查 warrantyVendor 是否为 Mulberry，如果是，则提示用户：

Title: “Warranty plan updated“

“Oops, the extended warranty plan you selected changed. Please choose your plan again.“

Button: Back to cart

点击按钮后返回购物车

上线新保险后，含旧保险的的订单取消，或者单独取消旧保险。

相关系统：NS，PSS

--

原来可通过 API 取消保险，但新保险上线后，原取消 Mulberry 的接口失效，需要业务去 Mulberry portal 手动操作。

External API

我们会将取消 warranty 的接口提供至 NS 和 PSS，详见https://castlery.atlassian.net/wiki/spaces/PM/pages/3334373507

Cowboy-Knight-Order details 页面

Order Details 页面的 Order info Tab 下的 Order Product 区域增加展示保险供应商、保险状态的展示

展示形式：[warrantyVendor]: [monthDuration] months / [currency]warrantyPolicyCost ([warrantyStatus]条件展示)

warrantyStatus：只有 warrantyStatus 为 policyCanceled、failed 时，才展示状态（红字部分）。其他状态不展示。

PDP 的 Guardsman 信息获取

JS 的加载和初始化：基本和 cart 一致

不同点：可以使用 SKU 进行初始化

通过 Product API 获取 PDP 的保险详情

通过下述字段请求，其中 description 传商品的后台类目

SPU -> productId

price → price

SKU → variantId

sku name → productTitle

categories → productDescription

Prosuro 会返回可用的 plans，offerId 或者 error

如果商品没有可用的 plan，则返回 plans 为空

plans 中，会包含各个 plan 的 id，可用于前端展示的描述 text，价格 price，保险年限 term，用于下单的 providerSku，当前 SKU 的 variantId 等

其中可以用 price 和 term 按需在前端展示

商品选择 warranty plan 后加车

加车时额外需要的字段信息：planId，offerId，term，price，providerSku

ProtectionPlan.id -> warrantyPlanId

ProtectionPlan.term\*12 → durationMonths

offerId -> warrantyOfferId

ProtectionPlan.price -> warrantyOfferPrice

ProtectionPlan.providerSku -> warrantyProviderSku

Prosuro 配置参考

业务负责：进行 Category & Warranty plan 的配置

plan 的载体

在 Prosuro 上创建 plan sku(providerSku)承载各个 warranty plan

商品后台类目与 warranty plan 的映射

每个后台类目可以配置一个对应的 providerSku，可以根据商品不同的价格区间，配置 providerSku 不同的价格

弹窗的样式配置

\*测试建议：可以简单抽样比对商品返回的 price 和 term 是否符合后台配置

\*会建议业务在 Prosuro 后台配置对应的数据
