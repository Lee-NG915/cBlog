---
confluence_id: "3419537673"
title: "技术方案 - CookieYes [Draft]"
status: current
parent_id: "2583822375"
depth: 1
domain: platform
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3419537673
local_joyboy_doc: null
blog_post: null
---
### Google consent mode

Google Consent Mode（Google 同意模式）是 Google 推出的隐私合规解决方案，用于在用户未明确同意 Cookie 使用的情况下，依然尽可能保持网站广告和分析功能的可用性，并兼容 **GDPR** 和 **ePrivacy** 等隐私法规的一种 **API 层机制**，让你的网站在用户尚未同意 Cookie 前，通过调整 Google 服务（如 Google Analytics 和 Google Ads）的行为，来**尊重用户隐私选择 和 保持关键转化和分析数据的收集能力（以非识别方式）。**

 

 

**How to Setup GCM By using CookieYes**

 



GCM核心点：

| 信号 | 控制内容 |
| `ad_storage` | 是否允许使用广告相关 cookies（例如：Google Ads Remarketing） |
| `analytics_storage` | 是否允许使用分析相关 cookies（例如：Google Analytics） |


| **Market** | **Enabled CookieYes** | **Enabled GCM** | **Consent Initialization** |
| **SG** | `False` | `False` | ```
{
  ad_storage: "granted",
  ad_user_data: "granted", 
  ad_personalization: "granted",
  analytics_storage: "granted",
  functionality_storage: "granted",
  personalization_storage: "granted",
  security_storage: "granted",
}
``` |
| **AU** | `False` | `False` |
| **US** | `True` | `True` |
| **CA** | `True` | `True` |
| **UK** | `True` | `True` | ```
{
  ad_storage: "denied",
  ad_user_data: "denied", 
  ad_personalization: "denied",
  analytics_storage: "denied",
  functionality_storage: "denied",
  personalization_storage: "denied",
  security_storage: "granted",
}
``` |




## 1 初始化GMC的同意内容到GTM

### **1.1 GTM Tag - All Pages 自动触发**

- 需在FE代码中，注意 GTM 和 Cookie yes脚本的加载顺序。
- 根据 ISO 3166-2标准，来设定Tag生效的Region（ 注意：英国是GB）。
![](attachment)

![](attachment)

### 1.1 在cookieYes开启“Support GCM”和“Allow Google tags to fire before consent”

a. Support GCM => 开启GCM

b. Allow Google tags to fire before consent => 在用户未选择同意内容前，以Google pings方式收集用户数据， 不依赖cookie

![](attachment)

## 2 check if we have blocked tags

### 2.2 排查和解锁 Google Tags

 



## 3  初步验证

#### 用例1：

| **Settings** | **Status** | **Result** |
| **GCM** | **Enabled** | **US** | **SG** |
| **Allow Google tags to fire before consent** | **Disabled** | 用户操作consent之前，未触发任何tag

![](attachment) |  |


#### 用例2：

| **Settings** | **Status** |
| **GCM** | **Enabled** |
| **Allow Google tags to fire before consent** | **Enabled** |
| **Result** |
|  |




Reference Materials:

1. - GCM Template Region的具体行为：根据GEO从IP获取位置， 受VPN等影响，不是特别准确，放弃使用Region来区别Consent初始设置，已验证可以使用GTM内置变量Page Path，通过正则来匹配市场。
2. - Consent Initialization trigger & How To Check Tags Not Enabled GCM
3. - Read how consent mode operates for [Google Ads](https://support.google.com/google-ads/answer/10000067), [Google Analytics](https://support.google.com/analytics/answer/9976101) and [Floodlight](https://support.google.com/campaignmanager/topic/6228828).
4. - 参考
![](attachment)

![](attachment)

1. - 


TODOS：

1. - 在GTM配置GCM Initialization， 调试 Consent 在 网站和GTM之间的同步情况。
2. - 在GTM 启用Consent Mode Overview， 审核哪些类型的Tag需要开启Consent， 并确认每一类Tag需要的Consent权限。
3. - 对比数据。