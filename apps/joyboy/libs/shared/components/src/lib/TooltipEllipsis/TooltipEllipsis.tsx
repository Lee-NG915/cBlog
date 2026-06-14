'use client';

import { Box, Tooltip } from '@castlery/fortress';
import { Info } from '@castlery/fortress/Icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface TooltipEllipsisProps {
  /**
   * @title Children
   * @type React.ReactNode
   * @description The content to be wrapped with tooltip
   */
  children: React.ReactNode;

  /**
   * @title Title
   * @type string
   * @description The tooltip content
   */
  title?: string;

  /**
   * @title Placement
   * @type 'top' | 'bottom' | 'right' | 'left' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'
   * @description Tooltip placement
   */
  placement?:
    | 'top'
    | 'bottom'
    | 'right'
    | 'left'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end'
    | 'right-start'
    | 'right-end';

  /**
   * @title Fit Placement
   * @type 'top' | 'bottom' | 'right' | 'left' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'
   * @description Fallback placement if primary placement doesn't fit
   */
  fitPlacement?:
    | 'top'
    | 'bottom'
    | 'right'
    | 'left'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end'
    | 'right-start'
    | 'right-end';

  /**
   * @title Hide Icon
   * @type boolean
   * @description Whether to hide the info icon
   */
  hideIcon?: boolean;
}

export const TooltipEllipsis = ({
  children,
  title,
  placement = 'top' as const,
  fitPlacement,
  hideIcon = false,
  ...props
}: TooltipEllipsisProps) => {
  const [showPopover, setShowPopover] = useState(false);
  const contentRef = useRef<HTMLElement>(null);

  const checkTextOverflow = useCallback(() => {
    if (contentRef.current) {
      const { scrollWidth, clientWidth } = contentRef.current;
      const isOverflow = scrollWidth > clientWidth;
      setShowPopover(isOverflow);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkTextOverflow();
    }, 0);

    return () => clearTimeout(timer);
  }, [checkTextOverflow]);

  const renderContent = () => React.cloneElement(children as React.ReactElement, { ref: contentRef });

  if (!showPopover) {
    return renderContent();
  }

  if (hideIcon) {
    return (
      <Tooltip
        title={title}
        placement={placement}
        arrow
        theme="dark"
        enterTouchDelay={0}
        leaveTouchDelay={500}
        {...props}
      >
        {renderContent()}
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {renderContent()}
      <Tooltip
        title={title}
        placement={placement}
        arrow
        theme="dark"
        enterTouchDelay={0}
        leaveTouchDelay={500}
        {...props}
      >
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            color: 'var(--fortress-palette-brand-mono-500)',
            '&:hover': {
              color: 'var(--fortress-palette-brand-mono-700)',
            },
          }}
        >
          <Info sx={{ fontSize: '1rem' }} />
        </Box>
      </Tooltip>
    </Box>
  );
};
