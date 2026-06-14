'use client';
import { createDataTrackingData } from '@castlery/utils';
import { usePathname } from 'next/navigation';

interface UseTrackingTagsProps {
  moduleName: string;
  elementName: string;
  content?: Object;
}
export const useTrackingTags = ({ moduleName, elementName, content }: UseTrackingTagsProps) => {
  const pathname = usePathname();
  return createDataTrackingData({
    pathname,
    module: moduleName,
    elementName,
    content,
  });
};
