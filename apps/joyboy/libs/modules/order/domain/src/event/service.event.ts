import { getAddonServices } from '../api/service.api';
//=================================== service ===================================
export const addonServicesUpdatedEvent = getAddonServices.matchFulfilled;
export const addonServicesUpdatePendingEvent = getAddonServices.matchPending;
