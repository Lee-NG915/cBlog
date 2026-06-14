# 搜索 Loading 状态

## 🎯 双重反馈机制

基于 Fortress 设计规范，搜索 Loading 提供两层用户反馈：

1. **顶部进度条**（`NextTopLoader`）- 全局页面级提示
2. **搜索结果蒙层**（`Backdrop`）- 局部区域明确提示

## 工作原理

```tsx
// libs/modules/search/components/src/lib/instantsearch/search-loading.tsx

export function SearchLoading() {
  const { status } = useInstantSearch();
  const loader = useTopLoader();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // loading 或 stalled 都会触发
    if (status === 'loading' || status === 'stalled') {
      loader.start(); // 1. 顶部进度条开始
      setIsVisible(true); // 2. 显示蒙层
    } else if (status === 'idle') {
      loader.done(); // 1. 顶部进度条完成
      // 2. 延迟隐藏蒙层（平滑过渡）
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [status, loader]);

  return (
    <Box
      sx={
        {
          /* 蒙层样式，参考 Fortress Backdrop */
        }
      }
    >
      <CircularProgress size="lg" />
    </Box>
  );
}
```

## 设计规范

搜索结果区域蒙层设计：

- ✅ 背景色：`rgba(251, 249, 244, 0.9)` - warmLinen-200 半透明
- ✅ 居中显示 `CircularProgress`
- ✅ 300ms 淡入淡出动画
- ✅ `pointerEvents` 控制交互
- ✅ 仅覆盖搜索结果区域（不影响左侧筛选器）

## 状态说明

- **loading** / **stalled**：搜索进行中（stalled = 响应时间 > 200ms）
  - 显示顶部进度条
  - 显示搜索结果蒙层（浅色半透明，不遮蔽左侧筛选器）
- **idle**（搜索完成）
  - 隐藏顶部进度条
  - 淡出蒙层（300ms 延迟）

## 集成说明

已自动集成在 `SearchView` 中，无需配置 🎉

```tsx
<Box sx={{ position: 'relative' }}>
  <SearchLoading /> {/* 在搜索结果区域显示 */}
  <CustomHits />
</Box>
```

## 参考文档

- [nextjs-toploader](https://github.com/TheSGJ/nextjs-toploader)
- Fortress Backdrop: `libs/fortress/src/back-drop/back-drop.tsx`
