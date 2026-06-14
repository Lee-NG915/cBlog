import { createMetadata } from '@castlery/seo';

export async function generateMetadata() {
  return createMetadata({
    title: `Shipping Address`,
    description: '',
    robots: {
      index: false,
    },
  });
}
