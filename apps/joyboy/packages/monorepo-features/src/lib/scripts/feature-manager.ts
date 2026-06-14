/* eslint-disable @typescript-eslint/no-unused-vars */
import { FEATURES_CONFIG } from '../feaures';
import { FeatureName, Region, ApplicationChannel, ApplicationEnv } from '../config';
import { Adapters } from '../adapters';
import type { Feature } from '../types';

/**
 * FeatureManager class
 * @doc https://posthog.com/docs/libraries/js#feature-flags
 */
export class FeatureManager {
  private static instance: FeatureManager;
  featureName = FeatureName;

  features: Record<FeatureName, Feature> = Object.keys(FEATURES_CONFIG).reduce((acc, key) => {
    acc[key as FeatureName] = FEATURES_CONFIG[key as FeatureName];
    return acc;
  }, {} as Record<FeatureName, Feature>);

  private constructor() {
    // Private constructor to enforce singleton pattern
    this.features = this.getFeatureFlags();
  }

  private getFeatureFlags() {
    // TODO: Fetch feature flags from remote source if needed
    return this.features;
  }

  private getFeature(featureName: FeatureName) {
    // TODO: Fetch feature flag from remote source if needed
    return this.features[featureName];
  }

  /**
   * 校验包含优先级
   * @param feature Feature object
   * @returns
   */
  private featureEffectiveChecker(feature: Feature): boolean {
    if (!feature) return false;

    if (!feature.status) return false;
    if (
      !feature.enabledAppChannels ||
      !feature.enabledAppChannels.includes(Adapters.currentAppChannel as ApplicationChannel)
    )
      return false;
    if (!feature.enabledRegions || !feature.enabledRegions.includes(Adapters.currentRegion as Region)) return false;

    if (
      Array.isArray(feature.environment) &&
      !feature.environment.includes(Adapters.currentApplicationEnv as ApplicationEnv)
    ) {
      return false;
    }
    if (feature.effectiveDate || feature.expirationDate) {
      const now = Date.now();
      if (feature.effectiveDate && feature.expirationDate) {
        return now > feature.effectiveDate && now < feature.expirationDate;
      }
      if (feature.effectiveDate) return now >= feature.effectiveDate;
      if (feature.expirationDate) return now <= feature.expirationDate;
    }
    return true;
  }

  /**
   * @todo Reserved method: compatible with scenarios where features are obtained remotely.
   * @param callback Callback function to be called when features are available
   */
  public onFeatureFlags(callback: (features: Record<keyof typeof FeatureName, Feature>) => void) {
    if (typeof callback === 'function' && this.features) {
      if (this.getFeatureFlags()) {
        callback(this.features);
      }
    }
  }

  public reloadFeatureFlags() {
    this.features = this.getFeatureFlags();
  }

  public static getInstance(): FeatureManager {
    if (!FeatureManager.instance) {
      FeatureManager.instance = new FeatureManager();
    }
    return FeatureManager.instance;
  }

  public isFeatureEnabled(featureName: FeatureName): boolean {
    const feature = this.getFeature(featureName);
    if (!feature) return false;
    return this.featureEffectiveChecker(feature);
  }

  // for multiple variants
  public getFeatureFlag() {
    // todo:编写feature variants的分发逻辑，暂时不需要，预留API
  }

  public getFeatureFlagPayload(featureName: FeatureName) {
    const target = this.getFeature(featureName);
    const enabled = this.isFeatureEnabled(featureName);
    return enabled && target?.payload ? target?.payload : null;
  }

  public toggleFeature(featureName: FeatureName) {
    // ....... 扩展：如果支持自由集成feature，可以通过dash board启用/禁用feature
  }

  public addFeature(featureName: FeatureName, properities: object) {
    // ....... 扩展：如果支持自有集成feature，可以通过dashboard add feature
  }
}

export const featureManager = FeatureManager.getInstance();
