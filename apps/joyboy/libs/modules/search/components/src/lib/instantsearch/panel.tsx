import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionGroup,
  SxProps,
  Typography,
  Divider,
  TypographyProps,
} from '@castlery/fortress';
import { EcEnv } from '@castlery/config';

export function PanelGroup({ children, sx }: { children: React.ReactNode; sx?: SxProps }) {
  return <AccordionGroup sx={sx}>{children}</AccordionGroup>;
}

export interface PanelProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  expanded?: boolean;
  showIf?: boolean;
  divider?: boolean;
  level?: TypographyProps['level'];
  sx?: SxProps;
}

export function Panel({
  divider = true,
  children,
  header,
  expanded = true,
  showIf = true,
  level = 'subh2',
  sx,
}: PanelProps) {
  const formatFurnitureSets = (panel: string) => {
    if (panel.includes('Furniture-sets') && EcEnv.NEXT_PUBLIC_COUNTRY === 'UK') {
      return 'Furniture Sets';
    }
    return panel;
  };
  return (
    <>
      <Accordion
        defaultExpanded={expanded}
        sx={{
          display: showIf ? 'block' : 'none',
          ...sx,
        }}
        divider={divider}
      >
        {header && (
          <AccordionSummary>
            <Typography level={level}>{typeof header === 'string' ? formatFurnitureSets(header) : header}</Typography>
          </AccordionSummary>
        )}
        <AccordionDetails>{children}</AccordionDetails>
      </Accordion>
    </>
  );
}
