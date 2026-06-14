# 本地 HTTPS 开发环境设置指南

## 为什么需要 HTTPS？

某些功能在本地开发时需要 HTTPS 环境才能正常工作：

- **Google Pay** - 必须在 HTTPS 环境下运行
- **Apple Pay** - 必须在 HTTPS 环境下运行
- **某些浏览器 API** - 如 Geolocation, Camera 等

## 快速开始

### 1. 生成 SSL 证书

```bash
pnpm run ssl:generate
```

这会在 `scripts/ssl/` 目录下生成以下文件：

- `localhost-key.pem` - 私钥
- `localhost.pem` - 证书

### 2. 信任证书（重要！）

生成证书后，您需要在系统中信任它，否则浏览器会显示警告。

#### macOS 方法 1（推荐）：

```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain scripts/ssl/localhost.pem
```

#### macOS 方法 2：

1. 双击 `scripts/ssl/localhost.pem` 文件
2. 在"钥匙串访问"中找到该证书（名称：localhost）
3. 双击证书，展开"信任"部分
4. 将"使用此证书时"设置为"始终信任"
5. 关闭窗口并输入密码确认

#### 验证证书是否已信任：

重启浏览器后访问 `https://localhost:7010`，应该不会显示安全警告。

### 3. 启动开发环境

打开两个终端窗口：

**终端 1 - 启动 Next.js 开发服务器（HTTP）:**

```bash
# 根据需要选择市场
pnpm run web:us    # 或 web:ca, web:au, web:uk, web:sg
```

这会在 http://localhost:7780 启动应用。

**终端 2 - 启动 HTTPS 代理:**

```bash
pnpm run proxy:web
```

这会启动一个 HTTPS 代理服务器：

- 接收 HTTPS 请求：`https://localhost:7010`
- 转发到 HTTP 服务：`http://localhost:7780`

### 4. 访问应用

在浏览器中打开：

```
https://localhost:7010
```

现在您可以测试 Google Pay、Apple Pay 等需要 HTTPS 的功能了！

## 故障排除

### 问题 1: 浏览器显示"不安全"警告

**原因：** 证书未被系统信任。

**解决方法：**

1. 按照上面的步骤信任证书
2. 重启浏览器
3. 如果还是不行，在 Chrome 中启用 `chrome://flags/#allow-insecure-localhost`

### 问题 2: Google Pay 仍然不显示

**可能的原因：**

1. **证书问题** - 确保 HTTPS 证书已正确信任，浏览器地址栏显示锁图标
2. **浏览器不支持** - 使用最新版本的 Chrome 测试
3. **未登录 Google 账户** - 登录 Google 账户并设置支付方式
4. **Stripe 配置** - 检查 Stripe Dashboard 中是否启用了 Google Pay

**调试步骤：**

1. 打开浏览器控制台（F12）
2. 查找错误消息和我们添加的调试日志：
   ```
   [ExpressElement] Available payment methods: {...}
   ```
3. 检查 `availablePaymentMethods` 中是否包含 `googlePay`

### 问题 3: 端口冲突

如果 7010 或 7780 端口已被占用：

```bash
# 查看端口占用
lsof -i :7010
lsof -i :7780

# 或者修改端口
node scripts/proxy-server.js --source 8443 --target 7780
```

### 问题 4: ERR_SSL_PROTOCOL_ERROR

**解决方法：**

1. 重新生成证书：`pnpm run ssl:generate`
2. 清除浏览器缓存和 SSL 状态
3. 重启浏览器

## 技术细节

### 代理服务器架构

```
浏览器 (HTTPS)  →  代理服务器 (HTTPS:7010)  →  Next.js (HTTP:7780)
    ↑                                              ↓
    └──────────────── (HTTPS 响应) ────────────────┘
```

### 代理服务器配置

代理服务器的实现位于 `scripts/proxy-server.js`，它：

1. 使用自签名证书创建 HTTPS 服务器
2. 接收所有 HTTPS 请求
3. 转发到本地 HTTP 服务器（Next.js）
4. 返回响应

### 端口映射

| 服务               | 协议  | 端口 | 用途           |
| ------------------ | ----- | ---- | -------------- |
| Next.js Dev Server | HTTP  | 7780 | 实际应用服务器 |
| HTTPS Proxy        | HTTPS | 7010 | HTTPS 代理入口 |

## 生产环境

注意：这些自签名证书**仅用于本地开发**。生产环境应使用正式的 SSL 证书（如 Let's Encrypt）。

## 相关资源

- [Stripe Express Checkout Element](https://docs.stripe.com/elements/express-checkout-element)
- [Google Pay for Web](https://developers.google.com/pay/api/web)
- [Apple Pay on the Web](https://developer.apple.com/apple-pay/implementation/)
