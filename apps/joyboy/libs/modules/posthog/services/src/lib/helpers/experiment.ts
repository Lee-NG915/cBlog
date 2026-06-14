import { phCapture } from './capture';
import { EcEnv } from '@castlery/config';

const region = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();

export const PhExperimentsNames = {
  PLA_LAYOUT_EXPERIMENT: `${region}_pla_layout_experiment`,
} as const;

export const PhExperimentsFeatureKeys = {
  PLA_LAYOUT_EXPERIMENT_FEATURE: `${region}-pla-layout-experiment-feature`,
};

export function phCaptureExperiment(experimentName: string, expFeatureKey: string) {
  phCapture(experimentName, {
    '$feature/experiment-feature-flag-key': expFeatureKey,
  });
}

export function phCaptureExperimentVariant(expFeatureKey: string, variant: string) {
  phCapture('$feature_flag_called', {
    $feature_flag_response: variant,
    $feature_flag: expFeatureKey,
  });
}
