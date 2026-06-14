# 中间件说明

## userAuthMiddleware

### 功能

在服务端中间件中处理用户认证、数据获取和 HTML 嵌入，一步到位完成所有用户数据处理。

### 工作流程

1. 检查 `webAccessToken` 是否存在
2. 如果存在，直接调用 API 获取用户信息
3. 使用 Web Crypto API 计算用户信息的哈希值
4. 直接使用用户信息创建嵌入脚本，无需通过 headers 传递
5. 将用户信息直接嵌入到 HTML 中，供客户端使用
6. 设置全局变量和触发事件

### Edge Runtime 兼容性

- 使用 Web Crypto API (`crypto.subtle.digest`) 替代 Node.js crypto 模块
- 支持 Edge Runtime 环境
- 使用 `TextEncoder` 进行字符串编码

### 哈希计算

```typescript
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
```

### API 调用

```typescript
const apiUrl = `${EcEnv.NEXT_PUBLIC_API_HOST}/users/me`;
const apiResponse = await fetch(apiUrl, {
  method: 'GET',
  headers: {
    'x-access-token': webAccessToken,
    'X-Channel': 'web',
  },
});
```

## HTML 嵌入功能

### 功能

将用户信息直接嵌入到 HTML 中，供客户端 JavaScript 使用。

### 嵌入的数据结构

```html
<script id="user-data-script" type="application/json">
  {
    "user": {
      /* 用户数据 */
    },
    "timestamp": 1703123456789
  }
</script>
<script>
  window.__USER_DATA__ = {
    /* 用户数据 */
  };
  window.__USER_ID__ = '123';
  window.__USER_EMAIL__ = 'user@example.com';

  window.dispatchEvent(
    new CustomEvent('userDataLoaded', {
      detail: {
        /* 用户数据 */
      },
    })
  );
</script>
```

## 错误处理

### 用户认证失败

- 清除无效的 token
- 记录警告日志
- 继续执行，不影响页面加载

### API 调用失败

- 记录错误日志
- 继续执行，不影响页面加载
- 不设置用户信息到 headers

### HTML 嵌入失败

- 记录错误日志
- 返回原始响应
- 不影响页面正常显示
- 用户数据仍然可以通过其他方式获取

## 调试

### 日志查看

```bash
# 查看用户认证中间件日志
grep "UserAuth" logs

# 查看 HTML 嵌入中间件日志
grep "HtmlEmbed" logs
```

### 控制台输出

- `console.log('🚀 ~ userAuthMiddleware ~ webAccessToken:', webAccessToken);`
- `console.log('🚀 ~ userAuthMiddleware ~ userInfo:', userInfo);`
- `console.log('🚀 ~ trackStoryblokPageViewClient ~ customer:', customer);`

## 性能优化

1. **条件执行**：只在有 `webAccessToken` 时才进行 API 调用
2. **异步处理**：使用 async/await 避免阻塞
3. **错误恢复**：即使出错也不影响页面加载
4. **缓存友好**：用户信息嵌入到 HTML 中，减少客户端请求
5. **一步到位**：用户认证和 HTML 嵌入在同一个中间件中完成，减少中间件数量
6. **直接嵌入**：无需额外的 HTML 嵌入中间件，提高性能
7. **直接使用**：直接使用用户信息变量，无需通过 headers 传递，减少序列化开销
