'use client';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { Stack, Card, Typography, typographyClasses } from '@castlery/fortress';

export interface ServiceGuranteeItemProps {
  title: string;
  description: string;
  guideLinkRichText: ReactNode;
  titleIcon: ReactNode;
  onPolicyLinkClick?: (title: string) => void;
}
export function ServiceGuranteeItem({
  title,
  description,
  guideLinkRichText,
  titleIcon,
  onPolicyLinkClick,
}: ServiceGuranteeItemProps) {
  const handleGuideLinkClickCapture = (event: ReactMouseEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('a')) {
      return;
    }
    onPolicyLinkClick?.(title);
  };

  return (
    <Card
      variant="plain"
      sx={{
        width: '100%',
        height: '100%',
        p: 6,
        m: 0,
      }}
    >
      <Stack sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Stack sx={{ gap: 2, mb: 4 }}>
          <Typography
            startDecorator={titleIcon}
            level="h4"
            sx={{
              [`& .${typographyClasses.startDecorator}`]: {
                marginInlineEnd: 3,
              },
            }}
          >
            {title}
          </Typography>
          <Typography level="body2">{description}</Typography>
        </Stack>
        <Typography
          level="caption1"
          onClickCapture={handleGuideLinkClickCapture}
          sx={{
            fontSize: '16px',
            color: (theme) => theme.palette.brand.mono[700],
            '& a': {
              fontSize: '16px',
            },
          }}
        >
          {guideLinkRichText}
        </Typography>
      </Stack>
    </Card>
  );
}

export default ServiceGuranteeItem;
