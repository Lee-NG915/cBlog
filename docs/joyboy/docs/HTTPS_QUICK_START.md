# 🚀 本地 HTTPS 快速启动指南

Google Pay 和 Apple Pay 需要在 HTTPS 环境下运行。按照以下步骤在本地启用 HTTPS：

## 三步快速开始

### 1️⃣ 生成 SSL 证书

```bash
pnpm run ssl:generate
```

### 2️⃣ 信任证书（macOS）

```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain scripts/ssl/localhost.pem
```

输入系统密码后，重启浏览器。

### 3️⃣ 启动服务

**终端 1 - 启动应用:**

```bash
pnpm run web:ca  # 或 web:us, web:au, web:uk, web:sg
```

**终端 2 - 启动 HTTPS 代理:**

```bash
pnpm run proxy:web
```

### 4️⃣ 访问

打开浏览器访问：**https://localhost:7010**

---

## 验证 Google Pay

1. 使用 **Chrome 浏览器**（推荐）
2. 确保已登录 Google 账户
3. 打开开发者工具（F12），查看控制台日志：
   ```
   [ExpressElement] Available payment methods: { googlePay: true, ... }
   ```
4. 如果 `googlePay: true`，说明 Google Pay 已成功启用！

---

## 常见问题

**Q: 浏览器显示"不安全"警告？**  
A: 确保执行了步骤 2（信任证书）并重启浏览器。

**Q: Google Pay 还是不显示？**  
A:

- 检查浏览器地址栏是否有锁图标（表示 HTTPS 已生效）
- 确保使用最新版 Chrome 浏览器
- 确保已登录 Google 账户并设置了支付方式
- 查看控制台是否有错误消息

**Q: 端口冲突？**  
A: 修改 `proxy:web` 命令中的端口号：

```bash
node scripts/proxy-server.js --source 8443 --target 7780
```

---

📖 详细文档：[docs/local-https-setup.md](./docs/local-https-setup.md)
