import { createMetadata } from '@castlery/seo';

export async function generateMetadata() {
  return createMetadata({
    title: `Cart`,
    description: '',
    robots: {
      index: false,
    },
  });
}
