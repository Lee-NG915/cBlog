---
confluence_id: "3453878361"
title: "Promotion 重构事项(Draft)"
status: current
parent_id: "2583822375"
depth: 1
domain: product
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3453878361
local_joyboy_doc: null
blog_post: null
---
# 1. tracking

`EVENT_GWP_BANNER_CLICK`

原场景：点击 banner 打开 freeGiftModal 

事件：

```
/**
 * @description Triggered when click choose-free-gift-banner
 */
function clickGWPBanner(action) {
  return {
    event: 'trackEvent',
    'eventDetails.category': 'choose_free_gift',
    'eventDetails.label': formatLabel(), // miniCart,fullCart
    'eventDetails.position': action?.result?.position, // "A","B"
  };
}
```

`EVENT_GWP_ADD_TO_CART_CLICK`

事件：

```
/**
 * @description Triggered when the user clicks the "Add To Cart" button in GWP Modal
 */
function clickGWPAddToCart(action) {
  return {
    event: 'trackEvent',
    'eventDetails.action': 'cart_event',
    'eventDetails.label': formatLabel(), // miniCart,fullCart
    'eventDetails.category': 'gwp_add_to_cart', // static
    'eventDetails.gift_id': action.result?.giftId, // dynamic, sku name of pr
  };
}
```

`EVENT_CAMPAIGN_PROGRESS_BAR_IMPRESSION`

事件：

```
/**
 * @description Storewide tier campaigns Cart message
 */
function campaignBarImpression(action) {
  return {
    event: 'trackEvent',
    'eventDetails.category': 'campaign_progress_bar_impression', //
    'eventDetails.action': action.result?.campaignName, // dynamic
    'eventDetails.label': formatLabel(), // dynamic
    'eventDetails.method': action.result?.discount, //
    'eventDetails.position': action.result?.position, // "A"|"B"|null ABTEST
  };
}
```

# 2. joyboy Pos 环境变量

AWS  **ecomm-team/joyboy** 新增DY配置

- `dy_section_id`
- `client_dy_api_key`
- `server_dy_api_key`