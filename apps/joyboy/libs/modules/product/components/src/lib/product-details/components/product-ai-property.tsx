'use client';

import { EcEnv } from '@castlery/config';
import { Box, Link, Stack, Typography } from '@castlery/fortress';
import { ProductAssemblyAiData } from '@castlery/modules-product-domain';
import { FortressVideo } from '@castlery/shared-components';

interface ProductAIPropertyProps {
  aiData?: ProductAssemblyAiData;
}

const ASSEMBLY_COPY =
  'As part of our White Glove Service, this piece will be fully assembled and placed in your room of choice. All packaging will be removed.';

export const ProductAIProperty = ({ aiData }: ProductAIPropertyProps) => {
  return (
    <Stack gap={4}>
      {EcEnv.NEXT_PUBLIC_COUNTRY === 'US' && <Typography level="body2">{ASSEMBLY_COPY}</Typography>}
      {aiData?.aiVideos?.length ? (
        <Stack gap={3}>
          {aiData.aiVideos.map((item) => (
            <Box key={item.id}>
              <FortressVideo
                id={item.id.toString()}
                key={item.id}
                containerConfig={{
                  aspectRatio: 1,
                  objectFit: 'cover',
                }}
                autoPlay={false}
                src={item.file_link}
              />
            </Box>
          ))}
        </Stack>
      ) : null}
      {aiData?.aiDocs?.length ? (
        <Stack gap={2}>
          {aiData.aiDocs.map((item) => (
            <Box key={item.id}>
              <Typography
                level="body2"
                sx={{
                  display: 'inline-flex',
                }}
              >
                How to build your
              </Typography>
              <Link variant="primary" level="body2" href={item.file_link} target="_blank" sx={{ mx: 1 }}>
                {item.display_filename}
              </Link>
            </Box>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
};
