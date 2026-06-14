'use client';

import React from 'react';
import { FortressImage } from '../fortress-image/fortress-image';
import Slick from 'react-slick';
import { Container, Link } from '@castlery/fortress';

interface BannerProps {
  mediaQuery: {
    breakpoint: 'xs' | 'md' | 'lg';
    srcset: string;
    src?: string;
    loader: {
      ratio: number;
    };
  };
  children?: React.ReactNode;
  title: string;
  lazy?: boolean;
  type?: string;
  backgroundColor?: string;
  link?: string;
}

const Banner = ({
  mediaQuery,
  title,
  lazy = true,
  type = 'image',
  backgroundColor = 'transparent',
  link,
  children,
  ...otherProps
}: BannerProps) => {
  let images = [];

  if (mediaQuery.src || mediaQuery.srcset) {
    const sources = mediaQuery.src || mediaQuery.srcset;
    const isSrcArray = Array.isArray(sources) ? sources : [sources];

    images = isSrcArray.map((src) => {
      const resolvedSrc = /^https?:\/\//.test(src) ? src : `https://res.cloudinary.com/castlery/image/upload${src}`;
      return (
        <FortressImage
          key={src}
          src={mediaQuery.src ? resolvedSrc : undefined}
          srcset={mediaQuery.srcset ? resolvedSrc : undefined}
          alt={title}
          loader={{
            widths: [640, 960, 1280, 1440, 1920],
            ...mediaQuery.loader,
          }}
          type={type}
          bgColor={backgroundColor}
          ratio={mediaQuery.loader.ratio}
          {...otherProps}
        />
      );
    });
  } else {
    images = [
      <FortressImage
        key="no-image"
        loader={{
          widths: [640, 960, 1280, 1440, 1920],
          ...mediaQuery.loader,
        }}
        ratio={calcRatio()}
        bgColor={backgroundColor}
      />,
    ];
  }
  const imageContent =
    images.length > 1 ? (
      <Slick infinite draggable={false} speed={300} dots arrows={false} className={`${style.banner}__slick`}>
        {images}
      </Slick>
    ) : (
      images[0]
    );
  const linkedImage = link ? <Link href={link}>{imageContent}</Link> : imageContent;
  return (
    <Container
      disableGutters
      sx={{
        position: 'relative',
      }}
    >
      {linkedImage}
      {children}
    </Container>
  );
};

export { Banner };
