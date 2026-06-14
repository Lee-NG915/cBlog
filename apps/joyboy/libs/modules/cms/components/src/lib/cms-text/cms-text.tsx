'use client';
import { Typography, useBreakpoints } from '@castlery/fortress';
import { TextBlokV2Storyblok } from '@castlery/types';
import { useMemo } from 'react';

export const fontFamilyMaps = {
  MinervaModern: `var(--fortress-fontFamily-display)`,
  Poppins: `var(--fortress-fontFamily-body)`,
};

export function CmsText({ blok, sx }: { blok: TextBlokV2Storyblok; sx?: Record<string, string> }) {
  const { desktop, tablet } = useBreakpoints();

  const {
    text,
    text_color,
    text_level,
    font_weight,
    font_family,
    mobile_font_size,
    tablet_font_size,
    desktop_font_size,
    max_text_length,
  } = blok;
  let truncatedText = text;
  if (max_text_length) {
    truncatedText = text.length > Number(max_text_length) ? text.slice(0, Number(max_text_length)) : text;
  }
  const abledFontSize = useMemo(() => {
    const mobileFontSize = Number(mobile_font_size) > 0 ? Number(mobile_font_size) : '';
    const tabletFontSize = Number(tablet_font_size) > 0 ? Number(tablet_font_size) : '';
    const desktopFontSize = Number(desktop_font_size) > 0 ? Number(desktop_font_size) : '';
    return desktop ? desktopFontSize : tablet ? tabletFontSize : mobileFontSize;
  }, [desktop, tablet, mobile_font_size, tablet_font_size, desktop_font_size]);

  return (
    <Typography
      level={text_level || 'body2'}
      sx={{
        color: text_color?.value,
        fontWeight: font_weight,
        ...(font_family && fontFamilyMaps[font_family] && { fontFamily: fontFamilyMaps[font_family] }),
        ...(abledFontSize && { fontSize: `${abledFontSize}px !important` }),
        ...sx,
      }}
    >
      {truncatedText}
    </Typography>
  );
}

export default CmsText;
