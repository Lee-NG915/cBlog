'use client';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Skeleton, Stepper, Step, StepIndicator, Typography } from '@castlery/fortress';
import { selectIsZeroOrder } from '@castlery/modules-checkout-domain';
import { CustomLink, useHasOrderCreated } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useWebCheckoutSteps } from '../hooks/use-web-checkout-steps';

const STEP_BAR_SKELETON_COUNT = 3;

const stepBarSx = {
  width: { xs: '100%', md: 480, lg: 600 },
  m: '0 auto',
  '& a': {
    textDecoration: 'none',
    color: 'inherit',
  },
} as const;

const stepBarSkeletonSx = {
  ...stepBarSx,
  '& .MuiStep-root::after': {
    background:
      'linear-gradient(90deg, rgba(249, 247, 239, 0.45) 0%, rgba(234, 230, 215, 0.95) 50%, rgba(249, 247, 239, 0.45) 100%)',
    backgroundSize: '200% 100%',
    animation: 'checkout-step-bar-skeleton-wave 1.6s ease-in-out 0.5s infinite',
  },
  '@keyframes checkout-step-bar-skeleton-wave': {
    '0%': {
      backgroundPosition: '200% 0',
    },
    '100%': {
      backgroundPosition: '-200% 0',
    },
  },
} as const;

export interface StepItem {
  label: string;
  level: number;
  href: string;
  linkKey: string;
  disabled: boolean;
}

export interface WebCheckoutStepBarProps {
  /** When true (e.g. on payment page with orderId), address and shipping method steps are not clickable */
  isOrderCreated?: boolean;
  /** When true, renders a skeleton state instead of the checkout steps */
  loading?: boolean;
}

export function WebCheckoutStepBar({ loading = false, ...props }: WebCheckoutStepBarProps = {}) {
  if (loading) {
    return <WebCheckoutStepBarSkeleton />;
  }

  return <WebCheckoutStepBarContent {...props} />;
}

function WebCheckoutStepBarSkeleton() {
  return (
    <Stepper sx={stepBarSkeletonSx}>
      {Array.from({ length: STEP_BAR_SKELETON_COUNT }).map((_, idx) => (
        <Step
          key={idx}
          orientation="vertical"
          indicator={
            <Skeleton variant="circular" animation="wave">
              <StepIndicator>{idx + 1}</StepIndicator>
            </Skeleton>
          }
        >
          <Typography sx={{ px: 1 }}>
            <Skeleton variant="text" animation="wave" level="h5" sx={{ width: idx === 1 ? 128 : 96 }} />
          </Typography>
        </Step>
      ))}
    </Stepper>
  );
}

function WebCheckoutStepBarContent({
  isOrderCreated: isOrderCreatedProp,
}: Pick<WebCheckoutStepBarProps, 'isOrderCreated'>) {
  const pathname = usePathname();
  const baseSteps = useWebCheckoutSteps();
  const isZeroOrder = useAppSelector(selectIsZeroOrder);
  const hasOrderCreatedFromPersistence = useHasOrderCreated();
  const isOrderCreated = isOrderCreatedProp ?? hasOrderCreatedFromPersistence;

  const { stepList, activeStep } = useMemo(() => {
    const steps: StepItem[] = baseSteps.map((step) => ({ ...step, disabled: false }));
    const activeStep = Math.max(
      steps.findIndex((step) => step.href === pathname),
      0
    );
    const stepList = steps.map((step) => ({
      ...step,
      disabled: isOrderCreated && (step.level === 0 || step.level === 1),
    }));
    return { stepList: isZeroOrder ? stepList.slice(0, -1) : stepList, activeStep };
  }, [baseSteps, pathname, isZeroOrder, isOrderCreated]);

  return (
    <Stepper sx={stepBarSx}>
      {stepList.map((step, idx) => {
        const canNavigateToStep = !step.disabled && idx <= activeStep;
        const indicator = <StepIndicator>{idx + 1}</StepIndicator>;

        return (
          <Step
            key={step.href}
            active={idx === activeStep}
            orientation="vertical"
            completed={idx < activeStep}
            disabled={step.disabled}
            indicator={canNavigateToStep ? <CustomLink linkKey={step.linkKey}>{indicator}</CustomLink> : indicator}
          >
            <Typography sx={{ px: 1 }}>
              {canNavigateToStep ? <CustomLink linkKey={step.linkKey}>{step.label}</CustomLink> : step.label}
            </Typography>
          </Step>
        );
      })}
    </Stepper>
  );
}
