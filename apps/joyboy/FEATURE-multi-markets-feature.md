# Multi-Market Feature Management

## Overview

This document outlines the approach for managing and implementing market-specific features in the Castlery application. The system is designed to handle different business requirements across multiple markets (AU, CA, SG, UK, US) while maintaining a clean and maintainable codebase.

## Domain-Driven Design Approach

The feature management system follows Domain-Driven Design (DDD) principles:

1. **Module Isolation**: Each module in the `modules` directory has its own feature service
2. **Domain Boundaries**: Features are scoped to their respective domains
3. **Encapsulation**: Module internals are not exposed to other modules
4. **Clear Interfaces**: Well-defined interfaces for feature access

### Module Structure Example

```
modules/
├── user/
│   ├── services/
│   │   └── feature.helper.ts    # User module feature service
│   └── domain/
│       └── features/            # User domain features
├── order/
│   ├── services/
│   │   └── feature.helper.ts    # Order module feature service
│   └── domain/
│       └── features/            # Order domain features
└── product/
    ├── services/
    │   └── feature.helper.ts    # Product module feature service
    └── domain/
        └── features/            # Product domain features
```

## Feature Types

The feature management system handles two distinct types of features:

### 1. Market-Specific Business Features

These features represent business requirements that vary across different markets, such as:

- Address format and validation rules
- Phone number formats
- Market-specific form fields
- Localization requirements
- Market-specific business rules

### 2. Non-Business Features

These features are not tied to specific markets but are used for:

- A/B testing
- Feature toggles
- Third-party system integrations
- Experimental features
- System-wide configurations

## Architecture

### 1. Module-Specific Feature Services

Each module implements its own feature service to maintain domain boundaries:

```typescript
// modules/user/services/feature.helper.ts
export const userFeatureService = {
  ...exportAllClassProperties(domainFeature),
  // User-specific features
  isGoogleSignInEnabled: () => featureManager.isEnabled('google-sign-in'),
  isFacebookSignInEnabled: () => featureManager.isEnabled('facebook-sign-in'),
  isAppleSignInEnabled: () => featureManager.isEnabled('apple-sign-in'),
};

// modules/order/services/feature.helper.ts
export const orderFeatureService = {
  ...exportAllClassProperties(domainFeature),
  // Order-specific features
  isAfterPayEnabled: () => featureManager.isEnabled('afterPay'),
  isAffirmEnabled: () => featureManager.isEnabled('affirm'),
  isZipPayEnabled: () => featureManager.isEnabled('zip-pay'),
};
```

### 2. Market Feature Classes

Each market has its own feature class that implements the module-specific feature interface:

```typescript
// modules/user/domain/features/au.feature.ts
export class AUUserFeatures implements UserDomainFeature {
  // User domain specific features
}

// modules/order/domain/features/au.feature.ts
export class AUOrderFeatures implements OrderDomainFeature {
  // Order domain specific features
}
```

### 3. Feature Service Implementation

Each module's feature service is implemented in its respective `services` directory and serves as the main entry point for accessing both types of features within that module's domain.

```typescript
// modules/user/services/feature.helper.ts
export const getMarketFeatures = (market: string) => {
  switch (market) {
    case 'AU':
      return new AUUserFeatures();
    case 'CA':
      return new CAUserFeatures();
    // ... other markets
  }
};
```

## Usage

### 1. Accessing Module Features

To access features within a module:

```typescript
// In user module
import { userFeatureService } from '@castlery/modules-user-services';

// Use user domain features
const userFeature = userFeatureService.someUserFeature();

// In order module
import { orderFeatureService } from '@castlery/modules-order-services';

// Use order domain features
const orderFeature = orderFeatureService.someOrderFeature();
```

### 2. Adding New Features

#### Market-Specific Business Features

1. Define the feature in the module's domain feature interface
2. Implement the feature in each market's feature class for that module
3. Provide market-specific implementations where needed

#### Non-Business Features

1. Define the feature in the feature management system
2. Access the feature through the module's feature service
3. Implement feature-specific logic in the appropriate components

### 3. Cross-Module Communication

When features need to interact across modules, follow these principles:

