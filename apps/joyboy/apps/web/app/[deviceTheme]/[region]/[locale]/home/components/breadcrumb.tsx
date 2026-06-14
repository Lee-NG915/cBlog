'use client';

import { Stack, useBreakpoints } from '@castlery/fortress';
import { BlogBreadcrumbs } from '@castlery/shared-components';

interface BreadcrumbType {
  name: string;
}

export const Breadcrumb = ({ name }: BreadcrumbType) => {
  const { desktop } = useBreakpoints();
  return (
    <>
      <Stack
        sx={{
          alignItems: 'center',
        }}
      >
        <Stack
          sx={{
            width: '100%',
            ...(desktop && { maxWidth: 1728 }),
          }}
        >
          <BlogBreadcrumbs
            needLeftPadding={true}
            ancestorCrumbs={[
              {
                title: name,
                url: '',
              },
            ]}
          />
        </Stack>
      </Stack>
    </>
  );
};
