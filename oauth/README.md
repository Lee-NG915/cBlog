# cBlog OAuth 代理

这是 cBlog 博客 CMS 管理后台的 GitHub OAuth 认证代理。
由于 GitHub 不支持纯客户端 PKCE 认证，需要一个服务端来处理 OAuth token 交换。

## 部署到 Netlify（免费）

### 方法一：一键部署

1. 将此 `oauth/` 目录作为独立仓库推送到 GitHub
2. 前往 [Netlify](https://app.netlify.com) 注册/登录
3. 点击 "Add new site" → "Import an existing project" → 选择该仓库
4. 在 "Environment variables" 中添加：
   - `OAUTH_GITHUB_CLIENT_ID` = 你的 GitHub OAuth App Client ID
   - `OAUTH_GITHUB_CLIENT_SECRET` = 你的 GitHub OAuth App Client Secret
5. 点击 "Deploy"

### 方法二：Netlify CLI

```bash
cd oauth
npm install
netlify deploy --prod
```

部署完成后获得的 URL（如 `https://xxx.netlify.app`），填入博客仓库 `public/admin/config.yml` 的 `base_url` 字段。

## GitHub OAuth App 设置

确保你的 GitHub OAuth App（https://github.com/settings/developers）：
- **Authorization callback URL** 设为：`https://你的netlify站点.netlify.app/callback`