1. **Primary Approach**: Avoid cross-module dependencies by keeping features within their domain boundaries
2. **Secondary Approach**: If cross-module communication is absolutely necessary, use domain events or shared domain services

### 4. Best Practices

1. **Module Isolation**:
   - Keep features scoped to their respective modules
   - Avoid cross-module feature dependencies
2. **Feature Isolation**:
   - Keep market-specific logic isolated in the respective market feature classes
   - Separate business features from non-business features
3. **Interface Consistency**: Ensure all market feature classes implement the same interface
4. **Default Behavior**: Provide sensible default implementations where possible
5. **Error Handling**: Include proper error handling for unsupported markets
6. **Type Safety**: Use TypeScript interfaces to ensure type safety across market implementations
7. **Feature Flag Management**:
   - Always access feature flags through the module's feature service
   - Avoid direct dependencies on feature flag implementation
   - Prepare for future migration to a dedicated feature platform
8. **Feature Organization**:
   - Clearly distinguish between market-specific and non-market-specific features
   - Document the purpose and scope of each feature
   - Maintain separate documentation for business and non-business features
9. **Domain Boundaries**:
   - Respect module boundaries
   - Use domain events for cross-module communication
   - Keep feature implementations within their respective domains

## Example Implementation

```typescript
// Define the module's feature interface
interface UserDomainFeature {
  // Market-specific business features
  someMarketSpecificFeature(): void;

  // Non-business features (A/B tests, third-party integrations, etc.)
  anotherFeature(): string;
}

// Implement for a specific market in the user module
class AUUserFeatures implements UserDomainFeature {
  // Market-specific business implementation
  someMarketSpecificFeature() {
    // Australia-specific implementation
  }

  // Non-business feature implementation
  anotherFeature() {
    // Access feature flag through service
    return userFeatureService.isFeatureEnabled('au-specific-feature') ? 'new-value' : 'default-value';
  }
}
```

## Testing

When testing features:

1. Test each module's features independently
2. Test each market's implementation independently
3. Verify that the correct market features are loaded based on the environment
4. Include tests for unsupported market scenarios
5. Mock the environment configuration when testing different markets
6. Mock feature flag service for testing different feature states
7. Test both market-specific and non-market-specific features
8. Verify feature interactions within the same module
9. Test cross-module communication through domain events

## Maintenance

1. Keep module-specific code organized and well-documented
2. Regularly review and update market features as business requirements change
3. Consider creating a feature flag system for gradual rollout of new features
4. Maintain a changelog of market-specific feature updates
5. Plan for feature flag platform migration:
   - Keep feature flag access centralized within each module
   - Document current feature flag usage
   - Prepare migration strategy
6. Feature Documentation:
   - Maintain separate documentation for each module's features
   - Document feature dependencies and interactions
   - Keep track of feature lifecycle and deprecation
7. Module Maintenance:
   - Regularly review module boundaries
   - Update cross-module communication patterns
   - Maintain clear domain interfaces

## Monorepo Features Management

### Structure

The monorepo-features module is organized as follows:

```
packages/
└── monorepo-features/
    ├── src/
    │   ├── lib/
    │   │   ├── feaures/          # Feature configurations
    │   │   │   ├── stripe.ts     # Payment features
    │   │   │   ├── paypal.ts     # Payment features
    │   │   │   ├── gtm.ts        # Analytics features
    │   │   │   └── ...           # Other feature configs
    │   │   ├── scripts/          # Core implementations
    │   │   │   └── feature-manager.ts  # Main feature manager
    │   │   ├── services/         # Service layer
    │   │   ├── types/           # Type definitions
    │   │   │   └── feature.ts    # Feature interface
    │   │   ├── config/          # Configuration
    │   │   │   ├── region.ts     # Region definitions
    │   │   │   └── feature-name.ts # Feature name enum
    │   │   ├── adapters/        # Adapters
    │   │   └── helpers/         # Utility functions
    │   └── index.ts             # Public API exports
    └── package.json
```

### FeatureManager API

The FeatureManager provides a comprehensive API for feature management:

