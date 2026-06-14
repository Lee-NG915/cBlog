import React from 'react';
import { Panel } from './panel';
import {
  useRefinementList,
  UseRefinementListProps,
  useRange,
  UseRangeProps,
  useNumericMenu,
  UseNumericMenuProps,
} from 'react-instantsearch';

export function RefinementPanel({
  header,
  children,
  ...props
}: { header?: React.ReactNode; children: React.ReactNode } & UseRefinementListProps) {
  const { canRefine } = useRefinementList(props);
  return (
    <Panel header={header} showIf={canRefine}>
      {children}
    </Panel>
  );
}

export function RangePanel({
  header,
  children,
  ...props
}: { header?: React.ReactNode; children: React.ReactNode } & UseRangeProps) {
  const { canRefine } = useRange(props);
  return (
    <Panel header={header} showIf={canRefine}>
      {children}
    </Panel>
  );
}

export function NumericMenuPanel({
  header,
  children,
  ...props
}: { header?: React.ReactNode; children: React.ReactNode } & UseNumericMenuProps) {
  const { canRefine } = useNumericMenu(props);
  return (
    <Panel header={header} showIf={canRefine}>
      {children}
    </Panel>
  );
}
