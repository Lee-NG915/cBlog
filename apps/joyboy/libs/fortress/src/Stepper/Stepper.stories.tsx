import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button } from '..';
import { Check } from '../Icons';
import { Stepper, StepperProps } from './index';
import { Step, StepIndicator } from '@mui/joy';

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/wz3fxSlmrXCX1R5ic71pa3/Fortress-2.0?node-id=11445-2424&m=dev',
    },
  },
} as Meta<StepperProps>;

export default meta;

type Story = StoryObj<StepperProps>;

export const Default: Story = {
  args: {
    orientation: 'horizontal',
    children: (
      <>
        <Step
          completed
          indicator={
            <StepIndicator>
              <Check />
            </StepIndicator>
          }
        >
          Shipping Information
        </Step>
        <Step completed indicator={<StepIndicator>2</StepIndicator>}>
          Payment Information
        </Step>
        <Step active indicator={<StepIndicator>3</StepIndicator>}>
          Shipping Method
        </Step>
        <Step active completed disabled indicator={<StepIndicator>4</StepIndicator>}>
          Disabled content
        </Step>
        <Step indicator={<StepIndicator>5</StepIndicator>}>Unselected content</Step>
        <Step
          indicator={
            <StepIndicator>
              <Check />
            </StepIndicator>
          }
        >
          Unselected content
        </Step>
      </>
    ),
  },
};

// 交互式步骤示例
export function InteractiveStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Select campaign settings', 'Create an ad group', 'Create an ad'];
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: { completed?: boolean } = {};

          if (index < activeStep) {
            stepProps.completed = true;
            labelProps.completed = true;
          }

          return (
            <Step active={index === activeStep} key={label} {...stepProps}>
              <StepIndicator variant={index < activeStep ? 'solid' : 'soft'}>
                {index < activeStep ? <Check /> : index + 1}
              </StepIndicator>
              {label}
            </Step>
          );
        })}
      </Stepper>

      {activeStep === steps.length ? (
        <Box sx={{ mt: 2 }}>
          All steps completed - you&apos;re finished
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          Step {activeStep + 1}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
            <Box />
            <Button onClick={handleNext}>{activeStep === steps.length - 1 ? 'Finish' : 'Next'}</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
