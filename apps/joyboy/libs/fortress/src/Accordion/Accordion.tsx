import { default as JoyAccordion } from '@mui/joy/Accordion';
import { AccordionProps as JoyAccordionProps } from '@mui/joy/Accordion';
import React from 'react';
export * from '@mui/joy/Accordion';

// export { default as AccordionContent } from '@mui/joy/AccordionContent';

export { default as AccordionDetails } from '@mui/joy/AccordionDetails';
export * from '@mui/joy/AccordionDetails';
export { default as AccordionGroup } from '@mui/joy/AccordionGroup';
export * from '@mui/joy/AccordionGroup';
export { default as AccordionSummary } from '@mui/joy/AccordionSummary';
export * from '@mui/joy/AccordionSummary';
// 扩展 AccordionProps 接口
export interface AccordionProps extends JoyAccordionProps {
  /**
   * 是否显示分割线
   * @default false
   */
  divider?: boolean;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>((props, ref) => {
  const { divider, sx, ...other } = props;

  return (
    <JoyAccordion
      ref={ref}
      sx={{
        ...sx,
        ...(divider && {
          '&:not(:last-child)': {
            borderBottom: `1px solid var(--fortress-palette-brand-mono-300)`,
          },
        }),
      }}
      {...other}
    />
  );
});
Accordion.displayName = 'Accordion';
// 为了在开发工具中显示正确的组件名称
