import { trackedPosProducts } from './product.helper';

export enum EventsDataTempateNames {
  EEC = 'EEC',
  PRODUCT = 'PRODUCT',
}

export const EventsDataTempateHelper = {
  [EventsDataTempateNames.EEC]: trackedPosProducts, //todo:把eec格式化方法暴露出来
  [EventsDataTempateNames.PRODUCT]: trackedPosProducts,
};
