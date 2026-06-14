import { getTermsOfUseServer } from '@castlery/modules-cms-domain/server';

export const termsOfUsePreload = () => {
  void getTermsOfUseServer(undefined, {
    revalidate: 60,
  });
};
