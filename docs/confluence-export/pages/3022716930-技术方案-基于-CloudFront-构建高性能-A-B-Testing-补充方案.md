---
confluence_id: "3022716930"
title: "技术方案 - 基于 CloudFront 构建高性能 A/B Testing 补充方案"
status: current
parent_id: "2583822375"
depth: 1
domain: platform
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3022716930
local_joyboy_doc: null
blog_post: null
---
# 基于 CloudFront 构建高性能 A/B Testing 补充方案

## 1. 背景与动机

### 1.1 现有系统的性能瓶颈

在重构和迁移关键业务页面（如 PLA 页面）的过程中，我们发现现有的 A/B Testing 系统存在一些性能瓶颈：

1. - **服务端渲染场景下**

- 调用第三方 A/B Testing API 需要 200-500ms
- 对高性能要求的页面影响显著
2. - **第三方 A/B Testing只能作用于应用层**

1. - 无法在请求进入应用前进行分流(即在 ingress层分流)
### 1.2 补充方案的诞生

在进行 PLA 页面迁移时，我们需要一个针对性能敏感场景的轻量级分流方案：

1. - **渐进式迁移需求**

- 新旧系统平滑切换
- 精确控制流量比例
- 保证迁移过程的可控性
2. - **性能优先场景**

- 营销关键页面
- 高转化率要求页面
> 这个方案并不是要替代现有的 A/B Testing 系统，而是作为一个补充，专门用于处理对性能特别敏感的场景。常规的 A/B Testing 需求仍然使用现有系统。

## 2. 系统设计

### 2.1 整体架构

```
sequenceDiagram
    participant User as Browser
    participant CF as CloudFront CDN
    participant WAF as WAF
    participant ALB as Application Load Balancer
    participant EKS as EKS Cluster

    Note over User,EKS: 请求处理阶段
    User->>CF: 1. HTTPS请求
    CF->>CF: 2. Viewer Request Function
    CF->>WAF: 3. 安全检查
    WAF-->>CF: 4. 检查结果
    
    opt 静态内容
        CF-->>User: 5a. 返回缓存内容
    end

    opt 动态内容
        CF->>ALB: 5b. 转发请求
        ALB->>EKS: 6. 路由到Service
        EKS-->>ALB: 7. 返回响应
        ALB-->>CF: 8. 返回响应
        CF-->>User: 9. 返回内容
    end
```

### 2.2 实验流量分配

```
flowchart TD
    subgraph ExperimentLogic["实验分配逻辑"]
        direction TB
        CookieCheck{"Cookie检查"}
        CF_Func["CloudFront Function<br>流量分配"]
        SetExp["设置Cookie<br>Control:20%<br>Variant A:40%<br>Variant B:40%"]
        ReadCookie["读取Cookie"]
        SetHeader["设置实验Header"]
    end
    
    subgraph K8sNamespace["Production Namespace"]
        HeaderCheck{"Header检查"}
        IC["Ingress Controller"]
        Canary["Canary Ingress"]
        MainIngress["Main Ingress"]
        NewService["新版本Service"]
        OldService["原版本Service"]
    end

    Client["Browser"] --> CF["CloudFront"]
    CF --> CF_Func
    CF_Func --> CookieCheck
    CookieCheck -- "不存在" --> SetExp
    CookieCheck -- "存在" --> ReadCookie
    SetExp --> SetHeader
    ReadCookie --> SetHeader
    SetHeader --> HeaderCheck
    HeaderCheck -- "实验组" --> Canary
    HeaderCheck -- "对照组" --> MainIngress
    Canary --> NewService
    MainIngress --> OldService

    classDef aws fill:#FF9900,stroke:#232F3E,color:white
    classDef logic fill:#B5EAEA,stroke:#232F3E
    classDef k8s fill:#326CE5,stroke:#232F3E,color:white
    classDef service fill:#4CAF50,stroke:#232F3E,color:white
    
    class CF,CF_Func aws
    class CookieCheck,HeaderCheck logic
    class IC,Canary,MainIngress k8s
    class NewService,OldService service
```

