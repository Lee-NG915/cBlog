import { makePersistenceHandles } from '@castlery/shared-persistence-kit';

export function getUserCity() {
  const userCity = makePersistenceHandles().webUserCity.getItem();
  if (typeof userCity === 'string') {
    return JSON.parse(userCity);
  }
  return null;
}

export function getGaPerSudoId() {
  return makePersistenceHandles().gaClient.getItem();
}

export function getEventRandomId(eventName?: string) {
  return `${eventName ?? ''}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
}
