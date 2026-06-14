# Issue Report: Checkout Order Number Lost

## 1. 问题描述 (Issue Description)

在 `src/containers/Checkout/Account.js` 中，当用户执行 `handleConfirm`（登录或注册并合并购物车）成功并跳转至 `checkout-shipping-address` 页面时，系统抛出错误：

> "No order number is available. Please refresh the page and try again."

这导致用户无法在配送地址页面进行操作（如选择地址）。

## 2. 发生位置 (Location)

- **文件**: `src/redux/modules/cart.js`
- **函数**: `initAndGetCartInfo`

## 3. 根本原因 (Root Cause)

这是一个**竞态条件 (Race Condition)** 问题。

在原有的逻辑中，`initAndGetCartInfo` 函数在发起合并订单的异步请求（API Call）**之前**，就立即执行了 `Cookie.remove('order_id')` 和 `Cookie.remove('order_token')`。

由于合并请求是异步的，在请求完成之前的这段空窗期内，Cookie 中没有有效的 `order_id`。如果此时页面发生跳转（跳转到 Shipping Address）或触发了其他需要 `order_id` 的动作（如 `requestWrapper` 中的逻辑），系统会检测不到 Order ID，从而抛出上述错误。

## 4. 解决方案 (Solution)

**延迟 Cookie 的清理时机。**

修改了 `initAndGetCartInfo` 中的 Promise 链逻辑，不再于请求发起前删除 Cookie，而是确保在合并请求成功返回（`.then()`）并且准备好设置新的 `order_id` 时，才移除旧的 Cookie。

### 代码变更 (Code Changes)

**Before:**

```javascript
// merge order if orderId and orderToken exist in cookie
if (orderToken && orderId) {
  // 错误：过早清除 Cookie
  Cookie.remove('order_id');
  Cookie.remove('order_token');

  return loadPromise.then(...)
}
```

**After:**

```javascript
// merge order if orderId and orderToken exist in cookie
if (orderToken && orderId) {
  return loadPromise.then((result) => {
    // ...
    // set order id
    return mergePromise.then((res) => {
      // 修复：在成功获取新 ID 后才清除旧 Cookie
      Cookie.remove('order_id');
      Cookie.remove('order_token');
      Cookie.set('order_id', res.number);
      return res;
    });
    // ...
  });
}
```

## 5. 验证 (Verification)

修复后，旧的 `order_id` 会一直保留直到合并完成。这保证了在合并过程中的任何并发请求都能读取到有效的（旧的）ID，直到它被新的 ID 替换，从而消除了报错。
