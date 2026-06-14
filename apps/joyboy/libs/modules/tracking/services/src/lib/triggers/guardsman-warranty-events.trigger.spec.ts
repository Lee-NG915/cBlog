import { configureStore } from '@reduxjs/toolkit';
import { buildGuardsmanWarrantyGaParams, trackGuardsmanWarrantyEvent } from './guardsman-warranty-events.trigger';
import { gaTrack } from '../utils';

jest.mock('../utils', () => ({
  gaTrack: jest.fn(),
}));

jest.mock('../events-name', () => ({
  EVENTS_NAMES_MAP: { GA_CUSTOM_TRACK_EVENT: 'trackEvent' },
}));

jest.mock('@castlery/observability/client', () => ({
  logger: { error: jest.fn() },
}));

describe('guardsman warranty GA tracking', () => {
  const store = configureStore({
    reducer: {
      tracking: (state = {}) => state,
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('buildGuardsmanWarrantyGaParams maps payload to guardsman_warranty trackEvent', () => {
    expect(
      buildGuardsmanWarrantyGaParams({
        action: 'select_extended_warranty',
        label: '2 Years',
        sku: 'SKU-001',
        skuName: 'Test Sofa',
        position: 'pdp',
        price: '99.00',
      })
    ).toEqual({
      event: 'trackEvent',
      'eventDetails.category': 'guardsman_warranty',
      'eventDetails.action': 'select_extended_warranty',
      'eventDetails.label': '2 Years',
      'eventDetails.sku_id': 'SKU-001',
      'eventDetails.sku_name': 'Test Sofa',
      'eventDetails.position': 'pdp',
      'eventDetails.price': '99.00',
    });
  });

  it('trackGuardsmanWarrantyEvent pushes GA payload', async () => {
    await store.dispatch(
      trackGuardsmanWarrantyEvent({
        action: 'add_extended_warranty',
        label: '3 Years',
        sku: 'SKU-002',
        skuName: 'Test Chair',
        position: 'pdp',
        price: 120,
      })
    );

    expect(gaTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        'eventDetails.category': 'guardsman_warranty',
        'eventDetails.action': 'add_extended_warranty',
      })
    );
  });

  it('trackGuardsmanWarrantyEvent skips GA when sku is missing', async () => {
    const result = await store.dispatch(
      trackGuardsmanWarrantyEvent({
        action: 'add_extended_warranty',
        sku: '',
        skuName: 'Test Sofa',
      })
    );

    expect(gaTrack).not.toHaveBeenCalled();
    expect(result.payload).toEqual({ data: 'error' });
  });
});
