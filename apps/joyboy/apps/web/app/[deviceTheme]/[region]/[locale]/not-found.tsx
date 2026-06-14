import { PageNotFoundContainer } from '@castlery/modules-others-components';
import { WebMainLayout } from '@castlery/modules-cms-components/server';

export default function NotFound() {
  return (
    <WebMainLayout>
      <PageNotFoundContainer />
    </WebMainLayout>
  );
}
