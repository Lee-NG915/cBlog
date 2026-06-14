import React, { useEffect, useState } from 'react';
// import NextImage from 'next/image';
import { BundleOption } from '@castlery/modules-product-domain';
import { useSearchParams } from 'next/navigation';
import { FortressImage } from '@castlery/shared-components';
// import { FortressImage } from '@castlery/shared-components';

interface BaseImageProps {
  mainSrc: string;
  mainAlt: string;
  bundleOptions?: BundleOption[];
}

const BaseImage = ({ mainSrc, mainAlt, bundleOptions }: BaseImageProps) => {
  const [overLayList, setOverLayList] = useState<string[]>([]);
  const searchParams = useSearchParams();
  useEffect(() => {
    const tempList: string[] = [];
    bundleOptions?.forEach((item) => {
      if (searchParams.get(item.name) !== null) {
        item.variants.forEach((variant) => {
          if (`${variant.id}` === searchParams.get(item.name)) {
            if (variant?.overlay?.links.large_overlay) {
              tempList.push(variant.overlay.links.large_overlay);
            }
          }
        });
      }
    });
    setOverLayList(tempList);
  }, [searchParams, bundleOptions]);
  return (
    <>
      <FortressImage
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        src={mainSrc}
        alt={mainAlt}
        lazy={false}
      />
      {/* <NextImage src={mainSrc} alt={mainAlt} layout="fill" objectFit="contain" /> */}
      {overLayList.map((item, index) => {
        // return <NextImage key={index} src={item.split('-test').join('')} alt="" fill objectFit="contain" />;
        return (
          <FortressImage
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: index + 10,
            }}
            key={index}
            src={item.split('-test').join('')}
            alt=""
            lazy={false}
          />
        );
      })}
    </>
  );
};

export default BaseImage;
