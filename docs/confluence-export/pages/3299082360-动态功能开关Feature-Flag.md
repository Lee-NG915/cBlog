---
confluence_id: "3299082360"
title: "动态功能开关Feature Flag"
status: current
parent_id: "3042443302"
depth: 2
domain: architecture
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3299082360
local_joyboy_doc: null
blog_post: null
---
# 1. 技术设计

## 1.1 架构设计

![](attachment)

## 1.2 职责说明

| **Feature Service** |
| #### Feature Management Service （To B） |
| - **职责：**

- **集中管理功能配置**：存储所有功能开关的状态、描述和依赖关系。
- **功能配置接口**：提供 REST API 或 GraphQL API 供前后端调用。
- **动态加载**：支持从数据库或缓存中动态读取配置。
- **角色与权限控制**：根据用户角色或分组限制功能的可见性和启用状态。
- **日志记录**：记录功能使用情况和配置变更。 |
| - **API**

- `/api/features` 获取功能开关列表（支持分页等）。
- `/api/features/{id}` 获取特定功能开关的详细信息。
- `/api/features/toggle` 更新功能开关的状态。
- `/api/features/add` 新增功能开关。
- `/api/features/update` 更新功能开关信息。
- `/api/features/disabled/{id}` 禁用功能开关。
- `/api/features/disabled` 批量禁用功能开关。
- `/api/features/remove/{id}`  删除功能开关。 |
| #### Feature Query API (To C) |
| - ** 职责**

- 提供轻量化接口供前端或其他服务快速获取功能状态。
- 缓存常用查询结果以提升性能。
- 负责权限验证，确保查询请求的安全性。 |
| - **API**

- `/api/features/list`  查询功能开关列表（支持分页等）。
- `/api/feature/{id}` 获取特定功能开关的详细信息。 |


| **JS SDK** |
| 封装 `FeatureManager` JavaScript SDK，与Feature Query API交互，负责加载和管理功能开关状态。

- **职责：**

- 为客户端提供`onFeaturesLoaded`、`isFeatureEnabled`、`getFeaturePayload` 等方法，异步获取功能状态。
- **主要功能：**

- `onFeaturesLoaded(callback)`：获取所有功能开关的配置。
- `isFeatureEnabled(featureId)`：检查某功能是否启用。
- `getFeaturePayload(featureId)`：获取某功能的详细配置信息。 |


> **目前资源问题，只能做本地维护的前端SDK版本。**

## 1.3 Feature Flag设计

### 1.3.1 功能分析

为能够灵活控制功能发布，提升系统的可维护性和业务的敏捷性。在设计features flag时主要考虑以下几个方面：

| 功能需求分析 | Feature Flag分类 | 数据存储位置 |
| **使用场景**

- 是用来做灰度发布、A/B 测试，还是多市场功能管理？
- 是针对用户、市场，还是开发环境？
**控制粒度**

- **全局级别**：影响所有用户或整个系统，例如切换后端服务版本。
- **用户级别**：对特定用户启用功能，如 VIP 用户或测试用户。
- **环境级别**：区分开发、测试、生产环境的功能启用。 | **静态 Feature Flag**

- 在构建时决定功能启用状态。
- 适用于开发环境中临时隐藏的功能。
**动态 Feature Flag**

- 在运行时通过服务端或配置动态决定功能状态。
- 适用于生产环境，便于远程控制。
**阶段性 Feature Flag**

- 用于特定时间段的功能控制，例如节假日促销活动。
**永久性 Feature Flag**

- 长期存在，用于管理不同市场的特性（如语言或货币设置）。 | **本地存储**：简单的 JSON 文件或配置文件，适合小型项目或开发环境。

**后端服务**：通过 API 动态获取 Flag 状态，适合需要实时更新的功能。

**第三方工具**：使用专业 Feature Flag 管理服务（如 LaunchDarkly、Unleash、 ）。 |


**基于以上的汇总，设计满足以下功能的features flag**

| **描述** |  |
| 支持**全局级别和环境级别**的功能控制：

1. - 支持按照项目渠道开启flag、
2. - 支持根据市场区域开启Flag、
3. - 支持根据网站运行环境开启Flag、
4. - 支持根据生效日期、失效日期开启Flag、
等多种场景，灵活设置某个功能特性的启用状态。 | `enabledAppChannels` |
| `enabledRegions` |
| `environment` |
| `status` |
| `effectiveDate` `expirationDate` |
| `user` |
| `version` |
| 1. - 支持通过API获取Flag状态 | `isFeatureEnabled` |
| 1. - 支持通过API获取feature payload | `getFeaturePayload` |


### 1.3.2 Feature数据模型

**Interface**

