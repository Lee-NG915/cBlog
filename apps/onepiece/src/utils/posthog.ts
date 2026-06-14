import { get as getCookie } from 'helpers/Cookie';
import { enabledPostHog } from 'config';

const region = __COUNTRY__.toLowerCase();

export const enablePosthog = enabledPostHog;

interface Window {
  posthog?: {
    capture?: (event: string) => void;
  };
}

export function phAvailable(): boolean {
  return enablePosthog && typeof window !== 'undefined' && 'posthog' in window && window.posthog !== undefined;
}
export function phCaptureAvailable(): boolean {
  return enablePosthog && phAvailable() && typeof (window as Window).posthog?.capture === 'function';
}

export function phCapture(event: string, properities: any) {
  if (phCaptureAvailable()) {
    // @ts-ignore
    window.posthog.capture(event, properities);
  }
}

export function phIdentify(hashedEmail: string) {
  if (phCaptureAvailable()) {
    // @ts-ignore
    phCapture('custom_identify', {
      customer_email: hashedEmail,
      customer_region: __COUNTRY__,
    });
  }
}
export function phPageView(currentUrl: string) {
  if (phCaptureAvailable()) {
    phCapture('$pageview', { $current_url: currentUrl });
  }
}

export const PhExperimentsNames = {
  PLA_LAYOUT_EXPERIMENT: `${region}_pla_layout_experiment`,
} as const;

export const PhExperimentsFeatureKeys = {
  PLA_LAYOUT_EXPERIMENT_FEATURE: `${region}-pla-layout-experiment-feature`,
};
export function phPLAExperiment() {
  if (!enablePosthog) {
    return;
  }
  const variantKey: string = getCookie('X-Exp-PlaLayout');
  if (variantKey) {
    phCapture(PhExperimentsNames.PLA_LAYOUT_EXPERIMENT, {
      '$feature/experiment-feature-flag-key': 'pla-layout-variant',
    });
  }
}

export function phPLAExperimentVariant() {
  if (!enablePosthog) {
    return;
  }
  const variantKey: string = getCookie('X-Exp-PlaLayout');
  if (variantKey) {
    const variantStr = variantKey === 'z' ? 'control' : `pla-layout-${variantKey}`;
    console.log('PLA expeiment group:', variantStr);
    phCapture('$feature_flag_called', {
      $feature_flag_response: variantStr,
      $feature_flag: PhExperimentsFeatureKeys.PLA_LAYOUT_EXPERIMENT_FEATURE,
    });
  }
}
