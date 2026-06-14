import { sbApiClient } from '@castlery/modules-cms-components';
import { createMetadata } from '@castlery/seo';

export async function generateMetadata({ params }: { params: { slug: string }; searchParams: URLSearchParams }) {
  const { slug } = params;
  try {
    const pageContent = await sbApiClient.getBlogPost(slug);
    if (!pageContent) throw new Error(`api error , slug : ${slug}`);
    const metaTitle = pageContent.content?.meta?.[0]?.title || 'Blog Title';

    const description = pageContent.content?.meta?.[0]?.description || '';

    const keywords = pageContent.content?.meta?.[0]?.keywords || '';

    return await createMetadata({
      title: metaTitle,
      description,
      keywords,
      publisher: 'Castlery',
      robots: {
        index: true,
        'max-image-preview': 'large',
      },
    });
  } catch (error) {
    return {};
  }
}
