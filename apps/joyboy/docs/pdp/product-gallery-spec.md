# PDP Product Gallery 业务规格说明

> 面向 PM / UI / QA  
> 对应组件：`libs/modules/product/components/.../refined-product-gallery/`

---

## 文档信息

| 字段     | 内容         |
| -------- | ------------ |
| 当前版本 | v1.0         |
| 创建日期 | 2026-04-16   |
| 最后更新 | 2026-04-16   |
| 负责人   | Jasper Zhang |

---

## 变更记录

| 版本 | 日期       | 变更内容                                                                                              | 作者         |
| ---- | ---------- | ----------------------------------------------------------------------------------------------------- | ------------ |
| v1.0 | 2026-04-16 | 初始版本：梳理 galleryList 组装逻辑、6 种媒体类型、Dimension / AR / Bundle Overlay 规格、QA checklist | Jasper Zhang |

---

## 一、Gallery 媒体列表（galleryList）的组装逻辑

Gallery 的所有媒体项统一叫做 **galleryList**，每次切换 Variant 都会重新计算。

### 组装步骤

```
Step 1  合并 images + assets
        ↓  按 position 字段升序排列

Step 2  注入 3D 图（条件触发）
        条件：variant 有 threed_images 字段 AND 无 sketchfab_3d_model_id
        位置：紧跟第一张 base/base_old 图之后；若没有 base 图则插在第 2 位

Step 3  防视频排头
        若排序后第一项是视频类型（video / master_video / short_video），
        把第一张非视频项移到最前面
```

> **结论**：第 1 张永远是图片（非视频），这是产品决策，避免进入页面就自动播放视频。

---

## 二、媒体类型一览表

| type           | 中文描述         | 数据来源                                              | 主画面表现                                                                                   | 缩略图表现                      |
| -------------- | ---------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------- |
| `base`         | 标准产品图       | `variant.images`                                      | 全尺寸图片；可叠加 Bundle overlay；支持 Dimension 切换                                       | 图片；可叠加 Dimension 尺寸图标 |
| `base_old`     | 旧格式标准产品图 | `variant.images`                                      | 同 base                                                                                      | 同 base                         |
| `3d`           | 360° 三维图      | `variant.threed_images[0]`（注入，非 Sketchfab 路径） | `ThreeSixtyViewImage` 组件——可拖拽旋转查看产品                                               | 白色 360° 图标叠加              |
| `short_video`  | 短循环视频       | `variant.assets`                                      | 自动播放 + 静音 + 循环，无控制条                                                             | 视频封面截帧 + 白色播放图标     |
| `video`        | 普通产品视频     | `variant.assets`                                      | 带播放控制条，静音，有封面缩略图                                                             | 同 short_video                  |
| `master_video` | 主推功能视频     | `variant.assets`                                      | 带播放控制条，静音；**特殊：第一张 base 图会显示「View More Features」按钮，点击跳至此视频** | 同 video                        |

> **注意**：`3d` 类型（`threed_images`）与 Sketchfab 3D 是两条不同路径：
>
> - 有 `sketchfab_3d_model_id` → 用 Sketchfab Viewer + AR Drawer（悬浮按钮覆盖在画廊上）
> - 无 `sketchfab_3d_model_id` 但有 `threed_images` → 在 galleryList 中注入一张可拖拽旋转的 3D 图

---

## 三、Dimension 图（尺寸图）

Dimension 是独立于 galleryList 的**叠加层**，不是一个独立的 media 类型。

| 数据字段                                   | 说明                                              |
| ------------------------------------------ | ------------------------------------------------- |
| `variant.dimension_image.links.feed`       | 彩色尺寸图（叠加在正常产品图上）                  |
| `variant.dimension_image.links.large_gray` | 灰色尺寸图（用于缩略图叠加 + PinchZoom 全屏查看） |

**触发条件**：用户在页面点击「Dimensions」toggle → 对应 index 进入激活状态。

| 位置     | 激活后表现                                                                 |
| -------- | -------------------------------------------------------------------------- |
| 缩略图   | 展示灰色尺寸图 + 白色 Dimension 图标                                       |
| 主图     | 自动滚动至页面 `#dimension-property` 锚点（**仅桌面端**）                  |
| 全屏点击 | 快速点击激活的 base 图 → 打开 PinchZoomViewer（灰色尺寸图专用，只有 1 张） |

---

## 四、AR / 3D 查看器（Sketchfab 路径）

**触发条件**：`variant.sketchfab_3d_model_id` 有值

