'use client';
import { Stack, Tag } from '@castlery/fortress';

interface ProductTagsProps {
  tags?: string[];
}
export function ProductTags({ tags }: ProductTagsProps) {
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

export default ProductTags;
