'use client';

import { enableYotpo } from '@castlery/config';
import { Container, useBreakpoints } from '@castlery/fortress';
import { storyblokEditable } from '@storyblok/react/rsc';
import { FC } from 'react';

interface YotpoTemplateProps {
  blok: {
    yotpo_id?: string;
    yotpoId?: string;
  };
}

export const YotpoTemplate: FC<YotpoTemplateProps> = ({ blok }) => {
  const { yotpo_id, yotpoId } = blok;
  const { mobile } = useBreakpoints();

  if (!enableYotpo) {
    return null;
  }

  return (
    <Container
      {...storyblokEditable(blok)}
      sx={{
        minHeight: mobile ? '965px' : '550px',
        width: '100%',
        img: {
          width: 'auto',
        },
      }}
    >
      {(yotpo_id || yotpoId) && <div className="yotpo-widget-instance" data-yotpo-instance-id={yotpo_id || yotpoId} />}
    </Container>
  );
};
