import { createMetadata } from '@castlery/seo';
import { PageClient } from './page.client';
import { QuizContainer } from '@castlery/modules-others-components';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const title = 'Quiz';
  const description = 'Quiz';

  return createMetadata({
    title,
    description,
    keywords: '',
    robots: {
      index: true,
    },
  });
}

export default function QuizPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  return (
    <>
      <PageClient />
      <QuizContainer slug={slug} />
    </>
  );
}
