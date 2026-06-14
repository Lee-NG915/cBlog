import { makePersistenceHandles } from '@castlery/shared-persistence-kit';

export const canAutoOpenOnlineCart = (id: number | undefined) => {
  const cacheStr = makePersistenceHandles()?.onlineCartSymbol?.getItem();
  let flag = true;
  if (cacheStr) {
    const data = JSON.parse(cacheStr);
    const cacheId = data?.id?.toString();
    const cacheHasOpen = data?.hasOpen?.toString();

    if (cacheId !== id?.toString() || cacheHasOpen !== 'true') {
      flag = true;
    } else {
      flag = false;
    }
  }
  return flag;
};

export const setAutoOpenOnlineCart = (id: number, hasOpen: boolean) => {
  makePersistenceHandles()?.onlineCartSymbol?.setItem(JSON.stringify({ id, hasOpen }));
};