## 3. 技术实现

```
sequenceDiagram
    participant Browser
    participant CF as CloudFront
    participant VRF as Viewer Request Function
    participant VRsF as Viewer Response Function
    participant Origin
    participant KVS as CloudFront KV Store

    Browser->>CF: 1. 发起请求
    CF->>VRF: 2. 触发 Viewer Request
    VRF->>KVS: 3. 读取实验配置
    KVS-->>VRF: 4. 返回配置
    
    alt 有实验 Cookie
        VRF->>VRF: 5a. 验证 Cookie 值
    else 无实验 Cookie
        VRF->>VRF: 5b. 根据权重分配实验组
    end
    
    VRF->>VRF: 6. 设置实验 Header
    VRF-->>CF: 7. 修改后的请求
    
    CF->>Origin: 8. 转发请求到源站
    Origin-->>CF: 9. 返回响应
    
    CF->>VRsF: 10. 触发 Viewer Response
    VRsF->>KVS: 11. 读取实验配置
    KVS-->>VRsF: 12. 返回配置
    VRsF->>VRsF: 13. 设置实验 Cookie
    VRsF-->>CF: 14. 修改后的响应
    CF-->>Browser: 15. 返回最终响应
```

### 3.1 实验配置

> 基于实验扩展性、灵活性需求，根据Region设置实验配置文件。

![](attachment)

实验配置存储在 CloudFront KV Store 中：

