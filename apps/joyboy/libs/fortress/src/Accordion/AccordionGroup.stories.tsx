import { AccordionGroup, Accordion, AccordionDetails, AccordionSummary } from '.';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import { Info } from '../Icons';
import { Box } from '..';
const meta: Meta<typeof AccordionGroup> = {
  title: 'Components/Accordion',
  component: AccordionGroup,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/wz3fxSlmrXCX1R5ic71pa3/Fortress-2.0?node-id=2-74&m=dev',
    },
  },
};

export default meta;

type Story = StoryObj<typeof AccordionGroup> & {};

export const Primary: Story = {
  args: {
    variant: 'plain',
    sx: {
      maxWidth: 400,
    },
  },
  render: (args: any) => {
    return (
      <AccordionGroup {...args} variant="plain">
        <Accordion onChange={() => {}}>
          <AccordionSummary>First accordion</AccordionSummary>
          <AccordionDetails>content1</AccordionDetails>
        </Accordion>
        <Accordion onChange={() => {}}>
          <AccordionSummary>Second accordion</AccordionSummary>
          <AccordionDetails>content2</AccordionDetails>
        </Accordion>
        <Accordion onChange={() => {}}>
          <AccordionSummary>Third accordion</AccordionSummary>
          <AccordionDetails>content3</AccordionDetails>
        </Accordion>
      </AccordionGroup>
    );
  },
};
export const WithDivider: Story = {
  args: {
    sx: {
      maxWidth: 400,
    },
  },
  render: (args: any) => {
    return (
      <AccordionGroup {...args}>
        <Accordion onChange={() => {}} divider>
          <AccordionSummary>First accordion</AccordionSummary>
          <AccordionDetails>content1</AccordionDetails>
        </Accordion>
        <Accordion onChange={() => {}} divider>
          <AccordionSummary>Second accordion</AccordionSummary>
          <AccordionDetails>content2</AccordionDetails>
        </Accordion>
        <Accordion onChange={() => {}} divider>
          <AccordionSummary>Third accordion</AccordionSummary>
          <AccordionDetails>content3</AccordionDetails>
        </Accordion>
      </AccordionGroup>
    );
  },
};

export const AccordionWithIcon: Story = {
  render: (args: any) => {
    return (
      <>
        <AccordionGroup sx={{ maxWidth: 500, marginBottom: 3 }}>
          <Accordion>
            <AccordionSummary>
              <Box display="flex" alignItems="center" gap={1}>
                <Info />
                First accordion
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              Lorem ipsum dolor sit amet. Vel velit blanditiis rem vero expedita qui nemo ipsa cum eaque necessitatibus
              et dolorem rerum. Ex quisquam autem quo dolorem consectetur aut quae itaque et voluptas minima. Lorem
              ipsum dolor sit amet. Vel velit blanditiis rem vero expedita qui nemo ipsa cum eaque necessitatibus et
              dolorem rerum. Ex quisquam autem quo dolorem consectetur aut quae itaque et voluptas minima.
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary>
              <Box display="flex" alignItems="center" gap={1}>
                <Info />
                Second accordion
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              Lorem ipsum dolor sit amet. Vel velit blanditiis rem vero expedita qui nemo ipsa cum eaque necessitatibus
              et dolorem rerum. Ex quisquam autem quo dolorem consectetur aut quae itaque et voluptas minima. Lorem
              ipsum dolor sit amet. Vel velit blanditiis rem vero expedita qui nemo ipsa cum eaque necessitatibus et
              dolorem rerum. Ex quisquam autem quo dolorem consectetur aut quae itaque et voluptas minima.
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary>
              <Box display="flex" alignItems="center" gap={1}>
                <Info />
                Third accordion
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              Lorem ipsum dolor sit amet. Vel velit blanditiis rem vero expedita qui nemo ipsa cum eaque necessitatibus
              et dolorem rerum. Ex quisquam autem quo dolorem consectetur aut quae itaque et voluptas minima. Lorem
              ipsum dolor sit amet. Vel velit blanditiis rem vero expedita qui nemo ipsa cum eaque necessitatibus et
              dolorem rerum. Ex quisquam autem quo dolorem consectetur aut quae itaque et voluptas minima.
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      </>
    );
  },
};