```
import { Region, ApplicationChannel, ApplicationEnv, FeatureName } from '../config';

export interface Feature {
  /**
   * The name of the feature
   */
  featureName: FeatureName;
  /**
   * The description of the feature
   */
  description: string;
  /**
   * The status of the feature
   * @default `true`
   * @required
   */
  status: boolean;
  /**
   * The channels where the feature is enabled
   * @required
   * @default `[]`
   */
  enabledAppChannels: ApplicationChannel[];
  /**
   * The regions where the feature is enabled
   * @required
   */
  enabledRegions: Region[];
  /**
   * The environment where the feature is enabled
   */
  environment?: ApplicationEnv[];
  /**
   * The date when the feature was enabled
   * @default `UTC timestamp`
   */
  effectiveDate?: number;
  /**
   * The date when the feature will be disabled
   * @default `UTC timestamp`
   */
  expirationDate?: number;
  /**
   * The remark for the feature
   */
  remark?: string;
  /**
   * The payload for the feature
   */
  payload?: {
    [key: string]: any;
  };
}
```

**Example**

```
/**
 * Apple Sign In
 */
const appleSign: Feature = {
  featureName: FeatureName.APPLE_SIGN_IN,
  description: 'Sign in with Apple',
  status: !!Adapters.appleClientId,
  enabledRegions: [Region.SG, Region.US, Region.AU],
  enabledAppChannels: [ApplicationChannel.WEB],
  payload: {
    jsSdkUrl: 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
    clientId: Adapters.appleClientId,
    icon: '',
  },
};
```

### 1.3.3 Feature生效判定逻辑

支持多种场景下的生效逻辑，包括`enabledAppChannels` 、`enabledRegions`、`environment`、`status`、`effectiveDate` 和 `expirationDate` 等条件，确保功能启用的灵活性与精确性。以下Flow Chart显示`feature`生效的判断流程。

**功能生效校验流程（ 待更新）**

```
flowchart TD
    A[isFeatureEnabled] --> B{check 'status'}
    B --> |False|Z[return False]
    B --> |Ture|C{check 'enabledRegions'}
    C --> |False|Z
    C --> |True|D{if 'environment'}
    D --> |False|Y
    D --> |True|F{check 'environment'}
    F --> |False|Z
    F --> |True|G{if 'effectiveDate' or 'expirationDate'}
    G --> |False|Y
    G --> |True|H[check 'effectiveDate' or 'expirationDate']
    H --> |True|Y[return true]
    H --> |False|Z
```

## 1.4 Feature Flag SDK & API

封装 `FeatureManager` 类，用于集中管理功能相关的方法，如 `features`、`loadFeatures` 和 `isFeatureEnabled`、`getFeaturePayload`。

### 1.4.1 SDK文件结构设计

| `feature-flag/` |
| ```
.  
├── adapters  
├── config    
├── features      
├── index.ts
├── types
└── scripts
``` |
| `adapters` | 适配器，用于统一管理 `features/` 目录下的文件对外部代码的依赖。`features/` 目录中的文件禁止直接访问外部资源（如项目中的环境变量等），以确保模块之间的解耦和代码的可维护性。 |
| `config` | 用于存放 `features` 的配置文件，专门维护每个 `feature` 的配置信息，确保配置管理的集中化和清晰性。 |
| `features` | 用于维护feature配置内容 |
| `helpers` | 用于抽象 `feature` 的功能方法，通常包含业务逻辑的通用封装。例如，`mulberry.helper.ts` 文件可能导出 `mulberryInit`、`openMulberryModal` 等工具方法，以便在多个模块中复用，提高代码的可读性和维护性。 |
| `script` | 用于存放 `feature` 的基础工具方法，例如 `featureManager` 和 `featureEffectiveCheker` 等。这些方法通常与具体业务无关，提供通用的功能支持，提升代码的复用性和模块化程度。 |


### 1.4.2 FeatureManager

通过这种封装，避免了直接操作全局变量或分散的配置文件，提高了代码的解耦性，便于功能模块的拆分、重构和问题排查。同时，`FeatureManager` 支持动态加载配置（如从服务器或文件读取），并能够处理复杂的功能依赖关系，为功能管理提供了灵活性和扩展性。

