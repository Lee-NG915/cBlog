// eslint-disable-next-line @nx/enforce-module-boundaries
// import {
//   PhExperimentsNames,
//   PhExperimentsFeatureKeys,
//   phCaptureExperiment,
//   phCaptureExperimentVariant,
//   enablePosthogManualCapture,
// } from '@castlery/modules-posthog-services';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { dt, EventsNames } from '@castlery/data-tracking-events';

export enum ExperimentIDS {
  AWS = 'AWS',
  DY = 'DY',
}
/**
 * triggered when user enter a experiment page
 */
export const trackPLAExperiment = createAsyncThunk(
  'tracking/trackExperiment',
  async ({ variantion }: { variantion: string }, { rejectWithValue }) => {
    if (!variantion) {
      return Promise.resolve();
    }
    try {
      dt.track(EventsNames.EVENT_EXPERIENCE_IMPRESSION)({
        tdyId: ExperimentIDS.AWS,
        expId: 'PLALAYOUT',
        variantId: variantion,
      });
      // if (enablePosthogManualCapture) {
      //   phCaptureExperiment(
      //     PhExperimentsNames.PLA_LAYOUT_EXPERIMENT,
      //     PhExperimentsFeatureKeys.PLA_LAYOUT_EXPERIMENT_FEATURE
      //   );
      //   const variantStr = variantion === 'pla-layout-z' ? 'control' : variantion;
      //   phCaptureExperimentVariant(PhExperimentsFeatureKeys.PLA_LAYOUT_EXPERIMENT_FEATURE, variantStr);
      // }

      return Promise.resolve();
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);
