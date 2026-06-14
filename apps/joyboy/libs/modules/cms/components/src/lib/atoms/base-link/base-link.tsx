'use client';
import { BaseLinkStoryblok } from '@castlery/types';
import { NextFortressLink } from '@castlery/shared-components';
import { IconsMap } from '../../cms-icon/map';
import { FortressTypographyProps } from '@castlery/fortress/Typography/Typography';

interface BaseLinkProps {
  blok: BaseLinkStoryblok | undefined;
}

export function BaseLink({ blok, ...rests }: BaseLinkProps) {
  const { ctaText, link, textLevel, startDecorator, endDecorator } = blok || {};
  if (!blok) {
    return null;
  }
  const StartDecoratorIcon = IconsMap[startDecorator as keyof typeof IconsMap];
  const EndDecoratorIcon = IconsMap[endDecorator as keyof typeof IconsMap];

  return (
    <NextFortressLink
      href={link?.url}
      {...(link?.target && {
        target: link?.target,
      })}
      level={textLevel as FortressTypographyProps['level']}
      startDecorator={StartDecoratorIcon ? <StartDecoratorIcon /> : undefined}
      endDecorator={EndDecoratorIcon ? <EndDecoratorIcon /> : undefined}
      {...rests}
    >
      {ctaText}
    </NextFortressLink>
  );
}

export default BaseLink;
