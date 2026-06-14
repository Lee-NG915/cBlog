'use client';

import { EcEnv } from '@castlery/config';
import { ArrowRight } from '@castlery/fortress/Icons';
import { NextFortressLink } from '@castlery/shared-components';
import { CollectionItem } from '@castlery/types';

interface CollectionDisplayClientProps {
  collectionPage: CollectionItem;
}

export const CollectionDisplayClient = (props: CollectionDisplayClientProps) => {
  const { collectionPage } = props;
  return (
    <NextFortressLink
      variant="primary"
      level="body2"
      endDecorator={
        <ArrowRight
          sx={{
            width: '20px',
            height: '20px',
          }}
        />
      }
      href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${collectionPage?.url}`}
    >
      View the {collectionPage.name}
    </NextFortressLink>
  );
};
