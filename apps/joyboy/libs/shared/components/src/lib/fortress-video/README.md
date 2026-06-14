# FortressVideo 组件

基于 Cloudinary 的视频播放器组件，支持自定义缩略图帧位置和海报配置。

## 基本用法

```tsx
import { FortressVideo } from '@castlery/shared-components';

// 基础使用
<FortressVideo
  src="your-video-public-id"
  width={800}
  height={600}
/>

// 响应式视频（推荐）
<FortressVideo
  src="your-video-public-id"
  responsive={true}
  transformation={{
    quality: 'auto',
    format: 'auto',
    crop: 'fit',
  }}
/>

// 自定义宽高比
<FortressVideo
  src="your-video-public-id"
  transformation={{
    quality: 'auto',
    format: 'auto',
    crop: 'fill',
    aspectRatio: '16:9', // 直接设置宽高比
  }}
/>
```

## 视频变换参数 (transformation)

`transformation` 属性支持 Cloudinary 的各种视频变换参数：

```tsx
<FortressVideo
  src="your-video-public-id"
  transformation={{
    quality: 'auto', // 自动质量优化
    format: 'auto', // 自动格式选择
    width: 800, // 视频宽度
    height: 600, // 视频高度
    crop: 'fill', // 裁剪模式：fit, fill, scale, crop
    gravity: 'center', // 重心位置：center, north, south 等
    aspectRatio: '16:9', // 宽高比：16:9, 4:3, 1:1 等
  }}
/>
```

### 裁剪模式说明

| 模式      | 行为                                       | 适用场景                   |
| --------- | ------------------------------------------ | -------------------------- |
| **fit**   | 保持原始宽高比，完整显示内容（可能有黑边） | 完整展示视频内容           |
| **fill**  | 填满指定尺寸，可能裁剪部分内容             | 确保没有黑边，适合背景视频 |
| **scale** | 强制缩放到指定尺寸（可能变形）             | 特殊效果需求               |
| **crop**  | 裁剪到指定尺寸，保持宽高比                 | 精确控制显示区域           |

### 宽高比设置

```tsx
// 常见宽高比设置
<FortressVideo
  src="video-id"
  transformation={{
    crop: 'fill',
    aspectRatio: '16:9',  // 16:9 宽屏
  }}
/>

<FortressVideo
  src="video-id"
  transformation={{
    crop: 'fill',
    aspectRatio: '4:3',   // 4:3 经典比例
  }}
/>

<FortressVideo
  src="video-id"
  transformation={{
    crop: 'fill',
    aspectRatio: '1:1',   // 正方形
  }}
/>
```

## 海报图配置

### posterOptions（推荐）

