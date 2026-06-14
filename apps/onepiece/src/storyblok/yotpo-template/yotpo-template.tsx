import { Container, useBreakpoints } from '@castlery/fortress';
import YotpoScript from 'components/Yotpo';
import React from 'react';

type YotpoTemplateProps = {
  blok: {
    yotpo_id?: string;
    yotpoId?: string;
  };
};

const YotpoTemplate = ({ blok }: YotpoTemplateProps) => {
  const { yotpo_id, yotpoId } = blok;
  const { mobile } = useBreakpoints();
  if (__YOTPO_ENABLED__) {
    return (
      <Container
      // sx={[
      //   {
      //     minHeight: '550px',
      //   },
      //   mobile && {
      //     minHeight: '965px',
      //   },
      // ]}
      >
        {(yotpo_id || yotpoId) && (
          <>
            {/* <YotpoScript /> */}
            <div className="yotpo-widget-instance" data-yotpo-instance-id={yotpo_id || yotpoId} />
          </>
        )}
      </Container>
    );
  }
  return null;
};

export default YotpoTemplate;
