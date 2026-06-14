import React from 'react';
import { Box, Typography, Card, CardCover, CardContent } from '@castlery/fortress';
import { Countdown } from '../countdown';

interface BannerProps {
  title?: string;
  description?: string; // HTML字符串
  desktopImage?: string; // 桌面端图片URL
  mobileImage?: string; // 移动端图片URL
  backgroundColor?: string; // 背景色
  showBanner?: boolean; // 是否显示banner
  className?: string;
  countdownDeadline?: string; // 倒计时截止时间
  countdownColor?: string; // 倒计时颜色: 'white' | 'black'
  showOverlay?: boolean; // 是否显示文字覆盖层
  imageFit?: 'cover' | 'contain'; // 图片适应方式
  imageRatio?: number; // 宽高比，如果提供将使用CSS aspect-ratio设置尺寸
  bannerData?: any;
}

// 最小HTML净化器，用于description字段
function sanitizeHtml(html?: string) {
  if (!html) return { __html: '' };
  const sanitized = html
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '');
  return { __html: sanitized };
}

/**
 * Banner背景层组件 - 包含背景图片和渐变遮罩
 * 在单个CardCover中管理所有背景层，确保正确的层叠顺序
 */
function BannerBackground({
  desktopImage,
  mobileImage,
  alt,
  imageFit = 'cover',
  showOverlay = true,
}: {
  desktopImage?: string;
  mobileImage?: string;
  alt: string;
  imageFit?: 'cover' | 'contain';
  showOverlay?: boolean;
}) {
  return (
    <CardCover>
      {/* 背景图片层 */}
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopImage || ''} />
        <source media="(max-width: 767px)" srcSet={mobileImage || desktopImage || ''} />
        <img
          src={desktopImage || ''}
          alt={alt}
          loading="eager"
          fetchPriority="high"
          style={{
            objectFit: imageFit,
            width: '100%',
            height: '100%',
          }}
        />
      </picture>

      {/* 渐变遮罩层 - 在图片上方，增强文字可读性 */}
      {showOverlay && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'var(--fortress-shadow-md)',
          }}
        />
      )}
    </CardCover>
  );
}

/**
 * Banner内容层 - 包含标题、描述和倒计时
 */
function BannerContentLayer({
  title,
  description,
  isCountdownActive,
  countdownDeadline,
  countdownColor,
  hasAnyImage,
}: {
  title?: string;
  description?: string;
  isCountdownActive: boolean;
  countdownDeadline?: string;
  countdownColor?: string;
  hasAnyImage: boolean;
}) {
  // 根据是否有背景图片决定文字颜色
  const textColor = hasAnyImage ? 'white' : 'inherit';

  return (
    <CardContent
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 0, // 移除默认padding，使用自定义间距
        height: '100%', // 确保CardContent填满Card容器
        overflow: 'hidden', // 防止内容溢出
      }}
    >
      <Box
        sx={{
          // maxWidth: 1184, // 恢复最大宽度限制，保持内容居中
          width: '100%',
          py: 4,
          px: 6,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          overflow: 'hidden', // 防止子元素溢出
        }}
      >
        {/* 标题 */}
        {title && (
          <Typography
            level="h1"
            sx={{
              color: textColor,
              WebkitLineClamp: 1, // 标题最多显示2行
            }}
            mb={1}
          >
            {title}
          </Typography>
        )}

        {/* 倒计时 */}
        {isCountdownActive && (
          <Box sx={{ mb: { xs: 1, sm: 1.5, md: 2 }, flexShrink: 0 }}>
            <Countdown deadline={countdownDeadline!} color={countdownColor === 'white' ? 'white' : 'black'} />
          </Box>
        )}

        {/* 描述内容 */}
        {description && (
          <Box
            sx={{
              color: textColor,
              fontSize: { xs: 14, sm: 16, md: 18 },
              lineHeight: { xs: 1.4, sm: 1.5, md: 1.6 },
              fontFamily: 'var(--font-aime)',
              maxWidth: '1184px',
              overflow: 'hidden',
              // 段落样式 - 统一限制为最多4行
              '& p, & div': {
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 4, // 所有屏幕尺寸都限制为4行
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
              // 链接样式
              '& a': {
                color: 'inherit',
                textDecoration: 'underline',
                '&:hover': { opacity: 0.8 },
              },
              // 段落间距 - 减少间距避免溢出
              '& p + p, & div + div': {
                mt: { xs: 0.5, sm: 1, md: 1.5 },
              },
            }}
            dangerouslySetInnerHTML={sanitizeHtml(description)}
          />
        )}
      </Box>
    </CardContent>
  );
}

/**
 * Banner UI组件
 *
 * 设计理念：
 * - 使用Card + CardCover + CardContent分层架构，符合Joy UI设计规范
 * - CardCover处理背景图片和渐变遮罩层
 * - CardContent处理前景内容（标题、描述、倒计时）
 * - 支持响应式图片、自定义宽高比、灵活的布局配置
 *
 * 主要改进：
 * - 移除复杂的绝对定位逻辑，使用Card组件自然的层叠结构
 * - 简化媒体处理，由CardCover统一管理
 * - 更清晰的组件分离和职责划分
 */
export function Banner({
  title,
  description,
  desktopImage,
  mobileImage,
  backgroundColor,
  showBanner = true,
  className,
  countdownDeadline,
  countdownColor,
  showOverlay = true,
  imageFit = 'cover', // 默认改为cover，更符合banner的预期效果
  imageRatio,
  bannerData,
}: BannerProps) {
  // 早期返回：不显示banner
  if (!showBanner) return null;

  const hasAnyImage = Boolean(desktopImage || mobileImage);
  const isEmpty = !hasAnyImage && !backgroundColor && !title && !description;

  // 早期返回：没有任何内容
  if (isEmpty) return null;

  // 判断倒计时是否激活
  const isCountdownActive = Boolean(countdownDeadline && new Date(countdownDeadline) > new Date());
  const shouldShowOverlay = Boolean(showOverlay);

  return (
    <Card
      className={className}
      sx={{
        position: 'relative',
        width: '100%',
        bgcolor: backgroundColor || 'transparent',
        // 设置固定高度，保持现有的视觉规格
        height: {
          xs: 146, // 移动端高度
          md: 252, // 桌面端高度
        },
        // 如果提供了imageRatio，使用aspect-ratio覆盖固定高度
        ...(typeof imageRatio === 'number' &&
          imageRatio > 0 && {
            height: 'auto',
            aspectRatio: imageRatio,
          }),
        // 移除Card默认的border和shadow，保持banner的纯净外观
        border: 'none',
        boxShadow: 'none',
        '--Card-padding': 0,
      }}
    >
      {/* 背景层 - 包含图片和渐变遮罩 */}
      {hasAnyImage && (
        <BannerBackground
          desktopImage={desktopImage}
          mobileImage={mobileImage}
          alt={title || 'Banner image'}
          imageFit={imageFit}
          showOverlay={shouldShowOverlay}
        />
      )}

      {/* 前景内容层 - 仅在需要覆盖层时显示 */}
      {shouldShowOverlay && (
        <BannerContentLayer
          title={title}
          description={description}
          isCountdownActive={isCountdownActive}
          countdownDeadline={countdownDeadline}
          countdownColor={countdownColor}
          hasAnyImage={hasAnyImage}
        />
      )}
    </Card>
  );
}