```
import { FEATURES_CONFIG } from '../feaures';
import { FeatureName, Region, ApplicationChannel, ApplicationEnv } from '../config';
import { Adapters } from '../adapters';
import type { Feature } from '../types';

/**
 * FeatureManager class
 * @doc https://posthog.com/docs/libraries/js#feature-flags
 */
export class FeatureManager {
  private static instance: FeatureManager;
  
  featureName = FeatureName;
  features: Record<FeatureName, Feature> = Object.keys(FEATURES_CONFIG).reduce((acc, key) => {
    acc[key as FeatureName] = FEATURES_CONFIG[key as FeatureName];
    return acc;
  }, {} as Record<FeatureName, Feature>);

  private constructor() {
    // Private constructor to enforce singleton pattern
    this.features = this.getFeatureFlags();
  }

  private getFeatureFlags() {
    // TODO: Fetch feature flags from remote source if needed
    return this.features;
  }

  private getFeature(featureName: FeatureName) {
    // TODO: Fetch feature flag from remote source if needed
    return this.features[featureName];
  }

  /**
   * 校验包含优先级
   * @param feature Feature object
   * @returns
   */
  private featureEffectiveCheker(feature: Feature): boolean {
    if (!feature) return false;

    if (!feature.status) return false;
    if (
      !feature.enabledAppChannels ||
      !feature.enabledAppChannels.includes(Adapters.currentAppChannel as ApplicationChannel)
    )
      return false;
    if (!feature.enabledRegions || !feature.enabledRegions.includes(Adapters.currentRegion as Region)) return false;

    if (
      Array.isArray(feature.environment) &&
      !feature.environment.includes(Adapters.currentApplicationEnv as ApplicationEnv)
    ) {
      return false;
    }
    if (feature.effectiveDate || feature.expirationDate) {
      const now = Date.now();
      if (feature.effectiveDate && feature.expirationDate) {
        return now > feature.effectiveDate && now < feature.expirationDate;
      }
      if (feature.effectiveDate) return now >= feature.effectiveDate;
      if (feature.expirationDate) return now <= feature.expirationDate;
    }
    return true;
  }

  /**
   * @todo Reserved method: compatible with scenarios where features are obtained remotely.
   * @param callback Callback function to be called when features are available
   */
  public onFeatureFlags(callback: (features: Record<keyof typeof FeatureName, Feature>) => void) {
    if (typeof callback === 'function' && this.features) {
      if (this.getFeatureFlags()) {
        callback(this.features);
      }
    }
  }

  public reloadFeatureFlags() {
    this.features = this.getFeatureFlags();
  }

  public static getInstance(): FeatureManager {
    if (!FeatureManager.instance) {
      FeatureManager.instance = new FeatureManager();
    }
    return FeatureManager.instance;
  }

  public isFeatureEnabled(featureName: FeatureName): boolean {
    const feature = this.getFeature(featureName);
    if (!feature) return false;
    return this.featureEffectiveCheker(feature);
  }

  // for multiple variants
  public getFeatureFlag() {
    // todo:编写feature variants的分发逻辑，暂时不需要，预留API
  }

  public getFeatureFlagPayload(featureName: FeatureName) {
    const target = this.getFeature(featureName);
    const enabled = this.isFeatureEnabled(featureName);
    return enabled && target?.payload ? target?.payload : null;
  }

  public toggleFeature(featureName: FeatureName) {
    // ....... 扩展：如果支持自由集成feature，可以通过dash board启用/禁用feature
  }

  public addFeature(featureName: FeatureName, properities: object) {
    // ....... 扩展：如果支持自有集成feature，可以通过dashboard add feature
  }
}

export const featureManager = FeatureManager.getInstance();
```

### 1.4.3 Feature API

#### 1) onFeatureFlags (待扩展)

- API: `onFeatureFlags(callback(features: Record<FeatureName, Feature>):void): void`
- 描述：监听featuresxxxx
- ```
修改中
```
#### 2) reloadFeatureFlags （待扩展）

- API: `reloadFeatureFlags(): Feature[]`
- 描述：刷新`features`
- ```
const newFeatures = featureManager.reloadFeatureFlags()
```
#### 3) isFeatureEnabled

- API: `isFeatureEnabled(featureName: string): boolean`
- 描述：检测feature是否生效。
- ```
const enabled = featureManager.isFeatureEnabled(featureManager.featureName.FEATURE_AAA)
```
#### 5) getFeaturePayload

- API: `getFeaturePayload(featureName: string): object`
- 描述：获取feature的参数。当feature生效时，返回`payload`，不生效时，返回null；
- ```
const payload = featureManager.getFeaturePayload(featureManager.featureName.FEATURE_AAA)
```
## 前端集成方案

放置于monorepo 项目的基础设施层，供多个项目复用。

`joyboy/packages/monorepo-features`

## 部署方案

V1版本，前端集成在项目中，通过JSON维护feature信息，随项目部署。

V2版本自研 Feature Manager System 或者第三方比如Unleash或者Posthog。

- 自研Feature Manager System, 部署在内部服务。
- 第三方比如Unleash或者Posthog，支持自托管或者第三方服务。