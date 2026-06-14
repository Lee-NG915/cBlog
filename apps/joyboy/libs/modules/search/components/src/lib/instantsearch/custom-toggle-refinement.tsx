import React from 'react';
import { useToggleRefinement, UseToggleRefinementProps } from 'react-instantsearch';
import { Switch, Typography } from '@castlery/fortress';
export function CustomToggleRefinement(props: UseToggleRefinementProps) {
  const { value, refine } = useToggleRefinement(props);

  return (
    <Switch
      checked={value.isRefined}
      onChange={(event) => {
        refine({ isRefined: event.target.checked });
      }}
      endDecorator={<Typography level="body2">{props.attribute}</Typography>}
    />
  );
}
