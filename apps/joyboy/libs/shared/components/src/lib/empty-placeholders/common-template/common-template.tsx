'use client';
import { Box, Button, Typography } from '@castlery/fortress';

interface CommonTemplateProps {
  title: string;
  cta: string;
  ctaUrl: string;
  description?: string;
}

export function CommonTemplate({ title, cta, ctaUrl, description }: CommonTemplateProps) {
  return (
    <Box>
      <Typography level="h2">{title}</Typography>
      {description && (
        <Typography level="body1" sx={{ mt: 4 }}>
          {description}
        </Typography>
      )}
      <Button component="a" href={ctaUrl} sx={{ mt: 10 }}>
        {cta}
      </Button>
    </Box>
  );
}