`posterOptions` 是 `next-cloudinary` v6.16.0+ 支持的原生属性，用于设置每次加载新视频时显示的默认海报图。根据 [Cloudinary Video Player API 文档](https://cloudinary.com/documentation/video_player_api_reference#posteroptions)，我们支持以下配置：

```tsx
// 使用固定海报图
<FortressVideo
  src="your-video-public-id"
  posterOptions={{
    publicId: 'sample-poster-image'
  }}
/>

// 添加视觉效果
<FortressVideo
  src="your-video-public-id"
  posterOptions={{
    publicId: 'sample-poster-image',
    transformation: {
      effect: ['sepia']
    }
  }}
/>

// 使用纯色背景
<FortressVideo
  src="your-video-public-id"
  posterOptions={{
    publicId: 'sample', // 仍需提供，但会被 posterColor 覆盖
    posterColor: 'red'
  }}
/>
```

#### posterOptions 完整参数说明

| 参数               | 类型     | 必需 | 说明                                                      |
| ------------------ | -------- | ---- | --------------------------------------------------------- |
| **publicId**       | `string` | ✅   | 海报图片的 Cloudinary 公共 ID                             |
| **transformation** | `object` | ❌   | 图像变换参数配置                                          |
| **posterColor**    | `string` | ❌   | 用于替代图像显示的常量颜色（RGB/RGBA 十六进制或颜色名称） |

#### transformation 支持的变换参数

| 参数            | 类型                 | 说明                                    | 示例                       |
| --------------- | -------------------- | --------------------------------------- | -------------------------- |
| **quality**     | `string`             | 视频质量：auto, 100, 80, 60 等          | `'auto'`, `'80'`           |
| **format**      | `string`             | 视频格式：auto, mp4, webm 等            | `'auto'`, `'mp4'`          |
| **width**       | `number`             | 视频宽度（像素）                        | `800`, `1200`              |
| **height**      | `number`             | 视频高度（像素）                        | `600`, `675`               |
| **crop**        | `string`             | 裁剪模式：fit, fill, scale, crop        | `'fit'`, `'fill'`          |
| **gravity**     | `string`             | 重心位置：center, north, south, auto 等 | `'center'`, `'auto'`       |
| **aspectRatio** | `string`             | 宽高比：width:height 格式               | `'16:9'`, `'4:3'`, `'1:1'` |
| **effect**      | `string \| string[]` | 视觉效果（仅用于 posterOptions）        | `'sepia'`, `['sepia']`     |

## 缩略图帧位置控制

### 参数说明

#### thumbnailStartOffset

- **类型**: `number`
- **说明**: 指定缩略图取第几秒的帧，支持小数点（如 5.5 秒）
- **优先级**: 最高，如果设置了此参数，会忽略 `thumbnailPercentage`
- **示例**: `5.5` 表示第 5.5 秒的帧

#### thumbnailPercentage

- **类型**: `number` (0-100)
- **说明**: 指定缩略图取视频百分比位置的帧
- **优先级**: 次于 `thumbnailStartOffset`
- **示例**: `50` 表示视频 50% 位置的帧，`25` 表示 25% 位置的帧

#### thumbnailWidth

- **类型**: `number`
- **默认值**: `200`
- **说明**: 缩略图宽度（像素）

#### thumbnailHeight

- **类型**: `number`
- **说明**: 缩略图高度（像素），如果不指定则根据比例自动计算

#### thumbnailAspectRatio

- **类型**: `string | number`
- **说明**: 缩略图宽高比，支持多种输入格式，最终都会转换为数字格式
- **数字类型**: `1.77`, `2.5`, `1` → 直接使用
- **数字字符串**: `'1.77'` → `ar_1.8`
- **比例字符串**: `'16:9'` → 计算为 `16÷9=1.8` → `ar_1.8`
- **常见示例**:
  - `1.77` 或 `'16:9'` → `ar_1.8` (宽屏)
  - `1.33` 或 `'4:3'` → `ar_1.3` (经典)
  - `1` 或 `'1:1'` → `ar_1.0` (正方形)
  - `2.5` → `ar_2.5` (超宽屏)
- **用途**: 确保缩略图有固定的宽高比，避免变形

#### poster

- **类型**: `string`
- **说明**: 手动指定的缩略图 URL，设置后会跳过所有自动缩略图生成逻辑

### 使用场景示例

```tsx
// 场景1: 产品展示视频，16:9 比例缩略图
<FortressVideo
  src="product-demo-video"
  transformation={{
    quality: 'auto',
    format: 'auto',
    crop: 'fill',
    aspectRatio: '16:9',
  }}
  thumbnailStartOffset={3}
  thumbnailWidth={400}
  thumbnailAspectRatio={1.77} // 数字类型，16:9 比例
/>

// 场景2: 社交媒体正方形视频和缩略图
<FortressVideo
  src="social-video"
  transformation={{
    quality: 'auto',
    format: 'auto',
    crop: 'fill',
    aspectRatio: '1:1',
    width: 400,
    height: 400,
  }}
  thumbnailPercentage={40}
  thumbnailWidth={300}
  thumbnailAspectRatio={1} // 数字类型，正方形
/>

// 场景3: 超宽屏视频缩略图
<FortressVideo
  src="ultrawide-video"
  responsive={true}
  transformation={{
    quality: 'auto',
    format: 'auto',
    crop: 'fit',
  }}
  thumbnailStartOffset={1.2}
  thumbnailWidth={320}
  thumbnailAspectRatio={2.5} // 数字类型，超宽屏比例
/>

// 场景4: 自定义尺寸但保持宽高比
<FortressVideo
  src="hero-video"
  transformation={{
    quality: '80',
    format: 'mp4',
    crop: 'fill',
    aspectRatio: '16:9',
    width: 1200,
    height: 675,
  }}
  thumbnailStartOffset={2.5}
  thumbnailWidth={600}
  thumbnailHeight={400} // 手动指定高度，不使用 aspectRatio
  posterOptions={{
    publicId: 'hero-poster',
    transformation: {
      effect: ['brightness:10']
    }
  }}
/>
```

## posterOptions vs 缩略图参数对比

| 功能         | posterOptions                | thumbnailStartOffset/thumbnailPercentage |
| ------------ | ---------------------------- | ---------------------------------------- |
| **用途**     | 为所有视频设置统一的默认海报 | 从当前视频生成特定帧的缩略图             |
| **应用时机** | 每次加载新视频时显示         | 作为 poster 属性传递给播放器             |
| **灵活性**   | 可以使用任意图片 + 变换      | 仅能从当前视频提取帧                     |
| **性能**     | 图片可预先处理和缓存         | 实时生成，依赖 Cloudinary 变换           |
| **适用场景** | 品牌统一性、固定设计         | 视频预览、内容展示                       |

### 推荐用法

1. **品牌统一**: 使用 `posterOptions` 为所有视频设置统一的品牌海报
2. **内容预览**: 使用 `thumbnailStartOffset` 展示视频的关键帧
3. **混合使用**: 可以同时使用两者，手动指定的 `poster` 优先级最高

### 技术原理

#### 缩略图生成

组件内部通过 Cloudinary 的变换参数来生成缩略图：

- `so_5.5` - 第 5.5 秒的帧（支持小数秒精确定位）
- `so_50p` - 50% 位置的帧
- `w_300,h_200` - 尺寸控制
- `ar_1.8` - 宽高比控制（可选，保留 1 位小数）
- `c_fill,g_center` - 裁剪和重心
- `q_auto,f_auto` - 自动质量和格式

生成的缩略图 URL 示例：

```
# 基础缩略图（指定宽度和宽高比）
https://res.cloudinary.com/your-cloud/video/upload/w_400,ar_1.8,so_5.5,c_fill,g_center,q_auto,f_auto/your-video-id.jpg

# 完整尺寸缩略图（指定宽度和高度）
https://res.cloudinary.com/your-cloud/video/upload/w_400,h_300,so_5.5,c_fill,g_center,q_auto,f_auto/your-video-id.jpg
```

#### 缩略图参数优先级

1. **尺寸控制优先级**：

   - 如果同时设置 `thumbnailWidth` + `thumbnailHeight`：使用精确尺寸
   - 如果只设置 `thumbnailWidth` + `thumbnailAspectRatio`：按宽高比自动计算高度
   - 如果只设置 `thumbnailWidth`：使用原始视频比例

2. **时间控制优先级**：
   - `thumbnailStartOffset` > `thumbnailPercentage`

### 注意事项

1. **缩略图功能**：仅支持 Cloudinary 视频，对于非 Cloudinary 视频请使用 `poster` 属性
2. **优先级**：`poster` > `thumbnailStartOffset` > `thumbnailPercentage`
3. **性能考虑**：缩略图生成是实时的，建议在生产环境中考虑缓存策略
4. **宽高比设置**：建议结合适当的 `crop` 模式使用 `aspectRatio` 以获得最佳效果
