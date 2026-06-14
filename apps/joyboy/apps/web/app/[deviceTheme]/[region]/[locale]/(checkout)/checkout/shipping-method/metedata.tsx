import { createMetadata } from '@castlery/seo';

export async function generateMetadata() {
  return createMetadata({
    title: `Shipping Method`,
    description: '',
    robots: {
      index: false,
    },
  });
}
