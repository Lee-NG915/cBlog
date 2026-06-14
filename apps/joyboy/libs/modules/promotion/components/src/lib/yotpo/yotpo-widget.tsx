'use client';
import { Container, useBreakpoints } from '@castlery/fortress';
import { YotpoScript } from './yotpo-script';
import { User } from '@castlery/types';

declare global {
  interface Window {
    yotpoWidgetsContainer?: {
      initWidgets?: () => void;
    };
  }
}
interface YotpoWidgetProps {
  yopto_id: string;
  user: User | null;
}

export const YotpoWidget = (props: YotpoWidgetProps) => {
  const { yopto_id, user } = props;
  const { mobile } = useBreakpoints();

  return (
    <Container
      disableGutters
      sx={{
        minHeight: mobile ? '965px' : '550px',
        width: '100%',
        img: {
          width: 'auto',
        },
      }}
    >
      <YotpoScript user={user} />
      <div className="yotpo-widget-instance" data-yotpo-instance-id={yopto_id} />
    </Container>
  );
};