```typescript
class FeatureManager {
  // Singleton instance
  private static instance: FeatureManager;

  // Feature configurations
  features: Record<FeatureName, Feature>;

  // Get singleton instance
  public static getInstance(): FeatureManager;

  // Check if a feature is enabled
  public isFeatureEnabled(featureName: FeatureName): boolean;

  // Get feature configuration payload
  public getFeatureFlagPayload(featureName: FeatureName): any;

  // Subscribe to feature updates
  public onFeatureFlags(callback: (features: Record<FeatureName, Feature>) => void): void;

  // Reload feature configurations
  public reloadFeatureFlags(): void;

  // Toggle feature status
  public toggleFeature(featureName: FeatureName): void;

  // Add new feature
  public addFeature(featureName: FeatureName, properties: object): void;
}
```

### Feature Interface

Each feature is defined with the following interface:

```typescript
interface Feature {
  // Feature identifier
  featureName: FeatureName;

  // Feature description
  description: string;

  // Feature status
  status: boolean;

  // Supported application channels
  enabledAppChannels: ApplicationChannel[];

  // Supported regions
  enabledRegions: Region[];

  // Environment restrictions
  environment?: ApplicationEnv[];

  // Feature activation date
  effectiveDate?: number;

  // Feature expiration date
  expirationDate?: number;

  // Additional notes
  remark?: string;

  // Feature configuration
  payload?: Record<string, any>;
}
```

### Feature Types

The system supports various feature types:

1. **Payment Features**

   - Stripe
   - PayPal
   - GrabPay
   - Afterpay
   - Affirm
   - ZipPay

2. **Authentication Features**

   - Facebook Sign-in
   - Google Sign-in
   - Apple Sign-in

3. **Analytics Features**

   - Google Tag Manager (GTM)

4. **Third-party Integrations**
   - Mulberry
   - Yotpo

### Feature Validation

The FeatureManager performs comprehensive validation:

1. **Status Check**

   - Verifies if the feature is enabled

2. **Channel Validation**

   - Checks if the feature is enabled for the current application channel

3. **Region Validation**

   - Validates if the feature is available in the current region

4. **Environment Check**

   - Verifies if the feature is enabled for the current environment

5. **Time Validation**
   - Checks if the feature is within its effective date range

### Usage Examples

```typescript
// Get feature manager instance
const featureManager = FeatureManager.getInstance();

// Check if Stripe is enabled
const isStripeEnabled = featureManager.isFeatureEnabled(FeatureName.STRIPE);

// Get PayPal configuration
const paypalConfig = featureManager.getFeatureFlagPayload(FeatureName.PAYPAL);

// Subscribe to feature updates
featureManager.onFeatureFlags((features) => {
  console.log('Features updated:', features);
});

// Reload feature configurations
featureManager.reloadFeatureFlags();
```

### Feature Configuration Example

```typescript
const stripeFeature: Feature = {
  featureName: FeatureName.STRIPE,
  description: 'Stripe payment integration',
  status: true,
  enabledAppChannels: [ApplicationChannel.WEB],
  enabledRegions: [Region.SG, Region.US, Region.AU, Region.CA],
  payload: {
    publicKey: 'pk_test_...',
    apiVersion: '2023-10-16',
  },
};
```

### Best Practices

1. **Feature Naming**

   - Use descriptive names in FeatureName enum
   - Follow consistent naming conventions

2. **Configuration Management**

   - Keep feature configurations in separate files
   - Use TypeScript for type safety
   - Document feature requirements and dependencies

3. **Feature Validation**

   - Implement comprehensive validation
   - Handle edge cases gracefully
   - Provide clear error messages

4. **Performance**

   - Use singleton pattern for FeatureManager
   - Cache feature configurations
   - Implement efficient update mechanisms

5. **Testing**
   - Test feature validation logic
   - Verify region and channel restrictions
   - Test feature update subscriptions

## Conclusion

This multi-market feature management system provides a scalable and maintainable way to handle both market-specific business requirements and non-business features while adhering to domain-driven design principles. By following the established patterns and best practices, developers can easily add and modify features while maintaining code quality and consistency. The system also provides a clear path for future feature flag platform migration while keeping the business logic clean and maintainable within proper domain boundaries.
