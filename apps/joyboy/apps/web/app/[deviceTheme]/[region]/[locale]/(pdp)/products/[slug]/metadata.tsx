import { Metadata } from 'next';
import { EcEnv } from '@castlery/config';
import { getProductByIdOrSlugThunk } from '@castlery/modules-product-domain';
import { makeStore } from '@castlery/shared-redux-store';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { createMetadata, generateKeyWords } from '@castlery/seo';
import { cookies, headers } from 'next/headers';
import { logger } from '@castlery/observability/server';
import { sanitizeSlug } from '@castlery/utils';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string; locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  try {
    // 获取产品数据
    const slug = sanitizeSlug(params.slug);
    const searchParamsString =
      Object.keys(searchParams).length > 0
        ? new URLSearchParams(
            Object.fromEntries(Object.entries(searchParams).filter(([_, value]) => value !== undefined)) as Record<
              string,
              string
            >
          ).toString()
        : '';
    const finalSlug = searchParamsString ? `${slug}?${searchParamsString}` : slug;
    const persistenceHandles = makePersistenceHandles({
      cookies,
    });
    let cityInfo: any = {};
    try {
      cityInfo = JSON.parse(persistenceHandles?.webCity?.getItem() || '{}');
    } catch (error) {
      logger.error('Failed to parse city info from cookies in metadata', { error });
    }
    const hostOrigin = headers().get('host');
    // 创建store并获取产品数据
    const store = makeStore();
    const productData = await store
      .dispatch(
        getProductByIdOrSlugThunk({
          idOrSlug: finalSlug,
          cityInfo,
        })
      )
      .unwrap();

    if (!productData) {
      return {
        title: 'Product Not Found | Castlery',
        description: 'The requested product could not be found.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    // 获取产品信息
    const product = productData;
    const variant = product.variants?.[0];
    // 生成关键词
    const keyWords = generateKeyWords(product, variant);

    // 生成当前URL - 确保包含协议
    const protocol = headers().get('x-forwarded-proto') || 'https';
    const originUrl = `${protocol}://${hostOrigin}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/products/${product.slug}`;

    // 生成meta数据
    const title = product.meta_title || product.name;
    const description = product.meta_description || product.description;
    const keywords = product.meta_keywords || keyWords;
    const image = variant?.images && variant.images.length > 0 ? variant.images[0].links.large : '';

    // 判断是否需要索引（产品是否可用）
    // const notIndexed = product.discontinued || (product.variants && product.variants.every((v: any) => v.discontinued));
    const notIndexed = false;

    const metadata = await createMetadata({
      title: title,
      description: description,
      image: image,
      keywords: keywords,
      canonicalUrl: originUrl,
      notIndexed: notIndexed,
      largeImagePreview: !!image,
      locale: params.locale,
      openGraph: {
        url: originUrl,
      },
      twitter: {
        card: 'summary_large_image',
        images: image ? [image] : [],
      },
      robots: {
        index: true,
        follow: true,
      },
    });
    return metadata;
  } catch (error) {
    // logger.warn('Product metadata generation failed', { slug: params.slug });

    // 返回默认meta数据
    return {
      title: 'Product | Castlery',
      description: 'Discover our collection of high-quality furniture.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}
