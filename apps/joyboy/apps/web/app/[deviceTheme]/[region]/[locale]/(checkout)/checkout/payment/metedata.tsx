import { createMetadata } from '@castlery/seo';

export function generateMetadata() {
  return createMetadata({
    title: `Payment Methods`,
    description: '',
    robots: {
      index: false,
    },
  });
}
