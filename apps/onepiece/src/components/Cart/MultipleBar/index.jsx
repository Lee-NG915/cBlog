import React from 'react';
import { Box, Typography, Stack } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { EVENT_CAMPAIGN_PROGRESS_BAR_IMPRESSION, EVENT_GWP_BANNER_CLICK } from 'utils/track/constants';
import GiftModal from '../GiftModal';
import Stepper from './Stepper';
import { Step, StepLabel } from './Step';
import { findActiveStep, COMPLETE_COPY_MAP } from '../utils/promotion';
import { CampaignTitle, FreeShippingTitle, GiftPromotionTitle, FreeGiftBanner } from './Slices';

const MultipleTierBar = ({ steps = [], value = 0, variation }, { frame }) => {
  const { mobile } = useBreakpoints();
  const dispatch = useDispatch();

  const activeStep = React.useMemo(() => findActiveStep(steps, value), [steps, value]);
  const activeStepData = steps[activeStep];
  const [triggerSymbol, setTriggerSymbol] = React.useState();

  const { isCompleted, completeCopy } = React.useMemo(() => {
    if (!steps?.length) {
      return { isCompleted: false, completeCopy: '' };
    }
    const last = steps[steps.length - 1] || null;
    return {
      isCompleted: value >= last.limit,
      completeCopy: last ? COMPLETE_COPY_MAP[last.type] : '',
    };
  }, [steps, value]);

  const needShowGiftBanner = React.useMemo(() => {
    if (!steps?.length) return false;
    return !!steps.find((step) => step.limit <= value && step.giftAvailable);
  }, [steps, value]);

  const openGiftModal = React.useCallback(() => {
    // @ts-ignore
    frame?.addModal(<GiftModal />);
    dispatch({
      type: EVENT_GWP_BANNER_CLICK,
      result: { position: variation },
    });
  }, [frame, variation, dispatch]);

  const createTitle = React.useCallback(() => {
    const { type } = activeStepData || {};
    if (type === 'store-wide-campaigns') {
      return <CampaignTitle {...activeStepData} total={value} variation={variation} />;
    }
    if (type === 'free-shipping') {
      return <FreeShippingTitle {...activeStepData} />;
    }
    if (type === 'gift-promotion') {
      return <GiftPromotionTitle {...activeStepData} total={value} handler={openGiftModal} />;
    }
  }, [activeStepData, value, openGiftModal, variation]);

  const calcProgress = React.useCallback(
    (step) => {
      if (value > step.start && value <= step.end) {
        const range = (value - step.start) / (step.end - step.start);
        return range > 0.99 && range < 1 ? 0.99 : Math.round(range * 100) / 100;
      }
      if (value > step.end) {
        return 1;
      }
      return 0;
    },
    [value]
  );
  const triggerEvent = React.useCallback(
    (activeStepData) => {
      dispatch({
        type: EVENT_CAMPAIGN_PROGRESS_BAR_IMPRESSION,
        result: {
          campaignName: activeStepData.campaignName,
          discount: activeStepData.label,
          position: variation,
        },
      });
      setTriggerSymbol(activeStepData.type + activeStepData.limit);
    },
    [variation]
  );

  if (activeStepData && activeStepData.type === 'store-wide-campaigns') {
    if (!triggerSymbol || triggerSymbol !== activeStepData.type + activeStepData.limit) {
      triggerEvent(activeStepData);
    }
  }

  return (
    <Box>
      <Typography level={mobile ? 'body2' : 'caption1'} sx={{ mb: 1 }}>
        {isCompleted ? completeCopy : createTitle()}
      </Typography>

      <Stepper>
        {Array.isArray(steps) &&
          steps.map((step, index) => (
            <Step key={`step_${step.limit}`} progress={calcProgress(step)}>
              <StepLabel
                sx={{
                  color: (theme) =>
                    isCompleted || index < activeStep
                      ? theme.palette.brand.charcoal[800]
                      : theme.palette.brand.charcoal[500],
                }}
              >
                {Array.isArray(step.label) ? step.label.map((item) => <Box key={item}>{item}</Box>) : <>{step.label}</>}
              </StepLabel>
            </Step>
          ))}
      </Stepper>
      {needShowGiftBanner && <FreeGiftBanner handler={openGiftModal} />}
    </Box>
  );
};
MultipleTierBar.propTypes = {
  steps: PropTypes.array,
  value: PropTypes.number,
  variation: PropTypes.string,
};
MultipleTierBar.contextTypes = {
  frame: PropTypes.object,
  router: PropTypes.object,
};
export default React.memo(MultipleTierBar);
