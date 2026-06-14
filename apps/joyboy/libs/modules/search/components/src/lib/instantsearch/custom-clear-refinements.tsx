import { Button } from '@castlery/fortress';
import { Replay } from '@castlery/fortress/Icons';
import { NextFortressLink } from '@castlery/shared-components';
import React from 'react';
import { useClearRefinements, UseClearRefinementsProps } from 'react-instantsearch';
import { FACET_ATTRIBUTE } from '../config';

export function CustomClearRefinements(props: UseClearRefinementsProps) {
  const { canRefine, refine } = useClearRefinements({
    // https://www.algolia.com/doc/api-reference/widgets/clear-refinements/react/#widget-param-excludedattributes
    excludedAttributes: [FACET_ATTRIBUTE.in_stock_regions],
    ...props,
  });

  if (!canRefine) return null;

  return (
    <NextFortressLink
      component={Button}
      variant="primary"
      onClick={refine}
      level="body2"
      sx={{
        textTransform: 'none',
        gap: 1,
      }}
    >
      <Replay />
      Reset
    </NextFortressLink>
  );
}
