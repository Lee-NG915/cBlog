'use client';

import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { FortressImage } from '@castlery/shared-components';

interface ImageImplementProps {
  title: string;
  description?: string;
  imageList: {
    url: string;
    alt: string;
  }[];
}

const ImageImplement = ({ imageList, title, description }: ImageImplementProps) => {
  const { desktop } = useBreakpoints();
  return (
    <Stack
      sx={(theme) => ({
        padding: desktop ? theme.spacing(15) : theme.spacing(6),
        backgroundColor: theme.palette.brand.warmLinen[500],
        width: '100%',
        flexWrap: 'wrap',
      })}
    >
      <Stack sx={(theme) => ({ mb: desktop ? theme.spacing(8) : theme.spacing(6) })}>
        <Typography level="h3" textAlign="center">
          {title}
        </Typography>
        {description && (
          <Typography
            level="body2"
            textAlign="center"
            sx={(theme) => ({ color: theme.palette.brand.mono[700], mt: theme.spacing(3) })}
          >
            {description}
          </Typography>
        )}
      </Stack>
      <Stack
        direction="row"
        gap={desktop ? 8 : 6}
        sx={{
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          '& > *': {
            flex: '0 0 auto',
          },
          // 桌面端居中，移动端左对齐
          justifyContent: desktop ? 'center' : 'flex-start',
        }}
      >
        {imageList.map((item, index) => (
          <Stack key={index} alignItems="center" sx={(theme) => ({ width: desktop ? 272 : 135 })}>
            <FortressImage
              src={item.url}
              alt={item.alt}
              ratio={1}
              objectFit="cover"
              imageWidth={desktop ? 272 : 135}
              imageHeight={desktop ? 272 : 135}
            />
            <Typography
              level="body2"
              sx={(theme) => ({ mt: desktop ? theme.spacing(5) : theme.spacing(3), textAlign: 'center' })}
            >
              {item.alt}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export { ImageImplement };
