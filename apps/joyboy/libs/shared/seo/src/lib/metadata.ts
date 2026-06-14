import merge from 'lodash.merge';
import type { Metadata } from 'next';
import { LocalesNamespace, fallbackLng, translationServer } from '@castlery/monorepo-i18n/server';
import { logger } from '@castlery/observability/server';

type MetadataGenerator = Omit<Metadata, 'description' | 'title'> & {
  title: string;
  description: string;
  image?: string;
  keywords?: string;
  canonicalUrl?: string;
  notIndexed?: boolean;
  largeImagePreview?: boolean;
  locale?: string;
};

const APPLICATION_NAME = 'Castlery';
// TODO 这里不可以使用相对逻辑 问题和 manifest 一样
export const DEFAULT_IMAGE = 'https://res.cloudinary.com/castlery/image/upload/v1773135208/180_x_180_px_jjkbl6.png';

// 默认 metadata 配置
const getDefaultMetadata = (parsedTitle: string, description: string, locale?: string): Metadata =>
  ({
    title: parsedTitle,
    description,
    applicationName: APPLICATION_NAME,
    formatDetection: {
      telephone: false,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: parsedTitle,
    },
    openGraph: {
      title: parsedTitle,
      description,
      type: 'website',
      siteName: APPLICATION_NAME,
      locale,
    },
  } as Metadata);

// 处理图片配置
const processImageConfig = (image: string, title: string, metadata: Metadata): void => {
  if (image && metadata.openGraph) {
    (metadata.openGraph as any).images = [
      {
        url: image,
        alt: title,
        // 使用更合理的宽高，参考社交媒体平台的最佳实践
        width: 1200,
        height: 630,
      },
    ];
  }
};

// 处理 robots 配置
const processRobotsConfig = (notIndexed = false, largeImagePreview = false, metadata: Metadata): void => {
  const robotsConfig: any = {};

  if (notIndexed) {
    robotsConfig.index = false;
    robotsConfig.follow = false;
  }

  if (largeImagePreview) {
    (metadata as any).other = {
      ...(metadata as any).other,
      robots: 'max-image-preview:large',
    };
  }

  if (Object.keys(robotsConfig).length > 0) {
    (metadata as any).robots = robotsConfig;
  }
};

/**
 * 创建标准化的 metadata 对象
 * @param title - 页面标题
 * @param description - 页面描述
 * @param image - 页面图片 URL（可选）
 * @param keywords - 页面关键词（可选）
 * @param canonicalUrl - 规范链接（可选）
 * @param notIndexed - 是否不索引（可选）
 * @param locale - 当前语言环境（可选）
 * @param largeImagePreview - 是否启用大图预览（可选）
 * @param properties - 其他 metadata 属性
 * @returns 完整的 Metadata 对象
 */
export const createMetadata = async ({
  title,
  description,
  image,
  keywords,
  canonicalUrl,
  notIndexed = false,
  largeImagePreview = false,
  locale,
  ...properties
}: MetadataGenerator): Promise<Metadata> => {
  // 参数验证
  if (!title || !description) {
    logger.info('createMetadata: title and description are required');
  }

  // 如果没有传入 locale，使用 fallbackLng
  const finalLocale = locale || fallbackLng;

  const { t } = await translationServer(LocalesNamespace.SHARED, {
    keyPrefix: 'common',
  });

  const pageTitle = `${APPLICATION_NAME} ${t('country')}`;

  const parsedTitle = `${title} | ${pageTitle}`;

  // 创建默认 metadata
  const defaultMetadata = getDefaultMetadata(parsedTitle, description, finalLocale);

  // 合并用户提供的属性
  const metadata: Metadata = merge(defaultMetadata, properties);

  // 处理图片配置
  if (image) {
    processImageConfig(image, title, metadata);
  } else {
    // 使用默认图片
    processImageConfig(DEFAULT_IMAGE, title, metadata);
  }

  // 处理关键词
  if (keywords) {
    (metadata as any).keywords = keywords;
  } else {
    (metadata as any).keywords = t('metadata.keywords');
  }

  // 处理规范链接
  if (canonicalUrl) {
    (metadata as any).alternates = {
      ...(metadata as any).alternates,
      canonical: canonicalUrl,
    };
  }

  // 处理 robots 配置
  processRobotsConfig(notIndexed, largeImagePreview, metadata);

  return metadata;
};
