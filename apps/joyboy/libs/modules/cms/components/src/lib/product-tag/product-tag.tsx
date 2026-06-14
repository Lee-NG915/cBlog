'use client';
import { Stack, Tag } from '@castlery/fortress';

interface ProductTagProps {
  tags?: string[];
}
export function ProductTag({ tags }: ProductTagProps) {
  return (
    <Stack direction={'row'} spacing={1}>
      {tags?.map((tag, index) => (
        <Tag
          variant="solid"
          key={index}
          sx={{
            borderRadius: 4,
          }}
        >
          {tag}
        </Tag>
      ))}
    </Stack>
  );
}

export default ProductTag;
