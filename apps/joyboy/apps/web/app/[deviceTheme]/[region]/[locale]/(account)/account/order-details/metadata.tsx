import { createMetadata } from '@castlery/seo';
import { LocalesNamespace, translationServer } from '@castlery/monorepo-i18n/server';

export async function generateMetadata() {
  const { t } = await translationServer(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderDetailsPage.metadata',
  });

  return {
    title: t('title'),
  };
}