> [https://us-east-1.console.aws.amazon.com/cloudfront/v4/home#/functions/kvs/Prod-Joyboy-Web-AB-Testing](https://us-east-1.console.aws.amazon.com/cloudfront/v4/home#/functions/kvs/Prod-Joyboy-Web-AB-Testing)

```
{
    "pla_layout": {
        "cookie": {
            "name": "X-Exp-PlaLayout",
            "maxAge": 604800,
            "secure": true
        },
        "header": {
            "name": "x-exp-pla-layout", //注意header.name值必须为小写
        },
        "conditions": {
            "path": {
                "pattern": "^/[a-zA-Z]{2}/pla/[^/]+$",
                "enabled": true  //enable为false时，该项条件不生效
            },
            "pathlist": {
                "collections": [
                    "/sg/pla/harper-dining-table",
                    "/sg/pla/jonathan-leather-extended-sofa",
                    "/sg/pla/dalton-storage-bed",
                    "/sg/pla/dawson-storage-bed",
                    "/sg/pla/dawson-pit-sectional-sofa",
                    "/sg/pla/seb-extendable-dining-set-for-4-6",
                    "/sg/pla/owen-chaise-sectional-sofa"
                ],
                "enabled": true //enable为false时，该项条件不生效
            }
        },
        "variants": {
            "z": {
                "weight": 50
            },
            "a": { 
                //weight为0的变体，不被包含到实验中
                //比如，实验前期进入a组的流量，在实验后期，a组权重修改为0后，携带a变体标记的流量将会被重新进行分组
                "weight": 0  
            },
            "b": {
                "weight": 50
            },
            "c": {
                "weight": 0
            }
        },
        "theme": {
            "cookie": {
                "name": "X-Exp-theme",
                "maxAge": 604800,
                "path": "/"
            },
            "header": {
                "name": "x-exp-theme"
            },
            "conditions": {
                "path": {
                    "pattern": "^/[a-zA-Z]{2}/pla/[^/]+$",
                    "enabled": true
                }
            },
            "variants": {
                "new": {
                    "weight": 20
                },
                "old": {
                    "weight": 80
                }
            }
        }
    }
}
```

### 3.2 Viewer Request Function

> [https://us-east-1.console.aws.amazon.com/cloudfront/v3/home#/functions/Prod-Joyboy-Web-Multiple-Market-AB-Testing-Req](https://us-east-1.console.aws.amazon.com/cloudfront/v3/home#/functions/Prod-Joyboy-Web-Multiple-Market-AB-Testing-Req)

```
import cf from "cloudfront";

const kvsHandle = cf.kvs();
// 根据市场获取实验配置
const expConfigPrefix = "EXPERIMENT_CONFIG_";
const enabledRegions = ["SG", "US", "AU"];

// 在文件顶部添加缓存对象
const cache = {
  value: null,
  timestamp: 0,
  ttl: 300000, // 缓存时间 5 分钟 (单位：毫秒)
};

// 根据请求path获取流量的市场信息
function getRegion(path) {
  const regionStr = path.split("/")[1];
  const region = regionStr.toUpperCase();
  return enabledRegions.includes(region) ? regionStr : "";
}

// 实验生效检测
// 根据实验配置中的条件，逐一校验，当条件检测不通过时，默认为控制组，并返回Request
function conditionsCheck(conditions, path) {
  const region = getRegion(path);
  let flag = true;
  if (conditions && Object.keys(conditions).length > 0) {
    Object.keys(conditions).forEach((key) => {
      const condition = conditions[key];
      if (key === "path" && condition.enabled) {
        const reg = new RegExp(condition.pattern);
        flag = reg.test(path);
        if (!flag) {
          console.log(`Error: path ${path} not match`);
          return flag;
        }
      }
      if (key === "pathlist" && condition.enabled) {
        const collections = condition.collections;
        if (Array.isArray(collections)) {
         //注意：不规范的path兼容
          const rePath = path.endsWith("/") ? path.slice(0, -1) : path;
          const lowerCapPath = rePath.toLowerCase();
          flag = collections.includes(lowerCapPath);
          if (!flag) {
            console.log(
              `Error: Path ${lowerCapPath} not match,origin path is ${path}`
            );
            return flag;
          }
        }
      }
    });
  }
  return flag;
}
// 获取可用的变体
// 此处会过滤掉权重为0的变体
function getEnabledVariants(variants) {
  const enabledVariants = {};
  Object.entries(variants).forEach((entry) => {
    const variantId = entry[0];
    const variant = entry[1];
    if (variant.weight > 0) {
      enabledVariants[variantId] = variant;
    }
  });
  return enabledVariants;
}
// 获取实验配置的函数
async function getExperimentConfig(kvsHandle, region) {
  const now = Date.now();

  // 如果缓存存在且未过期，直接返回缓存值
  if (cache.value && now - cache.timestamp < cache.ttl) {
    console.log("Using cached experiment config");
    return cache.value;
  }

  // 缓存不存在或已过期，从 KVS 获取新值
  try {
    // 根据市场获取实验配置
    const experimentConfigKey = expConfigPrefix + region.toUpperCase();
    const experimentsConfig = await kvsHandle.get(experimentConfigKey);
    const experiments = JSON.parse(experimentsConfig);

    // 更新缓存
    cache.value = experiments;
    cache.timestamp = now;

    console.log("Updated experiment config cache");
    return experiments;
  } catch (err) {
    console.log("Error fetching experiment config:", err);

    // 如果获取新值失败但存在过期缓存，使用过期缓存
    if (cache.value) {
      console.log("Using stale cache due to error");
      return cache.value;
    }

    throw err;
  }
}

function getRandomValue(max) {
  return Math.floor(Math.random() * max);
}
//命中变体
function selectVariant(variants) {
  if (!variants) return "";
  const totalWeight = Object.values(variants).reduce(
    (sum, variant) => sum + variant.weight,
    0
  );
  const randomValue = getRandomValue(totalWeight);
  let currentWeight = 0;
  for (const variantId in variants) {
    if (variants.hasOwnProperty(variantId)) {
      const variantWeight = variants[variantId].weight;
      currentWeight += variantWeight;
      if (randomValue < currentWeight) {
        return variantId;
      }
    }
  }
  // 注意 variants[0]配置为： 控制组
  return Object.keys(variants)[0];
}

function getDefaultVariant(variants) {
  if (!variants) return "";
  return Object.keys(variants)[0];
}

function transformGeoHeaders(headers){
  // 转换地理位置相关的请求头
  var geoHeaders = {
    "CloudFront-Viewer-Country": "X-Viewer-Country",
    "CloudFront-Is-IOS-Viewer": "X-Is-IOS-Viewer",
    "CloudFront-Is-Tablet-Viewer": "X-Is-Tablet-Viewer",
    "CloudFront-Is-Mobile-Viewer": "X-Is-Mobile-Viewer",
    "CloudFront-Viewer-City": "X-Viewer-City",
    "CloudFront-Viewer-Postal-Code": "X-Viewer-Postal-Code",
    "CloudFront-Viewer-Country-Region": "X-Viewer-Country-Region",
    "CloudFront-Is-Android-Viewer": "X-Is-Android-Viewer",
    "CloudFront-Is-Desktop-Viewer": "X-Is-Desktop-Viewer",
  };

  // 遍历并转换请求头
  for (var oldHeader in geoHeaders) {
    if (headers[oldHeader.toLowerCase()]) {
      // 获取原始header的值
      var headerValue = headers[oldHeader.toLowerCase()].value;

      // 添加新的X-前缀的header
      headers[geoHeaders[oldHeader].toLowerCase()] = {
        value: headerValue,
      };

      // 删除原始的CloudFront-前缀的header
      delete headers[oldHeader.toLowerCase()];
    }
  }

}

async function handler(event) {
  const request = event.request;
  const path = request.uri;
  const cookies = request.cookies || {};
  const region = getRegion(path);
  
  if (!region) {
    console.error("Invalid region:", path);
    return request;
  }

  var headers = request.headers;
  transformGeoHeaders(headers);

  try {
    // 从KVS获取所有实验配置
    const experiments = await getExperimentConfig(kvsHandle, region);

    // 处理每个实验
    Object.entries(experiments).forEach((entry) => {
      const config = entry[1];
      const conditions = config.conditions;

      //检测：是否可以进入实验
      if (!conditionsCheck(conditions, path)) {
        const variant = getDefaultVariant(config.variants);
        // 设置实验 header
        request.headers[config.header.name] = {
          value: variant,
        };
        return request;
      }
      console.log("GoodJob: conditionsCheck passed");

      const variants = getEnabledVariants(config.variants);
      let variant;
      // 检查现有cookie
      if (cookies[config.cookie.name]) {
        variant = cookies[config.cookie.name].value;
        // 验证变体是否有效
        if (!variants[variant]) {
          variant = selectVariant(variants);
        }
      } else {
        // 选择新的变体
        variant = selectVariant(variants);
      }
      // 设置实验 header
      request.headers[config.header.name] = {
        value: variant,
      };
      console.log("GoodJob: header set");
    });
  } catch (err) {
    console.log("Error processing experiments:", err);
  }
  return request;
}
```

### 3.3 Viewer Response Function

> [https://us-east-1.console.aws.amazon.com/cloudfront/v3/home#/functions/Prod-Joyboy-Web-Multiple-Market-AB-Testing-Res](https://us-east-1.console.aws.amazon.com/cloudfront/v3/home#/functions/Prod-Joyboy-Web-Multiple-Market-AB-Testing-Res)

```
import cf from 'cloudfront';

const kvsHandle = cf.kvs();
const expConfigPrefix = 'EXPERIMENT_CONFIG_';
const enabledRegions = ['SG', 'US', 'AU'];

// 在文件顶部添加缓存对象
const cache = {
  value: null,
  timestamp: 0,
  ttl: 300000, // 缓存时间 5 分钟 (单位：毫秒)
};
function getRegion(path) {
  const regionStr = path.split('/')[1];
  const region = regionStr.toUpperCase();
  return enabledRegions.includes(region) ? regionStr : '';
}

// 获取实验配置的函数
async function getExperimentConfig(kvsHandle, region) {
  const now = Date.now();

  // 如果缓存存在且未过期，直接返回缓存值
  if (cache.value && now - cache.timestamp < cache.ttl) {
    console.log('Using cached experiment config');
    return cache.value;
  }

  // 缓存不存在或已过期，从 KVS 获取新值
  try {
    const experimentConfigKey = expConfigPrefix + region.toUpperCase();
    const experimentsConfig = await kvsHandle.get(experimentConfigKey);
    const experiments = JSON.parse(experimentsConfig);

    // 更新缓存
    cache.value = experiments;
    cache.timestamp = now;

    console.log('Updated experiment config cache');
    return experiments;
  } catch (err) {
    console.log('Error fetching experiment config:', err);

    // 如果获取新值失败但存在过期缓存，使用过期缓存
    if (cache.value) {
      console.log('Using stale cache due to error');
      return cache.value;
    }

    throw err;
  }
}

// 验证实验配置是否有效
function isValidExperimentConfig(config) {
  if (!config || typeof config !== 'object') {
    return false;
  }

  if (!config.header || typeof config.header !== 'object' || !config.header.name) {
    return false;
  }

  if (!config.variants || typeof config.variants !== 'object') {
    return false;
  }

  const variantKeys = Object.keys(config.variants);
  return variantKeys.length > 0;
}
function getEnabledVariants(variants) {
  const enabledVariants = {};
  Object.entries(variants).forEach((entry) => {
    const variantId = entry[0];
    const variant = entry[1];
    if (variant.weight > 0) {
      enabledVariants[variantId] = variant;
    }
  });
  return enabledVariants;
}

// 验证变体是否有效
function isValidVariant(variant, variants) {
  if (!variant || !variants) {
    return false;
  }
  const targetVariant = variants[variant];
  return targetVariant !== undefined;
}

// 从路径中提取配置的路径部分
function extractConfiguredPath(path, configPath) {
  if (!path || !configPath) {
    return null;
  }

  try {
    const pathParts = path.split('/');

    // 检查第一个部分是否是国家代码（两个字母）
    const hasCountryCode = pathParts[1] && /^[a-z]{2}$/.test(pathParts[1]);
    if (hasCountryCode) {
      return `/${pathParts[1]}${configPath}`; // 直接返回配置的路径
    }
    return null;
  } catch (error) {
    console.log('Error parsing path:', error);
    return null;
  }
}

// 构建 cookie 属性
function buildCookieAttributes(cookieConfig, requestPath) {
  
  if (!cookieConfig) {
    return '';
  }

  const attributes = [];

  if (cookieConfig.maxAge) {
    attributes.push(`Max-Age=${cookieConfig.maxAge}`);
  }

  if (cookieConfig.domain) {
    attributes.push(`Domain=${cookieConfig.domain}`);
  }

  // 只有在明确配置了path的情况下才处理Path属性
  let configuredPath = '';
  if (cookieConfig.path) {
    configuredPath = cookieConfig.path;
  }else {
    configuredPath = requestPath;
  }
  
  if (configuredPath) {
    attributes.push(`Path=${configuredPath}`);
  }
  
  if (cookieConfig.secure) {
    attributes.push('Secure');
  }

  if (cookieConfig.httpOnly) {
    attributes.push('HttpOnly');
  }

  if (cookieConfig.sameSite) {
    attributes.push(`SameSite=${cookieConfig.sameSite}`);
  }

  return attributes.join('; ');
}

async function handler(event) {
  // 在 ViewerResponse 触发器中，我们只关心 response
  const response = event.response;
  if (!response) {
    console.log('Invalid event object - missing response:', event);
    return {};
  }

  // 注意：在 ViewerResponse 中，request 对象可能不完整或不存在
  const request = event.request || {};
  const path = request.uri
  const region = getRegion(path);

  try {
    // 使用缓存函数获取配置
    const experiments = await getExperimentConfig(kvsHandle, region);
    if (!experiments || typeof experiments !== 'object') {
      console.log('Invalid experiments config format');
      return response;
    }

    Object.keys(experiments).forEach((experimentId) => {
      try {
        const config = experiments[experimentId];

        if (!isValidExperimentConfig(config)) {
          console.log(`Invalid experiment config for ${experimentId}`);
          return;
        }

        // 安全地访问 headers
        const headers = request.headers || {};
        const headerValue = headers[config.header.name];
        const headerVariant = headerValue && headerValue.value;
        const variants = getEnabledVariants(config.variants);

        if (!headerVariant) {
          return;
        }

        if (!isValidVariant(headerVariant, variants)) {
          console.log(`Invalid variant ${headerVariant} for experiment ${experimentId}`);
          return;
        }

        if (!config.cookie || !config.cookie.name) {
          return;
        }

        // 安全地访问 cookies
        const cookies = request.cookies || {};
        const existingCookie = cookies[config.cookie.name];
        const shouldSetCookie = !existingCookie || existingCookie.value !== headerVariant;
        if (shouldSetCookie) {
          if (!response.cookies) {
            response.cookies = {};
          }
          const cookieAttributes = buildCookieAttributes(config.cookie, request.uri || '');

          response.cookies[config.cookie.name] = {
            value: headerVariant,
          };

          if (cookieAttributes) {
            response.cookies[config.cookie.name].attributes = cookieAttributes;
          }

          console.log(`Cookie update for experiment ${experimentId}:`, {
            previousValue: existingCookie ? existingCookie.value : null,
            newValue: headerVariant,
            reason: !existingCookie ? 'initial_set' : 'value_update',
          });
        }
      } catch (experimentError) {
        console.log(`Error processing experiment ${experimentId}:`, experimentError);
      }
    });
  } catch (err) {
    console.log('Error in experiment handler:', err);
  }

  return response;
}
```

### 3.4 Kubernetes 配置

> [https://github.com/castlery/joyboy-deployment/blob/master/applications/web/chart/templates/ingress-canary-op-pla.yaml](https://github.com/castlery/joyboy-deployment/blob/master/applications/web/chart/templates/ingress-canary-op-pla.yaml)

```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pla-canary
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-header: "x-exp-pla-layout"
    nginx.ingress.kubernetes.io/canary-by-header-value: "z"
spec:
  rules:
  - http:
      paths:
      - path: /sg/pla
        pathType: Prefix
        backend:
          service:
            name: new-pla-service
            port:
              number: 80
```

## 4. 应用场景

### 4.1 适用场景

1. - **性能敏感页面**

- 电商核心转化页面
- 营销活动落地页
- SEO 重要着陆页
2. - **架构迁移**

- 系统重构过程
- 服务迁移验证
- 技术栈升级
3. - **性能优化验证**

- 新架构性能对比
- 优化方案验证
- 资源加载优化
### 4.2 不适用场景

1. - **普通功能实验**

- UI 样式测试
- 功能特性验证
- 用户行为研究
2. - **复杂实验场景**

- 多变量测试
- 个性化实验
- 行为分析实验
## 5. 性能效果

| 指标 | 优化前 | 优化后 | 提升 |
| TTFB | 220ms | 80ms | 63% |
| FCP | 1.2s | 0.8s | 33% |
| LCP | 2.5s | 1.8s | 28% |


## 6. 监控方案

> 省略

## 7. 实验管理指南

> 下面的链接放的都是生产的 , 实际业务迭代中,请先在测试环境验证成功后 再来修改生产的



![](attachment)



![](attachment)



- 本质都是修改 [KeyValueStores](https://us-east-1.console.aws.amazon.com/cloudfront/v4/home#/functions/kvs/Prod-Joyboy-Web-AB-Testing) 这个配置文件

### 7.1 添加新实验

```
{
  "pla_layout": {
    "cookie": {
      "name": "X-Exp-PlaLayout",
      "maxAge": 604800,
      "secure": true
    },
    "header": {
      "name": "x-exp-pla-layout"
    },
    "variants": {
      "z": { "weight": 20 },
      "a": { "weight": 40 },
      "b": { "weight": 40 }
    }
  },
+  "theme": {
+    "cookie": {
+      "name": "X-Exp-theme",
+      "maxAge": 604800,
+      "path": "/"
+    },
+    "header": {
+      "name": "x-exp-theme"
+    },
+    "variants": {
+      "new": { "weight": 20 },
+      "old": { "weight": 80 }
+    }
+  }
}
```

### 7.2 修改实验

1. - **调整流量比例**
```
{
  "pla_layout": {
    "cookie": {
      "name": "X-Exp-PlaLayout",
      "maxAge": 604800,
      "secure": true
    },
    "header": {
      "name": "x-exp-pla-layout"
    },
    "variants": {
      "z": { "weight": 20 },
+      "a": { "weight": 10 },
      "b": { "weight": 40 }
    }
  }
}
```

### 7.3 停止实验

#### **渐进式停止**

##### `weight` 为 0 的情况

```
{
  "pla_layout": {
    "cookie": {
      "name": "X-Exp-PlaLayout",
      "maxAge": 604800,
      "secure": true
    },
    "header": {
      "name": "x-exp-pla-layout"
    },
    "variants": {
      "z": { "weight": 100 },
+      "a": { "weight": 0 }
    }
  }
}
```



> 注意：此操作只影响新用户，已有实验 Cookie 的用户仍会保持在原实验组

- 设置 weight: 0 不会立即停止实验
- 已有 Cookie 的用户仍会按原实验分组访问对应版本
- 只有新用户会被分配到对照组

##### 删除实验variant

```
{
  "pla_layout": {
    "cookie": {
      "name": "X-Exp-PlaLayout",
      "maxAge": 604800,
      "secure": true
    },
    "header": {
      "name": "x-exp-pla-layout"
    },
    "variants": {
      "z": { "weight": 100 }
-      "a": { "weight": 0 }
    }
  }
}
```

#### 完全停止实验（当前在使用的方案 ）

```
{
  "pla_layout": {
    "cookie": {
      "name": "X-Exp-PlaLayout",
      "maxAge": 604800,
      "secure": true
    },
    "header": {
      "name": "x-exp-pla-layout"
    },
    "variants": {
      "z": { "weight": 20 },
      "a": { "weight": 40 },
      "b": { "weight": 0 }, // 0代表完全停止实验，保留变体是为了动态调整实验权重（PM的需求）
      "c": { "weight": 40 }
    }
+  },
-  "theme": {
-    "cookie": {
-      "name": "X-Exp-theme",
-      "maxAge": 604800,
-      "path": "/"
-    },
-    "header": {
-      "name": "x-exp-theme"
-    },
-    "variants": {
-      "new": { "weight": 20 },
-      "old": { "weight": 80 }
-    }
-  }
}
```

## 8. 快速回滚方案

### 8.1 紧急回滚步骤

### 停用实验

参考  

### **停用 CloudFront Function**

在 CloudFront Distribution 的 Behaviors 配置中取消关联 Function

![](attachment)

> 请谨慎判断是否使用上诉方案, 因为这样会把该 Behaviors 下的实验全部终止

## 9. 经验总结

### 9.1 系统优势

1. - **性能影响最小**

- CDN 层完成分流
- 无客户端开销
- 避免页面闪烁
2. - **适合特定场景**

- 性能敏感页面
- 架构迁移验证
- 技术栈升级
3. - **成本效益好**

- 复用 CDN 基础设施
- 按调用计费
- 维护成本低
### 9.2 使用建议

1. - **合理选择场景**

- 评估性能需求
- 权衡实验复杂度
- 考虑维护成本
2. - **与现有系统配合**

- 明确分工界限
- 避免重复建设
- 保持系统简单
## 结语

这个基于 CloudFront 的 A/B Testing 方案是针对性能敏感场景的专门解决方案。它不是要替代现有的 A/B Testing 系统，而是作为一个补充，在特定场景下提供更好的性能表现。通过在 PLA 页面迁移等场景中的实践，证明这个方案能够很好地平衡性能和实验需求。