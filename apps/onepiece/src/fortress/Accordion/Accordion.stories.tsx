import type { Meta, StoryObj } from '@storybook/react';

import { AccordionContent, AccordionHeader, AccordionRoot } from './index';
const meta = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'fortress / Accordion',
  component: AccordionContent,
} as Meta<typeof AccordionContent>;

import {
  Box,
  Link,
  Stack,
  Typography,
  listItemButtonClasses,
  listItemClasses,
  listSubheaderClasses,
  selectClasses,
  sheetClasses,
  typographyClasses,
} from '@mui/joy';
import { AccordionItem } from '@radix-ui/react-accordion';
import { listDividerClasses } from '@mui/joy';
import { accordionHeaderClasses } from './Accordion';
import { useState } from 'react';

export default meta;
type Story = StoryObj<typeof AccordionContent>;

let items = [
  {
    value: 'item-1',
    label: 'How do I know if I need to buy a license?',
    children: (
      <Typography>
        If you are in doubt, check the license file of the npm package you're installing. For instance{' '}
        <Link href="https://unpkg.com/@mui/x-data-grid/LICENSE" target="_blank" rel="noreferrer noopener">
          @mui/x-data-grid
        </Link>
        is an MIT License (free) while
        <Link href="https://unpkg.com/@mui/x-data-grid-pro/LICENSE" target="_blank" rel="noreferrer noopener">
          @mui/x-data-grid-pro
        </Link>
        is a Commercial License.
      </Typography>
    ),
    isFirst: true,
  },
  {
    value: 'item-2',
    label: 'How many developer licenses do I need?',
    children: (
      <>
        The number of licenses purchased must correspond to the number of concurrent developers contributing changes to
        the front-end code of projects that use MUI X Pro or Premium.
        <br />
        <br />
        <b>Example 1.</b> Company 'A' is developing an application named 'AppA'. The app needs to render 10k rows of
        data in a table and allow users to group, filter, and sort. The dev team adds MUI X Pro to the project to
        satisfy this requirement. 5 front-end and 10 back-end developers are working on 'AppA'. Only 1 developer is
        tasked with configuring and modifying the data grid. Only the front-end developers are contributing code to the
        front-end so Company 'A' purchases 5 licenses.
        <br />
        <br />
        <b>Example 2.</b> A UI development team at Company 'A' creates its own UI library for internal development and
        includes MUI X Pro as a component. The team working on 'AppA' uses the new library and so does the team working
        on 'AppB'. 'AppA' has 5 front-end developers and 'AppB' has 3. There are 2 front-end developers on the UI
        development team. Company 'B' purchases 10 licenses.
      </>
    ),
  },
  {
    value: 'item-3',
    label: 'How do I know if I need to buy a license?',
    children: (
      <>
        <strong>No.</strong> We trust that you will not go over the number of licensed developers. Developers moving on
        and off projects is expected occasionally, and the license can be transferred between developers at that time.
      </>
    ),
    isLast: true,
  },
];
export const Variants = () => {
  return (
    <Stack gap={3}>
      <>
        <Typography level="h3">plain</Typography>
        <AccordionRoot>
          {items.map(({ value, children, label, isFirst, isLast }) => {
            return (
              <AccordionItem value={value}>
                <AccordionHeader isFirst={isFirst} isLast={isLast}>
                  {label}
                </AccordionHeader>
                <AccordionContent>{children}</AccordionContent>
              </AccordionItem>
            );
          })}
        </AccordionRoot>
      </>
      <>
        <Typography level="h3">outlined</Typography>
        <AccordionRoot defaultValue={[items[0].value]} variant="outlined">
          {items.map(({ value, children, label, isFirst, isLast }) => {
            return (
              <AccordionItem value={value}>
                <AccordionHeader isFirst={isFirst} isLast={isLast}>
                  {label}
                </AccordionHeader>
                <AccordionContent>{children}</AccordionContent>
              </AccordionItem>
            );
          })}
        </AccordionRoot>
      </>
    </Stack>
  );
};
export const Types = () => {
  const [preVal, setPreVal] = useState<[string]>([items[0].value]);
  return (
    <Stack gap={3}>
      <>
        <Typography level="h3">single</Typography>
        <AccordionRoot defaultValue={[items[0].value]} variant="outlined" type="single">
          {items.map(({ value, children, label, isFirst, isLast }) => {
            return (
              <AccordionItem value={value}>
                <AccordionHeader isFirst={isFirst} isLast={isLast}>
                  {label}
                </AccordionHeader>
                <AccordionContent>{children}</AccordionContent>
              </AccordionItem>
            );
          })}
        </AccordionRoot>
      </>
      <>
        <Typography level="h3">multiple</Typography>
        <AccordionRoot
          defaultValue={[items[0].value]}
          variant="outlined"
          type="multiple"
          onValueChange={(value) => {
            if (value.length > preVal.length) {
              let res = value[value.length - 1];
              console.log('🚀 ~ file: Accordion.stories.tsx:156 ~ Types ~ res:', res);
            }
            setPreVal(value);
          }}
        >
          {items.map(({ value, children, label, isFirst, isLast }) => {
            return (
              <AccordionItem value={value}>
                <AccordionHeader isFirst={isFirst} isLast={isLast}>
                  {label}
                </AccordionHeader>
                <AccordionContent>{children}</AccordionContent>
              </AccordionItem>
            );
          })}
        </AccordionRoot>
      </>
    </Stack>
  );
};