| 场景                         | 行为                                                                 |
| ---------------------------- | -------------------------------------------------------------------- |
| 点击「360 View」按钮         | 全屏打开 Sketchfab 3D 查看器，可自由旋转                             |
| 点击「View in AR」（移动端） | 修改 URL hash 为 `#ar-via-qr-code`，打开 3D 查看器并自动进入 AR 模式 |
| 点击「View in AR」（桌面端） | 打开 AR Drawer，展示二维码供手机扫描                                 |

**按钮显示规则：**

- 同时支持 3D 和 AR → 两个按钮均显示
- 只支持 3D → 只显示「360 View」，宽度撑满
- 都不支持 → 按钮区域不渲染（整个区块消失）

---

## 五、Bundle Overlay（套装叠加图）

部分产品为 Bundle（套装），例如沙发 + 脚凳组合。当用户通过 URL query string 选中了 bundle 子产品的某个 variant，对应的 `base` / `base_old` 图会额外叠加该子变体的 overlay 图层（来自 `variant.overlay.links.large_overlay`）。

- 切换子变体 → overlay 实时更新
- 非 `base` / `base_old` 类型的图不叠加 overlay

---

## 六、主画面渲染规则（桌面 vs 移动）

| 平台 | 滑动方向                   | 缩略图位置 | 缩略图触发               |
| ---- | -------------------------- | ---------- | ------------------------ |
| 桌面 | 垂直滚动（鼠标滚轮或拖拽） | 左侧竖排   | hover 画廊区域时淡入显现 |
| 平板 | 垂直滚动                   | 左侧竖排   | 同桌面                   |
| 移动 | 水平滑动                   | 底部横排   | 常驻，带可拖拽 Scrollbar |

缩略图点击 → 主画面跳转至对应项

---

## 七、PinchZoom 全屏查看

**触发**：点击非视频媒体项（视频点击会触发播放，不进入全屏）

- 包含 galleryList 中所有媒体，视频在全屏中仍以视频形式呈现
- Bundle overlay 仅在 `base` / `base_old` 类型图上叠加
- Dimension 激活时快速点击 base 图 → 打开**专属 Dimension 灰色图全屏**（独立 Viewer，只有 1 张图）

**触发判断（移动端）**：touch 持续时间 < 200ms 视为点击，超过则视为滑动，不触发全屏

---

## 八、QA 测试检查点

### 8.1 组装逻辑

- [ ] 切换 variant 后 galleryList 刷新，缩略图同步更新
- [ ] 有 `threed_images` 且无 `sketchfab_3d_model_id`：3D 图出现在第一张 base 图之后
- [ ] 有 `sketchfab_3d_model_id`：galleryList 中不出现 3D 类型图，画廊右下角悬浮按钮可见
- [ ] 若 `images[0]` 为视频类型 → 第一张展示非视频图（视频被后移）

### 8.2 媒体类型

- [ ] `short_video`：自动播放，静音，循环，无控制条
- [ ] `video` / `master_video`：有播放控制条，静音，封面截帧可见
- [ ] `master_video` 存在时：第一张 base 图出现「View More Features」按钮，点击跳转至 master_video 并自动播放
- [ ] `3d` 类型：可左右拖拽旋转，不触发 Sketchfab 弹窗

### 8.3 Dimension

- [ ] 点击 Dimension toggle → 对应缩略图变为灰色图 + Dimension 图标
- [ ] 桌面端：自动平滑滚动至尺寸区域
- [ ] 快速点击激活的 base 图 → 打开灰色尺寸图全屏

### 8.4 AR / 3D（Sketchfab 路径）

- [ ] 移动端「View in AR」→ Sketchfab 3D 查看器打开并自动进入 AR 模式
- [ ] 桌面端「View in AR」→ AR Drawer 打开并显示二维码
- [ ] 「360 View」→ Sketchfab Viewer 全屏打开，可自由拖拽旋转
- [ ] 无 Sketchfab 模型的产品 → AR/3D 按钮不显示

### 8.5 Bundle Overlay

- [ ] 选择 bundle 子变体 → base 图出现叠加层
- [ ] 切换子变体 → overlay 实时更新
- [ ] 非 base 类型图不出现 overlay
- [ ] PinchZoom 全屏中 overlay 同样叠加

---

## 九、关键代码位置索引

| 逻辑                                  | 文件路径                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| galleryList 组装                      | `libs/modules/product/components/.../refined-product-gallery/refined-product-gallery.client.tsx` |
| mergeAndSortArrays / handleImagesSort | `libs/modules/product/services/src/utils.ts`                                                     |
| MediaItem 渲染逻辑                    | `.../refined-product-gallery/components/media-item.tsx`                                          |
| ThumbnailImage 缩略图                 | `.../refined-product-gallery/components/thumbnail-image.tsx`                                     |
| Variant / Image 类型定义              | `libs/modules/product/domain/src/entity/product.entity.ts`                                       |
