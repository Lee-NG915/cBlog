## Global events

### GA event name : add_to_cart

```ts
dataLayer.push({
  event: "addToCart",
  eventId: "addToCart_mpw976fhwwtgx",
  userStatus: "logged-out",
  userEmail: "",
  userEmail2: "",
  atc_type: "regular",
  eventDetails: {position: ""},
  ecommerce: {
    currencyCode: "CAD",
    add: {
      products: [
        {
          id: "54000119-NA",
          name: "Mori Left/Right Facing 2 Seater Frame",
          price: "2024.00",
          category: "Modular 2-Seater Sofas",
          brand: "No Brand",
          dimension1: "Sofa & Armchairs",
          dimension2: "IN_STOCK",
          dimension3: "full",
          dimension4: "4-5 weeks",
          quantity: 1,
          metric1: "",
          metric2: "2024.00"
        }
      ]
    }
  },
  gtm.uniqueEventId: 8976
})
```

### GA event name: begin_checkout

```ts
dataLayer.push({
  event: "checkout",
  eventId: "InitiateCheckout_mpw9cpnd54jli",
  ecommerce: {
    currencyCode: "CAD",
    checkout: {
      actionField: {step: 1, option: null},
      products: [
        {
          id: "54000119-NA",
          name: "Mori Left/Right Facing 2 Seater Frame",
          price: "2024.00",
          category: "Modular 2-Seater Sofas",
          brand: "No Brand",
          dimension1: "Sofa & Armchairs",
          dimension2: "IN_STOCK",
          dimension3: "full",
          dimension4: "4-5 weeks",
          quantity: 1,
          metric1: ""
        }
      ],
      value: "2024.00"
    }
  },
  gtm.uniqueEventId: 26108
})
```

### GA event name: remove_from_cart

```ts
dataLayer.push({
  event: "removeFromCart",
  ecommerce: {
    currencyCode: "CAD",
    remove: {
      products: [
        {
          id: "54000001-TL4002",
          name: "Joshua Chair, Pearl Beige",
          price: "199.00",
          category: "Dining Chairs",
          brand: "Joshua Collection",
          dimension1: "Joshua Collection",
          dimension2: "IN_STOCK",
          dimension3: "sale",
          dimension4: "1-2 weeks",
          quantity: 1,
          metric1: "237.00",
          metric2: "-199.00"
        }
      ]
    }
  },
  gtm.uniqueEventId: 36478
})
```

## Custom Events

### GA event name: @abby

```ts
dataLayer.push({
  event: "trackEvent",
  eventDetails.category: "checkout_shipping_address",
  eventDetails.action: "add_coupon",
  eventDetails.label: "9KIIHH4B",
  gtm.uniqueEventId: 13902
})
```

### GA event name: @abby

```ts
dataLayer.push({
  event: "trackEvent",
  eventDetails.category: "zipcode_shipping_calculator",
  eventDetails.action: "click_shipping_calculator",
  eventDetails.label: "Ordersummary",
  gtm.uniqueEventId: 14980
})
```

### GA event name:

```ts
dataLayer.push({
  event: "trackEvent",
  eventDetails.category: "zipcode_shipping_calculator",
  eventDetails.action: "submit_shipping_calculator",
  eventDetails.label: "Ordersummary",
  gtm.uniqueEventId: 18984
})
```

### GA event name:

```ts
dataLayer.push({
  event: "trackEvent",
  eventDetails.category: "cart_service",
  eventDetails.action: "click_service_guarantee_policy",
  eventDetails.label: "30-day returns",
  eventDetails.position: "full_cart",
  gtm.uniqueEventId: 27761
})
```

### GA event name:

```ts
dataLayer.push({
  event: "trackEvent",
  eventDetails.category: "cart_recommendation",
  eventDetails.action: "view_product_recommendation",
  eventDetails.label: "Customers also purchased these",
  eventDetails.position: "full_cart",
  gtm.uniqueEventId: 27145
})
```

### GA event name: add_to_wishlist

```ts
dataLayer.push({
  event: "trackEvent",
  eventId: "AddToWishlist_mpwb9du9cdbjc",
  eventDetails.category: "Ecommerce",
  eventDetails.action: "Wish-list",
  eventDetails.label: "40550224 | Casa Dining Table",
  currencyCode: "CAD",
  productName: "Casa Dining Table",
  productPrice: null,
  productCode: ["40550224"],
  gtm.uniqueEventId: 30866
})
```

### GA event name: add_shipping_info

```ts
dataLayer.push({
  event: "checkout",
  eventId: "checkout_mpwbh2j5ld4ko",
  ecommerce: {currencyCode: "CAD", checkout: {actionField: {step: 4, option: "SHIPPING_FASTER"}}},
  gtm.uniqueEventId: 17919
})
```

### GA event name: add_payment_info

```ts
dataLayer.push({
  event: "checkout",
  eventId: "checkout_mpwbr41dyyss9",
  ecommerce: {currencyCode: "CAD", checkout: {actionField: {step: 5, option: "stripe-link-pay"}}},
  gtm.uniqueEventId: 20705
})
```

### GA event name:

```ts
dataLayer.push({
  event: "trackEvent",
  eventDetails.action: "view_canceled_order",
  eventDetails.category: "Cancelled",
  eventDetails.position: "order_history",
  gtm.uniqueEventId: 13300
})
```

### GA event name:

```ts
dataLayer.push({
  event: "trackEvent",
  eventDetails.action: "click_atc",
  eventDetails.category: "cancelled_order",
  eventDetails.position: "order_history",
  gtm.uniqueEventId: 15610
})
```

### GA event name:

```ts
dataLayer.push({
  event: "trackEvent",
  eventDetails.action: "click_pay",
  eventDetails.category: "pending_payment_order",
  eventDetails.label: "00:29:08",
  eventDetails.position: "order_history",
  gtm.uniqueEventId: 16067
})
```
